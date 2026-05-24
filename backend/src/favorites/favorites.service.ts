import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { ListingStatus } from '@prisma/client';

const ALLOWED_FAVORITE_STATUSES: ListingStatus[] = [ListingStatus.ACTIVE, ListingStatus.RESERVED];

@Injectable()
export class FavoritesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findByUser(userId: string, page = 1, limit = 24) {
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { 
          userId,
          listing: {
            status: { in: ALLOWED_FAVORITE_STATUSES },
          },
        },
        skip,
        take: limit,
        include: {
          listing: {
            include: {
              watch: { include: { brand: true, images: { take: 1 } } },
              images: { take: 1 },
              user: { select: { id: true, name: true, ratingsAvg: true } },
              _count: { select: { favorites: true, messages: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.favorite.count({
        where: { 
          userId,
          listing: {
            status: { in: ALLOWED_FAVORITE_STATUSES },
          },
        },
      }),
    ]);

    return {
      data: favorites,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async create(userId: string, listingId: string) {
    // Проверяем существование пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверяем существование и статус listing
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { 
        id: true, 
        status: true, 
        userId: true,
        favoritesCount: true,
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // Нельзя добавить в избранное удалённое/отклоненное/проданное объявление
    if (!ALLOWED_FAVORITE_STATUSES.includes(listing.status)) {
      throw new BadRequestException(
        `Cannot favorite listing with status ${listing.status}. Only ACTIVE or RESERVED listings can be favorited.`
      );
    }

    // УБРАНО: Нельзя добавить своё собственное объявление
    // if (listing.userId === userId) {
    //   throw new ForbiddenException('Cannot favorite your own listing');
    // }

    // Проверяем, не добавлено ли уже в избранное
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });

    if (existing) {
      throw new ConflictException('Listing already in favorites');
    }

    // Используем транзакцию для атомарности
    const result = await this.prisma.$transaction(async (tx) => {
      const favorite = await tx.favorite.create({
        data: { userId, listingId },
        include: {
          listing: {
            include: {
              watch: { include: { brand: true, images: { take: 1 } } },
              images: { take: 1 },
              _count: { select: { favorites: true, messages: true } },
            },
          },
        },
      });

      await tx.listing.update({
        where: { id: listingId },
        data: { favoritesCount: { increment: 1 } },
      });

      return favorite;
    });

    // Инвалидируем кэш
    await this.invalidateCache(listingId);

    return result;
  }

  async delete(userId: string, listingId: string) {
    // Проверяем существование listing
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, favoritesCount: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // Используем транзакцию для атомарности
    const result = await this.prisma.$transaction(async (tx) => {
      // Удаляем favorite и получаем количество удалённых записей
      const deleteResult = await tx.favorite.deleteMany({
        where: { userId, listingId },
      });

      // Если ничего не удалено — favorite не существовал
      if (deleteResult.count === 0) {
        throw new NotFoundException('Favorite not found');
      }

      // Уменьшаем счётчик только если favorite реально существовал
      // И защита от отрицательного значения
      const newCount = Math.max(0, listing.favoritesCount - 1);

      await tx.listing.update({
        where: { id: listingId },
        data: { favoritesCount: newCount },
      });

      return { deleted: true, previousCount: listing.favoritesCount };
    });

    // Инвалидируем кэш
    await this.invalidateCache(listingId);

    return { message: 'Removed from favorites' };
  }

  // Проверка, добавлен ли listing в избранное пользователем
  async isFavorite(userId: string, listingId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId } },
      select: { id: true },
    });
    return !!favorite;
  }

  // Получить количество избранных для listing
  async getFavoritesCount(listingId: string): Promise<number> {
    const result = await this.prisma.favorite.count({
      where: { listingId },
    });
    return result;
  }

  // Синхронизация favoritesCount (для исправления рассинхронизации)
  async syncFavoritesCount(listingId: string) {
    const actualCount = await this.prisma.favorite.count({
      where: { listingId },
    });

    await this.prisma.listing.update({
      where: { id: listingId },
      data: { favoritesCount: actualCount },
    });

    return { listingId, favoritesCount: actualCount };
  }

  private async invalidateCache(listingId: string) {
    // Удаляем кэш конкретного listing
    await this.redis.del(`listing:${listingId}`);

    // Удаляем кэш списков
    const keys = await this.redis.keys('listings:*');
    if (keys.length > 0) {
      await Promise.all(keys.map(key => this.redis.del(key)));
    }

    // Удаляем кэш dashboard
    await this.redis.del('admin:dashboard');
  }
}
