import { useEffect } from 'react';
import { bootstrapAuth } from '../lib/auth';

// Kicks off a one-time silent refresh on load. Rendering is NOT blocked on it:
// the app shows immediately (logged-out) and auth state updates in the
// background if/when the refresh resolves. Route guards handle the brief
// "session unknown" window so protected pages don't bounce a returning user
// to /login (see ProtectedRoute). A hung refresh can no longer freeze the app.
export default function AuthBootstrap({ children }) {
  useEffect(() => {
    bootstrapAuth();
  }, []);

  return children;
}
