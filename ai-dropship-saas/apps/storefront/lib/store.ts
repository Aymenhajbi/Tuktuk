import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from './api';

export interface CartItem { product: Product; quantity: number }

interface CartStore {
  items: CartItem[];
  add: (product: Product) => void;
  remove: (id: string) => void;
  update: (id: string, quantity: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product) => set((s) => {
        const existing = s.items.find(i => i.product.id === product.id);
        if (existing) return { items: s.items.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) };
        return { items: [...s.items, { product, quantity: 1 }] };
      }),
      remove: (id) => set((s) => ({ items: s.items.filter(i => i.product.id !== id) })),
      update: (id, quantity) => set((s) => ({
        items: quantity <= 0 ? s.items.filter(i => i.product.id !== id) : s.items.map(i => i.product.id === id ? { ...i, quantity } : i),
      })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + (i.product.salePrice ?? i.product.price) * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);
