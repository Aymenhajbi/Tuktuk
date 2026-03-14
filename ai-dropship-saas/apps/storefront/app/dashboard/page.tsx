'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';

interface QueueStatus {
  queues: Array<{ name: string; waiting: number; active: number; completed: number; failed: number }>;
}

const TOOLS = [
  { href: '/winning-lab', label: 'Winning Lab', desc: 'Score products across 7 AI signals', icon: '🏆' },
  { href: '/competitor-radar', label: 'Competitor Radar', desc: 'Scan any competitor store', icon: '🔍' },
  { href: '/trend-monitor', label: 'Trend Monitor', desc: 'TikTok virality scoring', icon: '📈' },
  { href: '/profit-simulator', label: 'Profit Simulator', desc: 'Optimize your pricing', icon: '💰' },
  { href: '/ai-campaign-studio', label: 'AI Campaign Studio', desc: 'Generate marketing copy', icon: '🤖' },
];

export default function DashboardPage() {
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getQueueStatus().then(setStatus as (v: unknown) => void).catch((e: Error) => setError(e.message));
  }, []);

  const totalWaiting = status?.queues.reduce((s, q) => s + (q.waiting ?? 0), 0) ?? '—';
  const totalActive = status?.queues.reduce((s, q) => s + (q.active ?? 0), 0) ?? '—';
  const totalCompleted = status?.queues.reduce((s, q) => s + (q.completed ?? 0), 0) ?? '—';
  const totalFailed = status?.queues.reduce((s, q) => s + (q.failed ?? 0), 0) ?? '—';

  return (
    <main className="page">
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

      <header className="header">
        <Link href="/" className="brand">TUKTUK</Link>
        <nav className="nav">
          {TOOLS.map(t => <Link key={t.href} href={t.href} className="nav-link">{t.label}</Link>)}
        </nav>
      </header>

      <section className="section" style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>Dashboard</h1>
        <p style={{ color: '#9ec4ff', marginBottom: 32, fontSize: 14 }}>
          AI dropshipping intelligence — live queue metrics and tools
        </p>

        {error && (
          <div className="alert-error">⚠ Backend unreachable: {error}</div>
        )}

        <div className="metrics-grid">
          {[
            { label: 'Waiting', value: totalWaiting, color: '#f59e0b' },
            { label: 'Active', value: totalActive, color: '#3b82f6' },
            { label: 'Completed', value: totalCompleted, color: '#10b981' },
            { label: 'Failed', value: totalFailed, color: '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} className="metric-card">
              <p style={{ color: '#7aadff', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
              <p style={{ fontSize: 36, fontWeight: 800, color, marginTop: 4 }}>{value}</p>
              <p style={{ color: '#4a6a9e', fontSize: 12, marginTop: 2 }}>jobs</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 16, marginBottom: 16, color: '#dbe7ff' }}>Intelligence Tools</h2>
        <div className="tools-grid">
          {TOOLS.map(tool => (
            <Link key={tool.href} href={tool.href} className="tool-card">
              <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{tool.icon}</span>
              <strong style={{ display: 'block', marginBottom: 4, color: '#e8f4ff' }}>{tool.label}</strong>
              <span style={{ fontSize: 12, color: '#7aadff' }}>{tool.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: radial-gradient(circle at 20% 20%, #122548 0%, #07090f 40%, #030305 100%);
          color: #f2f4ff;
          padding: 28px;
          font-family: Inter, system-ui, sans-serif;
          position: relative;
          overflow: hidden;
        }
        .ambient { position: absolute; border-radius: 50%; filter: blur(60px); z-index: 0; }
        .ambient-1 { width: 320px; height: 320px; background: rgba(21,146,255,0.18); top: -80px; right: -60px; }
        .ambient-2 { width: 200px; height: 200px; background: rgba(0,255,214,0.12); bottom: -60px; left: -50px; }
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; gap: 12px; flex-wrap: wrap; position: relative; z-index: 1; }
        .brand { font-weight: 800; letter-spacing: 0.18em; color: #f2f4ff; text-decoration: none; }
        .nav { display: flex; gap: 8px; flex-wrap: wrap; }
        .nav-link { color: #dbe7ff; border: 1px solid rgba(122,173,255,0.3); padding: 7px 12px; border-radius: 999px; font-size: 12px; text-decoration: none; transition: border-color 200ms; }
        .nav-link:hover { border-color: rgba(122,173,255,0.7); }
        .section { margin-bottom: 32px; }
        .alert-error { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; padding: 12px 16px; border-radius: 12px; margin-bottom: 24px; font-size: 13px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 12px; margin-bottom: 36px; }
        .metric-card { background: rgba(16,22,37,0.8); border: 1px solid rgba(110,169,255,0.2); border-radius: 16px; padding: 20px; }
        .tools-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 12px; }
        .tool-card { background: rgba(16,22,37,0.8); border: 1px solid rgba(110,169,255,0.2); border-radius: 16px; padding: 20px; text-decoration: none; display: block; transition: transform 200ms, border-color 200ms; }
        .tool-card:hover { transform: translateY(-4px); border-color: rgba(94,211,255,0.7); }
      `}</style>
    </main>
  );
}
