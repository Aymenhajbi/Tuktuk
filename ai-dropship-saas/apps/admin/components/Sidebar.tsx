'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Trophy,
  Radar,
  TrendingUp,
  Megaphone,
  DollarSign,
  Activity,
  Package,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/products', label: 'Products', Icon: Package },
  { href: '/winning-products', label: 'Winning Products', Icon: Trophy },
  { href: '/competitor-radar', label: 'Competitor Radar', Icon: Radar },
  { href: '/tiktok-analyzer', label: 'TikTok Analyzer', Icon: TrendingUp },
  { href: '/ai-campaign-studio', label: 'AI Campaign Studio', Icon: Megaphone },
  { href: '/pricing-optimizer', label: 'Pricing Optimizer', Icon: DollarSign },
  { href: '/queue-monitor', label: 'Queue Monitor', Icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-slate-900 flex flex-col min-h-screen shrink-0">
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">T</div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">Tuktuk Admin</p>
            <p className="text-slate-400 text-xs mt-0.5">Dropship Intelligence</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          localhost:3001
        </div>
      </div>
    </aside>
  );
}
