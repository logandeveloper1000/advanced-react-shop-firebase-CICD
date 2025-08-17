// src/components/Navbar.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectTotalCount } from "../features/cart/cartSlice";
import { useAuth } from "../features/auth/useAuth";

export default function Navbar() {
  const count = useSelector(selectTotalCount);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Close the menu when the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">Advanced React Shop Firebase CI/CD</Link>

        {/* Burger */}
        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen(o => !o)}
        >
          <span className="burger" aria-hidden />
        </button>

        <nav
          id="primary-navigation"
          className={`nav-links ${open ? "open" : ""}`}
        >
          {user ? (
            <>
              <Link to="/" className={pathname === "/" ? "active" : ""}>Home</Link>
              <Link to="/cart" className={pathname === "/cart" ? "active" : ""}>
                Cart {count > 0 && <span className="badge">{count}</span>}
              </Link>

              <Link
                to="/addproduct"
                className={pathname === "/addproduct" ? "active" : ""}
              >
                Add Product
              </Link>

              <Link to="/orders" className={pathname.startsWith("/orders") ? "active" : ""}>Orders</Link>
              <Link to="/profile" className={pathname === "/profile" ? "active" : ""}>Profile</Link>

              <button className="nav-logout" onClick={() => logout()}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={pathname === "/login" ? "active" : ""}>Login</Link>
              <Link to="/register" className={pathname === "/register" ? "active" : ""}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
