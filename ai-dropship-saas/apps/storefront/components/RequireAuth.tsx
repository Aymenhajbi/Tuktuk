'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/auth?redirect=${encodeURIComponent(path)}`);
    }
  }, [user, loading, router, path]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-gray-400">Loading…</div>;
  if (!user) return null;
  return <>{children}</>;
}
