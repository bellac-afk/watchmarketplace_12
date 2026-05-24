import { Controller, Get, Put, Delete, Post, Query, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, ListingStatus } from '@prisma/client';
import { AdminUpdateListingDto, AdminUpdateUserDto, UpdateListingStatusDto, UpdateUserRoleDto, UpdateUserVerificationDto, CreateBrandDto, UpdateBrandDto } from './dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  async getDashboardStats(@CurrentUser() admin: any) {
    return this.adminService.getDashboardStats();
  }

  @Get('listings')
  @ApiOperation({ summary: 'Get all listings (admin view)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ListingStatus })
  @ApiQuery({ name: 'search', required: false })
  async getAllListings(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('status') status?: ListingStatus,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllListings(+page, +limit, status, search);
  }

  @Get('listings/:id')
  @ApiOperation({ summary: 'Get listing details (admin)' })
  async getListingById(@Param('id') id: string) {
    return this.adminService.getListingById(id);
  }

  @Put('listings/:id')
  @ApiOperation({ summary: 'Update any listing (admin override)' })
  async updateListing(
    @Param('id') id: string,
    @Body() dto: AdminUpdateListingDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.updateListing(id, dto, admin.id);
  }

  @Delete('listings/:id')
  @ApiOperation({ summary: 'Delete any listing (admin)' })
  async deleteListing(
    @Param('id') id: string,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.deleteListing(id, admin.id);
  }

  @Put('listings/:id/status')
  @ApiOperation({ summary: 'Change listing status (admin)' })
  async updateListingStatus(
    @Param('id') id: string,
    @CurrentUser() admin: any,
    @Body() dto: UpdateListingStatusDto,
  ) {
    return this.adminService.updateListingStatus(id, dto.status, dto.reason, admin.id);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'search', required: false })
  async getAllUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('role') role?: UserRole,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(+page, +limit, role, search);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details (admin)' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update user (admin)' })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.updateUser(id, dto, admin.id);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (admin)' })
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.deleteUser(id, admin.id);
  }

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Change user role' })
  async updateUserRole(
    @Param('id') id: string,
    @CurrentUser() admin: any,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(id, dto.role, admin.id);
  }

  @Put('users/:id/verification')
  @ApiOperation({ summary: 'Update user verification status' })
  async updateUserVerification(
    @Param('id') id: string,
    @CurrentUser() admin: any,
    @Body() dto: UpdateUserVerificationDto,
  ) {
    return this.adminService.updateUserVerification(id, dto.status, dto.reason, admin.id);
  }

  @Get('watches')
  @ApiOperation({ summary: 'Get all watches (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  async getAllWatches(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllWatches(+page, +limit, search);
  }

  @Get('brands')
  @ApiOperation({ summary: 'Get all brands (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllBrands(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.adminService.getAllBrands(+page, +limit);
  }

  @Post('brands')
  @ApiOperation({ summary: 'Create brand (admin)' })
  async createBrand(
    @Body() dto: CreateBrandDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.createBrand(dto, admin.id);
  }

  @Put('brands/:id')
  @ApiOperation({ summary: 'Update brand (admin)' })
  async updateBrand(
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.updateBrand(id, dto, admin.id);
  }

  @Delete('brands/:id')
  @ApiOperation({ summary: 'Delete brand (admin)' })
  async deleteBrand(@Param('id') id: string, @CurrentUser() admin: any) {
    return this.adminService.deleteBrand(id, admin.id);
  }

  @Get('reviews')
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllReviews(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.adminService.getAllReviews(+page, +limit);
  }

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Delete review (admin)' })
  async deleteReview(@Param('id') id: string, @CurrentUser() admin: any) {
    return this.adminService.deleteReview(id, admin.id);
  }

  @Get('activity-log')
  @ApiOperation({ summary: 'Get admin activity log' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getActivityLog(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.adminService.getActivityLog(+page, +limit);
  }
}
