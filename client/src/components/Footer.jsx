import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const COLUMNS = [
  { title: 'Shop', links: ['Art Forms', 'Paintings', 'Textiles & Handloom', 'All Products'] },
  { title: 'Artisans', links: ['Their Stories', 'Become a Seller', 'Verification'] },
  { title: 'Support', links: ['Help Center', 'Shipping', 'Returns', 'Contact'] },
];

const TRUST = ['Verified Artisans', 'Secure Payments', 'Authentic Handmade', 'Fair Prices'];

export default function Footer() {
  const loggedIn = useAuthStore((s) => Boolean(s.accessToken));
  return (
    <footer className="mt-16 bg-navy text-cream">
      {/* Trust strip */}
      <div className="border-b border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-10 gap-y-2 px-6 py-4 text-sm text-cream/80">
          {TRUST.map((t) => (
            <span key={t}>✦ {t}</span>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl font-bold">VIRASAT</div>
          <p className="mt-3 text-sm text-cream/70">
            Connecting India&apos;s artisans directly with buyers — heritage craft,
            fair prices, verified authenticity.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="font-display text-lg">{col.title}</h4>
            <ul className="mt-3 space-y-2 text-sm text-cream/70">
              {col.links.map((l) => (
                <li key={l} className="hover:text-cream">
                  {l}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-cream/10 py-4 text-center text-xs text-cream/60">
        {/* Portal logins — only for fully logged-out visitors. */}
        {!loggedIn && (
          <div className="mb-2 flex justify-center gap-4 text-cream/40">
            <Link to="/artisan/login" className="hover:text-cream/70">
              Artisan login
            </Link>
            <span>·</span>
            <Link to="/admin/login" className="hover:text-cream/70">
              Admin login
            </Link>
          </div>
        )}
        © {new Date().getFullYear()} VIRASAT. All rights reserved.
      </div>
    </footer>
  );
}
