'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';

const SIGNALS = [
  { key: 'trendVelocity', label: 'Trend Velocity' },
  { key: 'engagementRate', label: 'Engagement Rate' },
  { key: 'adFrequency', label: 'Ad Frequency' },
  { key: 'marginPotential', label: 'Margin Potential' },
  { key: 'supplierScore', label: 'Supplier Score' },
  { key: 'lowCompetitionFactor', label: 'Low Competition' },
  { key: 'sentimentScore', label: 'Sentiment Score' },
] as const;

type SignalKey = typeof SIGNALS[number]['key'];

interface ScoreResult { winningScore?: { score?: number }; [k: string]: unknown }

const DEFAULTS: Record<SignalKey, number> = {
  trendVelocity: 82, engagementRate: 74, adFrequency: 55,
  marginPotential: 68, supplierScore: 90, lowCompetitionFactor: 60, sentimentScore: 85,
};

export default function WinningLabPage() {
  const [productId, setProductId] = useState('prod-001');
  const [productName, setProductName] = useState('Wireless Earbuds Pro');
  const [signals, setSignals] = useState<Record<SignalKey, number>>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);

  const set = (k: SignalKey, v: number) => setSignals(p => ({ ...p, [k]: v }));

  const handleScore = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.scoreProduct({ productId, productName, source: 'storefront', keyword: productName, ...signals });
      setResult(res as ScoreResult);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  const score = result?.winningScore?.score as number | undefined;
  const verdict = score !== undefined ? (score >= 70 ? '✓ IMPORT RECOMMENDED' : score >= 40 ? '~ MONITOR' : '✗ SKIP') : null;
  const scoreColor = score !== undefined ? (score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444') : '#7aadff';

  return (
    <main className="page">
      <div className="ambient ambient-1" /><div className="ambient ambient-2" />
      <header className="header">
        <Link href="/" className="brand">TUKTUK</Link>
        <Link href="/dashboard" className="nav-link">← Dashboard</Link>
      </header>

      <section style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>Winning Lab</h1>
        <p style={{ color: '#9ec4ff', marginBottom: 28, fontSize: 14 }}>Score a product across 7 AI signals to predict winning potential.</p>

        <div className="layout">
          <div className="panel">
            <div className="field-row">
              <div className="field">
                <label className="field-label">Product ID</label>
                <input className="input" value={productId} onChange={e => setProductId(e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Product Name</label>
                <input className="input" value={productName} onChange={e => setProductName(e.target.value)} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(110,169,255,0.15)', paddingTop: 20, marginTop: 16 }}>
              {SIGNALS.map(({ key, label }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label className="field-label">{label}</label>
                    <span style={{ color: '#1bf5ff', fontWeight: 700, fontSize: 13 }}>{signals[key]}</span>
                  </div>
                  <input
                    type="range" min={0} max={100} value={signals[key]}
                    onChange={e => set(key, Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#1592ff' }}
                  />
                </div>
              ))}
            </div>

            {error && <div className="error">{error}</div>}

            <button className="btn" onClick={handleScore} disabled={loading}>
              {loading ? 'Scoring…' : 'Calculate Winning Score'}
            </button>
          </div>

          <div className="result-panel">
            {!result && !loading && (
              <div className="empty-state">
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                <p>Score a product to see results</p>
              </div>
            )}
            {loading && <div className="empty-state"><div className="spinner" /><p style={{ marginTop: 16, color: '#7aadff' }}>Analyzing…</p></div>}
            {result && score !== undefined && (
              <>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <p style={{ color: '#7aadff', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Winning Score</p>
                  <p style={{ fontSize: 72, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score.toFixed(1)}</p>
                  <p style={{ color: scoreColor, fontWeight: 700, marginTop: 8, fontSize: 14 }}>{verdict}</p>
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{ width: `${Math.min(score, 100)}%`, background: scoreColor }} />
                </div>
                <details style={{ marginTop: 20 }}>
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
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .field { display: flex; flex-direction: column; gap: 4px; }
        .field-label { font-size: 11px; color: #7aadff; text-transform: uppercase; letter-spacing: 0.06em; }
        .input { background: rgba(0,0,0,0.4); border: 1px solid rgba(110,169,255,0.25); border-radius: 10px; padding: 8px 12px; color: #f2f4ff; font-size: 13px; outline: none; width: 100%; }
        .input:focus { border-color: rgba(21,146,255,0.6); }
        .btn { width: 100%; margin-top: 20px; background: linear-gradient(120deg, #1d77ff, #00e5ff); color: #04111d; border: 0; border-radius: 12px; padding: 12px; font-weight: 700; font-size: 14px; cursor: pointer; transition: opacity 200ms; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .error { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.35); color: #fca5a5; padding: 10px 14px; border-radius: 10px; margin-top: 12px; font-size: 12px; }
        .empty-state { text-align: center; color: #4a6a9e; font-size: 14px; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .spinner { width: 32px; height: 32px; border: 3px solid rgba(21,146,255,0.2); border-top-color: #1592ff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .score-bar-track { height: 8px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden; }
        .score-bar-fill { height: 100%; border-radius: 999px; transition: width 600ms ease; }
        .raw { font-size: 11px; color: #7aadff; background: rgba(0,0,0,0.3); border-radius: 10px; padding: 12px; margin-top: 8px; max-height: 200px; overflow: auto; }
        @media (max-width: 768px) { .layout { grid-template-columns: 1fr; } .field-row { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}
