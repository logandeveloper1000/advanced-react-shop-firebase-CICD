// src/features/cart/cartSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../types/product";

export type CartItem = {
  id: number;
  title: string;
  price: number;
  image: string;
  qty: number;
};

export type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

const toCartItem = (p: Product): CartItem => ({
  id: p.id,
  title: p.title,
  price: p.price,
  image: p.image,
  qty: 1,
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    loadCart(state, action: PayloadAction<CartState>) {
      state.items = action.payload.items;
    },
    addToCart(state, action: PayloadAction<Product>) {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push(toCartItem(action.payload));
      }
    },
    removeFromCart(state, action: PayloadAction<number>) {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    setQuantity(state, action: PayloadAction<{ id: number; qty: number }>) {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        item.qty = Math.max(1, Math.min(99, Math.floor(action.payload.qty || 1)));
      }
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, setQuantity, clearCart, loadCart } = cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCartItems = (s: { cart: CartState }) => s.cart.items;
export const selectTotalCount = (s: { cart: CartState }) =>
  s.cart.items.reduce((sum, i) => sum + i.qty, 0);
export const selectTotalPrice = (s: { cart: CartState }) =>
  s.cart.items.reduce((sum, i) => sum + i.qty * i.price, 0);
