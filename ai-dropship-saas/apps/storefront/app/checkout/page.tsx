'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../lib/store';
import { api } from '../../lib/api';
import { CheckCircle, CreditCard, Truck } from 'lucide-react';
import RequireAuth from '../../components/RequireAuth';
import { useAuth } from '../../lib/auth';

function CheckoutContent() {
  const { user } = useAuth();
  const { items, total, count, clear } = useCart();
  const router = useRouter();
  const cartTotal = total();
  const delivery = cartTotal >= 50 ? 0 : 4.99;

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', country: 'US', zip: '', payment: 'card' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create the order (status: PENDING)
      const order = await api.createOrder({
        address: `${form.address}, ${form.city}, ${form.country} ${form.zip}`,
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      });
      // 2. Create Stripe Checkout session and redirect
      const { url } = await api.createCheckoutSession(order.id);
      clear();
      window.location.href = url!;
    } catch (e) {
      alert('Checkout failed: ' + (e as Error).message);
    } finally { setLoading(false); }
  };

  if (count() === 0 && !success) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
        <Link href="/products" className="text-orange-500 hover:underline">Browse products</Link>
      </div>
    );
  }

  if (success) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed! 🎉</h1>
      <p className="text-gray-500 mb-2">Thank you for your purchase.</p>
      <p className="text-sm text-gray-400 mb-6">Order ID: <span className="font-mono text-gray-600">{orderId.slice(0, 8)}…</span></p>
      <div className="flex gap-3 justify-center">
        <Link href="/orders" className="bg-orange-500 text-white font-bold px-6 py-3 rounded-full hover:bg-orange-600">View Orders</Link>
        <Link href="/products" className="border border-gray-300 text-gray-600 font-bold px-6 py-3 rounded-full hover:bg-gray-50">Continue Shopping</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>
      <div className="grid lg:grid-cols-5 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-700 flex items-center gap-2 mb-4"><Truck size={18} className="text-orange-500" /> Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[['First Name', 'firstName', 'text'], ['Last Name', 'lastName', 'text'], ['Email', 'email', 'email'], ['Phone', 'phone', 'tel']].map(([l, k, t]) => (
                <div key={k}>
                  <label className="text-xs text-gray-500 font-medium">{l} *</label>
                  <input required type={t} value={(form as Record<string, string>)[k]} onChange={e => set(k, e.target.value)}
                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 font-medium">Street Address *</label>
                <input required type="text" value={form.address} onChange={e => set('address', e.target.value)}
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              {[['City', 'city'], ['ZIP / Postal Code', 'zip']].map(([l, k]) => (
                <div key={k}>
                  <label className="text-xs text-gray-500 font-medium">{l} *</label>
                  <input required type="text" value={(form as Record<string, string>)[k]} onChange={e => set(k, e.target.value)}
                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-700 flex items-center gap-2 mb-4"><CreditCard size={18} className="text-orange-500" /> Payment Method</h2>
            <div className="space-y-2">
              {[['card', '💳 Credit / Debit Card'], ['paypal', '🅿️ PayPal'], ['cod', '💵 Cash on Delivery']].map(([v, l]) => (
                <label key={v} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.payment === v ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value={v} checked={form.payment === v} onChange={e => set('payment', e.target.value)} className="accent-orange-500" />
                  <span className="text-sm font-medium">{l}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50">
            {loading ? 'Redirecting to Stripe…' : `Pay with Stripe — AED ${(cartTotal + delivery).toFixed(2)}`}
          </button>
        </form>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20">
            <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
              {items.map(({ product: p, quantity }) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                    {p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="48px" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 line-clamp-1">{p.name}</p>
                    <p className="text-xs text-gray-400">Qty: {quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-700 shrink-0">AED {((p.salePrice ?? p.price) * quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>AED {cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Delivery</span><span className={delivery === 0 ? 'text-green-600 font-medium' : ''}>{delivery === 0 ? 'FREE' : `AED ${delivery.toFixed(2)}`}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                <span>Total</span><span className="text-orange-500">AED {(cartTotal + delivery).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <RequireAuth><CheckoutContent /></RequireAuth>;
}
