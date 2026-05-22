import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      cartCount: 0,
      setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
      clearUser: () => set({ user: null, isAuthenticated: false, cartCount: 0 }),
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false, cartCount: 0 }),
      setCartCount: (cartCount) => set({ cartCount: Number(cartCount) || 0 }),
      incrementCartCount: (amount = 1) =>
        set({ cartCount: Math.max(0, get().cartCount + Number(amount || 1)) }),
      decrementCartCount: (amount = 1) =>
        set({ cartCount: Math.max(0, get().cartCount - Number(amount || 1)) }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        cartCount: state.cartCount,
      }),
    }
  )
);

export default useStore;