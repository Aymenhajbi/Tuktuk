'use client';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { ShoppingCart, User, Search, LogOut, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const CartBadge = dynamic(() => import('./CartBadge'), { ssr: false });

export default function Navbar() {
  const { user, logout } = useAuth();
  const [q, setQ] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/products?search=${encodeURIComponent(q.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          <Link href="/" className="text-2xl font-black text-orange-500 shrink-0">TUKTUK</Link>
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                value={q} onChange={e => setQ(e.target.value)}
                placeholder="Search products..."
                className="w-full border border-gray-300 rounded-full px-5 py-2 pr-12 text-sm focus:outline-none focus:border-orange-400"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500">
                <Search size={18} />
              </button>
            </div>
          </form>
          <nav className="flex items-center gap-3 shrink-0">
            {user ? (
              <>
                <Link href="/account" className="flex items-center gap-1 text-sm text-gray-600 hover:text-orange-500">
                  <User size={20} />
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500">
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link href="/auth" className="flex items-center gap-1 text-sm text-gray-600 hover:text-orange-500">
                <LogIn size={20} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
            <Link href="/cart" className="relative flex items-center gap-1 text-sm text-gray-600 hover:text-orange-500">
              <ShoppingCart size={20} />
              <CartBadge />
              <span className="hidden sm:inline">Cart</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
