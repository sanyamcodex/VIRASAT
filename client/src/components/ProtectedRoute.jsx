import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Role guard for a route subtree. Rendering is no longer globally blocked on
// the silent refresh (see AuthBootstrap), so the session may still be resolving
// when a protected route mounts. While it is, wait instead of bouncing a
// returning user to /login — bootstrapAuth's timeout guarantees this settles
// (authed/guest) within a few seconds.
export default function ProtectedRoute({ roles }) {
  const { accessToken, role, status } = useAuthStore();

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center bg-cream font-display text-2xl text-navy">
        VIRASAT…
      </div>
    );
  }

  if (!accessToken) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
