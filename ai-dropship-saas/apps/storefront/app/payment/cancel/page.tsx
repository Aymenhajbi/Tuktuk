'use client';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <XCircle size={64} className="text-red-400 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
      <p className="text-gray-500 mb-6">Your payment was cancelled and you have not been charged. Your order is still pending — you can complete payment from your orders page.</p>
      <div className="flex gap-3 justify-center">
        <Link href="/checkout" className="bg-orange-500 text-white font-bold px-6 py-3 rounded-full hover:bg-orange-600">Try Again</Link>
        <Link href="/products" className="border border-gray-300 text-gray-600 font-bold px-6 py-3 rounded-full hover:bg-gray-50">Continue Shopping</Link>
      </div>
    </div>
  );
}
