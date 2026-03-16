'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../lib/store';
import type { Product } from '../lib/api';

export default function ProductCard({ product }: { product: Product }) {
  const add = useCart(s => s.add);
  const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group">
      <Link href={`/products/${product.id}`}>
        <div className="relative h-48 bg-gray-50 overflow-hidden">
          {product.images[0] ? (
            <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 50vw, 25vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📦</div>
          )}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">-{discount}%</span>
          )}
          {product.featured && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">Featured</span>
          )}
        </div>
      </Link>
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-1">{product.category?.name}</p>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-800 text-sm line-clamp-2 hover:text-orange-500 mb-2">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-gray-600">{product.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {product.salePrice ? (
              <>
                <span className="font-bold text-orange-500">${product.salePrice.toFixed(2)}</span>
                <span className="text-xs text-gray-400 line-through ml-1">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="font-bold text-gray-800">${product.price.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={() => add(product)}
            className="bg-orange-500 text-white p-1.5 rounded-lg hover:bg-orange-600 transition-colors"
            title="Add to cart"
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
