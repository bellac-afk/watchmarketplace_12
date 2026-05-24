import { Controller, Get, Post, Delete, Param, UseGuards, Query, ParseIntPipe, DefaultValuePipe, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByUser(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(24), ParseIntPipe) limit: number,
  ) {
    if (page < 1) throw new BadRequestException('Page must be >= 1');
    if (limit < 1 || limit > 100) throw new BadRequestException('Limit must be between 1 and 100');

    return this.favoritesService.findByUser(user.id, page, limit);
  }

  @Post(':listingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add to favorites' })
  async create(
    @CurrentUser() user: any,
    @Param('listingId') listingId: string,
  ) {
    if (!this.isValidUUID(listingId)) {
      throw new BadRequestException('Invalid listing ID format');
    }

    return this.favoritesService.create(user.id, listingId);
  }

  @Delete(':listingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove from favorites' })
  async delete(
    @CurrentUser() user: any,
    @Param('listingId') listingId: string,
  ) {
    if (!this.isValidUUID(listingId)) {
      throw new BadRequestException('Invalid listing ID format');
    }

    return this.favoritesService.delete(user.id, listingId);
  }

  @Get('check/:listingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if listing is in favorites' })
  async isFavorite(
    @CurrentUser() user: any,
    @Param('listingId') listingId: string,
  ) {
    if (!this.isValidUUID(listingId)) {
      throw new BadRequestException('Invalid listing ID format');
    }

    const isFav = await this.favoritesService.isFavorite(user.id, listingId);
    return { isFavorite: isFav };
  }

  private isValidUUID(str: string): boolean {
    // ИСПРАВЛЕННЫЙ REGEX: [0-9a-f] вместо \[0-9a-f\]
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}
