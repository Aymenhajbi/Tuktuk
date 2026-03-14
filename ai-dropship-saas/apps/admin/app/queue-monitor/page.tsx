'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, QueueStatusResult, QueueCounts } from '../../lib/api';
import { Loader2, AlertCircle, RefreshCw, Activity } from 'lucide-react';

function StatusBadge({ count, type }: { count: number; type: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' }) {
  const styles = {
    waiting: 'bg-amber-50 text-amber-700 border-amber-200',
    active: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    delayed: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[type]}`}>
      {count}
    </span>
  );
}

function QueueRow({ name, counts, isDlq }: { name: string; counts: QueueCounts; isDlq?: boolean }) {
  const isHealthy = (counts.failed ?? 0) === 0 && (counts.active ?? 0) >= 0;
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDlq ? 'bg-slate-300' : isHealthy ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <span className="font-mono text-xs text-slate-700">{name}</span>
          {isDlq && <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">DLQ</span>}
        </div>
      </td>
      <td className="px-4 py-3 text-center"><StatusBadge count={counts.waiting ?? 0} type="waiting" /></td>
      <td className="px-4 py-3 text-center"><StatusBadge count={counts.active ?? 0} type="active" /></td>
      <td className="px-4 py-3 text-center"><StatusBadge count={counts.completed ?? 0} type="completed" /></td>
      <td className="px-4 py-3 text-center"><StatusBadge count={counts.failed ?? 0} type="failed" /></td>
      <td className="px-5 py-3 text-center"><StatusBadge count={counts.delayed ?? 0} type="delayed" /></td>
    </tr>
  );
}

export default function QueueMonitorPage() {
  const [status, setStatus] = useState<QueueStatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getQueueStatus();
      setStatus(data);
      setLastRefresh(new Date());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [autoRefresh, refresh]);

  const allRows = [
    ...(status?.queues ?? []).map((q) => ({ ...q, isDlq: false })),
    ...(status?.dlqs ?? []).map((q) => ({ ...q, isDlq: true })),
  ];

  const totalFailed = allRows.reduce((s, q) => s + (q.failed ?? 0), 0);
  const totalActive = allRows.filter((q) => !q.isDlq).reduce((s, q) => s + (q.active ?? 0), 0);

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Queue Monitor</h1>
          <p className="text-slate-500 text-sm mt-1">Live BullMQ job counts across all queues and dead-letter queues.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-indigo-600"
            />
            Auto-refresh (5s)
          </label>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Cannot reach backend</p>
            <p className="text-xs mt-1 opacity-80">{error}</p>
          </div>
        </div>
      )}

      {loading && !status && (
        <div className="flex items-center gap-2 text-slate-500 mb-6">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Loading queue status…</span>
        </div>
      )}

      {status && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Active Jobs</p>
              <p className={`text-2xl font-bold ${totalActive > 0 ? 'text-blue-600' : 'text-slate-400'}`}>{totalActive}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Failed Jobs</p>
              <p className={`text-2xl font-bold ${totalFailed > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{totalFailed}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Health</p>
              <div className="flex items-center gap-2 mt-1">
                <Activity size={18} className={totalFailed === 0 ? 'text-emerald-500' : 'text-red-500'} />
                <span className={`text-sm font-semibold ${totalFailed === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {totalFailed === 0 ? 'Healthy' : `${totalFailed} failures`}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3 text-slate-600 font-medium">Queue</th>
                  <th className="text-center px-4 py-3 text-amber-600 font-medium">Waiting</th>
                  <th className="text-center px-4 py-3 text-blue-600 font-medium">Active</th>
                  <th className="text-center px-4 py-3 text-emerald-600 font-medium">Completed</th>
                  <th className="text-center px-4 py-3 text-red-600 font-medium">Failed</th>
                  <th className="text-center px-5 py-3 text-purple-600 font-medium">Delayed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allRows.map((q) => (
                  <QueueRow key={q.name} name={q.name} counts={q} isDlq={q.isDlq} />
                ))}
              </tbody>
            </table>
          </div>

          {lastRefresh && (
            <p className="text-xs text-slate-400 mt-2">
              Last updated: {lastRefresh.toLocaleTimeString()}
              {autoRefresh && ' · refreshing every 5s'}
            </p>
          )}
        </>
      )}
    </div>
  );
}
