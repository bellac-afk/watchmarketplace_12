import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { Prisma, UserRole, ListingStatus, VerificationStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // Проверка что пользователь — админ и существует в БД
  private async verifyAdmin(adminId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true, id: true },
    });

    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return admin;
  }

  async getDashboardStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalListings,
      totalWatches,
      totalBrands,
      totalMessages,
      totalReviews,
      activeListings,
      soldListings,
      draftListings,
      rejectedListings,
      removedListings,
      reservedListings,
      newUsersToday,
      newListingsToday,
      avgListingPrice,
      topBrands,
      recentActivity,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.listing.count(),
      this.prisma.watch.count(),
      this.prisma.brand.count(),
      this.prisma.message.count(),
      this.prisma.review.count(),
      this.prisma.listing.count({ where: { status: ListingStatus.ACTIVE } }),
      this.prisma.listing.count({ where: { status: ListingStatus.SOLD } }),
      this.prisma.listing.count({ where: { status: ListingStatus.DRAFT } }),
      this.prisma.listing.count({ where: { status: ListingStatus.REJECTED } }),
      this.prisma.listing.count({ where: { status: ListingStatus.REMOVED } }),
      this.prisma.listing.count({ where: { status: ListingStatus.RESERVED } }),
      this.prisma.user.count({
        where: { createdAt: { gte: todayStart } },
      }),
      this.prisma.listing.count({
        where: { createdAt: { gte: todayStart } },
      }),
      this.prisma.listing.aggregate({
        where: { status: ListingStatus.ACTIVE },
        _avg: { price: true },
      }),
      this.prisma.brand.findMany({
        take: 5,
        include: {
          _count: { select: { watches: true } },
        },
        orderBy: {
          watches: {
            _count: 'desc',
          },
        },
      }),
      this.prisma.listing.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          watch: { include: { brand: true } },
          user: { select: { id: true, name: true, avatar: true } },
          images: { take: 1 },
        },
      }),
    ]);

    return {
      counts: {
        users: totalUsers,
        listings: totalListings,
        watches: totalWatches,
        brands: totalBrands,
        messages: totalMessages,
        reviews: totalReviews,
      },
      listingsByStatus: {
        active: activeListings,
        sold: soldListings,
        draft: draftListings,
        rejected: rejectedListings,
        removed: removedListings,
        reserved: reservedListings,
      },
      today: {
        newUsers: newUsersToday,
        newListings: newListingsToday,
      },
      avgListingPrice: avgListingPrice._avg?.price || 0,
      topBrands,
      recentActivity,
    };
  }

  async getAllListings(page = 1, limit = 50, status?: ListingStatus, search?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.ListingWhereInput = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { watch: { model: { contains: search, mode: 'insensitive' } } },
        { watch: { reference: { contains: search, mode: 'insensitive' } } },
        { watch: { brand: { name: { contains: search, mode: 'insensitive' } } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          watch: { include: { brand: true } },
          user: { select: { id: true, name: true, email: true, avatar: true } },
          images: { orderBy: { order: 'asc' } },
          _count: { select: { favorites: true, messages: true, reviews: true } },
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data: listings,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total },
    };
  }

  async getListingById(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        watch: { include: { brand: true, images: true } },
        user: { select: { id: true, name: true, email: true, avatar: true, phone: true, ratingsAvg: true } },
        images: { orderBy: { order: 'asc' } },
        messages: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: { select: { id: true, name: true } },
            receiver: { select: { id: true, name: true } },
          },
        },
        reviews: {
          include: {
            fromUser: { select: { id: true, name: true, avatar: true } },
          },
        },
        favorites: true,
      },
    });

    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async updateListing(id: string, data: Prisma.ListingUpdateInput, adminId: string) {
    await this.verifyAdmin(adminId);

    const updated = await this.prisma.listing.update({
      where: { id },
      data,
      include: {
        watch: { include: { brand: true } },
        user: { select: { id: true, name: true } },
        images: true,
      },
    });

    await this.logActivity(adminId, 'LISTING_UPDATED', `Updated listing ${id}`, { listingId: id });
    await this.invalidateCache();
    return updated;
  }

  async deleteListing(id: string, adminId: string) {
    await this.verifyAdmin(adminId);

    // Сначала удаляем связанные записи
    await this.prisma.listingImage.deleteMany({ where: { listingId: id } });
    await this.prisma.message.deleteMany({ where: { listingId: id } });
    await this.prisma.favorite.deleteMany({ where: { listingId: id } });
    await this.prisma.review.deleteMany({ where: { listingId: id } });

    await this.prisma.listing.delete({ where: { id } });
    await this.logActivity(adminId, 'LISTING_DELETED', `Deleted listing ${id}`, { listingId: id });
    await this.invalidateCache();
    return { message: 'Listing deleted successfully' };
  }

  async updateListingStatus(id: string, status: ListingStatus, reason: string | undefined, adminId: string) {
    await this.verifyAdmin(adminId);

    const updateData: Prisma.ListingUpdateInput = { status };
    if (status === ListingStatus.SOLD) updateData.soldAt = new Date();
    if (status === ListingStatus.ACTIVE) updateData.soldAt = null;

    const updated = await this.prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        watch: { include: { brand: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await this.logActivity(
      adminId,
      'LISTING_STATUS_CHANGED',
      `Changed listing ${id} status to ${status}${reason ? ` (${reason})` : ''}`,
      { listingId: id, status, reason },
    );
    await this.invalidateCache();
    return updated;
  }

  async getAllUsers(page = 1, limit = 50, role?: UserRole, search?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};

    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          verificationStatus: true,
          ratingsAvg: true,
          ratingsCount: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: { listings: true, reviewsReceived: true, favorites: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total },
    };
  }

  async getUserById(id: string) {
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
        role: true,
        verificationStatus: true,
        verifiedAt: true,
        ratingsAvg: true,
        ratingsCount: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        listings: {
          include: {
            watch: { include: { brand: true } },
            images: { take: 1 },
          },
          orderBy: { createdAt: 'desc' },
        },
        reviewsReceived: {
          include: {
            fromUser: { select: { id: true, name: true, avatar: true } },
            listing: { select: { id: true, watch: { select: { brand: true, model: true } } } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { listings: true, reviewsReceived: true, favorites: true, sentMessages: true },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: string, data: { name?: string; phone?: string; bio?: string; location?: string; avatar?: string }, adminId: string) {
    await this.verifyAdmin(adminId);

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        verificationStatus: true,
        updatedAt: true,
      },
    });

    await this.logActivity(adminId, 'USER_UPDATED', `Updated user ${id}`, { userId: id });
    await this.redis.del(`user:${id}`);
    return updated;
  }

  async deleteUser(id: string, adminId: string) {
    await this.verifyAdmin(adminId);

    // Нельзя удалить самого себя
    if (id === adminId) {
      throw new BadRequestException('Cannot delete yourself');
    }

    // Удаляем связанные записи в правильном порядке
    await this.prisma.$transaction(async (tx) => {
      // 1. Удаляем избранное
      await tx.favorite.deleteMany({ where: { userId: id } });

      // 2. Удаляем отзывы
      await tx.review.deleteMany({ where: { OR: [{ fromUserId: id }, { toUserId: id }] } });

      // 3. Удаляем сообщения
      await tx.message.deleteMany({ where: { OR: [{ senderId: id }, { receiverId: id }] } });

      // 4. Удаляем историю поиска
      await tx.searchHistory.deleteMany({ where: { userId: id } });

      // 5. Удаляем логи активности админа
      await tx.adminActivityLog.deleteMany({ where: { adminId: id } });

      // 6. Удаляем объявления пользователя (с каскадом)
      const userListings = await tx.listing.findMany({
        where: { userId: id },
        select: { id: true },
      });

      for (const listing of userListings) {
        await tx.listingImage.deleteMany({ where: { listingId: listing.id } });
        await tx.message.deleteMany({ where: { listingId: listing.id } });
        await tx.favorite.deleteMany({ where: { listingId: listing.id } });
        await tx.review.deleteMany({ where: { listingId: listing.id } });
        await tx.listing.delete({ where: { id: listing.id } });
      }

      // 7. Удаляем часы, созданные пользователем
      const userWatches = await tx.watch.findMany({
        where: { createdBy: id },
        select: { id: true },
      });

      for (const watch of userWatches) {
        await tx.watchImage.deleteMany({ where: { watchId: watch.id } });
        await tx.priceHistory.deleteMany({ where: { watchId: watch.id } });
        await tx.watch.delete({ where: { id: watch.id } });
      }

      // 8. Наконец удаляем пользователя
      await tx.user.delete({ where: { id } });
    });

    await this.logActivity(adminId, 'USER_DELETED', `Deleted user ${id}`, { userId: id });
    await this.redis.del(`user:${id}`);
    return { message: 'User deleted successfully' };
  }

  async updateUserRole(id: string, role: UserRole, adminId: string) {
    await this.verifyAdmin(adminId);

    // Нельзя понизить самого себя
    if (id === adminId && role !== UserRole.ADMIN) {
      throw new BadRequestException('Cannot downgrade your own role');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    await this.logActivity(adminId, 'USER_ROLE_CHANGED', `Changed user ${id} role to ${role}`, {
      userId: id,
      role,
    });
    await this.redis.del(`user:${id}`);
    return updated;
  }

  async updateUserVerification(id: string, status: VerificationStatus, reason: string | undefined, adminId: string) {
    await this.verifyAdmin(adminId);

    const updateData: Prisma.UserUpdateInput = {
      verificationStatus: status,
    };

    if (status === VerificationStatus.VERIFIED) {
      updateData.verifiedAt = new Date();
    } else {
      updateData.verifiedAt = null;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, verificationStatus: true, verifiedAt: true },
    });

    await this.logActivity(
      adminId,
      'USER_VERIFICATION_CHANGED',
      `Changed user ${id} verification to ${status}${reason ? ` (${reason})` : ''}`,
      { userId: id, status, reason },
    );
    await this.redis.del(`user:${id}`);
    return updated;
  }

  async getAllWatches(page = 1, limit = 50, search?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.WatchWhereInput = {};

    if (search) {
      where.OR = [
        { model: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [watches, total] = await Promise.all([
      this.prisma.watch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: true,
          images: { take: 1 },
          _count: { select: { listings: true } },
        },
      }),
      this.prisma.watch.count({ where }),
    ]);

    return {
      data: watches,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total },
    };
  }

  async getAllBrands(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [brands, total] = await Promise.all([
      this.prisma.brand.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { watches: true } },
        },
      }),
      this.prisma.brand.count(),
    ]);

    return {
      data: brands,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total },
    };
  }

  async createBrand(data: { name: string; slug: string; description?: string; country?: string; foundedYear?: number }, adminId: string) {
    await this.verifyAdmin(adminId);

    // Проверяем уникальность slug
    const existingSlug = await this.prisma.brand.findUnique({
      where: { slug: data.slug },
    });
    if (existingSlug) {
      throw new ConflictException(`Brand with slug "${data.slug}" already exists`);
    }

    // Проверяем уникальность name
    const existingName = await this.prisma.brand.findUnique({
      where: { name: data.name },
    });
    if (existingName) {
      throw new ConflictException(`Brand with name "${data.name}" already exists`);
    }

    const brand = await this.prisma.brand.create({ data });
    await this.logActivity(adminId, 'BRAND_CREATED', `Created brand ${brand.name}`, { brandId: brand.id });
    return brand;
  }

  async updateBrand(id: string, data: { name?: string; slug?: string; description?: string; country?: string; foundedYear?: number; logoUrl?: string }, adminId: string) {
    await this.verifyAdmin(adminId);

    // Проверяем существование бренда
    const existing = await this.prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Brand not found');
    }

    // Проверяем уникальность slug если он меняется
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await this.prisma.brand.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) {
        throw new ConflictException(`Brand with slug "${data.slug}" already exists`);
      }
    }

    // Проверяем уникальность name если он меняется
    if (data.name && data.name !== existing.name) {
      const nameExists = await this.prisma.brand.findUnique({
        where: { name: data.name },
      });
      if (nameExists) {
        throw new ConflictException(`Brand with name "${data.name}" already exists`);
      }
    }

    const brand = await this.prisma.brand.update({ where: { id }, data });
    await this.logActivity(adminId, 'BRAND_UPDATED', `Updated brand ${brand.name}`, { brandId: id });
    return brand;
  }

  async deleteBrand(id: string, adminId: string) {
    await this.verifyAdmin(adminId);

    // Проверяем существование бренда
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { watches: true } } },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    // Проверяем, есть ли связанные часы
    if (brand._count.watches > 0) {
      throw new BadRequestException(
        `Cannot delete brand with ${brand._count.watches} associated watches. Delete or reassign watches first.`
      );
    }

    await this.prisma.brand.delete({ where: { id } });
    await this.logActivity(adminId, 'BRAND_DELETED', `Deleted brand ${id}`, { brandId: id });
    return { message: 'Brand deleted successfully' };
  }

  async getAllReviews(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          fromUser: { select: { id: true, name: true, avatar: true } },
          toUser: { select: { id: true, name: true, avatar: true } },
          listing: { select: { id: true, watch: { select: { brand: true, model: true } } } },
        },
      }),
      this.prisma.review.count(),
    ]);

    return {
      data: reviews,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total },
    };
  }

  async deleteReview(id: string, adminId: string) {
    await this.verifyAdmin(adminId);

    const review = await this.prisma.review.findUnique({
      where: { id },
      select: { toUserId: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.prisma.review.delete({ where: { id } });

    // Пересчитываем рейтинг пользователя
    await this.recalculateUserRating(review.toUserId);

    await this.logActivity(adminId, 'REVIEW_DELETED', `Deleted review ${id}`, { reviewId: id });
    return { message: 'Review deleted successfully' };
  }

  private async recalculateUserRating(userId: string) {
    const stats = await this.prisma.review.aggregate({
      where: { toUserId: userId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ratingsAvg: stats._avg.rating || 0,
        ratingsCount: stats._count.rating || 0,
      },
    });
  }

  async logActivity(adminId: string, action: string, description: string, metadata?: Record<string, any>) {
    // Ограничиваем размер metadata
    const safeMetadata = metadata ? JSON.parse(JSON.stringify(metadata).slice(0, 10000)) : {};

    await this.prisma.adminActivityLog.create({
      data: {
        adminId,
        action,
        description,
        metadata: safeMetadata,
      },
    });
  }

  async getActivityLog(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.adminActivityLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.adminActivityLog.count(),
    ]);

    return {
      data: logs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total },
    };
  }

  private async invalidateCache() {
    // Удаляем только ключи listings, не трогаем другие
    const keys = await this.redis.keys('listings:*');
    if (keys.length > 0) {
      await Promise.all(keys.map(key => this.redis.del(key)));
    }
    const watchKeys = await this.redis.keys('watches:*');
    if (watchKeys.length > 0) {
      await Promise.all(watchKeys.map(key => this.redis.del(key)));
    }
    // Удаляем кэш dashboard
    await this.redis.del('admin:dashboard');
  }
}
