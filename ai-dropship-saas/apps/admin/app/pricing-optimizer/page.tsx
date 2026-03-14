'use client';

import { useState } from 'react';
import { api } from '../../lib/api';
import { Loader2, AlertCircle, DollarSign, TrendingUp } from 'lucide-react';

interface PricingResult {
  recommendedPrice?: number;
  projectedMargin?: number;
  projectedMarginPct?: number;
  simulatedRoas?: number;
  breakEvenPrice?: number;
  [key: string]: unknown;
}

function InputField({
  label, value, onChange, prefix, hint,
}: {
  label: string; value: string; onChange: (v: string) => void; prefix?: string; hint?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{prefix}</span>
        )}
        <input
          type="number"
          min={0}
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${prefix ? 'pl-7 pr-3' : 'px-3'}`}
        />
      </div>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function ResultCard({ label, value, color = 'text-slate-800', sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function PricingOptimizerPage() {
  const [cost, setCost] = useState('12.50');
  const [marketAverage, setMarketAverage] = useState('34.99');
  const [targetMarginPct, setTargetMarginPct] = useState('40');
  const [estimatedCpa, setEstimatedCpa] = useState('8.00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PricingResult | null>(null);

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.optimizePrice({
        cost: Number(cost),
        marketAverage: Number(marketAverage),
        targetMarginPct: Number(targetMarginPct),
        estimatedCpa: Number(estimatedCpa),
      }) as PricingResult;
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
        <h1 className="text-2xl font-bold text-slate-900">Pricing Optimizer</h1>
        <p className="text-slate-500 text-sm mt-1">
          Calculate the optimal selling price given cost, market average, target margin, and estimated CPA.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Cost Parameters</h2>
          <div className="space-y-4">
            <InputField
              label="Product Cost"
              value={cost}
              onChange={setCost}
              prefix="$"
              hint="Your landed cost per unit (product + shipping)"
            />
            <InputField
              label="Market Average Price"
              value={marketAverage}
              onChange={setMarketAverage}
              prefix="$"
              hint="Average selling price of competitors"
            />
            <InputField
              label="Target Margin %"
              value={targetMarginPct}
              onChange={setTargetMarginPct}
              hint="Desired profit margin as a percentage (0–100)"
            />
            <InputField
              label="Estimated CPA"
              value={estimatedCpa}
              onChange={setEstimatedCpa}
              prefix="$"
              hint="Estimated cost per acquisition from paid ads"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mt-4 text-xs">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleOptimize}
            disabled={loading}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
            {loading ? 'Optimizing…' : 'Optimize Price'}
          </button>
        </div>

        <div>
          {!result && !loading && (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-10 text-center h-full flex flex-col items-center justify-center">
              <TrendingUp size={32} className="text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm">Optimized price will appear here</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400 mb-1">Recommended Price</p>
                <p className="text-5xl font-bold text-indigo-700">
                  ${result.recommendedPrice?.toFixed(2) ?? '—'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {result.projectedMarginPct !== undefined && (
                  <ResultCard
                    label="Projected Margin"
                    value={`${result.projectedMarginPct.toFixed(1)}%`}
                    color={result.projectedMarginPct >= Number(targetMarginPct) ? 'text-emerald-600' : 'text-amber-600'}
                  />
                )}
                {result.simulatedRoas !== undefined && (
                  <ResultCard
                    label="Simulated ROAS"
                    value={`${result.simulatedRoas.toFixed(2)}x`}
                    sub="Return on ad spend"
                  />
                )}
                {result.breakEvenPrice !== undefined && (
                  <ResultCard
                    label="Break-even Price"
                    value={`$${result.breakEvenPrice.toFixed(2)}`}
                    sub="Minimum to cover costs + CPA"
                  />
                )}
                {result.projectedMargin !== undefined && (
                  <ResultCard
                    label="Projected Profit"
                    value={`$${result.projectedMargin.toFixed(2)}`}
                    sub="Per unit after CPA"
                  />
                )}
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
