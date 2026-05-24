import { Controller, Get, Put, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto as any);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get(':id/ratings')
  @ApiOperation({ summary: 'Get user ratings and reviews' })
  async getRatings(@Param('id') id: string) {
    return this.usersService.getUserRatings(id);
  }

  @Get('me/favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user favorites' })
  async getFavorites(@CurrentUser() user: any) {
    return this.usersService.getFavorites(user.id);
  }

  @Post('favorites/:listingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add to favorites' })
  async addFavorite(@CurrentUser() user: any, @Param('listingId') listingId: string) {
    return this.usersService.addFavorite(user.id, listingId);
  }

  @Delete('favorites/:listingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove from favorites' })
  async removeFavorite(@CurrentUser() user: any, @Param('listingId') listingId: string) {
    return this.usersService.removeFavorite(user.id, listingId);
  }

  @Get('me/search-history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get search history' })
  async getSearchHistory(@CurrentUser() user: any) {
    return this.usersService.getSearchHistory(user.id);
  }
}
