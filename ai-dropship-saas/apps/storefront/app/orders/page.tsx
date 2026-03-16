'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api, type Order } from '../../lib/api';
import { Package, Search } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await api.getOrders(email.trim());
      setOrders(res); setSearched(true);
    } catch { setOrders([]); setSearched(true); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
      <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Enter your email to find your orders</label>
        <div className="flex gap-3">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-orange-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50">
            <Search size={16} /> {loading ? 'Loading…' : 'Find Orders'}
          </button>
        </div>
      </form>

      {searched && orders.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Package size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No orders found for this email</p>
        </div>
      )}

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                <p className="font-bold text-orange-500 mt-1">${order.total.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 shrink-0">
                  <div className="relative w-10 h-10 bg-white rounded overflow-hidden">
                    {item.product.images[0] && <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="40px" />}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700 max-w-28 truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-400">×{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!searched && (
        <div className="text-center py-8 text-gray-400 text-sm">
          <p>Enter your email above to view your order history</p>
        </div>
      )}
    </div>
  );
}
