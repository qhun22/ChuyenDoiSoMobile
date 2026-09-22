import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types/product";

const saleProducts: Product[] = [
  { id: 4, name: "Nova Lite", slug: "nova-lite", price: 6990000, brand: { id: 1, name: "Nova", slug: "nova" }, category: { id: 1, name: "Smartphone", slug: "smartphone" } },
  { id: 5, name: "Slate Buds", slug: "slate-buds", price: 1490000, brand: { id: 3, name: "Slate", slug: "slate" }, category: { id: 3, name: "Phu kien", slug: "phu-kien" } },
];

export default function HotSalePage() { return <main className="store-shell"><section className="home-section"><p className="eyebrow">Limited drop / -30%</p><div className="section-heading"><h1>Hot sale</h1><span>Gia tot trong thoi gian co han</span></div><div className="product-grid">{saleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div></section></main>; }
