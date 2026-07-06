import { create } from "zustand";
import type { CartItem, MenuItem } from "./types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  addItem: (menuItem: MenuItem) => void;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (menuItem) =>
    set((state) => {
      const existing = state.items.find((i) => i.menuItem.id === menuItem.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.menuItem.id === menuItem.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { menuItem, quantity: 1 }] };
    }),

  removeItem: (menuItemId) =>
    set((state) => ({
      items: state.items.filter((i) => i.menuItem.id !== menuItemId),
    })),

  updateQuantity: (menuItemId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((i) => i.menuItem.id !== menuItemId),
        };
      }
      return {
        items: state.items.map((i) =>
          i.menuItem.id === menuItemId ? { ...i, quantity } : i
        ),
      };
    }),

  clearCart: () => set({ items: [] }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0),
}));
