import { create } from "zustand";
import type { CartItem, MenuItem } from "./types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  addItem: (menuItem: MenuItem, sideDishes?: import("./types").CartSideDish[], note?: string, quantity?: number) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
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

  addItem: (menuItem, sideDishes, note, quantity = 1) =>
    set((state) => {
      const existing = state.items.find(
        (i) =>
          i.menuItem.id === menuItem.id &&
          JSON.stringify(i.sideDishes || []) === JSON.stringify(sideDishes || []) &&
          i.note === note
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.cartItemId === existing.cartItemId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          ),
        };
      }
      const newCartItemId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
      return { 
        items: [...state.items, { cartItemId: newCartItemId, menuItem, quantity, sideDishes, note }] 
      };
    }),

  removeItem: (cartItemId) =>
    set((state) => ({
      items: state.items.filter((i) => i.cartItemId !== cartItemId),
    })),

  updateQuantity: (cartItemId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((i) => i.cartItemId !== cartItemId),
        };
      }
      return {
        items: state.items.map((i) =>
          i.cartItemId === cartItemId ? { ...i, quantity } : i
        ),
      };
    }),

  clearCart: () => set({ items: [] }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () =>
    get().items.reduce((sum, i) => {
      const sidesTotal = i.sideDishes?.reduce((sideSum, s) => sideSum + s.menuItem.price * s.quantity, 0) || 0;
      return sum + (i.menuItem.price + sidesTotal) * i.quantity;
    }, 0),
}));
