import type { CartItem as CartItemType } from "@/types/cart";
import { formatVND } from "@/lib/formatters";

export default function CartItem({ item }: { item: CartItemType }) {
  return <div className="cart-item"><span>{item.product.name}</span><span>x {item.quantity}</span><strong>{formatVND(item.unit_price * item.quantity)}</strong></div>;
}
