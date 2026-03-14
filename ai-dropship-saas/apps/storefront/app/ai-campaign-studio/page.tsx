'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';

interface AssetResult { assets?: { headline?: string; description?: string; hooks?: string[]; cta?: string[]; hashtags?: string[] }; [k: string]: unknown }

export default function AiCampaignStudioPage() {
  const [productName, setProductName] = useState('Wireless Earbuds Pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssetResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!productName.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await api.generateAssets(productName.trim());
      setResult(res as AssetResult);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const assets = result?.assets;

  return (
    <main className="page">
      <div className="ambient ambient-1" /><div className="ambient ambient-2" />
      <header className="header">
        <Link href="/" className="brand">TUKTUK</Link>
        <Link href="/dashboard" className="nav-link">← Dashboard</Link>
      </header>

      <section style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>AI Campaign Studio</h1>
        <p style={{ color: '#9ec4ff', marginBottom: 28, fontSize: 14 }}>Generate marketing copy, hooks, and hashtags with AI.</p>

        <div className="input-row">
          <div style={{ flex: 1 }}>
            <label className="field-label">Product Name</label>
            <input
              className="input" type="text" value={productName}
              onChange={e => setProductName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. Wireless Earbuds Pro"
              style={{ marginTop: 6 }}
            />
          </div>
          <button className="btn" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating…' : '🤖 Generate'}
          </button>
        </div>

        {error && <div className="error">⚠ {error}</div>}

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#7aadff' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p>Generating campaign assets…</p>
          </div>
        )}

        {assets && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {assets.headline && (
              <div className="asset-card">
                <div className="asset-header">
                  <span className="asset-label">Headline</span>
                  <button className="copy-btn" onClick={() => copy(assets.headline!, 'headline')}>
                    {copied === 'headline' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="asset-text">{assets.headline}</p>
              </div>
            )}

            {assets.description && (
              <div className="asset-card">
                <div className="asset-header">
                  <span className="asset-label">Description</span>
                  <button className="copy-btn" onClick={() => copy(assets.description!, 'desc')}>
                    {copied === 'desc' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="asset-text">{assets.description}</p>
              </div>
            )}

            {assets.hooks && assets.hooks.length > 0 && (
              <div className="asset-card">
                <div className="asset-header">
                  <span className="asset-label">Ad Hooks</span>
                  <button className="copy-btn" onClick={() => copy(assets.hooks!.join('\n'), 'hooks')}>
                    {copied === 'hooks' ? '✓ Copied' : 'Copy All'}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {assets.hooks.map((hook, i) => (
                    <div key={i} className="list-item">
                      <span className="item-num">{i + 1}</span>
                      <span>{hook}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {assets.cta && assets.cta.length > 0 && (
              <div className="asset-card">
                <div className="asset-header">
                  <span className="asset-label">Call to Action</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {assets.cta.map((c, i) => (
                    <span key={i} className="tag tag-blue">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {assets.hashtags && assets.hashtags.length > 0 && (
              <div className="asset-card">
                <div className="asset-header">
                  <span className="asset-label">Hashtags</span>
                  <button className="copy-btn" onClick={() => copy(assets.hashtags!.join(' '), 'tags')}>
                    {copied === 'tags' ? '✓ Copied' : 'Copy All'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {assets.hashtags.map((tag, i) => (
                    <span key={i} className="tag tag-cyan">{tag}</span>
                  ))}
                </div>
              </div>
            )}

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
        .input-row { display: flex; gap: 12px; align-items: flex-end; margin-bottom: 20px; position: relative; z-index: 1; }
        .field-label { font-size: 11px; color: #7aadff; text-transform: uppercase; letter-spacing: 0.06em; }
        .input { width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(110,169,255,0.25); border-radius: 10px; padding: 10px 14px; color: #f2f4ff; font-size: 13px; outline: none; box-sizing: border-box; }
        .input:focus { border-color: rgba(21,146,255,0.6); }
        .btn { background: linear-gradient(120deg, #1d77ff, #00e5ff); color: #04111d; border: 0; border-radius: 12px; padding: 11px 24px; font-weight: 700; font-size: 13px; cursor: pointer; white-space: nowrap; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .error { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.35); color: #fca5a5; padding: 12px 16px; border-radius: 12px; margin-bottom: 20px; font-size: 13px; position: relative; z-index: 1; }
        .spinner { width: 32px; height: 32px; border: 3px solid rgba(21,146,255,0.2); border-top-color: #1592ff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .asset-card { background: rgba(16,22,37,0.85); border: 1px solid rgba(110,169,255,0.2); border-radius: 16px; padding: 20px; position: relative; z-index: 1; }
        .asset-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .asset-label { font-size: 11px; color: #7aadff; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
        .asset-text { font-size: 14px; color: #e8f4ff; line-height: 1.6; margin-top: 8px; }
        .copy-btn { background: rgba(21,146,255,0.15); border: 1px solid rgba(21,146,255,0.3); color: #7aadff; border-radius: 6px; padding: 3px 10px; font-size: 11px; cursor: pointer; }
        .copy-btn:hover { background: rgba(21,146,255,0.25); }
        .list-item { display: flex; gap: 10px; align-items: flex-start; font-size: 13px; color: #dbe7ff; }
        .item-num { background: rgba(21,146,255,0.2); color: #1592ff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
        .tag { padding: 4px 10px; border-radius: 999px; font-size: 12px; }
        .tag-blue { background: rgba(21,146,255,0.15); border: 1px solid rgba(21,146,255,0.3); color: #7aadff; }
        .tag-cyan { background: rgba(0,229,255,0.1); border: 1px solid rgba(0,229,255,0.3); color: #00e5ff; }
        .raw { font-size: 11px; color: #7aadff; background: rgba(0,0,0,0.3); border-radius: 10px; padding: 12px; margin-top: 8px; max-height: 240px; overflow: auto; }
      `}</style>
    </main>
  );
}
