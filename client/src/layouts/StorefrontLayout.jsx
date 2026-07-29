import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Public storefront shell (User).
export default function StorefrontLayout() {
  // Re-key <main> per route so the mount fade re-runs on each navigation.
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col bg-cream text-navy">
      <Navbar />
      <main key={pathname} className="flex-1 animate-page">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
