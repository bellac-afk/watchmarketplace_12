import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete search' })
  async autocomplete(@Query('q') query: string) {
    return this.searchService.autocomplete(query);
  }

  @Get('reference/:ref')
  @ApiOperation({ summary: 'Search by reference number' })
  async searchByReference(@Param('ref') reference: string) {
    return this.searchService.searchByReference(reference);
  }

  @Get('price-history/:watchId')
  @ApiOperation({ summary: 'Get price history for watch' })
  async getPriceHistory(@Param('watchId') watchId: string) {
    return this.searchService.getPriceHistory(watchId);
  }

  @Get('market-stats/:watchId')
  @ApiOperation({ summary: 'Get market statistics' })
  async getMarketStats(@Param('watchId') watchId: string) {
    return this.searchService.getMarketStats(watchId);
  }
}
