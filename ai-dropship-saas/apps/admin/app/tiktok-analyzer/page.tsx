'use client';

import { useState } from 'react';
import { api } from '../../lib/api';
import { Loader2, AlertCircle, TrendingUp, Zap } from 'lucide-react';

interface ViralResult {
  viralityScore?: number;
  verdict?: string;
  trendSignal?: unknown;
  [key: string]: unknown;
}

function MetricInput({
  label, value, onChange, hint,
}: {
  label: string; value: string; onChange: (v: string) => void; hint?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function TikTokAnalyzerPage() {
  const [views24h, setViews24h] = useState('150000');
  const [comments, setComments] = useState('3200');
  const [shares, setShares] = useState('8500');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ViralResult | null>(null);

  const handleScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.scoreViral({
        views24h: Number(views24h),
        comments: Number(comments),
        shares: Number(shares),
      }) as ViralResult;
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const score = result?.viralityScore ?? 0;
  const scoreColor = score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-600' : 'text-red-600';
  const scoreBg = score >= 70 ? 'bg-emerald-50 border-emerald-200' : score >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">TikTok Analyzer</h1>
        <p className="text-slate-500 text-sm mt-1">Score a product's viral potential based on TikTok engagement metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Engagement Metrics</h2>
          <div className="space-y-4">
            <MetricInput
              label="24h Views"
              value={views24h}
              onChange={setViews24h}
              hint="Total views in the last 24 hours"
            />
            <MetricInput
              label="Comments"
              value={comments}
              onChange={setComments}
              hint="Total comment count on the video"
            />
            <MetricInput
              label="Shares"
              value={shares}
              onChange={setShares}
              hint="Total share count on the video"
            />
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
            className="mt-5 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
            {loading ? 'Analyzing…' : 'Score Virality'}
          </button>
        </div>

        <div>
          {!result && !loading && (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
              <Zap size={32} className="text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm">Enter metrics and click Score Virality</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className={`border rounded-xl p-6 ${scoreBg}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Virality Score</p>
                <p className={`text-5xl font-bold ${scoreColor}`}>{score}</p>
                {result.verdict && (
                  <p className={`text-sm font-medium mt-2 ${scoreColor}`}>{result.verdict}</p>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Inputs</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '24h Views', value: Number(views24h).toLocaleString() },
                    { label: 'Comments', value: Number(comments).toLocaleString() },
                    { label: 'Shares', value: Number(shares).toLocaleString() },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <details className="bg-white border border-slate-200 rounded-xl p-4">
                <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">Raw API response</summary>
                <pre className="mt-2 text-xs text-slate-600 overflow-auto max-h-48">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
