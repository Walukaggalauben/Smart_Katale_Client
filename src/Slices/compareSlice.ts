import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../types/product.types';

const STORAGE_KEY = 'minify_compare_products';

const loadInitial = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

interface CompareState {
  items: Product[];
}

const initialState: CompareState = { items: loadInitial() };

const persist = (items: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Persistence is optional; comparison still works in memory.
  }
};

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addToCompare: (state, action: PayloadAction<Product>) => {
      if (state.items.some((item) => String(item.id) === String(action.payload.id))) return;
      if (state.items.length >= 3) return;
      state.items.push(action.payload);
      persist(state.items);
    },
    removeFromCompare: (state, action: PayloadAction<string | number>) => {
      state.items = state.items.filter((item) => String(item.id) !== String(action.payload));
      persist(state.items);
    },
    clearCompare: (state) => {
      state.items = [];
      persist(state.items);
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;
