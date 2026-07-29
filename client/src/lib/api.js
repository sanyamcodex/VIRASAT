import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// baseURL falls back to /api (proxied to the server in dev — see vite.config.js).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // send the refresh cookie
  // Cap how long we hang on a stalled connection (e.g. Render free-tier cold
  // start) so it surfaces as a timeout the caller can retry, instead of hanging
  // indefinitely. 12s keeps the worst-case 3-attempt wait (~38s) reasonable
  // while still giving a warming server time to respond.
  timeout: 12000,
});

// Attach the current access token to every request.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, try a single refresh (shared across concurrent failures) and retry.
let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const is401 = error.response?.status === 401;
    const isRefresh = original?.url?.includes('/auth/refresh');
    if (is401 && !original._retry && !isRefresh) {
      original._retry = true;
      try {
        refreshing = refreshing || api.post('/auth/refresh');
        const { data } = await refreshing;
        refreshing = null;
        useAuthStore.getState().setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        refreshing = null;
        useAuthStore.getState().logout();
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
