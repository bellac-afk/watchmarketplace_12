import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SendMessageDto } from './dto';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user conversations' })
  async getConversations(@CurrentUser() user: any) {
    return this.messagesService.getConversations(user.id);
  }

  @Get(':partnerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get messages with partner' })
  async getMessages(
    @CurrentUser() user: any,
    @Param('partnerId') partnerId: string,
    @Query('listingId') listingId?: string,
  ) {
    return this.messagesService.getMessages(user.id, partnerId, listingId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send message' })
  async sendMessage(@CurrentUser() user: any, @Body() dto: SendMessageDto) {
    return this.messagesService.sendMessage(user.id, dto.receiverId, dto.listingId, dto.content);
  }

  @Get('unread/count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unread messages count' })
  async getUnreadCount(@CurrentUser() user: any) {
    return { count: await this.messagesService.getUnreadCount(user.id) };
  }
}
