'use client';
import Link from 'next/link';
import { useCart } from '../lib/store';
import { ShoppingCart, User, Search, Menu } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const count = useCart(s => s.count());
  const [q, setQ] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/products?search=${encodeURIComponent(q.trim())}`);
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
            <Link href="/account" className="flex items-center gap-1 text-sm text-gray-600 hover:text-orange-500">
              <User size={20} />
              <span className="hidden sm:inline">Account</span>
            </Link>
            <Link href="/cart" className="relative flex items-center gap-1 text-sm text-gray-600 hover:text-orange-500">
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{count}</span>
              )}
              <span className="hidden sm:inline">Cart</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
