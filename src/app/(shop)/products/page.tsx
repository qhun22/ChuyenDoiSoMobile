import ProductCard from "@/components/product/ProductCard";
import { FEATURED_PRODUCTS, ProductItemData } from "@/components/product/mock-products";

const products: ProductItemData[] = FEATURED_PRODUCTS;

export default function ProductsPage() {
  return (
    <main className="store-shell">
      <section className="home-section">
        <p className="eyebrow">Catalog / 2026</p>
        <div className="section-heading">
          <h1>Sản phẩm</h1>
          <span>Bộ lọc · Phân trang</span>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}

