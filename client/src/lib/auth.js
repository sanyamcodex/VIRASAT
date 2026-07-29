import api from './api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

// Silent session restore on app load using the httpOnly refresh cookie.
export const bootstrapAuth = async () => {
  const store = useAuthStore.getState();
  store.setStatus('loading');
  try {
    // Bounded so a hung refresh (e.g. cold-start / stalled connection) falls
    // back to logged-out within ~9s instead of staying pending indefinitely.
    const { data } = await api.post('/auth/refresh', null, { timeout: 9000 });
    store.setAccessToken(data.accessToken);
    if (useAuthStore.getState().role === 'user') useCartStore.getState().hydrate();
  } catch {
    store.logout(); // → status 'guest'
  }
};

export const doLogout = async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    /* ignore network errors on logout */
  }
  useAuthStore.getState().logout();
};
