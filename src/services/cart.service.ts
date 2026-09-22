import { apiFetch } from "./api";
import type { Cart } from "@/types/cart";
export function getCart() { return apiFetch<Cart>("/cart/"); }
export function addToCart(productId: number, quantity = 1, variantId?: number) { return apiFetch<Cart>("/cart/items/", { method: "POST", body: JSON.stringify({ product_id: productId, quantity, variant_id: variantId }) }); }
