import { Controller, Post, Body } from '@nestjs/common';
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
}
