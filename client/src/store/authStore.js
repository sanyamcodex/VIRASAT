import { create } from 'zustand';

// Decodes the JWT payload (contains sub + role) without verifying — for UI/role
// gating only. The server always re-checks on every protected route.
const decode = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
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
