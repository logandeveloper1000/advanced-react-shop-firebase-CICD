// src/pages/AddProduct.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct, listCategories } from "../services/products";
import type { FirestoreProduct } from "../types/product";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AddProduct() {
  const nav = useNavigate();
  const storage = getStorage(); // uses your initialized default app

  // Form state
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Image upload state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Rating (optional)
  const [rate, setRate] = useState<string>("0");
  const [count, setCount] = useState<string>("0");

  // UI state
  const [busy, setBusy] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // Load category suggestions
  useEffect(() => {
    (async () => {
      try {
        const cats = await listCategories();
        setCategories(cats.sort((a, b) => a.localeCompare(b)));
      } catch {
        // suggestions are optional
      }
    })();
  }, []);

  // Handle file selection + preview
  useEffect(() => {
    if (!file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const priceNumber = useMemo(() => Number(price), [price]);
  const rateNumber = useMemo(() => Number(rate), [rate]);
  const countNumber = useMemo(() => Number(count), [count]);

  // Simple client-side validation
  const canSubmit =
    title.trim().length > 2 &&
    !Number.isNaN(priceNumber) &&
    priceNumber > 0 &&
    category.trim().length > 0 &&
    file !== null;

  async function uploadProductImage(f: File): Promise<string> {
    // Generate a safe path: products/{timestamp}_{sanitizedName}
    const safeName = f.name.replace(/[^\w.-]+/g, "_");
    const path = `product-images-advancedreactshop/${Date.now()}_${safeName}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, f);
    const url = await getDownloadURL(storageRef);
    return url;
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setOk(null);

    if (!canSubmit) {
      setErr("Please fill in all required fields correctly and select an image.");
      return;
    }

    setBusy(true);
    try {
      // 1) Upload image to Firebase Storage, get a public URL
      const imageUrl = await uploadProductImage(file as File);

      // 2) Create Firestore product using that URL
      const payload: Omit<FirestoreProduct, "id"> = {
        title: title.trim(),
        price: priceNumber,
        category: category.trim(),
        description: description.trim(),
        image: imageUrl,
        rating: {
          rate: Number.isNaN(rateNumber) ? 0 : Math.max(0, Math.min(5, rateNumber)),
          count: Number.isNaN(countNumber) ? 0 : Math.max(0, countNumber),
        },
      };

      const created = await createProduct(payload);
      setOk(`Product created (id: ${created.id}).`);

      // Reset form
      setTitle("");
      setPrice("");
      setCategory("");
      setDescription("");
      setFile(null);
      setRate("0");
      setCount("0");

      // Optional: navigate home after a beat
      setTimeout(() => nav("/"), 800);
    } catch (ex) {
      const msg =
        ex instanceof Error
          ? ex.message
          : typeof ex === "string"
          ? ex
          : "Failed to create product.";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="profile-wrap">
      <div className="profile-card">
        <h1 className="profile-title" style={{ marginBottom: 8 }}>Add product</h1>
        <p className="profile-subtitle">Create a new item for your catalog.</p>

        {err && <div className="alert alert-error" role="alert" style={{ marginTop: 12 }}>{err}</div>}
        {ok && <div className="alert alert-success" role="status" style={{ marginTop: 12 }}>{ok}</div>}

        <form onSubmit={onSubmit} className="form profile-form" noValidate>
          <label className="field">
            <span className="label">Title *</span>
            <input
              className="input"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Product title"
              required
            />
          </label>

          <label className="field">
            <span className="label">Price (USD) *</span>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </label>

          <label className="field" style={{ gridColumn: "1 / -1" }}>
            <span className="label">Category *</span>
            <input
              className="input"
              list="categories-list"
              value={category}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)}
              placeholder="e.g., electronics"
              required
            />
            <datalist id="categories-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>

          {/* Image upload */}
          <label className="field" style={{ gridColumn: "1 / -1" }}>
            <span className="label">Product image *</span>
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                setFile(f);
              }}
              required
            />
            <span className="hint">PNG or JPG up to ~5MB recommended.</span>
          </label>

          {/* Preview */}
          {!!previewUrl && (
            <div style={{ gridColumn: "1 / -1" }}>
              <span className="label">Preview</span>
              <div
                style={{
                  background: "#0b1021",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 12,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <img
                  src={previewUrl}
                  alt="Product preview"
                  style={{ maxHeight: 180, objectFit: "contain" }}
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          <label className="field">
            <span className="label">Rating (0–5)</span>
            <input
              className="input"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={rate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRate(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="label">Rating count</span>
            <input
              className="input"
              type="number"
              min="0"
              step="1"
              value={count}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCount(e.target.value)}
            />
          </label>

          <label className="field" style={{ gridColumn: "1 / -1" }}>
            <span className="label">Description</span>
            <textarea
              className="input"
              rows={4}
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Tell shoppers about this product…"
              style={{ resize: "vertical" }}
            />
          </label>

          <div className="profile-actions">
            <button className="btn primary" disabled={busy || !canSubmit}>
              {busy ? "Creating…" : "Create product"}
            </button>
            <button
              className="btn outline"
              type="button"
              onClick={() => nav(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
