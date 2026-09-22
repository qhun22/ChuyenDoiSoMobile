import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types/product";

const products: Product[] = [
  { id: 1, name: "Nova X Pro", slug: "nova-x-pro", price: 18990000, brand: { id: 1, name: "Nova", slug: "nova" }, category: { id: 1, name: "Smartphone", slug: "smartphone" } },
  { id: 2, name: "Pixel Air 12", slug: "pixel-air-12", price: 12990000, brand: { id: 2, name: "Pixel", slug: "pixel" }, category: { id: 1, name: "Smartphone", slug: "smartphone" } },
  { id: 3, name: "Slate Tab 11", slug: "slate-tab-11", price: 9990000, brand: { id: 3, name: "Slate", slug: "slate" }, category: { id: 2, name: "Tablet", slug: "tablet" } },
];

export default function ProductsPage() {
  return <main className="store-shell"><section className="home-section"><p className="eyebrow">Catalog / 2026</p><div className="section-heading"><h1>San pham</h1><span>Bo loc · Phan trang</span></div><div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></section></main>;
}
