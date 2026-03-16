const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function req<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export interface Category { id: string; name: string; slug: string; image?: string; _count?: { products: number } }
export interface Product {
  id: string; name: string; description?: string; price: number; salePrice?: number;
  images: string[]; category: Category; brand?: string; rating: number; reviewCount: number;
  stock: number; tags: string[]; featured: boolean;
}
export interface Review { id: string; rating: number; title?: string; body?: string; author: string; createdAt: string }
export interface ProductDetail extends Product { reviews: Review[] }
export interface ProductsResponse { data: Product[]; total: number; page: number; limit: number; pages: number }
export interface Order {
  id: string; customerId: string; status: string; total: number; address: string;
  createdAt: string; items: Array<{ id: string; quantity: number; price: number; product: { id: string; name: string; images: string[] } }>;
}

export const api = {
  getProducts: (params?: Record<string, string | number | boolean>) => {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : '';
    return req<ProductsResponse>('GET', `/products${qs}`);
  },
  getProduct: (id: string) => req<ProductDetail>('GET', `/products/${id}`),
  getFeatured: () => req<Product[]>('GET', '/products/featured'),
  getTrending: () => req<Product[]>('GET', '/products/trending'),
  getCategories: () => req<Category[]>('GET', '/categories'),
  createOrder: (body: { customerId: string; address: string; items: Array<{ productId: string; quantity: number }> }) =>
    req<Order>('POST', '/orders', body),
  getOrders: (customerId: string) => req<Order[]>('GET', `/orders?customerId=${customerId}`),
  addReview: (productId: string, body: { rating: number; author: string; title?: string; body?: string }) =>
    req('POST', `/products/${productId}/reviews`, body),
};
