const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

async function req<T = unknown>(method: string, path: string, body?: unknown, auth = false): Promise<T> {
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  const token = auth ? getToken() : null;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
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
export interface AuthResponse { access_token: string; refresh_token: string }
export interface User { id: string; email: string; name: string; role: string }

export const api = {
  // Public
  getProducts: (params?: Record<string, string | number | boolean>) => {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : '';
    return req<ProductsResponse>('GET', `/products${qs}`);
  },
  getProduct: (id: string) => req<ProductDetail>('GET', `/products/${id}`),
  getFeatured: () => req<Product[]>('GET', '/products/featured'),
  getTrending: () => req<Product[]>('GET', '/products/trending'),
  getCategories: () => req<Category[]>('GET', '/categories'),
  addReview: (productId: string, body: { rating: number; author: string; title?: string; body?: string }) =>
    req('POST', `/products/${productId}/reviews`, body, true),

  // Auth
  register: (name: string, email: string, password: string) =>
    req<AuthResponse>('POST', '/auth/register', { name, email, password }),
  login: (email: string, password: string) =>
    req<AuthResponse>('POST', '/auth/login', { email, password }),
  logout: (refresh_token: string) =>
    req('POST', '/auth/logout', { refresh_token }),
  refresh: (refresh_token: string) =>
    req<AuthResponse>('POST', '/auth/refresh', { refresh_token }),
  me: () => req<User>('GET', '/auth/me', undefined, true),

  // Protected
  createOrder: (body: { address: string; items: Array<{ productId: string; quantity: number }> }) =>
    req<Order>('POST', '/orders', body, true),
  getOrders: () => req<Order[]>('GET', '/orders', undefined, true),
};
