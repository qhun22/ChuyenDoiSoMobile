'use client';

import { useState, useEffect } from 'react';
import ProductCard from "@/components/product/ProductCard";
import { FEATURED_PRODUCTS, ProductItemData } from "@/components/product/mock-products";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItemData[]>(FEATURED_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setProducts(data.data);
        }
      } catch {
        // Fallback to static mock if offline
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchCatalog();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="store-shell">
      <section className="home-section">
        <p className="eyebrow">Catalog / 2026</p>
        <div className="section-heading">
          <h1>Sản phẩm</h1>
          <span>Bộ lọc · Phân trang</span>
        </div>
        <div className="product-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3 animate-pulse shadow-xs">
                  <div className="w-full aspect-square bg-slate-100 rounded-xl"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-5 bg-slate-200 rounded w-1/3 pt-1"></div>
                </div>
              ))
            : products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </section>
    </main>
  );
}


