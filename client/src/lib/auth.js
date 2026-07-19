import api from './api';
import { useAuthStore } from '../store/authStore';

// Silent session restore on app load using the httpOnly refresh cookie.
export const bootstrapAuth = async () => {
  const store = useAuthStore.getState();
  store.setStatus('loading');
  try {
    const { data } = await api.post('/auth/refresh');
    store.setAccessToken(data.accessToken);
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
