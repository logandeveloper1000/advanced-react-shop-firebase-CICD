// src/services/users.ts
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db, now } from "../lib/firebase";
import type { AppUser } from "../features/auth/auth-types";

const col = "usersAdvancedReactShop"; // avoid users which is reserved in Firebase

export async function createUserIfMissing(u: User, extra?: Partial<AppUser>) {
  const ref = doc(db, col, u.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const payload: AppUser = {
      uid: u.uid,
      email: u.email || "",
      name: extra?.name || u.displayName || "",
      address: "",
      createdAt: now(),
      updatedAt: now(),
      isAdmin: false,
    };
    await setDoc(ref, payload);
  }
}

export async function getUserDocByUID(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, col, uid));
  return snap.exists() ? (snap.data() as AppUser) : null;
}

export async function updateUserDoc(uid: string, data: Partial<AppUser>) {
  await updateDoc(doc(db, col, uid), { ...data, updatedAt: now() });
}

export async function deleteUserDoc(uid: string) {
  await deleteDoc(doc(db, col, uid));
}
