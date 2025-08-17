// src/pages/Home.tsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";
import { useCategories, useProducts } from "../hooks/useProducts";
import CategorySelect from "../components/CategorySelect";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types/product";

export default function Home() {
  const [category, setCategory] = useState<"all" | string>("all");
  const { data: categories, isLoading: catsLoading } = useCategories();
  const { data: products, isLoading, isError, error } = useProducts(category);
  const dispatch = useDispatch();

  const handleAdd = (p: Product) => dispatch(addToCart(p));

  return (
    <section>
      <div className="toolbar">
        <h1>Products</h1>
        <CategorySelect
          categories={categories}
          value={category}
          onChange={(v: string) => setCategory(v)}
          isLoading={catsLoading}
        />
      </div>

      {isLoading && <p>Loading products…</p>}
      {isError && (
        <p style={{ color: "red" }}>
          {String((error as Error)?.message || "Error")}
        </p>
      )}

      <div className="grid">
        {products?.map((p) => (
          <ProductCard key={p.id} product={p} onAdd={handleAdd} />
        ))}
      </div>
    </section>
  );
}
