import type { Metadata } from 'next';
import './globals.css';
import AdminShell from '../components/AdminShell';

export const metadata: Metadata = {
  title: 'Tuktuk Admin',
  description: 'AI Dropship SaaS Admin Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex bg-slate-50 min-h-screen">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
