import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';

export interface CJProduct {
  cjId: string;
  name: string;
  images: string[];
  supplierPriceUSD: number;
  suggestedPriceAED: number;
  categoryName: string;
  warehouse: string;       // e.g. 'CN', 'US', 'DE'
  warehouseLabel: string;  // human-readable, e.g. 'China', 'USA'
  shippingDays: string;    // e.g. '7-14', '3-7'
  rating: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const CJ_API = 'https://developers.cjdropshipping.com/api2.0/v1';

/** USD → AED at 3.67 FX with 2.5× UAE retail markup */
const toAED = (usd: number) => Math.round(usd * 3.67 * 2.5);

const WAREHOUSE_LABELS: Record<string, string> = {
  CN: 'China',  US: 'USA',    DE: 'Germany',
  GB: 'UK',     AU: 'Australia', FR: 'France',
  ES: 'Spain',  IT: 'Italy',  oversea: 'Overseas',
};

/** Estimated shipping days from each warehouse to UAE */
const SHIPPING_DAYS: Record<string, string> = {
  CN: '7-14', US: '10-18', DE: '7-12',
  GB: '7-12', AU: '12-18', FR: '7-12', ES: '7-12', IT: '7-12',
};

// ── Type helpers for CJ API responses ────────────────────────────────────────

interface CJTokenResponse {
  result: boolean;
  message: string;
  data?: { accessToken: string; refreshToken?: string };
}

interface CJListResponse {
  result: boolean;
  message: string;
  data?: {
    list: Record<string, unknown>[];
    total: number;
  };
}

interface CJDetailResponse {
  result: boolean;
  message: string;
  data?: Record<string, unknown>;
}

// ── Scraper Service ───────────────────────────────────────────────────────────

@Injectable()
export class ScraperService implements OnModuleInit {
  private readonly logger = new Logger(ScraperService.name);
  private tokenCache: { token: string; expiresAt: number } | null = null;
  private tokenRefreshPromise: Promise<string> | null = null;
  private readonly TOKEN_FILE = '/tmp/cj-token.json';

  // ── Credentials ─────────────────────────────────────────────────────────────

  private get apiKey()       { return process.env.CJ_API_KEY ?? ''; }
  private get isConfigured() { return !!this.apiKey; }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  onModuleInit() {
    try {
      const raw = readFileSync(this.TOKEN_FILE, 'utf8');
      const saved = JSON.parse(raw) as { token: string; expiresAt: number };
      if (saved.token && saved.expiresAt > Date.now()) {
        this.tokenCache = saved;
        this.logger.log(`CJ token loaded from disk (expires ${new Date(saved.expiresAt).toISOString()})`);
      }
    } catch {
      // No file yet — will authenticate on first search
    }
  }

  // ── Token management (cached 14 days — token valid 15 days) ─────────────────

  private saveTokenToDisk(cache: { token: string; expiresAt: number }) {
    try {
      writeFileSync(this.TOKEN_FILE, JSON.stringify(cache), 'utf8');
    } catch (err) {
      this.logger.warn(`Could not persist CJ token to disk: ${(err as Error).message}`);
    }
  }

  private async fetchNewToken(): Promise<string> {
    const res = await fetch(`${CJ_API}/authentication/getAccessToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: this.apiKey }),
    });

    const json = await res.json() as CJTokenResponse;
    if (!json.result || !json.data?.accessToken) {
      throw new Error(`CJ auth failed: ${json.message}`);
    }

    const cache = {
      token: json.data.accessToken,
      expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000, // cache 14d (token valid 15d)
    };
    this.tokenCache = cache;
    this.saveTokenToDisk(cache);
    this.logger.log('CJ Dropshipping: access token refreshed and persisted');
    return cache.token;
  }

  private async getToken(): Promise<string> {
    // Return cached token if still valid
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.token;
    }

    // Mutex: if a refresh is already in flight, wait for it instead of making a second auth call
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = this.fetchNewToken().finally(() => {
      this.tokenRefreshPromise = null;
    });
    return this.tokenRefreshPromise;
  }

  // ── Authenticated GET helper ─────────────────────────────────────────────────

  private async cjGet(path: string, params: Record<string, string | number> = {}): Promise<unknown> {
    const token = await this.getToken();
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
    const url = `${CJ_API}${path}${qs ? '?' + qs : ''}`;

    const res = await fetch(url, {
      headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error(`CJ HTTP ${res.status}`);
    const json = await res.json() as { result: boolean; message: string; data: unknown };
    if (!json.result) throw new Error(`CJ API: ${json.message}`);
    return json.data;
  }

  // ── Product mapper ───────────────────────────────────────────────────────────

  private mapProduct(raw: Record<string, unknown>, fallbackWarehouse = 'CN'): CJProduct {
    // Price (CJ returns strings sometimes)
    const supplierPriceUSD = parseFloat(String(raw['sellPrice'] ?? raw['variantSellPrice'] ?? '0')) || 0;

    // Images: main image + optional set
    const mainImg = String(raw['productImage'] ?? '').trim();
    const imgs: string[] = mainImg ? [mainImg] : [];
    const imgSet = raw['productImageSet'];
    if (Array.isArray(imgSet)) {
      for (const img of imgSet as string[]) {
        const s = String(img).trim();
        if (s && !imgs.includes(s)) imgs.push(s);
      }
    } else if (typeof imgSet === 'string' && imgSet) {
      for (const s of imgSet.split(',').map(x => x.trim()).filter(Boolean)) {
        if (!imgs.includes(s)) imgs.push(s);
      }
    }

    // Warehouse: prefer explicit warehouse list from response
    let warehouseCode = fallbackWarehouse;
    const wList = raw['warehouseList'] as Array<{ country?: string; warehouseCode?: string }> | undefined;
    if (Array.isArray(wList) && wList.length > 0) {
      // Prefer non-CN warehouse (closer to UAE = faster shipping)
      const overseas = wList.find(w => w.country && w.country !== 'CN');
      const best = overseas ?? wList[0];
      warehouseCode = best.country ?? (best.warehouseCode?.slice(0, 2)) ?? fallbackWarehouse;
    }

    // Shipping days: use CJ's own info if present, else our estimate
    let shippingDays = SHIPPING_DAYS[warehouseCode] ?? '7-14';
    const sInfo = raw['shippingInfo'] as Array<{ cnPostTime?: string }> | undefined;
    if (Array.isArray(sInfo) && sInfo[0]?.cnPostTime) {
      shippingDays = sInfo[0].cnPostTime;
    }

    return {
      cjId:             String(raw['pid'] ?? ''),
      name:             String(raw['productNameEn'] ?? raw['productName'] ?? ''),
      images:           imgs.slice(0, 6),
      supplierPriceUSD,
      suggestedPriceAED: toAED(supplierPriceUSD),
      categoryName:     String(raw['categoryName'] ?? 'General'),
      warehouse:        warehouseCode,
      warehouseLabel:   WAREHOUSE_LABELS[warehouseCode] ?? warehouseCode,
      shippingDays,
      rating:           Number(raw['productRating'] ?? raw['rating'] ?? 4.5),
    };
  }

  // ── Public: search products ───────────────────────────────────────────────────

  async searchProducts(keyword: string, warehouse?: string): Promise<{ products: CJProduct[]; total: number }> {
    if (!this.isConfigured) {
      this.logger.warn('CJ_API_KEY not configured — using mock catalogue');
      return this.mockSearch(keyword, warehouse);
    }

    try {
      const params: Record<string, string | number> = {
        productNameEn: keyword.trim(),
        pageNum:  1,
        pageSize: 30,
      };

      // Map our warehouse labels to CJ country codes
      // 'oversea' means any non-CN warehouse → omit warehouseCountryCode to search all
      if (warehouse && warehouse !== 'all' && warehouse !== 'oversea') {
        params['warehouseCountryCode'] = warehouse; // 'CN', 'US', etc.
      }

      const data = await this.cjGet('/product/list', params) as CJListResponse['data'];
      const list  = data?.list ?? [];
      const total = data?.total ?? list.length;

      // Resolve the fallback warehouse code (never pass UI filter words as country codes)
      const fallbackWh = (warehouse && warehouse !== 'all' && warehouse !== 'oversea')
        ? warehouse   // real country code like 'CN', 'US', 'DE'
        : 'CN';       // default

      // Map and optionally filter oversea products
      let products = list.map(p => this.mapProduct(p, fallbackWh));

      if (warehouse === 'oversea') {
        // Keep only products that have a non-CN warehouse available
        products = products.filter(p => p.warehouse !== 'CN');
        // If that leaves nothing (common — CJ inventory varies), return all with CN marked clearly
        if (products.length === 0) {
          products = list.map(p => this.mapProduct(p, 'CN'));
        }
      }

      this.logger.log(`CJ search "${keyword}" → ${products.length} products`);
      return { products, total };

    } catch (err) {
      this.logger.error(`CJ search error: ${(err as Error).message} — falling back to mock`);
      return this.mockSearch(keyword, warehouse);
    }
  }

  // ── Public: product detail ────────────────────────────────────────────────────

  async getProductDetail(pid: string): Promise<CJProduct | null> {
    if (!this.isConfigured) return null;
    try {
      const data = await this.cjGet('/product/query', { pid }) as CJDetailResponse['data'];
      if (!data) return null;
      return this.mapProduct(data as Record<string, unknown>);
    } catch (err) {
      this.logger.error(`CJ product detail error: ${(err as Error).message}`);
      return null;
    }
  }

  // ── Mock fallback ─────────────────────────────────────────────────────────────

  private mockSearch(keyword: string, warehouse?: string): { products: CJProduct[]; total: number } {
    const kw = keyword.toLowerCase().trim();
    let results = MOCK_CATALOGUE.filter(p =>
      p.name.toLowerCase().includes(kw) || p.categoryName.toLowerCase().includes(kw),
    );
    if (warehouse && warehouse !== 'all') {
      const wh = warehouse === 'oversea' ? 'oversea' : warehouse;
      results = results.filter(p => p.warehouse === wh);
    }
    return { products: results, total: results.length };
  }
}

// ── Mock catalogue (fallback when CJ credentials not set) ────────────────────

const MOCK: (o: Omit<CJProduct, 'suggestedPriceAED' | 'warehouseLabel'>) => CJProduct =
  o => ({ ...o, suggestedPriceAED: toAED(o.supplierPriceUSD), warehouseLabel: WAREHOUSE_LABELS[o.warehouse] ?? o.warehouse });

const MOCK_CATALOGUE: CJProduct[] = [
  MOCK({ cjId:'CJ-10045231', name:'Smart WiFi LED Strip Lights 5M RGB Color Changing',   images:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],  supplierPriceUSD:8.50,  categoryName:'Electronics',   warehouse:'oversea', shippingDays:'3-7', rating:4.6 }),
  MOCK({ cjId:'CJ-10038872', name:'Wireless Earbuds Bluetooth 5.3 Noise Cancelling TWS', images:['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'],  supplierPriceUSD:12.00, categoryName:'Electronics',   warehouse:'oversea', shippingDays:'3-7', rating:4.5 }),
  MOCK({ cjId:'CJ-10029104', name:'Magnetic Car Phone Holder 360° Dashboard Mount',       images:['https://images.unsplash.com/photo-1609692814858-f7cd2f0afa4f?w=400'],  supplierPriceUSD:3.50,  categoryName:'Automotive',    warehouse:'oversea', shippingDays:'3-7', rating:4.4 }),
  MOCK({ cjId:'CJ-10051887', name:'Portable Mini Neck Fan USB Rechargeable Bladeless',    images:['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400'],  supplierPriceUSD:9.50,  categoryName:'Electronics',   warehouse:'oversea', shippingDays:'3-7', rating:4.3 }),
  MOCK({ cjId:'CJ-10067342', name:'Smart Watch Fitness Tracker Heart Rate Blood Oxygen',  images:['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],  supplierPriceUSD:18.00, categoryName:'Electronics',   warehouse:'oversea', shippingDays:'3-7', rating:4.7 }),
  MOCK({ cjId:'CJ-10012345', name:'3-in-1 Fast Charging Cable USB-C Lightning MicroUSB', images:['https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400'],  supplierPriceUSD:2.80,  categoryName:'Electronics',   warehouse:'CN',      shippingDays:'7-14',rating:4.2 }),
  MOCK({ cjId:'CJ-10088923', name:'Resistance Loop Bands Set 5 Levels Fabric Glutes',    images:['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400'],  supplierPriceUSD:4.50,  categoryName:'Sports',        warehouse:'oversea', shippingDays:'3-7', rating:4.5 }),
  MOCK({ cjId:'CJ-10076512', name:'Insulated Stainless Steel Water Bottle 750ml',         images:['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400'],  supplierPriceUSD:6.00,  categoryName:'Sports',        warehouse:'oversea', shippingDays:'3-7', rating:4.6 }),
  MOCK({ cjId:'CJ-10043219', name:'Digital Kitchen Scale 5kg Precision 1g Tare Function',images:['https://images.unsplash.com/photo-1611784728558-6a9848d4c72d?w=400'],  supplierPriceUSD:8.00,  categoryName:'Home & Living',  warehouse:'oversea', shippingDays:'3-7', rating:4.4 }),
  MOCK({ cjId:'CJ-10034567', name:'Bamboo Cutting Board Set 3-Piece with Juice Grooves', images:['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'],  supplierPriceUSD:9.50,  categoryName:'Home & Living',  warehouse:'oversea', shippingDays:'3-7', rating:4.5 }),
  MOCK({ cjId:'CJ-10098234', name:'Vitamin C Brightening Face Serum 30ml Anti-Aging',    images:['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'],  supplierPriceUSD:7.50,  categoryName:'Beauty',        warehouse:'oversea', shippingDays:'3-7', rating:4.7 }),
  MOCK({ cjId:'CJ-10056781', name:'Hyaluronic Acid Moisturizer Cream Deep Hydration 50ml',images:['https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400'], supplierPriceUSD:8.50,  categoryName:'Beauty',        warehouse:'oversea', shippingDays:'3-7', rating:4.6 }),
  MOCK({ cjId:'CJ-10023456', name:'Rose Quartz Jade Facial Roller & Gua Sha Set',         images:['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400'],  supplierPriceUSD:5.50,  categoryName:'Beauty',        warehouse:'oversea', shippingDays:'3-7', rating:4.4 }),
  MOCK({ cjId:'CJ-10087654', name:'Silk Sleep Eye Mask Blackout Adjustable Strap',        images:['https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400'],  supplierPriceUSD:3.20,  categoryName:'Beauty',        warehouse:'oversea', shippingDays:'3-7', rating:4.3 }),
  MOCK({ cjId:'CJ-10065432', name:"Men's Breathable Polo Shirt Slim Fit Summer Casual",   images:['https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=400'],  supplierPriceUSD:8.00,  categoryName:'Fashion',       warehouse:'oversea', shippingDays:'3-7', rating:4.3 }),
  MOCK({ cjId:'CJ-10076890', name:"Women's High-Waist Linen Wide-Leg Pants Loose Fit",    images:['https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=400'],  supplierPriceUSD:10.00, categoryName:'Fashion',       warehouse:'oversea', shippingDays:'3-7', rating:4.5 }),
  MOCK({ cjId:'CJ-10021987', name:'Large Canvas Tote Bag Shoulder Zipper Reusable',       images:['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400'],  supplierPriceUSD:5.50,  categoryName:'Fashion',       warehouse:'CN',      shippingDays:'7-14',rating:4.2 }),
  MOCK({ cjId:'CJ-10054321', name:'Wide Brim Straw Beach Hat UV Protection Foldable',     images:['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400'],  supplierPriceUSD:6.50,  categoryName:'Fashion',       warehouse:'oversea', shippingDays:'3-7', rating:4.4 }),
  MOCK({ cjId:'CJ-10032145', name:'Car Aromatherapy Air Freshener Vent Clip Diffuser',    images:['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400'],  supplierPriceUSD:5.50,  categoryName:'Automotive',    warehouse:'oversea', shippingDays:'3-7', rating:4.5 }),
  MOCK({ cjId:'CJ-10078965', name:'Cable Management Box Organizer with 6 Outlet Surge',   images:['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400'],  supplierPriceUSD:7.00,  categoryName:'Home & Living',  warehouse:'oversea', shippingDays:'3-7', rating:4.3 }),
  MOCK({ cjId:'CJ-10043871', name:'Posture Corrector Back Brace Adjustable Shoulder',     images:['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'],  supplierPriceUSD:9.00,  categoryName:'Sports',        warehouse:'oversea', shippingDays:'3-7', rating:4.6 }),
  MOCK({ cjId:'CJ-10019234', name:'Speed Jump Rope Weighted Handles Adjustable Cable',    images:['https://images.unsplash.com/photo-1598889972250-f53a6cb82bd4?w=400'],  supplierPriceUSD:5.50,  categoryName:'Sports',        warehouse:'oversea', shippingDays:'3-7', rating:4.4 }),
  MOCK({ cjId:'CJ-10067123', name:'Reusable Silicone Food Storage Bags Set of 6',         images:['https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400'],  supplierPriceUSD:7.50,  categoryName:'Home & Living',  warehouse:'oversea', shippingDays:'3-7', rating:4.5 }),
  MOCK({ cjId:'CJ-10088001', name:'Makeup Brush Set 12pcs Professional Synthetic Vegan',  images:['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400'],  supplierPriceUSD:6.50,  categoryName:'Beauty',        warehouse:'oversea', shippingDays:'3-7', rating:4.6 }),
  MOCK({ cjId:'CJ-10055678', name:'Portable Blender USB Rechargeable Smoothie Bottle',    images:['https://images.unsplash.com/photo-1622480916113-9000ac49b79d?w=400'],  supplierPriceUSD:14.00, categoryName:'Home & Living',  warehouse:'oversea', shippingDays:'3-7', rating:4.7 }),
];
