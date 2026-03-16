'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { adminMe, getAdminToken, clearAdminTokens } from '../lib/auth';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const path = usePathname();

  const isLoginPage = path === '/login';

  useEffect(() => {
    if (isLoginPage) { setChecking(false); return; }

    const token = getAdminToken();
    if (!token) { router.replace('/login'); setChecking(false); return; }

    adminMe(token)
      .then(() => setAuthed(true))
      .catch(() => { clearAdminTokens(); router.replace('/login'); })
      .finally(() => setChecking(false));
  }, [isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;
  if (checking) return (
    <div className="flex items-center justify-center min-h-screen w-full text-slate-400">
      Checking credentials…
    </div>
  );
  if (!authed) return null;

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </>
  );
}
