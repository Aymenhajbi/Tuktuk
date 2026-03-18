'use client';
import { useEffect, useState, useCallback } from 'react';
import { api, AdminOrder } from '../../lib/api';

import { RefreshCw, ChevronDown } from 'lucide-react';

type Status = AdminOrder['status'];

const STATUS_COLORS: Record<Status, string> = {
  PENDING:    'bg-yellow-100 text-yellow-700',
  PAID:       'bg-green-100 text-green-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED:    'bg-indigo-100 text-indigo-700',
  DELIVERED:  'bg-emerald-100 text-emerald-700',
  CANCELLED:  'bg-gray-100 text-gray-500',
  FAILED:     'bg-red-100 text-red-600',
};

const STATUS_OPTIONS: Status[] = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED'];

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
      {status}
    </span>
  );
}

function StatusSelect({ orderId, current, onUpdated }: { orderId: string; current: Status; onUpdated: () => void }) {
  const [updating, setUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as Status;
    if (next === current) return;
    setUpdating(true);
    try {
      await api.updateOrderStatus(orderId, next);
      onUpdated();
    } catch (err) {
      alert('Failed to update status: ' + (err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={current}
        onChange={handleChange}
        disabled={updating}
        className={`appearance-none pl-3 pr-7 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 ${STATUS_COLORS[current]}`}
      >
        {STATUS_OPTIONS.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 pointer-events-none opacity-60" />
    </div>
  );
}

function OrderRow({ order, onUpdated }: { order: AdminOrder; onUpdated: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <td className="px-4 py-3">
          <span className="font-mono text-xs text-gray-500">{order.id.slice(0, 8)}…</span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-700 max-w-[160px] truncate">{order.address}</td>
        <td className="px-4 py-3 text-sm text-gray-600">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-800">AED {order.total.toFixed(2)}</td>
        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
          <StatusSelect orderId={order.id} current={order.status} onUpdated={onUpdated} />
        </td>
        <td className="px-4 py-3 text-xs text-gray-400">
          {new Date(order.createdAt).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' })}
        </td>
        <td className="px-4 py-3 text-xs text-gray-400 font-mono truncate max-w-[120px]">
          {order.stripeSessionId ? order.stripeSessionId.slice(-12) : '—'}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50 border-b border-gray-100">
          <td colSpan={7} className="px-6 py-3">
            <div className="space-y-1.5">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  {item.product.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product.images[0]} alt={item.product.name} className="w-8 h-8 rounded object-cover shrink-0" />
                  )}
                  <span className="text-gray-700 flex-1">{item.product.name}</span>
                  <span className="text-gray-400">× {item.quantity}</span>
                  <span className="font-medium text-gray-700 w-24 text-right">AED {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status | 'ALL'>('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<Status, number>);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Orders</h1>
          <p className="text-slate-400 text-sm mt-0.5">{orders.length} total orders</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white border border-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
        >
          ALL ({orders.length})
        </button>
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filter === s ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading orders…</div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No orders found</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Stripe Session</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(order => (
                <OrderRow key={order.id} order={order} onUpdated={load} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return <OrdersContent />;
}
