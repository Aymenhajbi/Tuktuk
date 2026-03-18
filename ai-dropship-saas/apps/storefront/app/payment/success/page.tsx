'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { api, Order } from '../../../lib/api';

function PaymentSuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) { setError('No session ID in URL.'); setLoading(false); return; }
    api.verifySession(sessionId)
      .then(o => { setOrder(o); setLoading(false); })
      .catch(e => { setError((e as Error).message); setLoading(false); });
  }, [sessionId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 size={48} className="text-orange-500 animate-spin" />
      <p className="text-gray-500">Confirming your payment…</p>
    </div>
  );

  if (error || !order) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <XCircle size={64} className="text-red-400 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment verification failed</h1>
      <p className="text-gray-500 mb-6">{error || 'Could not confirm payment. Please check your orders or contact support.'}</p>
      <Link href="/orders" className="bg-orange-500 text-white font-bold px-6 py-3 rounded-full hover:bg-orange-600">View My Orders</Link>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
      <p className="text-gray-500 mb-2">Thank you for your purchase. Your order is confirmed.</p>
      <p className="text-sm text-gray-400 mb-1">
        Order ID: <span className="font-mono text-gray-600">{order.id.slice(0, 8)}…</span>
      </p>
      <p className="text-sm text-gray-400 mb-6">
        Total: <span className="font-semibold text-gray-700">AED {order.total.toFixed(2)}</span>
      </p>
      <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2">
        {order.items.map(item => (
          <div key={item.id} className="flex justify-between text-sm text-gray-600">
            <span>{item.product.name} × {item.quantity}</span>
            <span>AED {(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-center">
        <Link href="/orders" className="bg-orange-500 text-white font-bold px-6 py-3 rounded-full hover:bg-orange-600">View Orders</Link>
        <Link href="/products" className="border border-gray-300 text-gray-600 font-bold px-6 py-3 rounded-full hover:bg-gray-50">Continue Shopping</Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={48} className="text-orange-500 animate-spin" />
        <p className="text-gray-500">Confirming your payment…</p>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
