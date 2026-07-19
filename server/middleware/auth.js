import { verifyAccessToken } from '../utils/token.js';

// Verifies the Bearer access token and attaches { sub, role } as req.user.
export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// RBAC — enforced server-side regardless of the client. Usage: requireRole('admin').
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: 'Forbidden' });
    next();
  };
