// src/hooks/useProducts.ts
import { useQuery } from "@tanstack/react-query";
import { listAllProducts, listProductsByCategory, listCategories } from "../services/products";
import type { FirestoreProduct } from "../types/product";
import type { Product } from "../types/product";

// Adapter: FirestoreProduct -> UI Product used by ProductCard/cart
function toUiProduct(p: FirestoreProduct): Product {
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    category: p.category,
    description: p.description,
    image: p.image,
    rating: p.rating ?? { rate: 0, count: 0 },
  };
}

export function useCategories() {
  return useQuery<string[]>({
    queryKey: ["categoriesAdvancedReactShop"],
    queryFn: listCategories,
    staleTime: 60_000,
  });
}

export function useProducts(category: string | "all") {
  return useQuery<Product[]>({
    queryKey: ["productsAdvancedReactShop", category],
    queryFn: async () => {
      const data: FirestoreProduct[] =
        category === "all"
          ? await listAllProducts()
          : await listProductsByCategory(category);
      return data.map(toUiProduct);
    },
  });
}
