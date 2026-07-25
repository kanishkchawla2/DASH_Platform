'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') redirect('/login');
    if (status === 'authenticated' && session?.user?.role !== 'admin') redirect('/dashboard');
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/admin/requests').then(r => r.json()),
        fetch('/api/admin/stats').then(r => r.json()),
      ]).then(([reqData, statsData]) => {
        setRequests(reqData.requests || []);
        setStats(statsData);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status, session]);

  if (status === 'loading' || loading) {
    return <div className="flex h-64 items-center justify-center text-slate-500">Loading...</div>;
  }

  async function updateStatus(id, status) {
    await fetch('/api/admin/requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
      <p className="mt-1 text-sm text-slate-400">Manage report requests and monitor system.</p>

      {stats && (
        <div className="mt-6 grid grid-cols-5 gap-3">
          {[
            { label: 'Users', value: stats.users, color: 'text-cyan-400' },
            { label: 'Queued', value: stats.queued, color: 'text-yellow-400' },
            { label: 'Processing', value: stats.processing, color: 'text-blue-400' },
            { label: 'Completed', value: stats.completed, color: 'text-green-400' },
            { label: 'Failed', value: stats.failed, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-center">
              <div className="text-xs text-slate-500">{s.label}</div>
              <div className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 space-y-3">
        {requests.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
            No requests yet.
          </div>
        )}
        {requests.map((req) => (
          <div key={req.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-white">{req.symbol}</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                  req.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                  req.status === 'processing' ? 'bg-blue-500/10 text-blue-400' :
                  req.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>{req.status}</span>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {req.user_name || req.email} &middot; {req.created_at}
              </div>
              {req.error && <div className="mt-1 text-xs text-red-400">{req.error}</div>}
            </div>
            <div className="flex items-center gap-2">
              {req.status === 'queued' && (
                <button onClick={() => updateStatus(req.id, 'processing')} className="rounded bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/30">
                  Start
                </button>
              )}
              {req.status !== 'completed' && req.status !== 'failed' && (
                <button onClick={() => updateStatus(req.id, 'failed')} className="rounded bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-500/30">
                  Fail
                </button>
              )}
              {req.status === 'queued' && (
                <button onClick={() => updateStatus(req.id, 'completed')} className="rounded bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400 transition hover:bg-green-500/30">
                  Complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
