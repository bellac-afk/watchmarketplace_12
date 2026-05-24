import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findById(id: string) {
    const cacheKey = `user:${id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        bio: true,
        location: true,
        verificationStatus: true,
        role: true,
        ratingsAvg: true,
        ratingsCount: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            reviewsReceived: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.redis.set(cacheKey, JSON.stringify(user), 600);
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        verificationStatus: true,
      },
    });
  }

  async updateProfile(userId: string, data: Prisma.UserUpdateInput) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        bio: true,
        location: true,
        updatedAt: true,
      },
    });

    await this.redis.del(`user:${userId}`);
    return user;
  }

  async getUserRatings(userId: string) {
    return this.prisma.review.findMany({
      where: { toUserId: userId },
      include: {
        fromUser: {
          select: { id: true, name: true, avatar: true },
        },
        listing: {
          select: {
            id: true,
            watch: { select: { brand: true, model: true, reference: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            watch: { include: { brand: true, images: { take: 1 } } },
            images: { take: 1 },
            user: { select: { id: true, name: true, ratingsAvg: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addFavorite(userId: string, listingId: string) {
    const favorite = await this.prisma.favorite.create({
      data: { userId, listingId },
      include: {
        listing: {
          include: {
            watch: { include: { brand: true, images: { take: 1 } } },
            images: { take: 1 },
          },
        },
      },
    });

    await this.prisma.listing.update({
      where: { id: listingId },
      data: { favoritesCount: { increment: 1 } },
    });

    return favorite;
  }

  async removeFavorite(userId: string, listingId: string) {
    await this.prisma.favorite.deleteMany({
      where: { userId, listingId },
    });

    await this.prisma.listing.update({
      where: { id: listingId },
      data: { favoritesCount: { decrement: 1 } },
    });

    return { message: 'Removed from favorites' };
  }

  async getSearchHistory(userId: string) {
    return this.prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
