'use client';

import { useEffect, useState } from 'react';
import { api, QueueStatusResult } from '../../lib/api';
import { Activity, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

const SECTIONS = [
  { href: '/winning-products', label: 'Winning Products', desc: 'Score products across 7 AI signals and trigger re-scoring.' },
  { href: '/competitor-radar', label: 'Competitor Radar', desc: 'Scan any Shopify store and extract pricing & product data.' },
  { href: '/tiktok-analyzer', label: 'TikTok Analyzer', desc: 'Score viral potential from TikTok engagement metrics.' },
  { href: '/ai-campaign-studio', label: 'AI Campaign Studio', desc: 'Generate ad copy and marketing assets using GPT-4.' },
  { href: '/pricing-optimizer', label: 'Pricing Optimizer', desc: 'Calculate optimal price from cost, market average, and margin target.' },
  { href: '/queue-monitor', label: 'Queue Monitor', desc: 'Live BullMQ job counts across all queues and DLQs.' },
];

export default function DashboardPage() {
  const [status, setStatus] = useState<QueueStatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getQueueStatus()
      .then(setStatus)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalWaiting = status?.queues.reduce((s, q) => s + (q.waiting ?? 0), 0) ?? 0;
  const totalActive = status?.queues.reduce((s, q) => s + (q.active ?? 0), 0) ?? 0;
  const totalFailed = status?.queues.reduce((s, q) => s + (q.failed ?? 0), 0) ?? 0;
  const totalCompleted = status?.queues.reduce((s, q) => s + (q.completed ?? 0), 0) ?? 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Live overview of your AI dropshipping intelligence platform.</p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-500 mb-6">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Loading queue status…</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
          <AlertCircle size={16} />
          <span>Backend unreachable: {error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Waiting" value={totalWaiting} sub="jobs pending" color="text-amber-600" />
          <StatCard label="Active" value={totalActive} sub="processing now" color="text-blue-600" />
          <StatCard label="Completed" value={totalCompleted} sub="all time" color="text-emerald-600" />
          <StatCard label="Failed" value={totalFailed} sub="check DLQs" color="text-red-600" />
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTIONS.map(({ href, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-400 hover:shadow-sm transition-all group"
            >
              <p className="font-semibold text-slate-800 group-hover:text-indigo-600 text-sm">{label}</p>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {status && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Queue Breakdown</h2>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3 text-slate-600 font-medium">Queue</th>
                  <th className="text-right px-4 py-3 text-slate-600 font-medium">Waiting</th>
                  <th className="text-right px-4 py-3 text-slate-600 font-medium">Active</th>
                  <th className="text-right px-4 py-3 text-slate-600 font-medium">Completed</th>
                  <th className="text-right px-5 py-3 text-slate-600 font-medium">Failed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {status.queues.map((q) => (
                  <tr key={q.name} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono text-xs text-slate-700">{q.name}</td>
                    <td className="text-right px-4 py-3 text-amber-600 font-medium">{q.waiting ?? 0}</td>
                    <td className="text-right px-4 py-3 text-blue-600 font-medium">{q.active ?? 0}</td>
                    <td className="text-right px-4 py-3 text-emerald-600 font-medium">{q.completed ?? 0}</td>
                    <td className="text-right px-5 py-3 text-red-600 font-medium">{q.failed ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-2">Last updated: {new Date(status.timestamp).toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
}
