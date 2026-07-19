import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Role guard for a route subtree. Session status is already resolved by
// AuthBootstrap before any route renders, so we only check token + role here.
export default function ProtectedRoute({ roles }) {
  const { accessToken, role } = useAuthStore();

  if (!accessToken) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
