// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import cartReducer, { loadCart } from "../features/cart/cartSlice";
import type { CartState } from "../features/cart/cartSlice";
import { CART_STORAGE_KEY, loadFromSession, saveToSession } from "../utils/session";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

const persisted = loadFromSession<CartState>(CART_STORAGE_KEY);
if (persisted) {
  store.dispatch(loadCart(persisted));
}

store.subscribe(() => {
  const state = store.getState() as { cart: CartState };
  saveToSession<CartState>(CART_STORAGE_KEY, state.cart);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
