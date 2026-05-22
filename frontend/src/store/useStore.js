import { create } from 'zustand';

export const useStore = create((set, get) => ({
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
}));

export default useStore;