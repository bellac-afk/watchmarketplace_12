import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { ListingStatus } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async autocomplete(query: string) {
    if (query.length < 2) {
      return { watches: [], brands: [], references: [] };
    }

    const cacheKey = `autocomplete:${query.toLowerCase()}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const normalizedQuery = query.trim();

    const [watches, brands, references] = await Promise.all([
      this.prisma.watch.findMany({
        where: {
          OR: [
            { model: { contains: normalizedQuery, mode: 'insensitive' } },
            { reference: { contains: normalizedQuery, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          model: true,
          reference: true,
          brand: { select: { name: true } },
        },
      }),
      this.prisma.brand.findMany({
        where: {
          name: { contains: normalizedQuery, mode: 'insensitive' },
        },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
      this.prisma.watch.findMany({
        where: {
          reference: { contains: normalizedQuery, mode: 'insensitive' },
        },
        take: 5,
        select: {
          id: true,
          reference: true,
          model: true,
          brand: { select: { name: true } },
        },
      }),
    ]);

    const result = { watches, brands, references };
    await this.redis.set(cacheKey, JSON.stringify(result), 300);
    return result;
  }

  async searchByReference(reference: string) {
    const normalizedRef = reference.replace(/[-\s]/g, '').toUpperCase();

    return this.prisma.watch.findMany({
      where: {
        OR: [
          { reference: { equals: normalizedRef, mode: 'insensitive' } },
          { reference: { contains: normalizedRef, mode: 'insensitive' } },
        ],
      },
      include: {
        brand: true,
        images: { take: 1 },
        listings: {
          where: { status: ListingStatus.ACTIVE },
          take: 1,
          select: { price: true, condition: true },
        },
      },
      take: 20,
    });
  }

  async getPriceHistory(watchId: string) {
    return this.prisma.priceHistory.findMany({
      where: { watchId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getMarketStats(watchId: string) {
    const listings = await this.prisma.listing.findMany({
      where: {
        watchId,
        status: { in: [ListingStatus.ACTIVE, ListingStatus.SOLD] },
      },
      select: {
        price: true,
        condition: true,
        status: true,
        createdAt: true,
      },
    });

    const active = listings.filter(l => l.status === ListingStatus.ACTIVE);
    const sold = listings.filter(l => l.status === ListingStatus.SOLD);

    const avgActive = active.length > 0 
      ? active.reduce((sum, l) => sum + Number(l.price), 0) / active.length 
      : 0;

    const avgSold = sold.length > 0 
      ? sold.reduce((sum, l) => sum + Number(l.price), 0) / sold.length 
      : 0;

    const minPrice = active.length > 0 ? Math.min(...active.map(l => Number(l.price))) : 0;
    const maxPrice = active.length > 0 ? Math.max(...active.map(l => Number(l.price))) : 0;

    return {
      activeListings: active.length,
      soldListings: sold.length,
      averageActivePrice: Math.round(avgActive * 100) / 100,
      averageSoldPrice: Math.round(avgSold * 100) / 100,
      minPrice,
      maxPrice,
      priceRange: { min: minPrice, max: maxPrice },
    };
  }
}
