'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2, Edit2, Copy, Check, Tag } from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

const EMPTY_FORM = {
  code: '',
  discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
  discountValue: '',
  minOrderAmount: '',
  maxUses: '',
  expiresAt: '',
  isActive: true,
};

function randomCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function statusBadge(p: PromoCode) {
  if (!p.isActive) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">Inactive</span>;
  if (p.expiresAt && new Date(p.expiresAt) < new Date()) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">Expired</span>;
  if (p.maxUses !== null && p.usedCount >= p.maxUses) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-600">Maxed out</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-600">Active</span>;
}

export default function PromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.listPromoCodes()
      .then(setCodes)
      .catch(() => setCodes([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p: PromoCode) => {
    setEditId(p.id);
    setForm({
      code: p.code,
      discountType: p.discountType,
      discountValue: String(p.discountValue),
      minOrderAmount: p.minOrderAmount != null ? String(p.minOrderAmount) : '',
      maxUses: p.maxUses != null ? String(p.maxUses) : '',
      expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : '',
      isActive: p.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        code: form.code.toUpperCase().trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        expiresAt: form.expiresAt || undefined,
        isActive: form.isActive,
      };
      if (editId) {
        await api.updatePromoCode(editId, body);
      } else {
        await api.createPromoCode(body);
      }
      setShowModal(false);
      load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promo code?')) return;
    setDeleteId(id);
    try {
      await api.deletePromoCode(id);
      load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setDeleteId(null);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Promo Codes</h1>
          <p className="text-slate-400 text-sm mt-0.5">{codes.length} code{codes.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
          <Plus size={16} /> New Promo Code
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-white rounded-xl animate-pulse border border-slate-100" />)}
        </div>
      ) : codes.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Tag size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">No promo codes yet</p>
          <p className="text-sm">Create your first discount code</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Code</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Discount</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Min Order</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Uses</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Expires</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {codes.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{p.code}</span>
                      <button onClick={() => copyCode(p.code)} className="text-slate-400 hover:text-slate-700">
                        {copied === p.code ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-indigo-600">
                    {p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : `AED ${p.discountValue.toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.minOrderAmount != null ? `AED ${p.minOrderAmount}` : '—'}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {p.usedCount}{p.maxUses != null ? `/${p.maxUses}` : ''}
                    {p.maxUses == null && <span className="text-xs text-slate-400 ml-1">(unlimited)</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">{statusBadge(p)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} disabled={deleteId === p.id} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-lg">{editId ? 'Edit Promo Code' : 'New Promo Code'}</h2>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Code */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Code *</label>
                <div className="flex gap-2">
                  <input
                    required value={form.code}
                    onChange={e => set('code', e.target.value.toUpperCase())}
                    placeholder="SUMMER20"
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-indigo-400"
                  />
                  <button type="button" onClick={() => set('code', randomCode())}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-xs hover:bg-slate-50 whitespace-nowrap">
                    Generate
                  </button>
                </div>
              </div>

              {/* Discount type */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Discount Type *</label>
                <div className="flex gap-2">
                  {(['PERCENTAGE', 'FIXED_AMOUNT'] as const).map(t => (
                    <label key={t} className={`flex-1 flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-sm ${form.discountType === t ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-300'}`}>
                      <input type="radio" name="discountType" value={t} checked={form.discountType === t} onChange={() => set('discountType', t)} className="accent-indigo-600" />
                      {t === 'PERCENTAGE' ? 'Percentage (%)' : 'Fixed Amount (AED)'}
                    </label>
                  ))}
                </div>
              </div>

              {/* Discount value */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">
                  Discount Value * {form.discountType === 'PERCENTAGE' ? '(%)' : '(AED)'}
                </label>
                <input required type="number" min="0" step="0.01" value={form.discountValue}
                  onChange={e => set('discountValue', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              {/* Min order + max uses side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Min Order (AED)</label>
                  <input type="number" min="0" step="0.01" value={form.minOrderAmount} placeholder="Optional"
                    onChange={e => set('minOrderAmount', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Max Uses</label>
                  <input type="number" min="1" step="1" value={form.maxUses} placeholder="Unlimited"
                    onChange={e => set('maxUses', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              {/* Expiry date */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Expiry Date</label>
                <input type="date" value={form.expiresAt}
                  onChange={e => set('expiresAt', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  onClick={() => set('isActive', !form.isActive)}>
                  <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-slate-700">Active</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-slate-300 text-slate-600 py-2 rounded-xl hover:bg-slate-50 text-sm font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 text-sm font-medium disabled:opacity-50">
                  {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
