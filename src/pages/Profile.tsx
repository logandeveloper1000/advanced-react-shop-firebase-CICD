// src/pages/Profile.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../features/auth/useAuth";

function initials(name?: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

export default function Profile() {
  const { user, profile, saveProfile, logout } = useAuth();
  const [name, setName] = useState<string>(profile?.name || "");
  const [address, setAddress] = useState<string>(profile?.address || "");
  const [busy, setBusy] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    // Keep inputs in sync when profile loads/changes
    setName(profile?.name || "");
    setAddress(profile?.address || "");
  }, [profile?.name, profile?.address]);

  // ✅ Call hooks unconditionally (before any early return)
  const avatarText = useMemo(() => {
    const source = profile?.name ?? user?.displayName ?? user?.email ?? "";
    return initials(source);
  }, [profile?.name, user?.displayName, user?.email]);

  if (!user) return <p>You must be signed in.</p>;

  const onSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    await saveProfile({ name, address });
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className="profile-wrap">
      <div className="profile-card">
        <header className="profile-header">
          <div className="avatar" aria-hidden="true">{avatarText}</div>
          <div className="profile-headings">
            <h1 className="profile-title">Your profile</h1>
            <p className="profile-subtitle">Manage your account details and address.</p>
          </div>
        </header>

        <div className="profile-meta">
          <div className="meta-item">
            <span className="meta-label">Email</span>
            <span className="meta-value">{profile?.email}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">User ID</span>
            <span className="meta-value mono">{user.uid}</span>
          </div>
        </div>

        <hr className="divider" />

        {saved && (
          <div role="status" className="alert alert-success">Saved successfully.</div>
        )}

        <form onSubmit={onSave} className="form profile-form" noValidate>
          <label className="field">
            <span className="label">Full name</span>
            <input
              className="input"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Your name"
            />
          </label>

          <label className="field">
            <span className="label">Address</span>
            <input
              className="input"
              value={address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
              placeholder="Shipping address"
            />
          </label>

          <div className="profile-actions">
            <button className="btn primary" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              className="btn outline danger-outline"
              onClick={() => logout()}
            >
              Logout
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
