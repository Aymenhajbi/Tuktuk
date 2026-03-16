'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(mode === 'login' ? 'Login coming soon!' : 'Registration coming soon!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-orange-500">TUKTUK</Link>
          <p className="text-gray-500 mt-2">{mode === 'login' ? 'Welcome back!' : 'Create an account'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex rounded-xl border border-gray-200 p-1 mb-6">
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${mode === m ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-sm text-gray-600 font-medium">Full Name</label>
                <input required type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe"
                  className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
              </div>
            )}
            <div>
              <label className="text-sm text-gray-600 font-medium">Email</label>
              <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com"
                className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-medium">Password</label>
              <input required type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••"
                className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
            </div>
            <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-orange-500 font-medium hover:underline">
                {mode === 'login' ? 'Register' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          <Link href="/" className="hover:text-gray-600">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
