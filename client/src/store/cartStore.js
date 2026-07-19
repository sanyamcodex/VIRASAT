import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { useAuthStore } from './authStore';

// A logged-in buyer uses the server cart; guests keep a local (persisted) cart
// that is merged into the account cart on login (CLAUDE.md).
const isUser = () => {
  const s = useAuthStore.getState();
  return Boolean(s.accessToken) && s.role === 'user';
};

const normalize = (serverCart) =>
  (serverCart?.items || []).map((i) => ({ product: i.product, quantity: i.quantity }));

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // [{ product, quantity }]

      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0),

      hydrate: async () => {
        if (!isUser()) return;
        try {
          const { data } = await api.get('/cart');
          set({ items: normalize(data) });
        } catch {
          /* ignore */
        }
      },

      addItem: async (product, quantity = 1) => {
        if (isUser()) {
          const { data } = await api.post('/cart/items', { product: product._id, quantity });
          set({ items: normalize(data) });
        } else {
          const items = [...get().items];
          const ex = items.find((i) => i.product._id === product._id);
          if (ex) ex.quantity += quantity;
          else items.push({ product, quantity });
          set({ items });
        }
      },

      updateItem: async (productId, quantity) => {
        if (quantity < 1) return get().removeItem(productId);
        if (isUser()) {
          const { data } = await api.patch(`/cart/items/${productId}`, { quantity });
          set({ items: normalize(data) });
        } else {
          set({
            items: get().items.map((i) =>
              i.product._id === productId ? { ...i, quantity } : i
            ),
          });
        }
      },

      removeItem: async (productId) => {
        if (isUser()) {
          const { data } = await api.delete(`/cart/items/${productId}`);
          set({ items: normalize(data) });
        } else {
          set({ items: get().items.filter((i) => i.product._id !== productId) });
        }
      },

      clear: async () => {
        if (isUser()) {
          try {
            await api.delete('/cart');
          } catch {
            /* ignore */
          }
        }
        set({ items: [] });
      },

      // Called right after a successful login.
      mergeOnLogin: async () => {
        const local = get().items;
        if (local.length) {
          try {
            const { data } = await api.post('/cart/merge', {
              items: local.map((i) => ({ product: i.product._id, quantity: i.quantity })),
            });
            set({ items: normalize(data) });
            return;
          } catch {
            /* fall through to hydrate */
          }
        }
        await get().hydrate();
      },
    }),
    { name: 'virasat-cart' }
  )
);
