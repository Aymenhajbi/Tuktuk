import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryProductsDto } from './dto/query-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryProductsDto) {
    const {
      search, categoryId, minPrice, maxPrice, minRating,
      featured, page = 1, limit = 20,
      sortBy = 'createdAt', sortOrder = 'desc',
    } = query;

    const where: Record<string, unknown> = { active: true };
    if (search) where['name'] = { contains: search, mode: 'insensitive' };
    if (categoryId) where['categoryId'] = categoryId;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where['price'] = {};
      if (minPrice !== undefined) (where['price'] as Record<string, unknown>)['gte'] = Number(minPrice);
      if (maxPrice !== undefined) (where['price'] as Record<string, unknown>)['lte'] = Number(maxPrice);
    }
    if (minRating !== undefined) where['rating'] = { gte: Number(minRating) };
    if (featured !== undefined) where['featured'] = featured === true || (featured as unknown) === 'true';

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy: { [sortBy]: sortOrder },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto, include: { category: true } });
  }

  async update(id: string, dto: Partial<CreateProductDto>) {
    return this.prisma.product.update({ where: { id }, data: dto, include: { category: true } });
  }

  async delete(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  async findCategories() {
    return this.prisma.category.findMany({ include: { _count: { select: { products: true } } } });
  }

  async createCategory(name: string, slug: string, image?: string) {
    return this.prisma.category.create({ data: { name, slug, image } });
  }

  async getFeatured() {
    return this.prisma.product.findMany({
      where: { featured: true, active: true },
      include: { category: { select: { id: true, name: true, slug: true } } },
      take: 8,
      orderBy: { rating: 'desc' },
    });
  }

  async getTrending() {
    return this.prisma.product.findMany({
      where: { active: true, rating: { gte: 4 } },
      include: { category: { select: { id: true, name: true, slug: true } } },
      take: 8,
      orderBy: { reviewCount: 'desc' },
    });
  }

  async createReview(productId: string, rating: number, author: string, title?: string, body?: string) {
    const review = await this.prisma.review.create({
      data: { productId, rating, author, title, body },
    });
    const agg = await this.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    });
    await this.prisma.product.update({
      where: { id: productId },
      data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count },
    });
    return review;
  }

  async createOrder(dto: CreateOrderDto, userId: string, userEmail: string) {
    const productIds = dto.items.map(i => i.productId);
    const products = await this.prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map(p => [p.id, p]));

    const total = dto.items.reduce((sum, item) => {
      const p = productMap.get(item.productId);
      return sum + (p ? (p.salePrice ?? p.price) * item.quantity : 0);
    }, 0);

    return this.prisma.order.create({
      data: {
        customerId: userEmail,
        userId,
        address: dto.address,
        total,
        items: {
          create: dto.items.map(item => {
            const p = productMap.get(item.productId)!;
            return { productId: item.productId, quantity: item.quantity, price: p.salePrice ?? p.price };
          }),
        },
      },
      include: { items: { include: { product: true } } },
    });
  }

  async getOrders(userId?: string, customerId?: string) {
    const where: Record<string, string> = {};
    if (userId) where.userId = userId;
    else if (customerId) where.customerId = customerId;
    return this.prisma.order.findMany({
      where,
      include: { items: { include: { product: { select: { id: true, name: true, images: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async seedDemo() {
    const existing = await this.prisma.category.count();
    if (existing > 0) return { message: 'Already seeded' };

    const categories = await Promise.all([
      this.prisma.category.create({ data: { name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' } }),
      this.prisma.category.create({ data: { name: 'Fashion', slug: 'fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' } }),
      this.prisma.category.create({ data: { name: 'Home & Living', slug: 'home-living', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' } }),
      this.prisma.category.create({ data: { name: 'Beauty', slug: 'beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' } }),
      this.prisma.category.create({ data: { name: 'Sports', slug: 'sports', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400' } }),
    ]);

    const [electronics, fashion, home, beauty, sports] = categories;

    await this.prisma.product.createMany({
      data: [
        { name: 'Wireless Earbuds Pro', description: 'Premium sound quality with active noise cancellation. 30h battery life, IPX5 waterproof.', price: 89.99, salePrice: 59.99, images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'], categoryId: electronics.id, brand: 'SoundMax', rating: 4.5, reviewCount: 234, stock: 150, sku: 'WEP-001', tags: ['wireless', 'earbuds', 'noise-cancelling'], featured: true },
        { name: 'Smart Watch Series X', description: 'Track fitness, receive notifications, and monitor health metrics. AMOLED display, GPS, heart rate monitor.', price: 199.99, salePrice: 149.99, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'], categoryId: electronics.id, brand: 'TechWear', rating: 4.7, reviewCount: 189, stock: 80, sku: 'SWX-001', tags: ['smartwatch', 'fitness', 'gps'], featured: true },
        { name: 'Portable Bluetooth Speaker', description: '360° surround sound, 20h playtime, waterproof and dustproof design.', price: 79.99, salePrice: 49.99, images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600'], categoryId: electronics.id, brand: 'BoomBox', rating: 4.3, reviewCount: 312, stock: 200, sku: 'PBS-001', tags: ['speaker', 'bluetooth', 'portable'], featured: false },
        { name: 'Men\'s Slim Fit Jacket', description: 'Premium quality slim fit jacket. Perfect for casual and semi-formal occasions.', price: 129.99, salePrice: 79.99, images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600'], categoryId: fashion.id, brand: 'UrbanStyle', rating: 4.4, reviewCount: 98, stock: 60, sku: 'MSJ-001', tags: ['jacket', 'men', 'slim-fit'], featured: true },
        { name: 'Women\'s Floral Dress', description: 'Elegant floral print dress. Breathable fabric, perfect for summer.', price: 69.99, salePrice: 44.99, images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600'], categoryId: fashion.id, brand: 'BloomWear', rating: 4.6, reviewCount: 156, stock: 90, sku: 'WFD-001', tags: ['dress', 'women', 'floral'], featured: false },
        { name: 'Minimalist Wall Clock', description: 'Scandinavian design wall clock. Silent movement, easy installation.', price: 45.99, salePrice: null, images: ['https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600'], categoryId: home.id, brand: 'NordicHome', rating: 4.8, reviewCount: 267, stock: 120, sku: 'MWC-001', tags: ['clock', 'minimalist', 'decor'], featured: true },
        { name: 'Aromatherapy Diffuser', description: 'Ultrasonic essential oil diffuser with 7 LED colors. 500ml capacity, auto shut-off.', price: 39.99, salePrice: 29.99, images: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600'], categoryId: home.id, brand: 'ZenHome', rating: 4.5, reviewCount: 445, stock: 200, sku: 'AD-001', tags: ['diffuser', 'aromatherapy', 'wellness'], featured: false },
        { name: 'Vitamin C Serum', description: 'Brightening serum with 20% Vitamin C. Reduces dark spots and boosts collagen.', price: 34.99, salePrice: 24.99, images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600'], categoryId: beauty.id, brand: 'GlowLab', rating: 4.6, reviewCount: 523, stock: 350, sku: 'VCS-001', tags: ['serum', 'vitamin-c', 'skincare'], featured: true },
        { name: 'Resistance Bands Set', description: 'Set of 5 resistance bands with different tension levels. Perfect for home workouts.', price: 24.99, salePrice: 19.99, images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600'], categoryId: sports.id, brand: 'FitPro', rating: 4.4, reviewCount: 678, stock: 500, sku: 'RBS-001', tags: ['fitness', 'resistance-bands', 'workout'], featured: false },
        { name: 'Yoga Mat Premium', description: 'Eco-friendly non-slip yoga mat. 6mm thickness, carrying strap included.', price: 49.99, salePrice: 34.99, images: ['https://images.unsplash.com/photo-1601925228880-9e4b35167e14?w=600'], categoryId: sports.id, brand: 'ZenFit', rating: 4.7, reviewCount: 334, stock: 180, sku: 'YMP-001', tags: ['yoga', 'mat', 'eco-friendly'], featured: true },
      ],
    });

    return { message: 'Demo data seeded successfully', categories: categories.length, products: 10 };
  }
}
