import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
        listing: {
          select: {
            id: true,
            watch: { select: { brand: true, model: true, reference: true } },
            images: { take: 1 },
          },
        },
      },
    });

    // Group by conversation partner
    const conversations = new Map();
    messages.forEach(msg => {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partner: msg.senderId === userId ? msg.receiver : msg.sender,
          lastMessage: msg,
          unreadCount: msg.receiverId === userId && !msg.read ? 1 : 0,
          listing: msg.listing,
        });
      } else {
        const conv = conversations.get(partnerId);
        if (msg.receiverId === userId && !msg.read) {
          conv.unreadCount++;
        }
      }
    });

    return Array.from(conversations.values());
  }

  async getMessages(userId: string, partnerId: string, listingId?: string) {
    const where: Prisma.MessageWhereInput = {
      OR: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    };

    if (listingId) {
      where.listingId = listingId;
    }

    const messages = await this.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
        listing: {
          select: {
            id: true,
            watch: { select: { brand: true, model: true } },
            images: { take: 1 },
          },
        },
      },
    });

    // Mark messages as read
    await this.prisma.message.updateMany({
      where: {
        receiverId: userId,
        senderId: partnerId,
        read: false,
      },
      data: { read: true, readAt: new Date() },
    });

    return messages;
  }

  async sendMessage(senderId: string, receiverId: string, listingId: string, content: string) {
    // Verify listing exists
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { userId: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // Prevent messaging yourself
    if (listing.userId === senderId) {
      throw new ForbiddenException('Cannot message yourself');
    }

    const message = await this.prisma.message.create({
      data: {
        senderId,
        receiverId,
        listingId,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
        listing: {
          select: {
            id: true,
            watch: { select: { brand: true, model: true } },
          },
        },
      },
    });

    return message;
  }

  async getUnreadCount(userId: string) {
    return this.prisma.message.count({
      where: {
        receiverId: userId,
        read: false,
      },
    });
  }
}
