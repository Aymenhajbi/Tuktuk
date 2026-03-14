'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';

interface PriceResult {
  recommendation?: { recommendedPrice?: number; marginPct?: number; roi?: number };
  [k: string]: unknown;
}

export default function ProfitSimulatorPage() {
  const [cost, setCost] = useState(12);
  const [marketAverage, setMarketAverage] = useState(35);
  const [targetMarginPct, setTargetMarginPct] = useState(45);
  const [estimatedCpa, setEstimatedCpa] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PriceResult | null>(null);

  const handleOptimize = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.optimizePrice({ cost, marketAverage, targetMarginPct, estimatedCpa });
      setResult(res as PriceResult);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  const rec = result?.recommendation;

  return (
    <main className="page">
      <div className="ambient ambient-1" /><div className="ambient ambient-2" />
      <header className="header">
        <Link href="/" className="brand">TUKTUK</Link>
        <Link href="/dashboard" className="nav-link">← Dashboard</Link>
      </header>

      <section style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>Profit Simulator</h1>
        <p style={{ color: '#9ec4ff', marginBottom: 28, fontSize: 14 }}>Optimize your pricing for maximum profit margin.</p>

        <div className="layout">
          <div className="panel">
            <div className="fields">
              {[
                { label: 'Product Cost ($)', value: cost, set: setCost, min: 0, step: 0.5 },
                { label: 'Market Average ($)', value: marketAverage, set: setMarketAverage, min: 0, step: 0.5 },
                { label: 'Target Margin (%)', value: targetMarginPct, set: setTargetMarginPct, min: 0, max: 99, step: 1 },
                { label: 'Estimated CPA ($)', value: estimatedCpa, set: setEstimatedCpa, min: 0, step: 0.5 },
              ].map(({ label, value, set, min, max, step }) => (
                <div key={label} className="field">
                  <label className="field-label">{label}</label>
                  <input
                    className="input" type="number" value={value} min={min} max={max} step={step}
                    onChange={e => set(Number(e.target.value))}
                  />
                </div>
              ))}
            </div>

            {error && <div className="error">{error}</div>}
            <button className="btn" onClick={handleOptimize} disabled={loading}>
              {loading ? 'Calculating…' : '💰 Optimize Price'}
            </button>
          </div>

          <div className="result-panel">
            {!result && !loading && (
              <div className="empty-state">
                <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
                <p>Enter costs to calculate optimal price</p>
              </div>
            )}
            {loading && <div className="empty-state"><div className="spinner" /><p style={{ marginTop: 16, color: '#7aadff' }}>Calculating…</p></div>}
            {result && rec && (
              <>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <p style={{ color: '#7aadff', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Recommended Price</p>
                  <p style={{ fontSize: 64, fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
                    ${(rec.recommendedPrice as number | undefined)?.toFixed(2) ?? '—'}
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Margin', value: rec.marginPct !== undefined ? `${(rec.marginPct as number).toFixed(1)}%` : '—', color: '#10b981' },
                    { label: 'ROI', value: rec.roi !== undefined ? `${(rec.roi as number).toFixed(1)}%` : '—', color: '#1592ff' },
                    { label: 'Cost', value: `$${cost.toFixed(2)}`, color: '#f59e0b' },
                    { label: 'CPA', value: `$${estimatedCpa.toFixed(2)}`, color: '#ef4444' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="metric-card">
                      <p style={{ color: '#7aadff', fontSize: 10 }}>{label}</p>
                      <p style={{ fontWeight: 800, fontSize: 22, color }}>{value}</p>
                    </div>
                  ))}
                </div>
                <details>
                  <summary style={{ color: '#4a6a9e', fontSize: 12, cursor: 'pointer' }}>Raw response</summary>
                  <pre className="raw">{JSON.stringify(result, null, 2)}</pre>
                </details>
              </>
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        .page { min-height: 100vh; background: radial-gradient(circle at 20% 20%, #122548 0%, #07090f 40%, #030305 100%); color: #f2f4ff; padding: 28px; font-family: Inter, system-ui, sans-serif; position: relative; overflow: hidden; }
        .ambient { position: absolute; border-radius: 50%; filter: blur(60px); z-index: 0; }
        .ambient-1 { width: 300px; height: 300px; background: rgba(21,146,255,0.18); top: -70px; right: -60px; }
        .ambient-2 { width: 200px; height: 200px; background: rgba(0,255,214,0.12); bottom: -60px; left: -50px; }
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; position: relative; z-index: 1; }
        .brand { font-weight: 800; letter-spacing: 0.18em; color: #f2f4ff; text-decoration: none; }
        .nav-link { color: #dbe7ff; border: 1px solid rgba(122,173,255,0.3); padding: 7px 12px; border-radius: 999px; font-size: 12px; text-decoration: none; }
        .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .panel { background: rgba(16,22,37,0.85); border: 1px solid rgba(110,169,255,0.2); border-radius: 20px; padding: 24px; }
        .result-panel { background: rgba(16,22,37,0.85); border: 1px solid rgba(110,169,255,0.2); border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; }
        .fields { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
        .field { display: flex; flex-direction: column; gap: 4px; }
        .field-label { font-size: 11px; color: #7aadff; text-transform: uppercase; letter-spacing: 0.06em; }
        .input { background: rgba(0,0,0,0.4); border: 1px solid rgba(110,169,255,0.25); border-radius: 10px; padding: 8px 12px; color: #f2f4ff; font-size: 13px; outline: none; width: 100%; box-sizing: border-box; }
        .input:focus { border-color: rgba(21,146,255,0.6); }
        .btn { width: 100%; background: linear-gradient(120deg, #1d77ff, #00e5ff); color: #04111d; border: 0; border-radius: 12px; padding: 12px; font-weight: 700; font-size: 14px; cursor: pointer; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .error { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.35); color: #fca5a5; padding: 10px 14px; border-radius: 10px; margin-bottom: 12px; font-size: 12px; }
        .empty-state { text-align: center; color: #4a6a9e; font-size: 14px; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .spinner { width: 32px; height: 32px; border: 3px solid rgba(21,146,255,0.2); border-top-color: #1592ff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .metric-card { background: rgba(0,0,0,0.3); border: 1px solid rgba(110,169,255,0.15); border-radius: 12px; padding: 14px; }
        .raw { font-size: 11px; color: #7aadff; background: rgba(0,0,0,0.3); border-radius: 10px; padding: 12px; margin-top: 8px; max-height: 200px; overflow: auto; }
        @media (max-width: 768px) { .layout { grid-template-columns: 1fr; } .fields { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}
