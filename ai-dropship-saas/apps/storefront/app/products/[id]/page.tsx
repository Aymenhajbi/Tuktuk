'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, type ProductDetail } from '../../../lib/api';
import { useCart } from '../../../lib/store';
import { ShoppingCart, Star, Truck, Shield, RotateCcw, ChevronLeft } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart(s => s.add);

  useEffect(() => {
    api.getProduct(id).then(p => { setProduct(p); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = product?.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />)}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">😕</p>
      <h2 className="text-xl font-bold mb-2">Product not found</h2>
      <Link href="/products" className="text-orange-500 hover:underline">← Back to products</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link href="/products" className="flex items-center gap-1 text-gray-500 hover:text-orange-500 text-sm mb-6">
        <ChevronLeft size={16} /> Back to products
      </Link>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="relative h-96 bg-gray-50 rounded-xl overflow-hidden mb-3">
            {product.images[selectedImage] ? (
              <Image src={product.images[selectedImage]} alt={product.name} fill className="object-contain" sizes="(max-width: 768px) 100vw, 50vw" />
            ) : <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">📦</div>}
            {discount > 0 && <span className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">-{discount}%</span>}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${i === selectedImage ? 'border-orange-500' : 'border-gray-200'}`}>
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-orange-500 text-sm font-medium mb-1">{product.category?.name}</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={16} className={s <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
              ))}
            </div>
            <span className="text-sm text-gray-600">{product.rating.toFixed(1)} ({product.reviewCount} reviews)</span>
          </div>

          <div className="mb-4">
            {product.salePrice ? (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-orange-500">${product.salePrice.toFixed(2)}</span>
                <span className="text-lg text-gray-400 line-through">${product.price.toFixed(2)}</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded">Save {discount}%</span>
              </div>
            ) : (
              <span className="text-3xl font-black text-gray-800">${product.price.toFixed(2)}</span>
            )}
          </div>

          {product.description && <p className="text-gray-600 text-sm mb-5 leading-relaxed">{product.description}</p>}

          {product.brand && <p className="text-sm text-gray-500 mb-4">Brand: <span className="font-medium text-gray-700">{product.brand}</span></p>}

          <div className={`inline-flex items-center gap-1.5 text-sm font-medium mb-5 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </div>

          <div className="flex items-center gap-3 mb-5">
            <label className="text-sm text-gray-600">Qty:</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-50 text-lg">−</button>
              <span className="px-4 py-2 font-medium">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-50 text-lg">+</button>
            </div>
          </div>

          <button onClick={handleAdd} disabled={product.stock === 0}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3">
            <ShoppingCart size={20} />
            {added ? '✓ Added to Cart!' : 'Add to Cart'}
          </button>

          <Link href="/cart" className="w-full flex items-center justify-center border-2 border-orange-500 text-orange-500 font-bold py-3 rounded-xl hover:bg-orange-50 transition-colors">
            View Cart
          </Link>

          <div className="grid grid-cols-3 gap-3 mt-6 text-center text-xs text-gray-500">
            {[{ icon: <Truck size={18} />, t: 'Free Delivery', s: 'Orders $50+' }, { icon: <RotateCcw size={18} />, t: 'Easy Returns', s: '30-day policy' }, { icon: <Shield size={18} />, t: 'Secure Pay', s: '100% safe' }].map(b => (
              <div key={b.t} className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg">
                <span className="text-orange-500">{b.icon}</span>
                <span className="font-medium text-gray-700">{b.t}</span>
                <span>{b.s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Customer Reviews</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.reviews.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-gray-700">{r.author}</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />)}
                  </div>
                </div>
                {r.title && <p className="font-semibold text-sm text-gray-800 mb-1">{r.title}</p>}
                {r.body && <p className="text-sm text-gray-600">{r.body}</p>}
                <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
