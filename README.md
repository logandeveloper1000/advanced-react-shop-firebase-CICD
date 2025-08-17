# Advanced React Shop

A Firebase-powered e‑commerce demo built with **React + TypeScript**, **Redux Toolkit** for the cart, **React Query** for server state, **React Router** for routing, and **Firebase (Auth, Firestore, Storage)** for the backend. Users can register/login, browse products by category, add items to a cart (persisted to `sessionStorage`), upload product images to Firebase Storage, and place orders that are saved to Firestore.

> This project is intentionally simple and client‑driven to demonstrate modern React patterns. For production, you would want server‑side validation and payment processing.

---

## Features

- Email/password **authentication** with Firebase (register, login, logout).
- **Products catalog** with categories, loaded from Firestore and cached with React Query.
- **Add Product** page that uploads an image to **Firebase Storage** and creates the product in Firestore.
- **Shopping Cart** using Redux Toolkit, persisted in `sessionStorage` (`CART_STORAGE_KEY`).
- **Orders**: create an order from the cart and list the current user’s orders.
- Responsive **Navbar** with a burger menu that collapses on small screens.
- Typed APIs and models with **TypeScript** end‑to‑end.

---

## Tech Stack

- **React 18** + **Vite** + **TypeScript**
- **Redux Toolkit** for client state (cart)
- **@tanstack/react-query** for server state (products/orders)
- **React Router** (v6) for routing
- **Firebase v10 modular** SDKs: Auth, Firestore, Storage
- Plain CSS (see `src/index.css`)

---

## Project Structure (selected files)

```
src/
  app/store.ts                    # Redux store + sessionStorage persistence
  components/
    CategorySelect.tsx            # Category dropdown
    Navbar.tsx                    # Responsive navbar + auth links
    ProductCard.tsx               # Product tile
  features/
    auth/                         # Auth context + hooks + types
      AuthContext.ts
      AuthProvider.tsx
      auth-types.ts
      useAuth.ts
    cart/                         # Cart slice + selectors
      cartSlice.ts
  hooks/useProducts.ts            # React Query hooks for products & categories
  lib/firebase.ts                 # Firebase initialization + helpers
  pages/
    AddProduct.tsx                # Create product + image upload
    Cart.tsx                      # Shopping cart + checkout
    Home.tsx                      # Product grid + filtering
    Login.tsx / Register.tsx      # Auth forms
    Orders.tsx / OrderDetail.tsx  # Order listing + detail
    Profile.tsx                   # User profile (name/address)
  services/
    orders.ts                     # Firestore CRUD for orders
    products.ts                   # Firestore CRUD for products/categories
    users.ts                      # Firestore CRUD for users
  types/product.ts                # Product & FirestoreProduct types
  utils/session.ts                # sessionStorage helpers
  App.tsx                         # Routes + auth guard
  main.tsx                        # App bootstrap (Redux + React Query + Router + Auth)
```

---

## Data Model

### Product (stored in `productsAdvancedReactShop`)
```ts
type Product = {
  id: number;                 // numeric id (Date.now())
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;              // Firebase Storage public URL
  rating: { rate: number; count: number };
};

type FirestoreProduct = Product & {
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
};
```

### User (stored in `usersAdvancedReactShop`)
```ts
type AppUser = {
  uid: string;
  name?: string;
  email: string;
  address?: string;
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
  isAdmin?: boolean;
};
```

### Order (stored in `ordersAdvancedReactShop`)
```ts
type CartItem = { id: number; title: string; price: number; image: string; qty: number };

type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  createdAt: Timestamp | FieldValue;
};
```

---

## Getting Started

### Prerequisites
- Node.js **18+**
- A Firebase project with **Authentication**, **Firestore**, and **Storage** enabled

### 1) Install dependencies
```bash
npm install
# or
yarn
```

### 2) Configure environment
Create a `.env.local` in the project root:

```bash
VITE_FIREBASE_API_KEY=YOUR_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

> Notes
> - These variables are read in `src/lib/firebase.ts` via `import.meta.env` (Vite).
> - The Firebase Web API key is **not a secret**, but you must protect your backend with proper security rules.
> - The `firebasestorage.app` domain is the current default for Firebase Storage buckets.

### 3) Enable Firebase products
In the Firebase Console:
- **Authentication** → Sign-in method → enable **Email/Password**.
- **Firestore** → Create database → start in **production mode** (recommended). See rules below.
- **Storage** → Create default bucket → set rules (see below).

### 4) Run the dev server
```bash
npm run dev
```
Open the printed local URL in your browser.

---

## Firestore Collections Used

- `usersAdvancedReactShop/{uid}` — user profiles created on first sign-in.
- `productsAdvancedReactShop/{id}` — products (created via **Add Product** or scripts).
- `categoriesAdvancedReactShop/{category}` — category documents (auto-created when you add a product).
- `ordersAdvancedReactShop/{id}` — orders created from the cart.

### Optional composite index (orders)
`services/orders.ts` first tries to query with `where("userId","==",uid)` + `orderBy("createdAt","desc")`.
If you see an error that an index is required, create a **composite index** for `ordersAdvancedReactShop` with:
- **Fields**: `userId` (Ascending), `createdAt` (Descending)

The code includes a fallback to a non-indexed query and client-side sort.

---

## Minimal Security Rules (example)

These example rules assume only authenticated users can write, and users can only read their own orders/profile. Adjust to your needs (e.g., admin roles).

### Firestore rules
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /usersAdvancedReactShop/{uid} {
      allow create: if request.auth != null && request.auth.uid == uid;
      allow read, update, delete: if request.auth != null && request.auth.uid == uid;
    }

    match /productsAdvancedReactShop/{id} {
      allow read: if true; // public catalog
      // For demos: allow writes to authenticated users.
      // For production: restrict to admins.
      allow create, update, delete: if request.auth != null;
    }

    match /categoriesAdvancedReactShop/{id} {
      allow read: if true;
      allow write: if request.auth != null; // or admin only
    }

    match /ordersAdvancedReactShop/{orderId} {
      // Only the owner can create/read their orders
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow update, delete: if false; // immutable in this demo
    }
  }
}
```

### Storage rules
```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Images uploaded by AddProduct page
    match /product-images-advancedreactshop/{allPaths=**} {
      allow read: if true; // public images
      allow write: if request.auth != null;
    }
  }
}
```

> Always test rules in the Firebase Rules Playground. For production, further harden admin‑only writes to products/categories, validate payload shapes, and limit file sizes/MIME types.

---

## Seeding Data / Categories

- The **Add Product** page automatically ensures a category document exists in `categoriesAdvancedReactShop` using the product’s `category`.
- To pre‑seed categories without products, create documents manually where the **document id** equals the category name (e.g., `electronics`, `jewelery`).

---

## Cart Persistence

The cart is stored in Redux (`features/cart/cartSlice.ts`) and persisted to `sessionStorage` under `CART_STORAGE_KEY = "cart:v1"`. See `src/app/store.ts` for the load/subscribe logic. Session storage is **per‑tab** and cleared when the tab closes.

---

## Available Scripts

```bash
# Start dev server (Vite)
npm run dev

# Production build
npm run build

# Preview the production build
npm run preview
```

> If you’re deploying to Netlify/Vercel, set the Vite **build output** as your publish directory (typically `dist`) and add your environment variables in the dashboard.

---

## Troubleshooting

- **Missing categories**: If `CategorySelect` shows only “All”, ensure you’ve added at least one product or manually created documents in `categoriesAdvancedReactShop`.
- **Storage URL fails**: Make sure Storage is enabled and your rules permit authenticated writes. The app uses the download URL returned by `getDownloadURL`.
- **“Requires an index” error**: Create the composite index for orders as described above.
- **Navbar overlaps content**: Ensure your CSS sets appropriate `z-index` and spacing for `.navbar` vs. page content. The provided markup uses a burger toggle class `open` to control visibility.

---

## Notes & Limitations

- **Totals are calculated client‑side** for demo purposes. In a real store, verify pricing and totals on a trusted server and integrate a payment provider.
- There is no admin role enforcement out‑of‑the‑box. Restrict product/category writes to admins before going live.
- Image uploads are not validated for MIME/size in the client; use Storage rules to enforce constraints.

---

## License

MIT (or your preferred license).

---

## Acknowledgments

Built to showcase modern React app structure with Firebase. Adapt and extend as needed.
