import { Controller, Get, Post, Put, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WatchesService } from './watches.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateWatchDto, UpdateWatchDto, WatchFiltersDto } from './dto';

@ApiTags('Watches')
@Controller('watches')
export class WatchesController {
  constructor(private watchesService: WatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all watches with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 24,
    @Query() filters: WatchFiltersDto,
    @Query('sortBy') sortBy = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    return this.watchesService.findAll(+page, +limit, filters, sortBy, sortOrder);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search watches by query' })
  async search(@Query('q') query: string) {
    return this.watchesService.search(query);
  }

  @Get('reference/:ref')
  @ApiOperation({ summary: 'Find watch by reference number' })
  async findByReference(@Param('ref') reference: string) {
    return this.watchesService.findByReference(reference);
  }

  @Get('compare')
  @ApiOperation({ summary: 'Compare multiple watches' })
  async compare(@Query('ids') ids: string) {
    const idArray = ids.split(',');
    return this.watchesService.compare(idArray);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get watch by ID' })
  async findById(@Param('id') id: string) {
    return this.watchesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create watch (Admin only)' })
  async create(@Body() dto: CreateWatchDto) {
    return this.watchesService.create(dto as any);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update watch (Admin only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateWatchDto) {
    return this.watchesService.update(id, dto as any);
  }
}
