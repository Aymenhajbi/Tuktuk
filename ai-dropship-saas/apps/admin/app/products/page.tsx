'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, AdminProduct, AliExpressImport, Category, CJProduct, CreateProductBody } from '../../lib/api';
import {
  Plus, Pencil, Trash2, Search, X, Loader2, AlertCircle,
  CheckCircle, XCircle, ChevronLeft, ChevronRight, Download, ShoppingBag,
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

function AiScoreBadge({ score, breakdown }: { score?: number; breakdown?: Record<string, number> }) {
  const [show, setShow] = useState(false);
  if (score == null) return <span className="text-xs text-slate-300">—</span>;
  const color = score >= 80 ? 'bg-emerald-100 text-emerald-700'
    : score >= 65 ? 'bg-indigo-100 text-indigo-700'
    : score >= 50 ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-600';
  const LABELS: Record<string, string> = {
    trend: 'Trend', margin: 'Margin', supplier: 'Supplier', saturation: 'Saturation', bonus: 'Bonus',
  };
  return (
    <span className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold cursor-default ${color}`}>
        {score}
      </span>
      {show && breakdown && Object.keys(breakdown).length > 0 && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-slate-900 text-white rounded-lg p-2.5 shadow-xl text-[11px] pointer-events-none">
          <div className="font-semibold mb-1.5 text-slate-300">Score Breakdown</div>
          {Object.entries(breakdown).map(([k, v]) => (
            <div key={k} className="flex justify-between items-center py-0.5">
              <span className="text-slate-400">{LABELS[k] ?? k}</span>
              <span className="font-bold text-white">{v}</span>
            </div>
          ))}
          <div className="border-t border-slate-700 mt-1.5 pt-1.5 flex justify-between">
            <span className="text-slate-400">Total</span>
            <span className="font-bold text-emerald-400">{score}</span>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </span>
  );
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

// ─── CJ Dropshipping search modal ────────────────────────────────────────────

interface CJModalProps {
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

function CJSearchModal({ categories, onClose, onSaved }: CJModalProps) {
  const [keyword, setKeyword] = useState('');
  const [warehouse, setWarehouse] = useState('oversea');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<CJProduct[] | null>(null);
  const [searchError, setSearchError] = useState('');
  const [selected, setSelected] = useState<CJProduct | null>(null);

  // Review form (shown after clicking Import on a CJ card)
  const [form, setForm] = useState<CreateProductBody & { imagesRaw: string; tagsRaw: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const setF = (field: string, value: unknown) =>
    setForm(f => f ? { ...f, [field]: value } : f);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSearching(true);
    try {
      const data = await api.searchCJ(keyword.trim(), warehouse);
      setResults(data.products);
    } catch (err) {
      setSearchError((err as Error).message);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectProduct = (p: CJProduct) => {
    setSelected(p);
    setForm({
      name: p.name, description: '', price: p.suggestedPriceAED,
      salePrice: undefined, images: p.images, imagesRaw: p.images.join('\n'),
      categoryId: '', brand: '', stock: 50, sku: p.cjId,
      tags: [p.categoryName.toLowerCase().replace(/\s+/g, '-')],
      tagsRaw: p.categoryName.toLowerCase().replace(/\s+/g, '-'),
      featured: false, active: true,
      sourceUrl: `https://cjdropshipping.com/product/${p.cjId}`,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaveError('');
    setSaving(true);
    try {
      await api.createProduct({
        name: form.name, description: form.description,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : undefined,
        images: form.imagesRaw.split('\n').map(s => s.trim()).filter(Boolean),
        categoryId: form.categoryId, brand: form.brand,
        stock: Number(form.stock), sku: form.sku,
        tags: form.tagsRaw.split(',').map(s => s.trim()).filter(Boolean),
        featured: form.featured, active: form.active,
        sourceUrl: form.sourceUrl,
      });
      onSaved();
    } catch (err) {
      setSaveError((err as Error).message);
      setSaving(false);
    }
  };

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400';
  const labelCls = 'block text-xs font-medium text-slate-500 mb-1';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Search CJ Dropshipping</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {form ? 'Review product details before saving to your store.' : 'Search the mock catalogue — swap for live CJ credentials in Step 3.'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>

        {/* Search panel */}
        {!form && (
          <div className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3 mb-5">
              <input
                required value={keyword} onChange={e => setKeyword(e.target.value)}
                placeholder="Search products… e.g. earbuds, skincare, fitness"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              />
              <select value={warehouse} onChange={e => setWarehouse(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                <option value="oversea">UAE Warehouse (3-7d)</option>
                <option value="CN">China Warehouse (7-14d)</option>
                <option value="US">US Warehouse</option>
                <option value="all">All Warehouses</option>
              </select>
              <button type="submit" disabled={searching}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {searching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
              </button>
            </form>

            {searchError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                <AlertCircle size={14} />{searchError}
              </div>
            )}

            {results === null && !searching && (
              <div className="text-center py-12 text-slate-400 text-sm">
                Enter a keyword to search the CJ catalogue.
              </div>
            )}

            {results !== null && results.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">No products found for "{keyword}".</div>
            )}

            {results && results.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {results.map(p => (
                  <div key={p.cjId} className="border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-sm transition-all">
                    <div className="aspect-square bg-slate-50 overflow-hidden">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-2 mb-2">{p.name}</p>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">${p.supplierPriceUSD} USD</span>
                        <span className="text-sm font-bold text-indigo-600">AED {p.suggestedPriceAED}</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">{p.shippingDays}d · {p.warehouse}</span>
                        <span className="text-[10px] text-slate-500">★ {p.rating}</span>
                      </div>
                      <button onClick={() => handleSelectProduct(p)}
                        className="w-full text-xs font-semibold bg-indigo-600 text-white py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                        Import
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Review form */}
        {form && selected && (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 text-xs text-indigo-800 flex items-center justify-between">
              <span>CJ ID: <strong>{selected.cjId}</strong> · Supplier <strong>${selected.supplierPriceUSD} USD</strong> → <strong>AED {selected.suggestedPriceAED}</strong> retail (2.5×)</span>
              <button type="button" onClick={() => setForm(null)} className="text-indigo-600 hover:underline font-medium">Back to results</button>
            </div>

            {saveError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                <AlertCircle size={14} />{saveError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Name *</label>
                <input required value={form.name} onChange={e => setF('name', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Brand</label>
                <input value={form.brand ?? ''} onChange={e => setF('brand', e.target.value)} className={inputCls} placeholder="Brand" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea rows={2} value={form.description ?? ''} onChange={e => setF('description', e.target.value)}
                className={`${inputCls} resize-none`} placeholder="Write a short product description…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Price (AED) *</label>
                <input required type="number" min={0} step="0.01" value={form.price} onChange={e => setF('price', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Sale Price (AED)</label>
                <input type="number" min={0} step="0.01" value={form.salePrice ?? ''} onChange={e => setF('salePrice', e.target.value ? Number(e.target.value) : undefined)} className={inputCls} placeholder="Optional" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Category *</label>
                <select required value={form.categoryId} onChange={e => setF('categoryId', e.target.value)} className={inputCls}>
                  <option value="">Select category…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Stock</label>
                <input type="number" min={0} value={form.stock ?? 50} onChange={e => setF('stock', e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Image URLs (one per line)</label>
              <textarea rows={3} value={form.imagesRaw} onChange={e => setF('imagesRaw', e.target.value)}
                className={`${inputCls} resize-none font-mono text-xs`} />
              {form.imagesRaw.split('\n').filter(Boolean).length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {form.imagesRaw.split('\n').filter(Boolean).slice(0, 4).map((img, i) => (
                    <img key={i} src={img.trim()} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-200" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>SKU</label>
                <input value={form.sku ?? ''} onChange={e => setF('sku', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tags (comma-separated)</label>
                <input value={form.tagsRaw} onChange={e => setF('tagsRaw', e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input type="checkbox" checked={form.featured ?? false} onChange={e => setF('featured', e.target.checked)} className="accent-indigo-600 w-4 h-4" />Featured
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input type="checkbox" checked={form.active ?? true} onChange={e => setF('active', e.target.checked)} className="accent-indigo-600 w-4 h-4" />Active on storefront
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                {saving ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Saving…</span> : 'Save to store'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── AliExpress import modal ─────────────────────────────────────────────────

interface ImportModalProps {
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

// ─── client-side score calculator (mirrors backend calculateAiScore) ──────────

function calcAiScore(
  f: { price: number | string; salePrice?: number | string; description?: string; brand?: string; imagesRaw: string },
  sellerRating: number,
  orderCount: number,
  reviewCount: number,
  trendScore: number,
): { score: number; breakdown: Record<string, number> } {
  const trend = Math.round(trendScore * 0.25);

  const saleP = Number(f.salePrice) || Number(f.price) || 0;
  const costP = saleP / 2.5;
  const marginPct = saleP > 0 ? ((saleP - costP) / saleP) * 100 : 60;
  const margin = Math.round(Math.min(marginPct, 100) * 0.20);

  const supplier = sellerRating > 0 ? Math.round(Math.min(sellerRating * 4, 20)) : 10;

  const satPct = orderCount > 0 ? Math.max(0, 100 - orderCount / 500) : 65;
  const saturation = Math.round(satPct * 0.20);

  let bonus = 0;
  const imgs = f.imagesRaw.split('\n').filter(Boolean);
  if (imgs.length >= 3) bonus += 4;
  if ((f.description?.length ?? 0) > 50) bonus += 3;
  if (f.salePrice && Number(f.salePrice) < Number(f.price)) bonus += 4;
  if (reviewCount > 100) bonus += 2;
  if (f.brand) bonus += 2;

  const score = Math.min(100, Math.max(1, trend + margin + supplier + saturation + bonus));
  return { score, breakdown: { trend, margin, supplier, saturation, bonus } };
}

// ─── AliExpress import modal ──────────────────────────────────────────────────

function ImportModal({ categories, onClose, onSaved }: ImportModalProps) {
  const [step, setStep] = useState<'url' | 'review'>('url');
  const [url, setUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [preview, setPreview] = useState<AliExpressImport | null>(null);

  // Review form state (pre-filled from preview, fully editable)
  const [form, setForm] = useState<CreateProductBody & { imagesRaw: string; tagsRaw: string }>({
    name: '', description: '', price: 0, salePrice: undefined, images: [],
    categoryId: '', brand: '', stock: 10, sku: '', tags: [], featured: false, active: true,
    sourceUrl: undefined, aiScore: undefined, scoreBreakdown: undefined,
    imagesRaw: '', tagsRaw: '',
  });

  // Manually editable supplier signals — pre-filled from scrape (often 0), admin can correct
  const [sellerRating, setSellerRating] = useState(0);
  const [orderCount, setOrderCount]     = useState(0);

  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState('');

  const setF = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));

  // Live score — recalculates whenever form fields or supplier signals change
  const liveScore = useMemo(
    () => calcAiScore(form, sellerRating, orderCount, preview?.reviewCount ?? 0, preview?.trendScore ?? 50),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.price, form.salePrice, form.description, form.brand, form.imagesRaw,
     sellerRating, orderCount, preview?.reviewCount, preview?.trendScore],
  );

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    setExtractError('');
    setExtracting(true);
    try {
      const data = await api.importAliExpress(url.trim());
      setPreview(data);
      setSellerRating(data.sellerRating ?? 0);
      setOrderCount(data.orderCount ?? 0);
      setForm(f => ({
        ...f,
        name: data.name,
        description: data.description,
        price: data.priceAED,
        images: data.images,
        imagesRaw: data.images.join('\n'),
        tagsRaw: '',
        stock: 10,
        active: true,
        featured: false,
        sourceUrl: data.sourceUrl,
      }));
      setStep('review');
    } catch (err) {
      setExtractError((err as Error).message);
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaving(true);
    try {
      await api.createProduct({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : undefined,
        images: form.imagesRaw.split('\n').map(s => s.trim()).filter(Boolean),
        categoryId: form.categoryId,
        brand: form.brand,
        stock: Number(form.stock),
        sku: form.sku,
        tags: form.tagsRaw.split(',').map(s => s.trim()).filter(Boolean),
        featured: form.featured,
        active: form.active,
        sourceUrl: form.sourceUrl,
        // Use live (admin-corrected) score
        aiScore: liveScore.score,
        scoreBreakdown: liveScore.breakdown,
      });
      onSaved();
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400';
  const labelCls = 'block text-xs font-medium text-slate-500 mb-1';
  const SCORE_LABELS: Record<string, string> = { trend: 'Trend', margin: 'Margin', supplier: 'Supplier', saturation: 'Saturation', bonus: 'Bonus' };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Import from AliExpress</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 'url' ? 'Paste a product URL to extract details automatically.' : 'Review extracted data — all fields are editable before saving.'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>

        {/* Step 1 — URL */}
        {step === 'url' && (
          <form onSubmit={handleExtract} className="p-6 space-y-4">
            <div>
              <label className={labelCls}>AliExpress Product URL</label>
              <input
                required value={url} onChange={e => setUrl(e.target.value)}
                placeholder="https://www.aliexpress.com/item/1005006xxxxxx.html"
                className={inputCls}
              />
            </div>
            {extractError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                <AlertCircle size={14} className="mt-0.5 shrink-0" /><span>{extractError}</span>
              </div>
            )}
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-4 py-3">
              Price is automatically converted to AED with a <strong>2.5× markup</strong> (supplier USD → AED retail). You can edit it before saving.
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={extracting} className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {extracting ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Extracting…</span> : 'Extract Product'}
              </button>
            </div>
          </form>
        )}

        {/* Step 2 — Review */}
        {step === 'review' && preview && (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {/* Source info banner */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 text-xs text-indigo-800 flex items-center justify-between">
              <span>
                Extracted from AliExpress
                {preview.priceUSD > 0 && <> · Supplier <strong>${preview.priceUSD.toFixed(2)} USD</strong> → <strong>AED {preview.priceAED}</strong> (2.5×)</>}
                {preview.keyword && <> · Keyword: <strong>{preview.keyword}</strong></>}
                {preview.trendScore != null && <> · Trend: <strong>{preview.trendScore.toFixed(0)}/100</strong></>}
              </span>
              <button type="button" onClick={() => setStep('url')} className="text-indigo-600 hover:underline font-medium shrink-0 ml-2">Try another URL</button>
            </div>

            {/* ── Live AI Score panel ────────────────────────────────────────── */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">AI Winning Score</span>
                <AiScoreBadge score={liveScore.score} breakdown={liveScore.breakdown} />
              </div>

              {/* Breakdown tiles */}
              <div className="grid grid-cols-5 gap-1 text-center">
                {Object.entries(liveScore.breakdown).map(([k, v]) => (
                  <div key={k} className="bg-white rounded border border-slate-100 p-1.5">
                    <div className="text-slate-400 text-[10px]">{SCORE_LABELS[k] ?? k}</div>
                    <div className="font-bold text-slate-800">{v}</div>
                  </div>
                ))}
              </div>

              {/* Editable supplier signals */}
              <div className="border-t border-slate-200 pt-3">
                <p className="text-slate-500 mb-2">
                  Supplier signals affect <span className="font-medium text-slate-700">Supplier</span> and <span className="font-medium text-slate-700">Saturation</span> scores.{' '}
                  <span className="text-indigo-600">Check the AliExpress product page for these values.</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">
                      Seller Rating (0–5 ★)
                    </label>
                    <input
                      type="number" min={0} max={5} step={0.1}
                      value={sellerRating}
                      onChange={e => setSellerRating(Math.min(5, Math.max(0, Number(e.target.value))))}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
                      placeholder="e.g. 4.8"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">
                      Orders Sold (total)
                    </label>
                    <input
                      type="number" min={0} step={1}
                      value={orderCount}
                      onChange={e => setOrderCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
                      placeholder="e.g. 5000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {saveError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                <AlertCircle size={14} />{saveError}
              </div>
            )}

            {/* Name + Brand */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Name *</label>
                <input required value={form.name} onChange={e => setF('name', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Brand</label>
                <input value={form.brand ?? ''} onChange={e => setF('brand', e.target.value)} className={inputCls} placeholder="Brand" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea rows={3} value={form.description ?? ''} onChange={e => setF('description', e.target.value)}
                className={`${inputCls} resize-none`} />
            </div>

            {/* Price + Sale price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Price (AED) *</label>
                <input required type="number" min={0} step="0.01" value={form.price}
                  onChange={e => setF('price', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Sale Price (AED)</label>
                <input type="number" min={0} step="0.01" value={form.salePrice ?? ''}
                  onChange={e => setF('salePrice', e.target.value ? Number(e.target.value) : undefined)}
                  className={inputCls} placeholder="Optional" />
              </div>
            </div>

            {/* Category + Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Category *</label>
                <select required value={form.categoryId} onChange={e => setF('categoryId', e.target.value)} className={inputCls}>
                  <option value="">Select category…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Initial Stock</label>
                <input type="number" min={0} value={form.stock ?? 10} onChange={e => setF('stock', e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* SKU + Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>SKU</label>
                <input value={form.sku ?? ''} onChange={e => setF('sku', e.target.value)} className={inputCls} placeholder="Optional" />
              </div>
              <div>
                <label className={labelCls}>Tags (comma-separated)</label>
                <input value={form.tagsRaw} onChange={e => setF('tagsRaw', e.target.value)} className={inputCls} placeholder="tag1, tag2" />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className={labelCls}>Image URLs (one per line) — {form.imagesRaw.split('\n').filter(Boolean).length} extracted</label>
              <textarea rows={4} value={form.imagesRaw} onChange={e => setF('imagesRaw', e.target.value)}
                className={`${inputCls} resize-none font-mono text-xs`} />
              {form.imagesRaw.split('\n').filter(Boolean).length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {form.imagesRaw.split('\n').filter(Boolean).slice(0, 5).map((img, i) => (
                    <img key={i} src={img.trim()} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-200" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ))}
                </div>
              )}
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input type="checkbox" checked={form.featured ?? false} onChange={e => setF('featured', e.target.checked)} className="accent-indigo-600 w-4 h-4" />
                Featured
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input type="checkbox" checked={form.active ?? true} onChange={e => setF('active', e.target.checked)} className="accent-indigo-600 w-4 h-4" />
                Active on storefront
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                {saving ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Saving…</span> : 'Save to store'}
              </button>
            </div>
          </form>
        )}
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
  const [importOpen, setImportOpen] = useState(false);
  const [cjOpen, setCjOpen] = useState(false);
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCjOpen(true)}
            className="flex items-center gap-2 border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ShoppingBag size={16} />Search CJ
          </button>
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Download size={16} />Import from AliExpress
          </button>
          <button
            onClick={() => setModalProduct('new')}
            className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />Add Product
          </button>
        </div>
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
              <th className="text-center px-4 py-3 text-slate-600 font-medium">AI Score</th>
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

                {/* AI Score */}
                <td className="px-4 py-3 text-center">
                  <AiScoreBadge score={product.aiScore} breakdown={product.scoreBreakdown} />
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
      {cjOpen && (
        <CJSearchModal
          categories={categories}
          onClose={() => setCjOpen(false)}
          onSaved={() => { setCjOpen(false); load(page); }}
        />
      )}

      {importOpen && (
        <ImportModal
          categories={categories}
          onClose={() => setImportOpen(false)}
          onSaved={() => { setImportOpen(false); load(page); }}
        />
      )}

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
