const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export interface AdminUser { id: string; email: string; name: string; role: string }

export async function adminLogin(email: string, password: string): Promise<{ access_token: string; refresh_token: string }> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json();
}

export async function adminMe(token: string): Promise<AdminUser> {
  const res = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Unauthorized');
  const user = await res.json() as AdminUser;
  if (user.role !== 'ADMIN') throw new Error('Not an admin');
  return user;
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_access_token');
}

export function setAdminTokens(access: string, refresh: string) {
  localStorage.setItem('admin_access_token', access);
  localStorage.setItem('admin_refresh_token', refresh);
}

export function clearAdminTokens() {
  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_refresh_token');
}
