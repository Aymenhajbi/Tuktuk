'use client';

import { useState } from 'react';
import { api } from '../../lib/api';
import { Loader2, AlertCircle, Search, ExternalLink } from 'lucide-react';

interface CompetitorResult {
  snapshot?: {
    url?: string;
    productCount?: number;
    avgPrice?: number;
    topProducts?: Array<{ name?: string; price?: number }>;
    [key: string]: unknown;
  };
  indexed?: boolean;
  [key: string]: unknown;
}

export default function CompetitorRadarPage() {
  const [url, setUrl] = useState('https://example-store.myshopify.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompetitorResult | null>(null);

  const handleScan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.scanCompetitor(url.trim()) as CompetitorResult;
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Competitor Radar</h1>
        <p className="text-slate-500 text-sm mt-1">Scan a competitor store to extract products, pricing, and engagement data.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-2">Store URL</label>
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            placeholder="https://competitor-store.com"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleScan}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            {loading ? 'Scanning…' : 'Scan Store'}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Note: Requires Elasticsearch configured at <code className="bg-slate-100 px-1 rounded">ELASTICSEARCH_URL</code>.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Scan failed</p>
            <p className="text-xs mt-1 opacity-80">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Scan Results</h2>
              {result.indexed && (
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full">
                  Indexed to Elasticsearch
                </span>
              )}
            </div>

            {result.snapshot?.url && (
              <a
                href={result.snapshot.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-600 text-sm hover:underline mb-4"
              >
                {result.snapshot.url}
                <ExternalLink size={12} />
              </a>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              {result.snapshot?.productCount !== undefined && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Products Found</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{result.snapshot.productCount}</p>
                </div>
              )}
              {result.snapshot?.avgPrice !== undefined && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Average Price</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">${result.snapshot.avgPrice}</p>
                </div>
              )}
            </div>

            {result.snapshot?.topProducts && Array.isArray(result.snapshot.topProducts) && result.snapshot.topProducts.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Top Products</h3>
                <div className="space-y-2">
                  {result.snapshot.topProducts.map((p, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                      <span className="text-sm text-slate-700">{p.name ?? 'Unknown product'}</span>
                      {p.price !== undefined && (
                        <span className="text-sm font-medium text-slate-900">${p.price}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <details className="mt-4">
              <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">View raw response</summary>
              <pre className="mt-2 bg-slate-50 rounded-lg p-3 text-xs text-slate-600 overflow-auto max-h-64">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
