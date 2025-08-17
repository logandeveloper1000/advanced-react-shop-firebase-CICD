// src/pages/OrderDetail.tsx
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "../services/orders";

export default function OrderDetail() {
  const { id = "" } = useParams();
  const q = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
    enabled: !!id
  });

  if (q.isLoading) return <p>Loading…</p>;
  if (!q.data) return <p>Order not found.</p>;
  const o = q.data;

  return (
    <section>
      <h1>Order #{o.id.slice(-6)}</h1>
      <p><strong>Total:</strong> ${o.total.toFixed(2)}</p>
      <ul className="cart-list">
        {o.items.map(i => (
          <li key={i.id} className="cart-item">
            <img src={i.image} alt={i.title} />
            <div className="info">
              <h3>{i.title}</h3>
              <p>${i.price.toFixed(2)} × {i.qty}</p>
            </div>
          </li>
        ))}
      </ul>
      <Link to="/orders" className="link">Back to orders</Link>
    </section>
  );
}
