// src/services/products.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { db, now } from "../lib/firebase";
import type { FirestoreProduct } from "../types/product";

const productsCol = collection(db, "productsAdvancedReactShop"); // avoid products which is reserved in Firebase
const categoriesCol = collection(db, "categoriesAdvancedReactShop");

// Helper to generate a numeric id (sufficient for demo/admin UI)
const newProductId = () => Date.now();

/**
 * List all products (ordered by title).
 */
export async function listAllProducts(): Promise<FirestoreProduct[]> {
  const snap = await getDocs(query(productsCol, orderBy("title")));
  return snap.docs.map((d) => d.data() as FirestoreProduct);
}

/**
 * List products for a given category (ordered by title).
 */
export async function listProductsByCategory(
  category: string
): Promise<FirestoreProduct[]> {
  const snap = await getDocs(
    query(productsCol, where("category", "==", category), orderBy("title"))
  );
  return snap.docs.map((d) => d.data() as FirestoreProduct);
}

/**
 * List available categories.
 * Stored as documents under /categories with doc.id = category name.
 */
export async function listCategories(): Promise<string[]> {
  const snap = await getDocs(categoriesCol);
  return snap.docs.map((d) => d.id);
}

/**
 * Create a product.
 * - Document id is the numeric product id as a string to match cart logic.
 * - Also ensures the category doc exists.
 */
export async function createProduct(
  p: Omit<FirestoreProduct, "id"> & Partial<Pick<FirestoreProduct, "id">>
): Promise<FirestoreProduct> {
  const id = p.id ?? newProductId();
  const ref = doc(db, "productsAdvancedReactShop", String(id));

  const payload: FirestoreProduct = {
    id,
    title: p.title,
    price: p.price,
    category: p.category,
    description: p.description,
    image: p.image,
    rating: p.rating ?? { rate: 0, count: 0 },
    createdAt: now(),  // FieldValue on write; Timestamp on read
    updatedAt: now(),
  };

  await setDoc(ref, payload);

  // Ensure category exists (doc id = category name)
  await setDoc(doc(db, "categoriesAdvancedReactShop", p.category), { name: p.category }, { merge: true });

  return payload;
}

/**
 * Update a product by id.
 * - If category changes, ensure the category doc exists.
 */
export async function updateProduct(
  id: number,
  data: Partial<FirestoreProduct>
) {
  const ref = doc(db, "productsAdvancedReactShop", String(id));
  await updateDoc(ref, { ...data, updatedAt: now() });

  if (data.category) {
    await setDoc(doc(db, "categoriesAdvancedReactShop", data.category), { name: data.category }, { merge: true });
  }
}

/**
 * Delete a product by id.
 */
export async function deleteProduct(id: number) {
  await deleteDoc(doc(db, "productsAdvancedReactShop", String(id)));
}

/**
 * Get a single product by id.
 */
export async function getProduct(id: number): Promise<FirestoreProduct | null> {
  const snap = await getDoc(doc(db, "productsAdvancedReactShop", String(id)));
  return snap.exists() ? (snap.data() as FirestoreProduct) : null;
}
