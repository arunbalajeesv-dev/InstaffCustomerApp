import { create } from 'zustand';
import type { CartItem } from '../types';

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => string;
  updateItem: (id: string, item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
};

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: item => {
    const id = generateId();
    set({ items: [...get().items, { ...item, id }] });
    return id;
  },
  updateItem: (id, item) =>
    set({ items: get().items.map(existing => (existing.id === id ? { ...item, id } : existing)) }),
  removeItem: id => set({ items: get().items.filter(existing => existing.id !== id) }),
}));
