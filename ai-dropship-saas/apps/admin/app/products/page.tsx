'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, AdminProduct, Category, CreateProductBody } from '../../lib/api';
import {
  Plus, Pencil, Trash2, Search, X, Loader2, AlertCircle,
  CheckCircle, XCircle, ChevronLeft, ChevronRight, Eye, EyeOff,
} from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

const EMPTY_FORM: CreateProductBody = {
  name: '', description: '', price: 0, salePrice: undefined, images: [],
  categoryId: '', brand: '', stock: 0, sku: '', tags: [], featured: false, active: true,
};

// ─── sub-components ──────────────────────────────────────────────────────────

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Out of stock</span>;
  if (stock < 10) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{stock} left</span>;
  return <span className="text-sm text-slate-700">{stock}</span>;
}

function ActiveBadge({ active }: { active: boolean }) {
  return active
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle size={10} />Active</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500"><XCircle size={10} />Inactive</span>;
}

// ─── form modal ──────────────────────────────────────────────────────────────

interface ModalProps {
  product: AdminProduct | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

function ProductModal({ product, categories, onClose, onSaved }: ModalProps) {
  const isEdit = product !== null;
  const [form, setForm] = useState<CreateProductBody>(() =>
    isEdit ? {
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      salePrice: product.salePrice ?? undefined,
      images: product.images,
      categoryId: product.categoryId,
      brand: product.brand ?? '',
      stock: product.stock,
      sku: product.sku ?? '',
      tags: product.tags,
      featured: product.featured,
      active: product.active,
    } : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Raw string states for array fields
  const [imagesRaw, setImagesRaw] = useState(form.images?.join('\n') ?? '');
  const [tagsRaw, setTagsRaw] = useState(form.tags?.join(', ') ?? '');

  const set = (field: keyof CreateProductBody, value: unknown) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload: CreateProductBody = {
      ...form,
      images: imagesRaw.split('\n').map(s => s.trim()).filter(Boolean),
      tags: tagsRaw.split(',').map(s => s.trim()).filter(Boolean),
      salePrice: form.salePrice || form.salePrice === 0 ? Number(form.salePrice) : undefined,
      price: Number(form.price),
      stock: Number(form.stock),
    };
    try {
      if (isEdit) {
        await api.updateProduct(product.id, payload);
      } else {
        await api.createProduct(payload);
      }
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400';
  const labelCls = 'block text-xs font-medium text-slate-500 mb-1';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              <AlertCircle size={14} />{error}
            </div>
          )}

          {/* Name + Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Name *</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} placeholder="Product name" />
            </div>
            <div>
              <label className={labelCls}>Brand</label>
              <input value={form.brand ?? ''} onChange={e => set('brand', e.target.value)} className={inputCls} placeholder="Brand" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea rows={3} value={form.description ?? ''} onChange={e => set('description', e.target.value)}
              className={`${inputCls} resize-none`} placeholder="Product description" />
          </div>

          {/* Price + Sale Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Price (AED) *</label>
              <input required type="number" min={0} step="0.01" value={form.price}
                onChange={e => set('price', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Sale Price (AED)</label>
              <input type="number" min={0} step="0.01"
                value={form.salePrice ?? ''}
                onChange={e => set('salePrice', e.target.value ? Number(e.target.value) : undefined)}
                className={inputCls} placeholder="Leave blank if no sale" />
            </div>
          </div>

          {/* Category + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category *</label>
              <select required value={form.categoryId} onChange={e => set('categoryId', e.target.value)} className={inputCls}>
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Stock</label>
              <input type="number" min={0} value={form.stock ?? 0} onChange={e => set('stock', e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* SKU + Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>SKU</label>
              <input value={form.sku ?? ''} onChange={e => set('sku', e.target.value)} className={inputCls} placeholder="e.g. PROD-001" />
            </div>
            <div>
              <label className={labelCls}>Tags (comma-separated)</label>
              <input value={tagsRaw} onChange={e => setTagsRaw(e.target.value)} className={inputCls} placeholder="wireless, earbuds, sale" />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className={labelCls}>Image URLs (one per line)</label>
            <textarea rows={3} value={imagesRaw} onChange={e => setImagesRaw(e.target.value)}
              className={`${inputCls} resize-none font-mono text-xs`}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
              <input type="checkbox" checked={form.featured ?? false} onChange={e => set('featured', e.target.checked)}
                className="accent-indigo-600 w-4 h-4" />
              Featured product
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
              <input type="checkbox" checked={form.active ?? true} onChange={e => set('active', e.target.checked)}
                className="accent-indigo-600 w-4 h-4" />
              Active (visible on storefront)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {saving ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Saving…</span> : isEdit ? 'Save changes' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── delete confirm ──────────────────────────────────────────────────────────

function DeleteConfirm({ product, onCancel, onDeleted }: { product: AdminProduct; onCancel: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteProduct(product.id);
      onDeleted();
    } catch (err) {
      setError((err as Error).message);
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-bold text-slate-900 mb-1">Delete product?</h3>
        <p className="text-sm text-slate-500 mb-4">
          <span className="font-medium text-slate-700">"{product.name}"</span> will be permanently removed from the store.
        </p>
        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting}
            className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal state
  const [modalProduct, setModalProduct] = useState<AdminProduct | null | 'new'>(undefined as unknown as null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);

  // Toggling active state per product
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number | boolean> = {
        page: p,
        limit: PAGE_SIZE,
        showAll: true,
      };
      if (search) params.search = search;
      if (filterCategory) params.categoryId = filterCategory;
      const result = await api.listProducts(params);
      // Client-side filter for active/inactive (showAll returns both)
      const rows = filterActive === 'active'
        ? result.data.filter(pr => pr.active)
        : filterActive === 'inactive'
          ? result.data.filter(pr => !pr.active)
          : result.data;
      setProducts(rows);
      setTotal(result.total);
      setPage(p);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterActive]);

  // Load categories once
  useEffect(() => {
    api.listCategories().then(setCategories).catch(() => {});
  }, []);

  // Debounced reload on filter change
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1), 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [load]);

  const handleToggleActive = async (product: AdminProduct) => {
    setToggling(prev => new Set(prev).add(product.id));
    try {
      const updated = await api.updateProduct(product.id, { active: !product.active });
      setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
    } catch {
      // silently ignore — next reload will correct state
    } finally {
      setToggling(prev => { const s = new Set(prev); s.delete(product.id); return s; });
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your store catalogue — {total} product{total !== 1 ? 's' : ''} total.</p>
        </div>
        <button
          onClick={() => setModalProduct('new')}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 w-56"
          />
        </div>

        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400"
        >
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          value={filterActive}
          onChange={e => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400"
        >
          <option value="all">All status</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>

        {(search || filterCategory || filterActive !== 'all') && (
          <button
            onClick={() => { setSearch(''); setFilterCategory(''); setFilterActive('all'); }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-2"
          >
            <X size={12} />Clear
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-5">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-5 py-3 text-slate-600 font-medium">Product</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Category</th>
              <th className="text-right px-4 py-3 text-slate-600 font-medium">Price</th>
              <th className="text-center px-4 py-3 text-slate-600 font-medium">Stock</th>
              <th className="text-center px-4 py-3 text-slate-600 font-medium">Status</th>
              <th className="text-right px-5 py-3 text-slate-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400">
                  <Loader2 size={20} className="animate-spin inline-block" />
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                  No products found.
                </td>
              </tr>
            ) : products.map(product => (
              <tr key={product.id} className={`hover:bg-slate-50 transition-colors ${!product.active ? 'opacity-60' : ''}`}>
                {/* Product info */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                      {product.images[0]
                        ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No img</div>
                      }
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 leading-tight">{product.name}</p>
                      {product.brand && <p className="text-xs text-slate-400 mt-0.5">{product.brand}</p>}
                      {product.featured && (
                        <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">Featured</span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                    {product.category.name}
                  </span>
                </td>

                {/* Price */}
                <td className="px-4 py-3 text-right">
                  {product.salePrice != null ? (
                    <div>
                      <span className="font-semibold text-emerald-600">AED {product.salePrice.toFixed(2)}</span>
                      <span className="text-xs text-slate-400 line-through ml-1">AED {product.price.toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className="font-medium text-slate-700">AED {product.price.toFixed(2)}</span>
                  )}
                </td>

                {/* Stock */}
                <td className="px-4 py-3 text-center">
                  <StockBadge stock={product.stock} />
                </td>

                {/* Status toggle */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggleActive(product)}
                    disabled={toggling.has(product.id)}
                    title={product.active ? 'Click to deactivate' : 'Click to activate'}
                    className="inline-flex items-center gap-1 transition-opacity disabled:opacity-40"
                  >
                    {toggling.has(product.id)
                      ? <Loader2 size={14} className="animate-spin text-slate-400" />
                      : <ActiveBadge active={product.active} />
                    }
                  </button>
                </td>

                {/* Actions */}
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setModalProduct(product)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-slate-500">
            Page {page} of {totalPages} · {total} products
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => load(page - 1)}
              disabled={page <= 1 || loading}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => load(page + 1)}
              disabled={page >= totalPages || loading}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {modalProduct !== undefined && (
        <ProductModal
          product={modalProduct === 'new' ? null : modalProduct}
          categories={categories}
          onClose={() => setModalProduct(undefined as unknown as null)}
          onSaved={() => { setModalProduct(undefined as unknown as null); load(page); }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          product={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onDeleted={() => { setDeleteTarget(null); load(page); }}
        />
      )}
    </div>
  );
}
