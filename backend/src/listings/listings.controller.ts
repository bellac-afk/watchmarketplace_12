import { Controller, Get, Post, Put, Patch, Delete, Query, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, ListingStatus } from '@prisma/client';
import { CreateListingDto, UpdateListingDto, UpdateStatusDto } from './dto';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  constructor(private listingsService: ListingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all listings with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 24,
    @Query() filters: any,
    @Query('sortBy') sortBy = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    return this.listingsService.findAll(+page, +limit, filters, sortBy, sortOrder);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user listings' })
  async getMyListings(
    @CurrentUser() user: any,
    @Query('status') status?: ListingStatus,
  ) {
    return this.listingsService.getUserListings(user.id, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get listing by ID' })
  async findById(@Param('id') id: string, @Query('track') track?: string) {
    return this.listingsService.findById(id, track === 'true');
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new listing' })
  async create(@Body() dto: CreateListingDto, @CurrentUser() user: any) {
    return this.listingsService.create(user.id, dto as any);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update listing' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
    @CurrentUser() user: any,
  ) {
    return this.listingsService.update(id, user.id, dto as any, user.role === UserRole.ADMIN);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete listing' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.listingsService.delete(id, user.id, user.role === UserRole.ADMIN);
  }

  @Post(':id/bump')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bump listing to top' })
  async bump(@Param('id') id: string, @CurrentUser() user: any) {
    return this.listingsService.bump(id, user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update listing status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.listingsService.updateStatus(id, user.id, dto.status, user.role === UserRole.ADMIN);
  }
}
