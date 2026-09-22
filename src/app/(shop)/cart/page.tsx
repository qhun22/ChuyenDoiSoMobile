import Link from "next/link";
import CartItem from "@/components/cart/CartItem";

export default function CartPage() {
  const item = { id: 1, product: { id: 1, name: "Nova X Pro", slug: "nova-x-pro", price: 18990000 }, quantity: 1, unit_price: 18990000 };
  return <main className="store-shell"><section className="home-section"><p className="eyebrow">Checkout / 01</p><h1>Gio hang</h1><CartItem item={item} /><Link className="primary-button" href="/checkout">Tiep tuc thanh toan</Link></section></main>;
}
