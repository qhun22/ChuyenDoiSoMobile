import type { Product, Variant } from "./product";
export type CartItem = { id: number; product: Product; variant?: Variant; quantity: number; unit_price: number };
export type Cart = { id: number; items: CartItem[]; subtotal: number; total: number };
