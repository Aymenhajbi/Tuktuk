'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, type Product, type Category } from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const page = Number(searchParams.get('page') || 1);
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    router.push(`/products?${p.toString()}`);
  };

  const setPage = (n: number) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set('page', String(n));
    router.push(`/products?${p.toString()}`);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = { page, limit: 20, sortBy, sortOrder };
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minRating) params.minRating = minRating;
      const res = await api.getProducts(params);
      setProducts(res.data); setTotal(res.total); setPages(res.pages);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [page, search, categoryId, minPrice, maxPrice, minRating, sortBy, sortOrder]);

  useEffect(() => { api.getCategories().then(setCategories).catch(() => {}); }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {search ? `Results for "${search}"` : 'All Products'}
          </h1>
          <p className="text-gray-400 text-sm">{total} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 md:hidden">
            <Filter size={16} /> Filters
          </button>
          <select value={`${sortBy}-${sortOrder}`} onChange={e => { const [s, o] = e.target.value.split('-'); setParam('sortBy', s); setParam('sortOrder', o); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400">
            <option value="createdAt-desc">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Best Rated</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-56 shrink-0`}>
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-5 sticky top-20">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Category</h3>
              <div className="space-y-1">
                <button onClick={() => setParam('categoryId', '')} className={`w-full text-left px-2 py-1.5 rounded text-sm ${!categoryId ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>All</button>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setParam('categoryId', cat.id)} className={`w-full text-left px-2 py-1.5 rounded text-sm ${categoryId === cat.id ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>{cat.name}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Price Range</h3>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minPrice} onChange={e => setParam('minPrice', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-orange-400" />
                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setParam('maxPrice', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-orange-400" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Min Rating</h3>
              <div className="space-y-1">
                {['', '4', '3', '2'].map(r => (
                  <button key={r} onClick={() => setParam('minRating', r)} className={`w-full text-left px-2 py-1.5 rounded text-sm ${minRating === r ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {r ? `${r}★ & above` : 'Any rating'}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => router.push('/products')} className="w-full text-sm text-gray-400 hover:text-gray-600 underline">Clear all filters</button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-64 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={16} /></button>
                  {Array.from({ length: pages }, (_, i) => i + 1).filter(n => n === 1 || n === pages || Math.abs(n - page) <= 1).map((n, i, arr) => (
                    <span key={n}>
                      {i > 0 && arr[i - 1] !== n - 1 && <span className="px-1 text-gray-400">…</span>}
                      <button onClick={() => setPage(n)} className={`w-9 h-9 rounded-lg text-sm font-medium ${n === page ? 'bg-orange-500 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>{n}</button>
                    </span>
                  ))}
                  <button onClick={() => setPage(page + 1)} disabled={page >= pages} className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={16} /></button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-64 animate-pulse border border-gray-100" />
          ))}
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
