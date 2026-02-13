import Link from 'next/link';

const routes = [
  '/dashboard',
  '/winning-lab',
  '/competitor-radar',
  '/trend-monitor',
  '/profit-simulator',
  '/ai-campaign-studio',
  '/settings',
  '/billing',
  '/auth',
];

export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: 'Inter, sans-serif' }}>
      <h1>AI Dropship SaaS</h1>
      <p>Navigation vers les modules de la plateforme.</p>
      <ul>
        {routes.map((route) => (
          <li key={route}><Link href={route}>{route}</Link></li>
        ))}
      </ul>
    </main>
  );
}
