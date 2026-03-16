import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../lib/auth';

export const metadata: Metadata = {
  title: 'TUKTUK — Online Shopping',
  description: 'Shop the best products at unbeatable prices',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <footer className="bg-gray-800 text-gray-300 mt-16 py-10 text-center text-sm">
            <p className="font-black text-white text-xl mb-2">TUKTUK</p>
            <p>© 2026 TUKTUK. All rights reserved.</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
