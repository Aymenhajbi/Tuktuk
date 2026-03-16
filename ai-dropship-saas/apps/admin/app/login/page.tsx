'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin, adminMe, setAdminTokens, getAdminToken } from '../../lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      adminMe(token).then(() => router.replace('/')).catch(() => {});
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tokens = await adminLogin(email, password);
      const user = await adminMe(tokens.access_token);
      if (user.role !== 'ADMIN') throw new Error('Admin access required');
      setAdminTokens(tokens.access_token, tokens.refresh_token);
      router.replace('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-orange-500">TUKTUK</h1>
          <p className="text-gray-500 text-sm mt-1">Admin Dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-medium">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@tuktuk.com"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 mt-2">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Default: admin@tuktuk.com / admin123
        </p>
      </div>
    </div>
  );
}
