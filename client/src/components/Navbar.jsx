import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { doLogout } from '../lib/auth';
import Button from './ui/Button';

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Art Forms', to: '/art-forms' },
  { label: 'Paintings', to: '/shop?category=paintings' },
  { label: 'Textiles & Handloom', to: '/shop?category=textiles' },
  { label: 'Shop', to: '/shop' },
];

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive ? 'text-terracotta' : 'text-navy/70 hover:text-navy'
  }`;

export default function Navbar() {
  const navigate = useNavigate();
  const { accessToken, role } = useAuthStore();
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  const dashboardPath = role === 'artisan' ? '/artisan' : role === 'admin' ? '/admin' : null;

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-2xl font-bold tracking-wide text-navy">
          VIRASAT
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <NavLink key={n.label} to={n.to} className={linkClass} end={n.to === '/'}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {accessToken && role === 'user' && (
            <Link to="/orders" className="text-sm text-navy/70 hover:text-navy">
              My Orders
            </Link>
          )}
          <Link to="/wishlist" className="text-sm text-navy/70 hover:text-navy">
            Wishlist
          </Link>
          <Link to="/cart" className="text-sm text-navy/70 hover:text-navy">
            Cart{cartCount > 0 && <span className="ml-1 rounded-full bg-terracotta px-1.5 text-xs text-cream">{cartCount}</span>}
          </Link>
          {accessToken ? (
            <>
              {dashboardPath && (
                <Button as={Link} to={dashboardPath} variant="outline" size="sm">
                  Dashboard
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await doLogout();
                  navigate('/');
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <Button as={Link} to="/login" variant="primary" size="sm">
              Log in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
