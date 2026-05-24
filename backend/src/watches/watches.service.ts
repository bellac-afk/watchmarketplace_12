import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { Prisma, WatchCondition, MovementType, CaseMaterial, ListingStatus } from '@prisma/client';

interface WatchFilters {
  brand?: string;
  model?: string;
  reference?: string;
  movementType?: MovementType;
  caseMaterial?: CaseMaterial;
  minDiameter?: number;
  maxDiameter?: number;
  yearFrom?: number;
  yearTo?: number;
  condition?: WatchCondition;
  minPrice?: number;
  maxPrice?: number;
  status?: ListingStatus;
  search?: string;
}

@Injectable()
export class WatchesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll(page = 1, limit = 24, filters: WatchFilters = {}, sortBy = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') {
    const skip = (page - 1) * limit;
    const cacheKey = `watches:${page}:${limit}:${JSON.stringify(filters)}:${sortBy}:${sortOrder}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const where: Prisma.WatchWhereInput = {};
    const listingWhere: Prisma.ListingWhereInput = { status: ListingStatus.ACTIVE };

    if (filters.brand) {
      where.brand = { slug: filters.brand };
    }
    if (filters.model) {
      where.model = { contains: filters.model, mode: 'insensitive' };
    }
    if (filters.reference) {
      where.reference = { contains: filters.reference, mode: 'insensitive' };
    }
    if (filters.movementType) {
      where.movementType = filters.movementType;
    }
    if (filters.caseMaterial) {
      where.caseMaterial = filters.caseMaterial;
    }
    if (filters.minDiameter || filters.maxDiameter) {
      where.caseDiameter = {};
      if (filters.minDiameter) where.caseDiameter.gte = filters.minDiameter;
      if (filters.maxDiameter) where.caseDiameter.lte = filters.maxDiameter;
    }
    if (filters.yearFrom || filters.yearTo) {
      where.yearIntroduced = {};
      if (filters.yearFrom) where.yearIntroduced.gte = filters.yearFrom;
      if (filters.yearTo) where.yearIntroduced.lte = filters.yearTo;
    }
    if (filters.minPrice || filters.maxPrice) {
      listingWhere.price = {};
      if (filters.minPrice) listingWhere.price.gte = filters.minPrice;
      if (filters.maxPrice) listingWhere.price.lte = filters.maxPrice;
    }
    if (filters.condition) {
      listingWhere.condition = filters.condition;
    }

    const orderBy: Prisma.WatchOrderByWithRelationInput = {};
    if (sortBy === 'price') {
      // Price sorting handled via listings
    } else {
      orderBy[sortBy as keyof Prisma.WatchOrderByWithRelationInput] = sortOrder;
    }

    const [watches, total] = await Promise.all([
      this.prisma.watch.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          brand: true,
          images: { take: 1 },
          listings: {
            where: listingWhere,
            take: 1,
            orderBy: { price: 'asc' },
            select: {
              id: true,
              price: true,
              condition: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.watch.count({ where }),
    ]);

    const result = {
      data: watches,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };

    await this.redis.set(cacheKey, JSON.stringify(result), 300);
    return result;
  }

  async findById(id: string) {
    const cacheKey = `watch:${id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const watch = await this.prisma.watch.findUnique({
      where: { id },
      include: {
        brand: true,
        images: { orderBy: { order: 'asc' } },
        listings: {
          where: { status: ListingStatus.ACTIVE },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                ratingsAvg: true,
                createdAt: true,
                _count: { select: { listings: true } },
              },
            },
            images: { take: 1 },
          },
        },
      },
    });

    if (!watch) {
      throw new NotFoundException('Watch not found');
    }

    // Similar watches
    const similar = await this.prisma.watch.findMany({
      where: {
        brandId: watch.brandId,
        id: { not: watch.id },
      },
      take: 4,
      include: {
        brand: true,
        images: { take: 1 },
        listings: {
          where: { status: ListingStatus.ACTIVE },
          take: 1,
          select: { price: true },
        },
      },
    });

    const result = { ...watch, similar };
    await this.redis.set(cacheKey, JSON.stringify(result), 600);
    return result;
  }

  async findByReference(reference: string) {
    const normalizedRef = reference.replace(/[-\s]/g, '').toUpperCase();

    const watch = await this.prisma.watch.findFirst({
      where: {
        OR: [
          { reference: { equals: normalizedRef, mode: 'insensitive' } },
          { reference: { contains: normalizedRef, mode: 'insensitive' } },
        ],
      },
      include: {
        brand: true,
        images: { orderBy: { order: 'asc' } },
        listings: {
          where: { status: ListingStatus.ACTIVE },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                ratingsAvg: true,
              },
            },
            images: { take: 1 },
          },
        },
      },
    });

    if (!watch) {
      throw new NotFoundException('Watch not found');
    }

    return watch;
  }

  async search(query: string) {
    const cacheKey = `search:${query}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const normalizedQuery = query.trim();

    const [watches, brands] = await Promise.all([
      this.prisma.watch.findMany({
        where: {
          OR: [
            { reference: { contains: normalizedQuery, mode: 'insensitive' } },
            { model: { contains: normalizedQuery, mode: 'insensitive' } },
            { brand: { name: { contains: normalizedQuery, mode: 'insensitive' } } },
          ],
        },
        take: 20,
        include: {
          brand: true,
          images: { take: 1 },
          listings: {
            where: { status: ListingStatus.ACTIVE },
            take: 1,
            select: { price: true },
          },
        },
      }),
      this.prisma.brand.findMany({
        where: {
          name: { contains: normalizedQuery, mode: 'insensitive' },
        },
        take: 5,
      }),
    ]);

    const result = { watches, brands, total: watches.length };
    await this.redis.set(cacheKey, JSON.stringify(result), 300);
    return result;
  }

  async compare(ids: string[]) {
    if (ids.length > 4) {
      throw new Error('Cannot compare more than 4 watches');
    }

    const watches = await this.prisma.watch.findMany({
      where: { id: { in: ids } },
      include: {
        brand: true,
        images: { take: 1 },
        listings: {
          where: { status: ListingStatus.ACTIVE },
          take: 1,
          select: { price: true, condition: true },
        },
      },
    });

    return watches;
  }

  async create(data: Prisma.WatchCreateInput) {
    const watch = await this.prisma.watch.create({
      data,
      include: { brand: true },
    });
    await this.invalidateCache();
    return watch;
  }

  async update(id: string, data: Prisma.WatchUpdateInput) {
    const watch = await this.prisma.watch.update({
      where: { id },
      data,
      include: { brand: true },
    });
    await this.invalidateCache(id);
    return watch;
  }

  private async invalidateCache(watchId?: string) {
    const keys = await this.redis.keys('watches:*');
    if (keys.length > 0) {
      await Promise.all(keys.map(key => this.redis.del(key)));
    }
    if (watchId) {
      await this.redis.del(`watch:${watchId}`);
    }
  }
}
