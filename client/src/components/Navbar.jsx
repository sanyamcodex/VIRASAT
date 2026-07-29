import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { doLogout } from '../lib/auth';
import Button from './ui/Button';
import logo from '../assets/logo.png';

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Art Forms', to: '/art-forms' },
  { label: 'Paintings', to: '/shop?category=paintings' },
  { label: 'Textiles & Handloom', to: '/shop?category=textiles' },
  { label: 'Shop', to: '/shop' },
];

const linkClass = ({ isActive }) =>
  `text-base font-medium transition ${
    isActive ? 'text-terracotta' : 'text-navy/70 hover:text-navy'
  }`;

export default function Navbar() {
  const navigate = useNavigate();
  const { accessToken, role } = useAuthStore();
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  // Visual-only, local to the Navbar: firm up the bar once scrolled, and
  // auto-hide on downward scroll / reveal on any upward scroll. Near the top
  // it's always visible. Uses a ref for last position so scroll handling
  // doesn't re-render on every frame — no global state involved.
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y < 80) {
        setHidden(false); // always show near the top of the page
      } else if (y > lastY.current + 4) {
        setHidden(true); // scrolling down — slide up out of view
      } else if (y < lastY.current - 4) {
        setHidden(false); // any upward scroll — slide back in
      }
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The public storefront nav never links to the artisan/admin dashboards —
  // those are reached via their own login URLs (and the footer links).
  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur transition-all duration-300 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      } ${
        scrolled
          ? 'border-b border-navy/10 bg-cream/95 shadow-sm'
          : 'border-b border-transparent bg-cream/60'
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300 ${
          scrolled ? 'py-3' : 'py-4'
        }`}
      >
        <Link to="/" className="flex items-center" aria-label="VIRASAT — home">
          <img
            src={logo}
            alt="VIRASAT"
            className="h-14 w-auto shrink-0 mix-blend-multiply md:h-16"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <NavLink key={n.label} to={n.to} className={linkClass} end={n.to === '/'}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {accessToken && role === 'user' && (
            <Link to="/orders" className="text-sm text-navy/70 hover:text-navy md:text-base">
              My Orders
            </Link>
          )}
          <Link to="/wishlist" className="text-sm text-navy/70 hover:text-navy md:text-base">
            Wishlist
          </Link>
          <Link to="/cart" className="text-sm text-navy/70 hover:text-navy md:text-base">
            Cart{cartCount > 0 && <span className="ml-1 rounded-full bg-terracotta px-1.5 text-xs text-cream">{cartCount}</span>}
          </Link>
          {accessToken ? (
            <Button
              variant="ghost"
              size="md"
              onClick={async () => {
                await doLogout();
                navigate('/');
              }}
            >
              Log out
            </Button>
          ) : (
            <Button as={Link} to="/login" variant="primary" size="md">
              Log in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
