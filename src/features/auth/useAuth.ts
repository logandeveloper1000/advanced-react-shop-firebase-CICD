// src/features/auth/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export const useAuth = () => {
  const v = useContext(AuthContext);
  if (!v) throw new Error("useAuth must be inside <AuthProvider>");
  return v;
};
