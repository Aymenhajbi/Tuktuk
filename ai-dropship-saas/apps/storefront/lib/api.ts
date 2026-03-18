const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

// Shared promise so concurrent 401s only trigger one refresh call
let refreshing: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  const rt = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
  if (!rt) throw new Error('no refresh token');
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: rt }),
  });
  if (!res.ok) throw new Error('refresh failed');
  const { access_token, refresh_token } = await res.json() as { access_token: string; refresh_token: string };
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
}

async function req<T = unknown>(method: string, path: string, body?: unknown, auth = false, retry = true): Promise<T> {
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

  if (res.status === 401 && retry) {
    try {
      if (!refreshing) refreshing = doRefresh().finally(() => { refreshing = null; });
      await refreshing;
      return req<T>(method, path, body, auth, false);
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      throw new Error('Session expired. Please log in again.');
    }
  }

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

  // Payments
  createCheckoutSession: (orderId: string) =>
    req<{ url: string; sessionId: string }>('POST', '/payments/create-checkout-session', { orderId }, true),
  verifySession: (sessionId: string) =>
    req<Order | null>('GET', `/payments/verify?session_id=${encodeURIComponent(sessionId)}`),
};
