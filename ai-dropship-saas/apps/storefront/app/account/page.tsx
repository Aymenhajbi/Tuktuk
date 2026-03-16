'use client';
import Link from 'next/link';
import { Package, Heart, MapPin, Settings, ChevronRight } from 'lucide-react';
import RequireAuth from '../../components/RequireAuth';
import { useAuth } from '../../lib/auth';
import { useRouter } from 'next/navigation';

function AccountContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const menu = [
    { icon: <Package size={20} />, label: 'My Orders', desc: 'Track and manage your orders', href: '/orders' },
    { icon: <Heart size={20} />, label: 'Wishlist', desc: 'Your saved products', href: '/products' },
    { icon: <MapPin size={20} />, label: 'Addresses', desc: 'Manage delivery addresses', href: '/checkout' },
    { icon: <Settings size={20} />, label: 'Settings', desc: 'Account preferences', href: '#' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-black">{initials}</div>
          <div>
            <h1 className="text-xl font-bold">{user?.name}</h1>
            <p className="text-orange-100 text-sm">{user?.email}</p>
            {user?.role === 'ADMIN' && (
              <span className="mt-1 inline-block bg-white bg-opacity-20 text-white text-xs font-bold px-2 py-0.5 rounded-full">ADMIN</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        {menu.map(item => (
          <Link key={item.label} href={item.href} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
            <span className="text-orange-500 bg-orange-50 p-2 rounded-lg">{item.icon}</span>
            <div className="flex-1">
              <p className="font-medium text-gray-800 text-sm">{item.label}</p>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </Link>
        ))}
      </div>

      <button onClick={handleLogout}
        className="mt-6 w-full border border-red-200 text-red-500 font-medium py-3 rounded-xl hover:bg-red-50 transition-colors text-sm">
        Sign Out
      </button>
    </div>
  );
}

export default function AccountPage() {
  return <RequireAuth><AccountContent /></RequireAuth>;
}
