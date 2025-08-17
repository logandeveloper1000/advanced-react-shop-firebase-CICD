// src/features/auth/AuthContext.ts
import { createContext } from "react";
import type { User } from "firebase/auth";
import type { AppUser } from "./auth-types";

export type AuthCtx = {
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  register: (email: string, password: string, name?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  saveProfile: (data: Partial<AppUser>) => Promise<void>;
};

export const AuthContext = createContext<AuthCtx | null>(null);
