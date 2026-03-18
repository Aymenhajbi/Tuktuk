'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth';

function AuthContent() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login, register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  // Redirect if already logged in
  useEffect(() => {
    if (user) router.replace(params.get('redirect') ?? '/');
  }, [user, router, params]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      router.replace(params.get('redirect') ?? '/');
    } catch (err) {
      setError((err as Error).message.replace(/^\d+: /, ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h1 className="text-2xl font-black text-gray-800 mb-1">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-orange-500 font-medium hover:underline">
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs text-gray-500 font-medium">Full Name</label>
              <input required type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="John Doe"
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
            </div>
          )}
          <div>
            <label className="text-xs text-gray-500 font-medium">Email</label>
            <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="you@example.com"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Password</label>
            <input required type="password" value={form.password} onChange={e => set('password', e.target.value)}
              placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 mt-2">
            {loading ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <AuthContent />
    </Suspense>
  );
}
