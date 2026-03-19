import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryProductsDto } from './dto/query-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { PromoCodesService } from '../promo-codes/promo-codes.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly promoCodes: PromoCodesService,
  ) {}

  async findAll(query: QueryProductsDto) {
    const {
      search, categoryId, minPrice, maxPrice, minRating,
      featured, page = 1, limit = 20,
      sortBy = 'createdAt', sortOrder = 'desc',
      showAll,
    } = query;

    const where: Record<string, unknown> = {};
    if (!showAll || (showAll as unknown) === 'false') where['active'] = true;
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
    // Use pre-calculated aiScore from AliExpress import if provided, else compute heuristically
    const { score, breakdown } = dto.aiScore !== undefined
      ? { score: dto.aiScore, breakdown: dto.scoreBreakdown ?? {} }
      : this.calculateAiScore(dto);
    const sku = dto.sku?.trim() || `IMP-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const { aiScore: _a, scoreBreakdown: _b, ...rest } = dto;
    return this.prisma.product.create({
      data: { ...rest, sku, aiScore: score, scoreBreakdown: breakdown },
      include: { category: true },
    });
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

    const subtotal = dto.items.reduce((sum, item) => {
      const p = productMap.get(item.productId);
      return sum + (p ? (p.salePrice ?? p.price) * item.quantity : 0);
    }, 0);

    let total = subtotal;
    if (dto.promoCode) {
      const { discountAmount } = await this.promoCodes.applyToOrder(dto.promoCode, subtotal);
      total = Math.max(0, subtotal - discountAmount);
    }

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

  async updateOrderStatus(id: string, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status: status as never },
      include: { items: { include: { product: { select: { id: true, name: true, images: true } } } } },
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

  // ─── AI Score ─────────────────────────────────────────────────────────────

  private calculateAiScore(
    dto: Partial<CreateProductDto>,
    signals?: { sellerRating: number; orderCount: number; trendScore: number; reviewCount: number },
  ): { score: number; breakdown: Record<string, number> } {
    // 1. Trend velocity (0–25 pts) — real Google Trends or heuristic fallback
    const trendRaw = signals?.trendScore ?? this.hashBasedTrend(dto.name ?? '');
    const trend = Math.round(trendRaw * 0.25);

    // 2. Margin potential (0–20 pts)
    const salePrice = dto.salePrice ?? dto.price ?? 0;
    const costPrice = salePrice / 2.5; // reverse 2.5× UAE markup
    const marginPct = salePrice > 0 ? ((salePrice - costPrice) / salePrice) * 100 : 60;
    const margin = Math.round(Math.min(marginPct, 100) * 0.20);

    // 3. Supplier reliability (0–20 pts) — real seller rating or neutral default
    const rating = signals?.sellerRating ?? 0;
    const supplier = rating > 0 ? Math.round(Math.min(rating * 4, 20)) : 10;

    // 4. Market saturation (0–20 pts) — more orders = more saturated = lower score
    const orders = signals?.orderCount ?? 0;
    const satPct = orders > 0 ? Math.max(0, 100 - orders / 500) : 65;
    const saturation = Math.round(satPct * 0.20);

    // 5. Quality bonus (0–15 pts)
    let bonus = 0;
    if ((dto.images?.length ?? 0) >= 3) bonus += 4;
    if ((dto.description?.length ?? 0) > 50) bonus += 3;
    if (dto.salePrice && dto.salePrice < (dto.price ?? Infinity)) bonus += 4;
    if ((signals?.reviewCount ?? 0) > 100) bonus += 2;
    if (dto.brand) bonus += 2;

    const score = Math.min(100, Math.max(1, trend + margin + supplier + saturation + bonus));
    return { score, breakdown: { trend, margin, supplier, saturation, bonus } };
  }

  private hashBasedTrend(name: string): number {
    const hash = name.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
    return 35 + (Math.abs(hash) % 30); // 35–65 stable estimate
  }

  // ─── Keyword extraction ───────────────────────────────────────────────────

  private extractKeyword(name: string): string {
    const STOP = new Set([
      // articles / conjunctions / prepositions
      'the','a','an','and','or','for','with','in','of','to','from','by','at',
      // generic product words (these add no search value)
      'brand','case','kit','pack','set','cover','bag','box','type','style',
      'pcs','pc','piece','pieces','pair','lot','item','items',
      // quality / marketing noise
      'new','hot','best','top','free','cheap','sale','good','nice','cool',
      'high','quality','premium','luxury','original','genuine','official',
      'portable','mini','super','ultra','pro','plus','max','lite',
      // time / shipping noise
      'shipping','delivery','fast','2024','2025','latest',
    ]);
    return name
      .toLowerCase()
      .replace(/\d+%?\s*(off|sale|discount)?/gi, '')          // strip "40% off"
      .replace(/\d+\s*x\s*\d+\s*\w*/gi, '')                  // strip "30x40cm"
      .replace(/\d+\s*(ml|g|kg|cm|mm|inch|oz|lb|w|v|mah)\b/gi, '') // strip specs
      .split(/[\s,;:&|()+\-\/\\]+/)
      .filter(w => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w))
      .slice(0, 3)
      .join(' ')
      .trim();
  }

  // ─── Google Trends ────────────────────────────────────────────────────────

  private async getGoogleTrendsScore(keyword: string): Promise<number> {
    if (!keyword) return this.hashBasedTrend(keyword);
    try {
      // Step 1: get widget token from explore endpoint
      const reqParam = JSON.stringify({
        comparisonItem: [{ keyword, geo: 'AE', time: 'now 7-d' }],
        category: 0,
        property: '',
      });
      const exploreUrl = `https://trends.google.com/trends/api/explore?hl=en-US&tz=-180&req=${encodeURIComponent(reqParam)}`;

      const ac1 = new AbortController();
      const t1 = setTimeout(() => ac1.abort(), 8000);
      const exploreRes = await fetch(exploreUrl, {
        signal: ac1.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://trends.google.com/',
        },
      });
      clearTimeout(t1);
      if (!exploreRes.ok) return this.hashBasedTrend(keyword);

      const exploreText = await exploreRes.text();
      const exploreJson = JSON.parse(exploreText.replace(/^\)\]\}'\n/, '')) as {
        widgets?: Array<{ id: string; token: string; request: unknown }>;
      };

      const tsWidget = exploreJson.widgets?.find(w => w.id === 'TIMESERIES');
      if (!tsWidget) return this.hashBasedTrend(keyword);

      // Step 2: fetch actual interest-over-time data
      const multilineUrl =
        `https://trends.google.com/trends/api/widgetdata/multiline` +
        `?hl=en-US&tz=-180` +
        `&req=${encodeURIComponent(JSON.stringify(tsWidget.request))}` +
        `&token=${encodeURIComponent(tsWidget.token)}`;

      const ac2 = new AbortController();
      const t2 = setTimeout(() => ac2.abort(), 8000);
      const dataRes = await fetch(multilineUrl, {
        signal: ac2.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://trends.google.com/',
        },
      });
      clearTimeout(t2);
      if (!dataRes.ok) return this.hashBasedTrend(keyword);

      const dataText = await dataRes.text();
      const dataJson = JSON.parse(dataText.replace(/^\)\]\}'\n/, '')) as {
        default?: { timelineData?: Array<{ value: number[] }> };
      };

      const timeline = dataJson?.default?.timelineData ?? [];
      const values = timeline.map(p => p.value[0]).filter(v => typeof v === 'number' && !isNaN(v));
      if (!values.length) return this.hashBasedTrend(keyword);

      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return Math.round(Math.min(100, Math.max(0, avg)));
    } catch {
      // Google blocked, rate-limited, or parse failed — fall back to hash estimate
      return this.hashBasedTrend(keyword);
    }
  }

  // ─── AliExpress seller signal extraction ─────────────────────────────────

  /** Pull first regex match > threshold from a string. Returns 0 on miss. */
  private firstMatch(html: string, patterns: RegExp[], threshold = 0): number {
    for (const re of patterns) {
      const m = html.match(re);
      if (m) {
        const v = parseFloat(m[1].replace(/,/g, ''));
        if (!isNaN(v) && v > threshold) return v;
      }
    }
    return 0;
  }

  /** Safe deep-get on an unknown JSON object, returns undefined on any miss. */
  private deepGet(obj: unknown, ...keys: string[]): unknown {
    let cur = obj;
    for (const k of keys) {
      if (cur == null || typeof cur !== 'object') return undefined;
      cur = (cur as Record<string, unknown>)[k];
    }
    return cur;
  }

  private extractSellerData(html: string): { sellerRating: number; orderCount: number; reviewCount: number } {
    // ── Diagnostics ──────────────────────────────────────────────────────────
    console.log('[AliExpress] HTML length:', html.length);
    const hasRunParams  = html.includes('window.runParams');
    const hasTradeCount = html.includes('tradeCount');
    const hasSellerKey  = html.includes('sellerScore') || html.includes('sellerFeedback') || html.includes('positiveRate');
    console.log('[AliExpress] Keys — runParams:', hasRunParams, 'tradeCount:', hasTradeCount, 'sellerKey:', hasSellerKey);

    // ── Strategy 1: parse window.runParams JSON ──────────────────────────────
    // When AliExpress serves a full page the object looks like:
    // window.runParams = { data: { sellerComponent:{sellerScore,sellerFeedbackScore},
    //                               tradeComponent:{tradeCount,formatTradeCount},
    //                               feedbackComponent:{totalValidNum,star} } }
    let sellerRating = 0;
    let orderCount   = 0;
    let reviewCount  = 0;

    const rpMatch = html.match(/window\.runParams\s*=\s*(\{[\s\S]*?\});\s*(?:window\.|\/\/|$)/);
    if (rpMatch) {
      try {
        const rp = JSON.parse(rpMatch[1]) as Record<string, unknown>;
        const data = (rp['data'] ?? rp) as Record<string, unknown>;

        // Seller rating (percentage 0-100 → 0-5)
        const sc = this.deepGet(data, 'sellerComponent');
        if (sc) {
          const raw =
            Number(this.deepGet(sc, 'sellerFeedbackScore') ?? 0) ||
            Number(this.deepGet(sc, 'sellerScore') ?? 0) ||
            Number(this.deepGet(sc, 'positiveRate') ?? 0);
          if (raw > 0) sellerRating = parseFloat((raw > 5 ? raw / 20 : raw).toFixed(2));
        }

        // Order count
        const tc = this.deepGet(data, 'tradeComponent') as Record<string, unknown> | undefined;
        if (tc) {
          const raw =
            parseInt(String(this.deepGet(tc, 'tradeCount') ?? '0').replace(/[^\d]/g, ''), 10) ||
            parseInt(String(this.deepGet(tc, 'formatTradeCount') ?? '0').replace(/[^\d]/g, ''), 10);
          if (raw > 0) orderCount = raw;
        }

        // Review count
        const fc = this.deepGet(data, 'feedbackComponent') as Record<string, unknown> | undefined;
        if (fc) {
          const raw =
            parseInt(String(this.deepGet(fc, 'totalValidNum') ?? '0'), 10) ||
            parseInt(String(this.deepGet(fc, 'totalStarNum') ?? '0'), 10);
          if (raw > 0) reviewCount = raw;
        }

        console.log('[AliExpress] runParams parse — sellerRating:', sellerRating, 'orderCount:', orderCount, 'reviewCount:', reviewCount);
      } catch {
        console.log('[AliExpress] runParams parse failed — falling back to regex');
      }
    }

    // ── Strategy 2: broad regex fallback (CSR / partial pages) ──────────────
    if (sellerRating === 0) {
      const raw = this.firstMatch(html, [
        /"sellerScore":\s*"?([\d.]+)"?/,
        /"tradeScore":\s*"?([\d.]+)"?/,
        /"sellerFeedbackScore":\s*"?([\d.]+)"?/,
        /"positiveRate":\s*"?([\d.]+)"?/,
        /"feedbackPositive":\s*"?([\d.]+)"?/,
        /"sellerFeedbackPercent":\s*"?([\d.]+)"?/,
        /([\d.]+)%\s*positive\s*feedback/i,
      ]);
      if (raw > 0) sellerRating = parseFloat((raw > 5 ? raw / 20 : raw).toFixed(2));
    }

    if (orderCount === 0) {
      orderCount = Math.round(this.firstMatch(html, [
        /"tradeCount":\s*"?([\d,]+)"?/,
        /"formatTradeCount":\s*"?([\d,]+)"?/,
        /"soldCount":\s*"?([\d,]+)"?/,
        /"orderCount":\s*(\d+)/,
        /([\d,]+)\+?\s*(?:sold|orders)/i,
      ]));
    }

    if (reviewCount === 0) {
      reviewCount = Math.round(this.firstMatch(html, [
        /"totalEvaluation":\s*(\d+)/,
        /"totalValidNum":\s*(\d+)/,
        /"totalStarNum":\s*(\d+)/,
        /"feedbackCount":\s*(\d+)/,
        /"reviewCount":\s*(\d+)/,
        /"evaluationCount":\s*(\d+)/,
      ]));
    }

    console.log('[AliExpress] Final signals — sellerRating:', sellerRating, 'orderCount:', orderCount, 'reviewCount:', reviewCount);
    return { sellerRating, orderCount, reviewCount };
  }

  // ─── AliExpress import ────────────────────────────────────────────────────

  async importFromAliExpress(url: string) {
    if (!/aliexpress\.(com|us)\/item\//i.test(url)) {
      throw new BadRequestException('Please provide a valid AliExpress product URL (must contain aliexpress.com/item/)');
    }

    let html: string;
    try {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 15000);
      const res = await fetch(url, {
        signal: ac.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
      });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (err) {
      throw new BadRequestException(`Could not fetch product page: ${(err as Error).message}`);
    }

    // — Name —
    let name = this.extractOGMeta(html, 'og:title') || this.extractTitle(html) || '';
    name = name
      .replace(/^\d+%?\s*(?:OFF|off)\s*[|│]\s*/g, '')
      .replace(/\s*[|│].*$/, '')
      .replace(/\s*[-–]\s*AliExpress.*$/i, '')
      .trim();

    // — Description —
    const description = (
      this.extractOGMeta(html, 'og:description') ||
      this.extractMetaName(html, 'description')
    ).slice(0, 1000).trim();

    // — Images —
    const images: string[] = [];
    const ogImg = this.extractOGMeta(html, 'og:image');
    if (ogImg) images.push(ogImg.startsWith('//') ? `https:${ogImg}` : ogImg);
    const imgListMatch = html.match(/"imagePathList"\s*:\s*(\["[^"]*"(?:\s*,\s*"[^"]*")*\])/);
    if (imgListMatch) {
      try {
        const list = JSON.parse(imgListMatch[1]) as string[];
        for (const img of list) {
          const normalized = img.startsWith('//') ? `https:${img}` : img;
          if (!images.includes(normalized)) images.push(normalized);
        }
      } catch { /* ignore */ }
    }

    // — Price (USD) —
    let priceUSD = 0;
    const pricePatterns = [
      /"formatedAmount"\s*:\s*"([^"]+)"/,
      /"minAmount"\s*:\s*"([^"]+)"/,
      /"activityAmount"\s*:\s*"([^"]+)"/,
      /"maxActivityAmount"\s*:\s*"([^"]+)"/,
      /<meta[^>]+property="og:price:amount"[^>]+content="([^"]+)"/i,
    ];
    for (const re of pricePatterns) {
      const m = html.match(re);
      if (m) {
        const parsed = parseFloat(m[1].replace(/[^0-9.]/g, ''));
        if (parsed > 0) { priceUSD = parsed; break; }
      }
    }
    const priceAED = priceUSD > 0 ? Math.round(priceUSD * 3.67 * 2.5) : 0;

    // — Real supplier signals —
    const { sellerRating, orderCount, reviewCount } = this.extractSellerData(html);

    // — Google Trends (UAE region, with fallback) —
    const keyword = this.extractKeyword(name);
    const trendScore = await this.getGoogleTrendsScore(keyword);

    // — AI Score with real signals —
    const dtoLike = { name, description, images, price: priceAED, salePrice: priceAED };
    const { score: aiScore, breakdown: scoreBreakdown } = this.calculateAiScore(dtoLike, {
      sellerRating,
      orderCount,
      trendScore,
      reviewCount,
    });

    return {
      name,
      description,
      images: images.slice(0, 8),
      priceUSD,
      priceAED,
      sourceUrl: url,
      // Real signals
      sellerRating,
      orderCount,
      reviewCount,
      trendScore,
      keyword,
      // Pre-calculated score
      aiScore,
      scoreBreakdown,
    };
  }

  private extractOGMeta(html: string, property: string): string {
    const m =
      html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*?)["']`, 'i')) ||
      html.match(new RegExp(`<meta[^>]+content=["']([^"']*?)["'][^>]+property=["']${property}["']`, 'i'));
    return m ? m[1] : '';
  }

  private extractMetaName(html: string, name: string): string {
    const m =
      html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*?)["']`, 'i')) ||
      html.match(new RegExp(`<meta[^>]+content=["']([^"']*?)["'][^>]+name=["']${name}["']`, 'i'));
    return m ? m[1] : '';
  }

  private extractTitle(html: string): string {
    const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return m ? m[1].trim() : '';
  }
}
