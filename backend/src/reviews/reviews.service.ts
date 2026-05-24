import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(fromUserId: string, toUserId: string, listingId: string, rating: number, comment?: string) {
    // Check if review already exists
    const existing = await this.prisma.review.findUnique({
      where: {
        fromUserId_listingId: {
          fromUserId,
          listingId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('You have already reviewed this transaction');
    }

    // Verify listing is sold
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { status: true, userId: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.status !== 'SOLD') {
      throw new ForbiddenException('Can only review sold listings');
    }

    const review = await this.prisma.review.create({
      data: {
        fromUserId,
        toUserId,
        listingId,
        rating,
        comment,
      },
      include: {
        fromUser: { select: { id: true, name: true, avatar: true } },
        toUser: { select: { id: true, name: true } },
        listing: {
          select: {
            watch: { select: { brand: true, model: true } },
          },
        },
      },
    });

    // Update user rating average
    const reviews = await this.prisma.review.findMany({
      where: { toUserId },
      select: { rating: true },
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await this.prisma.user.update({
      where: { id: toUserId },
      data: {
        ratingsAvg: Math.round(avgRating * 10) / 10,
        ratingsCount: reviews.length,
      },
    });

    return review;
  }

  async findByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { toUserId: userId },
      include: {
        fromUser: { select: { id: true, name: true, avatar: true } },
        listing: {
          select: {
            watch: { select: { brand: true, model: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
