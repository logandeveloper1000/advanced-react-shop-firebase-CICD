// src/types/product.ts
import type { Timestamp, FieldValue } from "firebase/firestore";

export type Product = {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;
  rating: { rate: number; count: number };
};

export type FirestoreProduct = Product & {
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
};
