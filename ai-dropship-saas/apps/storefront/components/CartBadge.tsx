'use client';
import { useCart } from '../lib/store';

export default function CartBadge() {
  const count = useCart(s => s.count());
  if (count === 0) return null;
  return (
    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
      {count}
    </span>
  );
}
