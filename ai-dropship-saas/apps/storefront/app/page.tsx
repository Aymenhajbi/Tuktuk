import Link from 'next/link';
import Image from 'next/image';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';

async function getData() {
  try {
    const [featured, trending, categories] = await Promise.all([
      api.getFeatured().catch(() => []),
      api.getTrending().catch(() => []),
      api.getCategories().catch(() => []),
    ]);
    return { featured, trending, categories };
  } catch {
    return { featured: [], trending: [], categories: [] };
  }
}

export default async function HomePage() {
  const { featured, trending, categories } = await getData();

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <p className="text-orange-100 text-sm font-medium mb-2">🔥 Hot Deals — Limited Time</p>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Shop Smart,<br/>Save More</h1>
            <p className="text-orange-100 text-lg mb-6">Discover thousands of products at unbeatable prices. Free delivery on orders over $50.</p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/products" className="bg-white text-orange-600 font-bold px-6 py-3 rounded-full hover:bg-orange-50 transition-colors">
                Shop Now
              </Link>
              <Link href="/products?featured=true" className="border border-white text-white font-bold px-6 py-3 rounded-full hover:bg-orange-600 transition-colors">
                View Deals
              </Link>
            </div>
          </div>
          <div className="flex gap-4 shrink-0">
            {[
              { icon: '🚚', title: 'Free Delivery', sub: 'Orders over $50' },
              { icon: '↩️', title: 'Easy Returns', sub: '30-day policy' },
              { icon: '🔒', title: 'Secure Pay', sub: '100% protected' },
            ].map(b => (
              <div key={b.title} className="bg-orange-600 rounded-xl p-4 text-center hidden md:block">
                <div className="text-2xl mb-1">{b.icon}</div>
                <p className="font-bold text-sm">{b.title}</p>
                <p className="text-orange-200 text-xs">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {categories.map(cat => (
                <Link key={cat.id} href={`/products?categoryId=${cat.id}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-4 text-center transition-all hover:-translate-y-1">
                  <div className="relative h-16 mb-3 rounded-lg overflow-hidden bg-gray-50">
                    {cat.image && <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="150px" />}
                  </div>
                  <p className="font-semibold text-gray-700 text-sm group-hover:text-orange-500">{cat.name}</p>
                  {cat._count && <p className="text-xs text-gray-400">{cat._count.products} products</p>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featured.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">⭐ Featured Products</h2>
              <Link href="/products?featured=true" className="text-orange-500 hover:text-orange-600 font-medium text-sm">View all →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Promo Banner */}
        <section className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-purple-200 text-sm mb-1">Limited Time Offer</p>
            <h3 className="text-2xl font-bold mb-2">Up to 50% OFF on Electronics</h3>
            <p className="text-purple-200">Wireless earbuds, smartwatches, speakers & more</p>
          </div>
          <Link href="/products?categoryId=electronics" className="bg-white text-purple-600 font-bold px-6 py-3 rounded-full whitespace-nowrap hover:bg-purple-50 transition-colors">
            Shop Electronics
          </Link>
        </section>

        {/* Trending Products */}
        {trending.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">📈 Trending Now</h2>
              <Link href="/products?minRating=4" className="text-orange-500 hover:text-orange-600 font-medium text-sm">View all →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {trending.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {featured.length === 0 && trending.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🛍️</p>
            <h3 className="text-xl font-bold mb-2">No products yet</h3>
            <p>Add products via the admin panel at localhost:3002</p>
          </div>
        )}
      </div>
    </div>
  );
}
