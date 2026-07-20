import { create } from 'zustand';

// Decodes the JWT payload (contains sub + role) without verifying — for UI/role
// gating only. The server always re-checks on every protected route.
// JWT payloads are base64URL, which the browser's strict atob() rejects when the
// segment contains `-`/`_` — so convert to standard base64 (+ padding) first.
// Without this, role silently becomes null on refresh for such tokens.
const decode = (token) => {
  try {
    const seg = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = seg.padEnd(seg.length + ((4 - (seg.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  role: null,
  status: 'idle', // idle | loading | authed | guest

  setAuth: ({ accessToken, user }) =>
    set({
      accessToken,
      user,
      role: user?.role || decode(accessToken)?.role || null,
      status: 'authed',
    }),

  setAccessToken: (accessToken) =>
    set({ accessToken, role: decode(accessToken)?.role || null, status: 'authed' }),

  setStatus: (status) => set({ status }),

  logout: () => set({ accessToken: null, user: null, role: null, status: 'guest' }),
}));
