// src/pages/Register.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  const maybe = err as { message?: unknown };
  if (typeof maybe?.message === "string") return maybe.message;
  return "Failed to register";
}

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [showPw, setShowPw] = useState<boolean>(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await register(email, password, name);
      nav("/");
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Get started with Advanced React Shop</p>

        {err && (
          <div role="alert" className="alert alert-error">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="form form-auth" noValidate>
          <label className="field">
            <span className="label">Full name</span>
            <input
              className="input"
              autoComplete="name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
              placeholder="Ada Lovelace"
            />
          </label>

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
                autoComplete="new-password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                placeholder="Create a strong password"
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
            <span className="hint">Use at least 8 characters.</span>
          </label>

          <button className="btn btn-block primary" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="auth-muted">
          Already have an account?{" "}
          <Link className="link-plain" to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
