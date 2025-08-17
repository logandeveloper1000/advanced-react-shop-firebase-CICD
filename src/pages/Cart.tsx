// src/pages/Cart.tsx
import { useDispatch, useSelector } from "react-redux";
import {
  selectCartItems,
  selectTotalCount,
  selectTotalPrice,
  removeFromCart,
  setQuantity,
  clearCart,
} from "../features/cart/cartSlice";
import { useAuth } from "../features/auth/useAuth";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../services/orders";

export default function Cart() {
  const items = useSelector(selectCartItems);
  const totalCount = useSelector(selectTotalCount);
  const totalPrice = useSelector(selectTotalPrice);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { user } = useAuth();
  const placeholder = "/no-image.png";

  const handleCheckout = async () => {
    if (!user) {
      nav("/login", { state: { from: "/cart" } });
      return;
    }
    if (items.length === 0) return;

    const orderId = await createOrder({
      userId: user.uid,
      items,
      total: Number(totalPrice.toFixed(2)),
    });

    dispatch(clearCart());
    nav(`/orders/${orderId}`);
  };

  return (
    <section>
      <h1>Your Cart</h1>

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-list">
            {items.map((i) => (
              <li key={i.id} className="cart-item">
                <img
                  src={i.image}                 // ✅ use saved URL directly
                  alt={i.title}
                  loading="lazy"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    if (!el.src.endsWith(placeholder)) el.src = placeholder;
                  }}
                />
                <div className="info">
                  <h3>{i.title}</h3>
                  <p>${i.price.toFixed(2)}</p>
                </div>
                <div className="qty">
                  <label htmlFor={`qty-${i.id}`}>Qty</label>
                  <input
                    id={`qty-${i.id}`}
                    type="number"
                    min={1}
                    max={99}
                    value={i.qty}
                    onChange={(e) =>
                      dispatch(setQuantity({ id: i.id, qty: Number(e.target.value) }))
                    }
                  />
                </div>
                <button
                  className="link danger"
                  onClick={() => dispatch(removeFromCart(i.id))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="cart-summary">
            <div><strong>Total Items:</strong> {totalCount}</div>
            <div><strong>Total Price:</strong> ${totalPrice.toFixed(2)}</div>
          </div>

          <button className="btn primary" onClick={handleCheckout}>
            Place Order
          </button>
        </>
      )}
    </section>
  );
}
