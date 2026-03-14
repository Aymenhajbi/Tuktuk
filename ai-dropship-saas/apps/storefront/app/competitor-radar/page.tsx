'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';

interface ScanResult { snapshot?: Record<string, unknown>; indexed?: boolean; [k: string]: unknown }

export default function CompetitorRadarPage() {
  const [url, setUrl] = useState('https://example-store.myshopify.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await api.scanCompetitor(url.trim()) as ScanResult;
      setResult(data);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <main className="page">
      <div className="ambient ambient-1" /><div className="ambient ambient-2" />
      <header className="header">
        <Link href="/" className="brand">TUKTUK</Link>
        <Link href="/dashboard" className="nav-link">← Dashboard</Link>
      </header>

      <section style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>Competitor Radar</h1>
        <p style={{ color: '#9ec4ff', marginBottom: 28, fontSize: 14 }}>Scan any competitor store — extract products, pricing, and market signals.</p>

        <div className="scan-box">
          <label className="field-label">Store URL</label>
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            <input
              className="input" type="url" value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="https://competitor.com"
            />
            <button className="btn" onClick={handleScan} disabled={loading} style={{ width: 'auto', padding: '10px 24px' }}>
              {loading ? 'Scanning…' : '🔍 Scan'}
            </button>
          </div>
          <p style={{ color: '#4a6a9e', fontSize: 11, marginTop: 8 }}>
            Note: requires Elasticsearch configured at <code>ELASTICSEARCH_URL</code>
          </p>
        </div>

        {error && <div className="error">⚠ {error}</div>}

        {result && (
          <div className="result-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18 }}>Scan Results</h2>
              {result.indexed && <span className="badge">✓ Indexed to Elasticsearch</span>}
            </div>
            {result.snapshot?.url && (
              <a href={result.snapshot.url as string} target="_blank" rel="noopener noreferrer"
                style={{ color: '#1592ff', fontSize: 13, display: 'block', marginBottom: 16 }}>
                {result.snapshot.url as string} ↗
              </a>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 12, marginBottom: 20 }}>
              {result.snapshot?.productCount !== undefined && (
                <div className="metric-card">
                  <p style={{ color: '#7aadff', fontSize: 11 }}>Products Found</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#1bf5ff' }}>{result.snapshot.productCount as number}</p>
                </div>
              )}
              {result.snapshot?.avgPrice !== undefined && (
                <div className="metric-card">
                  <p style={{ color: '#7aadff', fontSize: 11 }}>Avg Price</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>${result.snapshot.avgPrice as number}</p>
                </div>
              )}
            </div>
            <details>
              <summary style={{ color: '#4a6a9e', fontSize: 12, cursor: 'pointer' }}>Raw response</summary>
              <pre className="raw">{JSON.stringify(result, null, 2)}</pre>
            </details>
          </div>
        )}
      </section>

      <style jsx>{`
        .page { min-height: 100vh; background: radial-gradient(circle at 20% 20%, #122548 0%, #07090f 40%, #030305 100%); color: #f2f4ff; padding: 28px; font-family: Inter, system-ui, sans-serif; position: relative; overflow: hidden; }
        .ambient { position: absolute; border-radius: 50%; filter: blur(60px); z-index: 0; }
        .ambient-1 { width: 300px; height: 300px; background: rgba(21,146,255,0.18); top: -70px; right: -60px; }
        .ambient-2 { width: 200px; height: 200px; background: rgba(0,255,214,0.12); bottom: -60px; left: -50px; }
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; position: relative; z-index: 1; }
        .brand { font-weight: 800; letter-spacing: 0.18em; color: #f2f4ff; text-decoration: none; }
        .nav-link { color: #dbe7ff; border: 1px solid rgba(122,173,255,0.3); padding: 7px 12px; border-radius: 999px; font-size: 12px; text-decoration: none; }
        .scan-box { background: rgba(16,22,37,0.85); border: 1px solid rgba(110,169,255,0.2); border-radius: 20px; padding: 24px; margin-bottom: 20px; }
        .field-label { font-size: 11px; color: #7aadff; text-transform: uppercase; letter-spacing: 0.06em; }
        .input { flex: 1; background: rgba(0,0,0,0.4); border: 1px solid rgba(110,169,255,0.25); border-radius: 10px; padding: 10px 14px; color: #f2f4ff; font-size: 13px; outline: none; }
        .input:focus { border-color: rgba(21,146,255,0.6); }
        .btn { background: linear-gradient(120deg, #1d77ff, #00e5ff); color: #04111d; border: 0; border-radius: 12px; padding: 12px 24px; font-weight: 700; font-size: 13px; cursor: pointer; white-space: nowrap; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .error { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.35); color: #fca5a5; padding: 12px 16px; border-radius: 12px; margin-bottom: 20px; font-size: 13px; }
        .result-card { background: rgba(16,22,37,0.85); border: 1px solid rgba(110,169,255,0.2); border-radius: 20px; padding: 24px; }
        .metric-card { background: rgba(0,0,0,0.3); border: 1px solid rgba(110,169,255,0.15); border-radius: 12px; padding: 16px; }
        .badge { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); color: #6ee7b7; padding: 4px 10px; border-radius: 999px; font-size: 11px; }
        .raw { font-size: 11px; color: #7aadff; background: rgba(0,0,0,0.3); border-radius: 10px; padding: 12px; margin-top: 8px; max-height: 240px; overflow: auto; }
      `}</style>
    </main>
  );
}
