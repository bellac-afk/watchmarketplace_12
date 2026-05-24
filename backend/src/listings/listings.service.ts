import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { Prisma, ListingStatus, WatchCondition, UserRole, MovementType, CaseMaterial } from '@prisma/client';
import { CreateListingDto } from './dto';

const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'price', 'bumpedAt', 'viewsCount', 'favoritesCount'];
const ALLOWED_SORT_ORDERS = ['asc', 'desc'];

interface ListingFilters {
  brand?: string;
  model?: string;
  reference?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: WatchCondition;
  hasBox?: boolean;
  hasPapers?: boolean;
  location?: string;
  status?: ListingStatus;
  userId?: string;
  movementType?: MovementType;
  caseMaterial?: CaseMaterial;
  minDiameter?: number;
  maxDiameter?: number;
  yearFrom?: number;
  yearTo?: number;
}

@Injectable()
export class ListingsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll(page = 1, limit = 24, filters: ListingFilters = {}, sortBy = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') {
    // Валидация sortBy
    if (!ALLOWED_SORT_FIELDS.includes(sortBy)) {
      sortBy = 'createdAt';
    }
    if (!ALLOWED_SORT_ORDERS.includes(sortOrder)) {
      sortOrder = 'desc';
    }

    const skip = (page - 1) * limit;
    const cacheKey = `listings:${page}:${limit}:${this.hashFilters(filters)}:${sortBy}:${sortOrder}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const where: Prisma.ListingWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    } else {
      where.status = { in: [ListingStatus.ACTIVE, ListingStatus.RESERVED] };
    }
    if (filters.userId) where.userId = filters.userId;
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }
    if (filters.condition) where.condition = filters.condition;
    if (filters.hasBox !== undefined) where.hasBox = filters.hasBox;
    if (filters.hasPapers !== undefined) where.hasPapers = filters.hasPapers;
    if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };

    const watchWhere: Prisma.WatchWhereInput = {};
    if (filters.brand) watchWhere.brand = { slug: filters.brand.toLowerCase() };
    if (filters.model) watchWhere.model = { contains: filters.model, mode: 'insensitive' };
    if (filters.reference) watchWhere.reference = { contains: filters.reference, mode: 'insensitive' };
    if (filters.movementType) watchWhere.movementType = filters.movementType;
    if (filters.caseMaterial) watchWhere.caseMaterial = filters.caseMaterial;
    if (filters.minDiameter || filters.maxDiameter) {
      watchWhere.caseDiameter = {};
      if (filters.minDiameter) watchWhere.caseDiameter.gte = filters.minDiameter;
      if (filters.maxDiameter) watchWhere.caseDiameter.lte = filters.maxDiameter;
    }
    if (filters.yearFrom || filters.yearTo) {
      watchWhere.yearIntroduced = {};
      if (filters.yearFrom) watchWhere.yearIntroduced.gte = filters.yearFrom;
      if (filters.yearTo) watchWhere.yearIntroduced.lte = filters.yearTo;
    }

    if (Object.keys(watchWhere).length > 0) {
      where.watch = watchWhere;
    }

    const orderBy: Prisma.ListingOrderByWithRelationInput = {};
    if (sortBy === 'bumpedAt') {
      orderBy.bumpedAt = { sort: sortOrder, nulls: 'last' };
    } else if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'viewsCount') {
      orderBy.viewsCount = sortOrder;
    } else if (sortBy === 'favoritesCount') {
      orderBy.favoritesCount = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          watch: {
            include: {
              brand: true,
              images: { take: 1 },
            },
          },
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
          images: { orderBy: { order: 'asc' } },
          _count: { select: { favorites: true } },
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    const result = {
      data: listings,
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

  async findById(id: string, incrementViews = false) {
    const cacheKey = `listing:${id}`;

    if (incrementViews) {
      // Используем транзакцию для атомарного инкремента
      await this.prisma.$transaction(async (tx) => {
        await tx.listing.update({
          where: { id },
          data: { viewsCount: { increment: 1 } },
        });
      });
      await this.redis.del(cacheKey);
    }

    const cached = await this.redis.get(cacheKey);
    if (cached && !incrementViews) {
      return JSON.parse(cached);
    }

    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        watch: {
          include: {
            brand: true,
            images: { orderBy: { order: 'asc' } },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            location: true,
            ratingsAvg: true,
            ratingsCount: true,
            verificationStatus: true,
            createdAt: true,
            _count: { select: { listings: true } },
          },
        },
        images: { orderBy: { order: 'asc' } },
        reviews: {
          include: {
            fromUser: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: { select: { favorites: true, messages: true } },
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    await this.redis.set(cacheKey, JSON.stringify(listing), 600);
    return listing;
  }

  async create(userId: string, dto: CreateListingDto) {
    let watchId = dto.watchId;

    if (!watchId) {
      // Генерируем уникальный reference
      const reference = dto.reference || `USER-${userId.slice(0, 8)}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const existing = await this.prisma.watch.findUnique({ where: { reference } });

      if (existing) {
        watchId = existing.id;
      } else {
        let brand = dto.brandSlug
          ? await this.prisma.brand.findUnique({ where: { slug: dto.brandSlug.toLowerCase() } })
          : null;

        if (!brand) {
          const name = dto.brandSlug || 'Other';
          const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          brand = await this.prisma.brand.upsert({
            where: { slug },
            update: {},
            create: { name, slug },
          });
        }

        const watchData: Prisma.WatchCreateInput = {
          brand: { connect: { id: brand.id } },
          model: dto.model || 'Unknown',
          reference,
          createdBy: userId,
          ...(dto.movementType && { movementType: dto.movementType }),
          ...(dto.caseMaterial && { caseMaterial: dto.caseMaterial }),
          ...(dto.caseDiameter && { caseDiameter: dto.caseDiameter }),
          ...(dto.caseThickness && { caseThickness: dto.caseThickness }),
          ...(dto.waterResistance && { waterResistance: dto.waterResistance }),
          ...(dto.powerReserve && { powerReserve: dto.powerReserve }),
          ...(dto.crystal && { crystal: dto.crystal }),
          ...(dto.dialColor && { dialColor: dto.dialColor }),
          ...(dto.braceletMaterial && { braceletMaterial: dto.braceletMaterial }),
          ...(dto.braceletType && { braceletType: dto.braceletType }),
          ...(dto.claspType && { claspType: dto.claspType }),
          ...(dto.bezelMaterial && { bezelMaterial: dto.bezelMaterial }),
          ...(dto.functions && { functions: dto.functions }),
          ...(dto.complications && { complications: dto.complications }),
          ...(dto.lugWidth && { lugWidth: dto.lugWidth }),
          ...(dto.weight && { weight: dto.weight }),
        };

        const watch = await this.prisma.watch.create({ data: watchData });
        watchId = watch.id;
      }
    } else {
      // Проверяем существование watchId
      const watch = await this.prisma.watch.findUnique({ where: { id: watchId } });
      if (!watch) {
        throw new NotFoundException(`Watch with id ${watchId} not found`);
      }
    }

    const { watchId: _, brandSlug, model, reference, images, ...listingData } = dto;

    // Конвертируем price в Decimal
    const priceDecimal = new (require('@prisma/client').Prisma).Decimal(listingData.price);

    const createData: Prisma.ListingCreateInput = {
      price: priceDecimal,
      condition: listingData.condition,
      ...(listingData.negotiable !== undefined && { negotiable: listingData.negotiable }),
      ...(listingData.originalPrice && { originalPrice: new (require('@prisma/client').Prisma).Decimal(listingData.originalPrice) }),
      ...(listingData.year && { year: listingData.year }),
      ...(listingData.hasBox !== undefined && { hasBox: listingData.hasBox }),
      ...(listingData.hasPapers !== undefined && { hasPapers: listingData.hasPapers }),
      ...(listingData.hasOriginalStrap !== undefined && { hasOriginalStrap: listingData.hasOriginalStrap }),
      ...(listingData.additionalAccessories && { additionalAccessories: listingData.additionalAccessories }),
      ...(listingData.description && { description: listingData.description }),
      ...(listingData.location && { location: listingData.location }),
      watch: { connect: { id: watchId } },
      user: { connect: { id: userId } },
      ...(images?.length ? {
        images: {
          create: images
            .filter(url => this.isValidUrl(url))
            .map((url, index) => ({ url, order: index, isMain: index === 0 })),
        },
      } : {}),
    };

    const listing = await this.prisma.listing.create({
      data: createData,
      include: {
        watch: { include: { brand: true } },
        user: {
          select: { id: true, name: true, avatar: true, ratingsAvg: true },
        },
        images: true,
      },
    });

    await this.invalidateCache();
    return listing;
  }

  async update(id: string, userId: string, data: Prisma.ListingUpdateInput, isAdmin = false) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      select: { userId: true, status: true, watchId: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.userId !== userId && !isAdmin) {
      throw new ForbiddenException('You can only update your own listings');
    }

    if (listing.status === ListingStatus.SOLD && !isAdmin) {
      throw new ForbiddenException('Cannot edit sold listings');
    }

    // Защита от изменения критических полей
    const safeData: Prisma.ListingUpdateInput = {};
    const allowedFields = ['price', 'negotiable', 'originalPrice', 'condition', 'year', 'hasBox', 'hasPapers', 'hasOriginalStrap', 'additionalAccessories', 'description', 'location', 'status'];

    for (const field of allowedFields) {
      if (field in data) {
        (safeData as any)[field] = (data as any)[field];
      }
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: safeData,
      include: {
        watch: { include: { brand: true } },
        images: true,
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    await this.invalidateCache(id);
    return updated;
  }

  async delete(id: string, userId: string, isAdmin = false) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.userId !== userId && !isAdmin) {
      throw new ForbiddenException('You can only delete your own listings');
    }

    // Удаляем связанные записи перед удалением listing
    await this.prisma.listingImage.deleteMany({ where: { listingId: id } });
    await this.prisma.message.deleteMany({ where: { listingId: id } });
    await this.prisma.favorite.deleteMany({ where: { listingId: id } });
    await this.prisma.review.deleteMany({ where: { listingId: id } });

    await this.prisma.listing.delete({ where: { id } });
    await this.invalidateCache(id);
    return { message: 'Listing deleted successfully' };
  }

  async bump(id: string, userId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      select: { userId: true, bumpedAt: true, status: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.userId !== userId) {
      throw new ForbiddenException('You can only bump your own listings');
    }

    if (listing.status !== ListingStatus.ACTIVE) {
      throw new BadRequestException('Only active listings can be bumped');
    }

    // Используем транзакцию для предотвращения race condition
    const result = await this.prisma.$transaction(async (tx) => {
      const current = await tx.listing.findUnique({
        where: { id },
        select: { bumpedAt: true },
      });

      if (current?.bumpedAt && new Date().getTime() - new Date(current.bumpedAt).getTime() < 24 * 60 * 60 * 1000) {
        throw new ForbiddenException('You can only bump once per 24 hours');
      }

      return tx.listing.update({
        where: { id },
        data: { bumpedAt: new Date() },
      });
    });

    await this.invalidateCache(id);
    return result;
  }

  async updateStatus(id: string, userId: string, status: ListingStatus, isAdmin = false) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.userId !== userId && !isAdmin) {
      throw new ForbiddenException('You can only update your own listings');
    }

    const updateData: Prisma.ListingUpdateInput = { status };
    if (status === ListingStatus.SOLD) {
      updateData.soldAt = new Date();
    }
    if (status === ListingStatus.ACTIVE) {
      updateData.soldAt = null;
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: updateData,
    });

    await this.invalidateCache(id);
    return updated;
  }

  async getUserListings(userId: string, status?: ListingStatus) {
    const where: Prisma.ListingWhereInput = { userId };
    if (status) where.status = status;

    return this.prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        watch: { include: { brand: true, images: { take: 1 } } },
        images: { take: 1 },
        _count: { select: { favorites: true, messages: true } },
      },
    });
  }

  private async invalidateCache(listingId?: string) {
    const keys = await this.redis.keys('listings:*');
    if (keys.length > 0) {
      await Promise.all(keys.map(key => this.redis.del(key)));
    }
    if (listingId) {
      await this.redis.del(`listing:${listingId}`);
    }
  }

  private hashFilters(filters: ListingFilters): string {
    // Создаём короткий хеш фильтров для ключа Redis
    const str = JSON.stringify(filters);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
}
