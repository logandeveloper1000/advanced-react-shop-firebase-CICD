// src/components/ProductCard.tsx
import type { Product } from "../types/product";

type Props = { product: Product; onAdd: (p: Product) => void };

export default function ProductCard({ product, onAdd }: Props) {

  return (
    <article className="card">
      <img
        src={product.image}
        alt={product.title}
        className="card-img"
        loading="lazy"
        decoding="async"
      />
      <div className="card-body">
        <h3 className="card-title">{product.title}</h3>
        <p className="card-meta">
          <span className="price">${product.price.toFixed(2)}</span>
          <span className="dot">•</span>
          <span className="category">{product.category}</span>
          <span className="dot">•</span>
          <span className="rating">⭐ {product.rating.rate.toFixed(1)}</span>
        </p>
        <p className="card-desc">{product.description}</p>
        <button className="btn" onClick={() => onAdd(product)}>
          Add to Cart
        </button>
      </div>
    </article>
  );
}
