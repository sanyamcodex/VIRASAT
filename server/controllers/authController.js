import User from '../models/User.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/token.js';

const REFRESH_COOKIE = 'refreshToken';

// httpOnly refresh cookie, scoped to the auth path (CLAUDE.md Auth section).
// In production the client (Vercel) and API (Render) are on different domains,
// so the cookie must be SameSite=None; Secure to be sent cross-site. In dev
// (same-origin via the Vite proxy) SameSite=Strict is fine.
const isProd = process.env.NODE_ENV === 'production';
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'strict',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const issueTokens = (res, user) => {
  const payload = { sub: user._id.toString(), role: user.role };
  res.cookie(REFRESH_COOKIE, signRefreshToken(payload), refreshCookieOptions);
  return signAccessToken(payload);
};

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
});

// --- Register (User creates a plain account; Artisan also gets a pending profile) ---
const makeRegister = (role) =>
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role });
    if (role === 'artisan') {
      // verified defaults false → held pending until an admin approves.
      await ArtisanProfile.create({
        user: user._id,
        craft: req.body.craft,
        region: req.body.region,
        phone: req.body.phone,
      });
    }
    const accessToken = issueTokens(res, user);
    res.status(201).json({ accessToken, user: publicUser(user) });
  });

export const registerUser = makeRegister('user');
export const registerArtisan = makeRegister('artisan');

// --- Login (scoped by role so a user token can't be minted on the artisan route) ---
const makeLogin = (role) =>
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role }).select('+password');
    if (!user || !user.password || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    if (user.disabled)
      return res.status(403).json({ message: 'Account is disabled' });

    const accessToken = issueTokens(res, user);
    res.json({ accessToken, user: publicUser(user) });
  });

export const loginUser = makeLogin('user');
export const loginArtisan = makeLogin('artisan');
export const loginAdmin = makeLogin('admin');

// --- Refresh (rotate refresh cookie, issue new access token) ---
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  try {
    const decoded = verifyRefreshToken(token);
    const payload = { sub: decoded.sub, role: decoded.role };
    res.cookie(REFRESH_COOKIE, signRefreshToken(payload), refreshCookieOptions);
    res.json({ accessToken: signAccessToken(payload) });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// --- Logout (clear the refresh cookie) ---
export const logout = (req, res) => {
  res.clearCookie(REFRESH_COOKIE, {
    path: refreshCookieOptions.path,
    sameSite: refreshCookieOptions.sameSite,
    secure: refreshCookieOptions.secure,
  });
  res.json({ message: 'Logged out' });
};

// --- Google OAuth callback (User login only) — hands the access token to the client ---
export const googleCallback = (req, res) => {
  const accessToken = issueTokens(res, req.user);
  const base = process.env.CLIENT_ORIGIN || '';
  res.redirect(`${base}/oauth/callback#accessToken=${accessToken}`);
};
