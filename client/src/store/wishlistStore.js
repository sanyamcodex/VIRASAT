import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Client-side wishlist (persisted). Stores product summaries for display.
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      has: (id) => get().items.some((i) => i._id === id),
      toggle: (product) =>
        set((s) =>
          s.items.some((i) => i._id === product._id)
            ? { items: s.items.filter((i) => i._id !== product._id) }
            : { items: [...s.items, product] }
        ),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i._id !== id) })),
    }),
    { name: 'virasat-wishlist' }
  )
);
