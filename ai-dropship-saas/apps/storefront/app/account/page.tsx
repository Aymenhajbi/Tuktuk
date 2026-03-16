import Link from 'next/link';
import { Package, Heart, MapPin, Settings, ChevronRight } from 'lucide-react';

export default function AccountPage() {
  const menu = [
    { icon: <Package size={20} />, label: 'My Orders', desc: 'Track and manage your orders', href: '/orders' },
    { icon: <Heart size={20} />, label: 'Wishlist', desc: 'Your saved products', href: '/products' },
    { icon: <MapPin size={20} />, label: 'Addresses', desc: 'Manage delivery addresses', href: '/checkout' },
    { icon: <Settings size={20} />, label: 'Settings', desc: 'Account preferences', href: '#' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-black">G</div>
          <div>
            <h1 className="text-xl font-bold">Guest User</h1>
            <p className="text-orange-100 text-sm">Welcome to TUKTUK</p>
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

      <div className="mt-6 bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-600 mb-3">Sign in for a personalized experience</p>
        <Link href="/auth" className="bg-orange-500 text-white font-bold px-6 py-2 rounded-full hover:bg-orange-600 transition-colors text-sm">
          Sign In / Register
        </Link>
      </div>
    </div>
  );
}
