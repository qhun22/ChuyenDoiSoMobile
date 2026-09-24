import ProductCard from "@/components/product/ProductCard";
import { FEATURED_PRODUCTS, ProductItemData } from "@/components/product/mock-products";

const saleProducts: ProductItemData[] = FEATURED_PRODUCTS.filter((p) => (p.discount_percent ?? 0) > 0);

export default function HotSalePage() {
  return (
    <main className="store-shell">
      <section className="home-section">
        <p className="eyebrow">Limited drop / -30%</p>
        <div className="section-heading">
          <h1>Hot sale</h1>
          <span>Giá tốt trong thời gian có hạn</span>
        </div>
        <div className="product-grid">
          {saleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}

