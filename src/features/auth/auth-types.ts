// src/features/auth/auth-types.ts
import type { Timestamp, FieldValue } from "firebase/firestore";

export type AppUser = {
  uid: string;
  name?: string;
  email: string;
  address?: string;
  createdAt?: Timestamp | FieldValue; // Firestore serverTimestamp() or Timestamp
  updatedAt?: Timestamp | FieldValue;
  isAdmin?: boolean;
};
