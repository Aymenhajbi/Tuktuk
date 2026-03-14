'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';

interface ViralResult { viralScore?: { score?: number; tier?: string }; [k: string]: unknown }

export default function TrendMonitorPage() {
  const [views24h, setViews24h] = useState(850000);
  const [comments, setComments] = useState(12400);
  const [shares, setShares] = useState(34200);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ViralResult | null>(null);

  const handleScore = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.scoreViral({ views24h, comments, shares });
      setResult(res as ViralResult);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  const score = result?.viralScore?.score as number | undefined;
  const tier = result?.viralScore?.tier as string | undefined;
  const scoreColor = score !== undefined ? (score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444') : '#7aadff';

  return (
    <main className="page">
      <div className="ambient ambient-1" /><div className="ambient ambient-2" />
      <header className="header">
        <Link href="/" className="brand">TUKTUK</Link>
        <Link href="/dashboard" className="nav-link">← Dashboard</Link>
      </header>

      <section style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>Trend Monitor</h1>
        <p style={{ color: '#9ec4ff', marginBottom: 28, fontSize: 14 }}>Score TikTok virality from raw engagement signals.</p>

        <div className="layout">
          <div className="panel">
            {[
              { label: 'Views (24h)', value: views24h, set: setViews24h, max: 5000000, step: 10000 },
              { label: 'Comments', value: comments, set: setComments, max: 100000, step: 100 },
              { label: 'Shares', value: shares, set: setShares, max: 200000, step: 500 },
            ].map(({ label, value, set, max, step }) => (
              <div key={label} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label className="field-label">{label}</label>
                  <span style={{ color: '#1bf5ff', fontWeight: 700, fontSize: 13 }}>{value.toLocaleString()}</span>
                </div>
                <input
                  type="range" min={0} max={max} step={step} value={value}
                  onChange={e => set(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#1592ff' }}
                />
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Views 24h', value: views24h, onChange: setViews24h },
                { label: 'Comments', value: comments, onChange: setComments },
                { label: 'Shares', value: shares, onChange: setShares },
              ].map(({ label, value, onChange }) => (
                <div key={label}>
                  <label className="field-label">{label}</label>
                  <input
                    className="input" type="number" value={value}
                    onChange={e => onChange(Number(e.target.value))}
                    style={{ marginTop: 4 }}
                  />
                </div>
              ))}
            </div>

            {error && <div className="error">{error}</div>}
            <button className="btn" onClick={handleScore} disabled={loading}>
              {loading ? 'Analyzing…' : '📈 Score Virality'}
            </button>
          </div>

          <div className="result-panel">
            {!result && !loading && (
              <div className="empty-state">
                <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
                <p>Enter engagement metrics to score</p>
              </div>
            )}
            {loading && <div className="empty-state"><div className="spinner" /><p style={{ marginTop: 16, color: '#7aadff' }}>Analyzing…</p></div>}
            {result && score !== undefined && (
              <>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <p style={{ color: '#7aadff', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Viral Score</p>
                  <p style={{ fontSize: 72, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score.toFixed(1)}</p>
                  {tier && <p style={{ color: scoreColor, fontWeight: 700, marginTop: 8, fontSize: 14 }}>{tier}</p>}
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{ width: `${Math.min(score, 100)}%`, background: scoreColor }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 20 }}>
                  {[
                    { label: 'Views', value: views24h.toLocaleString() },
                    { label: 'Comments', value: comments.toLocaleString() },
                    { label: 'Shares', value: shares.toLocaleString() },
                  ].map(({ label, value }) => (
                    <div key={label} className="metric-mini">
                      <p style={{ color: '#7aadff', fontSize: 10 }}>{label}</p>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#f2f4ff' }}>{value}</p>
                    </div>
                  ))}
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
        .field-label { font-size: 11px; color: #7aadff; text-transform: uppercase; letter-spacing: 0.06em; }
        .input { background: rgba(0,0,0,0.4); border: 1px solid rgba(110,169,255,0.25); border-radius: 10px; padding: 8px 12px; color: #f2f4ff; font-size: 13px; outline: none; width: 100%; box-sizing: border-box; }
        .btn { width: 100%; margin-top: 4px; background: linear-gradient(120deg, #1d77ff, #00e5ff); color: #04111d; border: 0; border-radius: 12px; padding: 12px; font-weight: 700; font-size: 14px; cursor: pointer; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .error { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.35); color: #fca5a5; padding: 10px 14px; border-radius: 10px; margin-bottom: 12px; font-size: 12px; }
        .empty-state { text-align: center; color: #4a6a9e; font-size: 14px; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .spinner { width: 32px; height: 32px; border: 3px solid rgba(21,146,255,0.2); border-top-color: #1592ff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .score-bar-track { height: 8px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden; }
        .score-bar-fill { height: 100%; border-radius: 999px; transition: width 600ms ease; }
        .metric-mini { background: rgba(0,0,0,0.3); border: 1px solid rgba(110,169,255,0.15); border-radius: 10px; padding: 10px; text-align: center; }
        .raw { font-size: 11px; color: #7aadff; background: rgba(0,0,0,0.3); border-radius: 10px; padding: 12px; margin-top: 8px; max-height: 200px; overflow: auto; }
        @media (max-width: 768px) { .layout { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}
