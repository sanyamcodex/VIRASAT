import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { bootstrapAuth } from '../lib/auth';

// Runs a one-time silent refresh on load and blocks rendering until the
// session status is known, so guards don't flash the login page.
export default function AuthBootstrap({ children }) {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    bootstrapAuth();
  }, []);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center bg-cream font-display text-2xl text-navy">
        VIRASAT…
      </div>
    );
  }
  return children;
}
