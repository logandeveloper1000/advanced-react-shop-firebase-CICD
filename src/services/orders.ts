// src/services/orders.ts
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
  type FirestoreError,
  type Timestamp,
  type FieldValue,
} from "firebase/firestore";
import { db, now } from "../lib/firebase";
import type { CartItem } from "../features/cart/cartSlice";

const ordersCol = collection(db, "ordersAdvancedReactShop");

// Base order shape in Firestore
type OrderBase = {
  userId: string;
  items: CartItem[];
  total: number;
  createdAt: Timestamp | FieldValue; // FieldValue on write; Timestamp on read
};

export type Order = OrderBase & { id: string };

export async function createOrder(params: {
  userId: string;
  items: CartItem[];
  total: number;
}): Promise<string> {
  const payload: OrderBase = {
    userId: params.userId,
    items: params.items,
    total: params.total,
    createdAt: now(), // serverTimestamp
  };
  const ref = await addDoc(ordersCol, payload);
  return ref.id;
}

export async function listUserOrders(userId: string): Promise<Order[]> {
  try {
    // Preferred: requires composite index (userId asc, createdAt desc)
    const q1 = query(ordersCol, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snap = await getDocs(q1);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as OrderBase) }));
  } catch (err) {
    const e = err as FirestoreError;
    // Fallback if index is missing (FAILED_PRECONDITION)
    if (e.code === "failed-precondition" || /requires an index/i.test(e.message)) {
      const q2 = query(ordersCol, where("userId", "==", userId));
      const snap2 = await getDocs(q2);
      const rows = snap2.docs.map((d) => ({ id: d.id, ...(d.data() as OrderBase) }));
      // Sort client-side by createdAt desc
      return rows.sort((a, b) => {
        const ta = "toMillis" in (a.createdAt as Timestamp) ? (a.createdAt as Timestamp).toMillis() : 0;
        const tb = "toMillis" in (b.createdAt as Timestamp) ? (b.createdAt as Timestamp).toMillis() : 0;
        return tb - ta;
      });
    }
    throw err;
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, "ordersAdvancedReactShop", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as OrderBase) };
}
