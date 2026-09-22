import Link from "next/link";
import type { Product } from "@/types/product";
import { formatVND } from "@/lib/formatters";

export default function ProductCard({ product }: { product: Product }) {
  return <article className="product-card"><div className="product-image">{product.brand?.name ?? "MOBILE"}</div><p className="eyebrow">{product.category?.name ?? "Thiet bi"}</p><h3>{product.name}</h3><strong>{formatVND(product.price)}</strong><Link href={`/products/${product.slug}`}>Xem chi tiet</Link></article>;
}
