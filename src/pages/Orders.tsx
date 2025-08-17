// src/pages/Orders.tsx
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../features/auth/useAuth";
import { listUserOrders, type Order } from "../services/orders";
import { Link } from "react-router-dom";
import type { Timestamp } from "firebase/firestore";

function fmtCurrency(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function isTimestamp(v: unknown): v is Timestamp {
  return (
    typeof v === "object" &&
    v !== null &&
    // avoid `any` by narrowing the shape explicitly
    typeof (v as { toMillis?: unknown }).toMillis === "function"
  );
}

function toMillis(createdAt: unknown): number {
  if (isTimestamp(createdAt)) {
    try {
      return createdAt.toMillis();
    } catch {
      // ignore, fall through
    }
  }
  return 0;
}

export default function Orders() {
  const { user } = useAuth();

  const q = useQuery<Order[], Error>({
    queryKey: ["ordersAdvancedReactShop", user?.uid],
    queryFn: () => (user ? listUserOrders(user.uid) : Promise.resolve([])),
    enabled: !!user,
  });

  if (!user) return <p>Please sign in to view your orders.</p>;
  if (q.isLoading) return <p>Loading orders…</p>;
  if (q.isError) {
    const msg = q.error?.message || "Failed to load orders.";
    return <p style={{ color: "crimson" }}>{msg}</p>;
  }

  const orders = (q.data ?? [])
    .slice()
    .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

  return (
    <section className="orders-wrap">
      <header className="orders-header">
        <h1>Your Orders</h1>
        <span className="orders-count">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </span>
      </header>

      {orders.length ? (
        <ul className="orders-grid">
          {orders.map((o) => {
            const ms = toMillis(o.createdAt);
            const date = ms ? new Date(ms) : null;
            const niceDate = date ? date.toLocaleString() : "Processing…";
            return (
              <li key={o.id} className="order-card">
                <Link
                  to={`/orders/${o.id}`}
                  className="order-link"
                  aria-label={`View order ${o.id}`}
                >
                  <div className="order-top">
                    <div className="order-id">
                      <span className="muted">Order</span>
                      <strong>#{o.id.slice(-6)}</strong>
                    </div>
                    <div className="order-total">{fmtCurrency(o.total)}</div>
                  </div>

                  <div className="order-meta">
                    <span className="order-chip">
                      {o.items.length} item{o.items.length === 1 ? "" : "s"}
                    </span>
                    <span className="order-date">{niceDate}</span>
                  </div>

                  <div className="order-footer">
                    <span className="order-status">Placed</span>
                    <span className="order-arrow" aria-hidden>
                      →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="orders-empty">
          <p>No orders yet.</p>
          <Link to="/" className="btn">
            Start shopping
          </Link>
        </div>
      )}
    </section>
  );
}
