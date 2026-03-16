import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('products')
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('products')
  findAll(@Query() query: Record<string, unknown>) {
    return this.productsService.findAll(query as never);
  }

  @Get('products/featured')
  getFeatured() { return this.productsService.getFeatured(); }

  @Get('products/trending')
  getTrending() { return this.productsService.getTrending(); }

  @Get('products/:id')
  findOne(@Param('id') id: string) { return this.productsService.findOne(id); }

  @Post('products')
  create(@Body() dto: CreateProductDto) { return this.productsService.create(dto); }

  @Put('products/:id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.productsService.update(id, dto);
  }

  @Delete('products/:id')
  delete(@Param('id') id: string) { return this.productsService.delete(id); }

  @Get('categories')
  findCategories() { return this.productsService.findCategories(); }

  @Post('categories')
  createCategory(@Body() body: { name: string; slug: string; image?: string }) {
    return this.productsService.createCategory(body.name, body.slug, body.image);
  }

  @Post('products/:id/reviews')
  createReview(
    @Param('id') id: string,
    @Body() body: { rating: number; author: string; title?: string; body?: string },
  ) {
    return this.productsService.createReview(id, body.rating, body.author, body.title, body.body);
  }

  @Post('orders')
  createOrder(@Body() dto: CreateOrderDto) { return this.productsService.createOrder(dto); }

  @Get('orders')
  getOrders(@Query('customerId') customerId: string) {
    return this.productsService.getOrders(customerId);
  }

  @Post('seed')
  seed() { return this.productsService.seedDemo(); }
}
