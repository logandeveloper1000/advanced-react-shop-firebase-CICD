// src/features/auth/AuthProvider.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { createUserIfMissing, getUserDocByUID, updateUserDoc } from "../../services/users";
import type { AppUser } from "./auth-types";
import { AuthContext } from "./AuthContext";
import type { AuthCtx } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await createUserIfMissing(u); // ensure users/{uid} exists
        const p = await getUserDocByUID(u.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string): Promise<void> => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
      await createUserIfMissing(cred.user, { name });
    },
    []
  );

  const login = useCallback(
    (email: string, password: string): Promise<void> =>
      signInWithEmailAndPassword(auth, email, password).then(() => {}),
    []
  );

  const logout = useCallback((): Promise<void> => signOut(auth), []);

  const saveProfile = useCallback(
    async (data: Partial<AppUser>): Promise<void> => {
      if (!user) return;
      await updateUserDoc(user.uid, data);
      const p = await getUserDocByUID(user.uid);
      setProfile(p);
    },
    [user]
  );

  const value = useMemo<AuthCtx>(
    () => ({ user, profile, loading, register, login, logout, saveProfile }),
    [user, profile, loading, register, login, logout, saveProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
