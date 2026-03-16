'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../lib/store';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const { items, update, remove, total, count } = useCart();
  const cartTotal = total();
  const cartCount = count();

  if (cartCount === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <ShoppingCart size={64} className="text-gray-200 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
      <p className="text-gray-400 mb-6">Add some products to get started</p>
      <Link href="/products" className="bg-orange-500 text-white font-bold px-8 py-3 rounded-full hover:bg-orange-600 transition-colors">
        Browse Products
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart ({cartCount} items)</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ product: p, quantity }) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4">
              <Link href={`/products/${p.id}`} className="relative w-20 h-20 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                {p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="80px" />}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${p.id}`} className="font-medium text-gray-800 hover:text-orange-500 text-sm line-clamp-2">{p.name}</Link>
                <p className="text-xs text-gray-400 mt-0.5">{p.category?.name}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => update(p.id, quantity - 1)} className="px-2 py-1 hover:bg-gray-50"><Minus size={14} /></button>
                    <span className="px-3 text-sm font-medium">{quantity}</span>
                    <button onClick={() => update(p.id, quantity + 1)} className="px-2 py-1 hover:bg-gray-50"><Plus size={14} /></button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-500">${((p.salePrice ?? p.price) * quantity).toFixed(2)}</p>
                    {quantity > 1 && <p className="text-xs text-gray-400">${(p.salePrice ?? p.price).toFixed(2)} each</p>}
                  </div>
                </div>
              </div>
              <button onClick={() => remove(p.id)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 h-fit sticky top-20">
          <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-gray-600"><span>Subtotal ({cartCount} items)</span><span>${cartTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Delivery</span><span className={cartTotal >= 50 ? 'text-green-600 font-medium' : ''}>{cartTotal >= 50 ? 'FREE' : '$4.99'}</span></div>
            {cartTotal < 50 && <p className="text-xs text-orange-500">Add ${(50 - cartTotal).toFixed(2)} more for free delivery!</p>}
          </div>
          <div className="border-t border-gray-100 pt-4 mb-5">
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-orange-500">${(cartTotal + (cartTotal >= 50 ? 0 : 4.99)).toFixed(2)}</span></div>
          </div>
          <Link href="/checkout" className="block w-full bg-orange-500 text-white font-bold py-3 rounded-xl text-center hover:bg-orange-600 transition-colors">
            Proceed to Checkout
          </Link>
          <Link href="/products" className="block w-full text-center text-gray-400 hover:text-gray-600 text-sm mt-3">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
