import Link from 'next/link';

const navRoutes = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/winning-lab', label: 'Winning Lab' },
  { href: '/competitor-radar', label: 'Competitor Radar' },
  { href: '/trend-monitor', label: 'Trend Monitor' },
  { href: '/profit-simulator', label: 'Profit Simulator' },
  { href: '/ai-campaign-studio', label: 'AI Campaign Studio' },
];

const trending = [
  { name: 'Neon Utility Bomber', price: '$129', badge: 'HOT' },
  { name: 'Electric Cargo Set', price: '$149', badge: 'TRENDING' },
  { name: 'Shadow Oversized Hoodie', price: '$99', badge: 'BESTSELLER' },
  { name: 'Arc Runner 3D Sneakers', price: '$169', badge: 'NEW' },
];

const limitedDrops = [
  { name: 'TUKTUK x NightGrid Jacket', stock: '32 left' },
  { name: 'Chrome Pulse Tactical Vest', stock: '11 left' },
  { name: 'Afterglow Reflective Pants', stock: '17 left' },
];

const seasonal = [
  { title: 'Summer Heatwave', subtitle: 'Lightweight street essentials' },
  { title: 'Autumn Flux', subtitle: 'Layered silhouettes + deep tones' },
  { title: 'Winter Neon Core', subtitle: 'Insulated cuts with luminous accents' },
];

export default function HomePage() {
  return (
    <main className="page">
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

      <header className="header">
        <div className="brand">TUKTUK</div>
        <nav className="nav">
          {navRoutes.map((route) => (
            <Link key={route.href} href={route.href} className="nav-link">
              {route.label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">GLOBAL STREETWEAR & LIFESTYLE</p>
          <h1>Own the Streets. Wear the Future.</h1>
          <p className="subtitle">
            Premium urban culture essentials with bold graphics, neon-infused tones,
            and inclusive global energy.
          </p>
          <div className="cta-row">
            <button className="primary">Shop Latest Drops</button>
            <button className="ghost">Explore Collections</button>
          </div>
        </div>

        <div className="mockup-zone">
          <div className="mockup-card one">3D JACKET</div>
          <div className="mockup-card two">3D SNEAKER</div>
          <div className="mockup-card three">3D BAG</div>
        </div>
      </section>

      <section className="section">
        <h2>Trending Streetwear</h2>
        <div className="grid products">
          {trending.map((item) => (
            <article key={item.name} className="card product-card">
              <span className="badge">{item.badge}</span>
              <div className="image-placeholder" />
              <h3>{item.name}</h3>
              <p>{item.price}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split">
        <div>
          <h2>Limited Edition Drops</h2>
          <div className="grid">
            {limitedDrops.map((drop) => (
              <article key={drop.name} className="card limited-card">
                <h3>{drop.name}</h3>
                <p>{drop.stock}</p>
              </article>
            ))}
          </div>
        </div>

        <div>
          <h2>Seasonal Collections</h2>
          <div className="grid">
            {seasonal.map((collection) => (
              <article key={collection.title} className="card seasonal-card">
                <h3>{collection.title}</h3>
                <p>{collection.subtitle}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section inclusive">
        <h2>Built for a Global Community</h2>
        <p>
          Diverse silhouettes, inclusive fits, and expressive aesthetics for every city,
          every identity, every movement.
        </p>
      </section>