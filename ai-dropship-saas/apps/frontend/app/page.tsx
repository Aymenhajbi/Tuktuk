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

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: radial-gradient(circle at 20% 20%, #122548 0%, #07090f 40%, #030305 100%);
          color: #f2f4ff;
          padding: 28px;
          font-family: Inter, system-ui, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .ambient {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          z-index: 0;
        }

        .ambient-1 {
          width: 320px;
          height: 320px;
          background: rgba(21, 146, 255, 0.25);
          top: -70px;
          right: -80px;
        }

        .ambient-2 {
          width: 240px;
          height: 240px;
          background: rgba(0, 255, 214, 0.16);
          bottom: -80px;
          left: -70px;
        }

        .header,
        .hero,
        .section {
          position: relative;
          z-index: 1;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .brand {
          letter-spacing: 0.18em;
          font-weight: 800;
        }

        .nav {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .nav-link {
          text-decoration: none;
          color: #dbe7ff;
          border: 1px solid rgba(122, 173, 255, 0.3);
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
        }

        .hero {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
          align-items: center;
          margin-bottom: 36px;
        }

        .eyebrow {
          color: #9ec4ff;
          font-size: 12px;
          letter-spacing: 0.1em;
        }

        h1 {
          font-size: clamp(30px, 6vw, 58px);
          line-height: 1.05;
          margin: 8px 0;
        }

        .subtitle {
          color: #c5d6ff;
          max-width: 580px;
        }

        .cta-row {
          display: flex;
          gap: 10px;
          margin-top: 16px;
          flex-wrap: wrap;
        }

        .primary,
        .ghost {
          border-radius: 12px;
          padding: 10px 14px;
          cursor: pointer;
          border: 0;
          font-weight: 600;
        }

        .primary {
          background: linear-gradient(120deg, #1d77ff, #00e5ff);
          color: #04111d;
        }

        .ghost {
          background: rgba(255, 255, 255, 0.06);
          color: #eef4ff;
          border: 1px solid rgba(130, 178, 255, 0.35);
        }

        .mockup-zone {
          position: relative;
          height: 300px;
        }

        .mockup-card {
          position: absolute;
          width: 170px;
          height: 210px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          font-weight: 700;
          color: #e8f8ff;
          background: linear-gradient(180deg, rgba(28, 88, 188, 0.55), rgba(0, 0, 0, 0.5));
          border: 1px solid rgba(130, 190, 255, 0.35);
          box-shadow: 0 25px 40px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
        }

        .one {
          left: 0;
          top: 40px;
          transform: rotate(-9deg);
        }

        .two {
          left: 90px;
          top: 0;
          transform: rotate(4deg);
          z-index: 2;
        }

        .three {
          right: 10px;
          top: 62px;
          transform: rotate(10deg);
        }

        .section {
          margin-bottom: 32px;
        }

        h2 {
          margin-bottom: 12px;
        }

        .grid {
          display: grid;
          gap: 12px;
        }

        .products {
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        }

        .card {
          background: rgba(16, 22, 37, 0.8);
          border: 1px solid rgba(110, 169, 255, 0.25);
          border-radius: 16px;
          padding: 14px;
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
        }

        .card:hover {
          transform: translateY(-6px);
          border-color: rgba(94, 211, 255, 0.8);
          box-shadow: 0 20px 30px rgba(5, 13, 26, 0.65);
        }

        .badge {
          font-size: 11px;
          color: #1bf5ff;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .image-placeholder {
          height: 150px;
          margin: 10px 0;
          border-radius: 12px;
          background: linear-gradient(140deg, #0d1425, #16284a 45%, #0f1a30 100%);
          box-shadow: inset 0 0 0 1px rgba(148, 190, 255, 0.2);
        }

        .split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .inclusive {
          text-align: center;
          background: linear-gradient(120deg, rgba(20, 36, 71, 0.7), rgba(0, 42, 63, 0.45));
          border: 1px solid rgba(111, 180, 255, 0.3);
          padding: 22px;
          border-radius: 18px;
        }

        @media (max-width: 980px) {
          .hero,
          .split {
            grid-template-columns: 1fr;
          }

          .mockup-zone {
            height: 230px;
          }

          .mockup-card {
            width: 140px;
            height: 170px;
          }
        }
      `}</style>
    </main>
  );
}
