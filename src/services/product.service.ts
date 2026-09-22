import { apiFetch } from "./api";
import type { Product } from "@/types/product";
export function getProducts(query = "") { return apiFetch<Product[]>(`/products/${query ? `?${query}` : ""}`); }
export function getProductBySlug(slug: string) { return apiFetch<Product>(`/products/${slug}/`); }
