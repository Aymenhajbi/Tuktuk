import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('products')
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get('products')
  findAll(@Query() query: Record<string, unknown>) {
    return this.productsService.findAll(query as never);
  }

  @Public()
  @Get('products/featured')
  getFeatured() { return this.productsService.getFeatured(); }

  @Public()
  @Get('products/trending')
  getTrending() { return this.productsService.getTrending(); }

  @Public()
  @Get('products/:id')
  findOne(@Param('id') id: string) { return this.productsService.findOne(id); }

  @Roles('ADMIN')
  @Post('products/import/aliexpress')
  importAliExpress(@Body() body: { url: string }) {
    return this.productsService.importFromAliExpress(body.url);
  }

  @Roles('ADMIN')
  @Post('products')
  create(@Body() dto: CreateProductDto) { return this.productsService.create(dto); }

  @Roles('ADMIN')
  @Put('products/:id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.productsService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete('products/:id')
  delete(@Param('id') id: string) { return this.productsService.delete(id); }

  @Public()
  @Get('categories')
  findCategories() { return this.productsService.findCategories(); }

  @Roles('ADMIN')
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
  createOrder(
    @Body() dto: CreateOrderDto,
    @GetUser() user: { sub: string; email: string },
  ) {
    // Derive customerId from the verified JWT — never trust client-supplied value
    dto.customerId = user.sub;
    return this.productsService.createOrder(dto, user.sub, user.email);
  }

  @Get('orders')
  getOrders(@GetUser() user: { sub: string; role: string }, @Query('customerId') customerId?: string) {
    const userId = user.role === 'ADMIN' ? undefined : user.sub;
    return this.productsService.getOrders(userId, customerId);
  }

  @Roles('ADMIN')
  @Put('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.productsService.updateOrderStatus(id, body.status);
  }

  @Public()
  @Post('seed')
  seed() { return this.productsService.seedDemo(); }
}
