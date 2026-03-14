'use client';

import { useState } from 'react';
import { api } from '../../lib/api';
import { Loader2, AlertCircle, Megaphone, Copy, Check } from 'lucide-react';

interface AssetsResult {
  headline?: string;
  description?: string;
  callToAction?: string;
  emailSubject?: string;
  emailBody?: string;
  hashtags?: string[];
  [key: string]: unknown;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
    </button>
  );
}

function AssetCard({ label, content }: { label: string; content: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <CopyButton text={content} />
      </div>
      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

export default function AiCampaignStudioPage() {
  const [productName, setProductName] = useState('Wireless Earbuds Pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssetsResult | null>(null);

  const handleGenerate = async () => {
    if (!productName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.generateAssets(productName.trim()) as AssetsResult;
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Flatten top-level string fields from result for display
  const textAssets = result
    ? Object.entries(result)
        .filter(([, v]) => typeof v === 'string' && v.length > 0)
    : [];

  const arrayAssets = result
    ? Object.entries(result)
        .filter(([, v]) => Array.isArray(v) && (v as unknown[]).length > 0)
    : [];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI Campaign Studio</h1>
        <p className="text-slate-500 text-sm mt-1">Generate ad copy, email templates, and hashtags using GPT-4.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-2">Product Name</label>
        <div className="flex gap-3">
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g. Wireless Earbuds Pro"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !productName.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Megaphone size={14} />}
            {loading ? 'Generating…' : 'Generate Assets'}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Requires a valid <code className="bg-slate-100 px-1 rounded">OPENAI_API_KEY</code> in the backend <code className="bg-slate-100 px-1 rounded">.env</code>.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Generation failed</p>
            <p className="text-xs mt-1 opacity-80">{error}</p>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center">
          <Megaphone size={36} className="mx-auto text-slate-300 mb-2" />
          <p className="text-slate-400 text-sm">Generated marketing assets will appear here</p>
        </div>
      )}

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Loader2 size={28} className="mx-auto text-indigo-400 animate-spin mb-2" />
          <p className="text-slate-400 text-sm">GPT-4 is crafting your campaign…</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-3">
          {textAssets.map(([key, value]) => (
            <AssetCard
              key={key}
              label={key.replace(/([A-Z])/g, ' $1').trim()}
              content={value as string}
            />
          ))}
          {arrayAssets.map(([key, value]) => (
            <AssetCard
              key={key}
              label={key.replace(/([A-Z])/g, ' $1').trim()}
              content={(value as string[]).join(' · ')}
            />
          ))}
          {textAssets.length === 0 && arrayAssets.length === 0 && (
            <details className="bg-white border border-slate-200 rounded-xl p-4">
              <summary className="text-xs text-slate-500 cursor-pointer">Raw API response</summary>
              <pre className="mt-2 text-xs text-slate-600 overflow-auto max-h-64">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
