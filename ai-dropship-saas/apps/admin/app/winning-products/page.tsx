'use client';

import { useState } from 'react';
import { api, ScoreProductBody } from '../../lib/api';
import { Loader2, AlertCircle, Trophy, RefreshCw } from 'lucide-react';

interface ScoreResult {
  winningScore?: { score?: number };
  trendSignal?: { keyword?: string; velocity?: number };
  snapshot?: { id?: string };
  [key: string]: unknown;
}

interface HistoryEntry {
  productId: string;
  productName: string;
  score: number;
  result: ScoreResult;
  scoredAt: string;
}

function ScoreBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium w-8 text-right text-slate-700">{pct}</span>
    </div>
  );
}

const FIELDS: Array<{ key: keyof ScoreProductBody; label: string; min?: number; max?: number }> = [
  { key: 'trendVelocity', label: 'Trend Velocity', min: 0, max: 100 },
  { key: 'engagementRate', label: 'Engagement Rate', min: 0, max: 100 },
  { key: 'adFrequency', label: 'Ad Frequency', min: 0, max: 100 },
  { key: 'marginPotential', label: 'Margin Potential', min: 0, max: 100 },
  { key: 'supplierScore', label: 'Supplier Score', min: 0, max: 100 },
  { key: 'lowCompetitionFactor', label: 'Low Competition Factor', min: 0, max: 100 },
  { key: 'sentimentScore', label: 'Sentiment Score', min: 0, max: 100 },
];

const DEFAULTS: ScoreProductBody = {
  productId: 'prod-001',
  productName: 'Wireless Earbuds Pro',
  source: 'tiktok',
  keyword: 'wireless earbuds',
  trendVelocity: 82,
  engagementRate: 74,
  adFrequency: 55,
  marginPotential: 68,
  supplierScore: 90,
  lowCompetitionFactor: 60,
  sentimentScore: 85,
};

export default function WinningProductsPage() {
  const [form, setForm] = useState<ScoreProductBody>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const handleChange = (key: keyof ScoreProductBody, value: string) => {
    const numFields = FIELDS.map((f) => f.key);
    setForm((prev) => ({
      ...prev,
      [key]: numFields.includes(key) ? Number(value) : value,
    }));
  };

  const handleScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.scoreProduct(form) as ScoreResult;
      const score = (result?.winningScore?.score ?? 0) as number;
      setHistory((prev) => [
        {
          productId: form.productId,
          productName: form.productName ?? form.productId,
          score,
          result,
          scoredAt: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Winning Products</h1>
        <p className="text-slate-500 text-sm mt-1">Score a product across 7 AI signals and see its winning potential.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Product Parameters</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Product ID</label>
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.productId}
                  onChange={(e) => handleChange('productId', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Product Name</label>
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.productName ?? ''}
                  onChange={(e) => handleChange('productName', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Source</label>
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.source ?? ''}
                  onChange={(e) => handleChange('source', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Keyword</label>
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.keyword ?? ''}
                  onChange={(e) => handleChange('keyword', e.target.value)}
                />
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3 space-y-3">
              {FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-slate-500">{label}</label>
                    <span className="text-xs font-medium text-slate-700">{form[key] as number}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={form[key] as number}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full accent-indigo-600"
                  />
                </div>
              ))}
            </div>
          </div>
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mt-4 text-xs">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <button
            onClick={handleScore}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {loading ? 'Scoring…' : 'Calculate Score'}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {history.length === 0 && (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center">
              <Trophy size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm">Score a product to see results here</p>
            </div>
          )}
          {history.map((entry, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{entry.productName}</p>
                  <p className="text-xs text-slate-400">{entry.productId} · {entry.scoredAt}</p>
                </div>
                <div className={`text-xl font-bold ${entry.score >= 70 ? 'text-emerald-600' : entry.score >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                  {entry.score.toFixed(1)}
                </div>
              </div>
              <ScoreBar value={entry.score} />
              <p className={`text-xs font-medium mt-2 ${entry.score >= 70 ? 'text-emerald-600' : entry.score >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                {entry.score >= 70 ? '✓ Import recommended' : entry.score >= 40 ? '~ Monitor this product' : '✗ Skip — below threshold'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
