// src/pages/Login.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  const rec = err as Record<string, unknown> | null | undefined;
  if (rec && typeof rec.message === "string") return rec.message;
  return "Login failed";
}

function hasFrom(v: unknown): v is { from: string } {
  if (typeof v !== "object" || v === null) return false;
  const rec = v as Record<string, unknown>;
  return typeof rec["from"] === "string";
}

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [showPw, setShowPw] = useState<boolean>(false);

  const redirectTo = hasFrom(loc.state) ? loc.state.from : "/";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email, password);
      nav(redirectTo, { replace: true });
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue to your store</p>

        {err && (
          <div role="alert" className="alert alert-error">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="form form-auth" noValidate>
          <label className="field">
            <span className="label">Email</span>
            <input
              className="input"
              autoComplete="email"
              inputMode="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </label>

          <label className="field">
            <span className="label">Password</span>
            <div className="input-with-action">
              <input
                className="input"
                autoComplete="current-password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                className="chip"
                onClick={() => setShowPw((v) => !v)}
                aria-pressed={showPw}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <button className="btn btn-block primary" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-muted">
          Don’t have an account?{" "}
          <Link className="link-plain" to="/register">Create one</Link>
        </p>
      </div>
    </section>
  );
}
