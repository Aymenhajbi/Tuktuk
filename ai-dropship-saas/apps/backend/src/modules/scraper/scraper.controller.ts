import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { ScraperService } from './scraper.service';
import { SearchProductsDto } from './dto/search-products.dto';

@ApiTags('scraper')
@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Roles('ADMIN')
  @Post('search-products')
  searchProducts(@Body() dto: SearchProductsDto) {
    return this.scraperService.searchProducts(dto.keyword, dto.warehouse);
  }

  @Roles('ADMIN')
  @Get('product/:pid')
  getProductDetail(@Param('pid') pid: string) {
    return this.scraperService.getProductDetail(pid);
  }
}
