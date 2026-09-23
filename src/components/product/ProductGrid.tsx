'use client';

import ProductCard from './ProductCard';
import { FEATURED_PRODUCTS, ProductItemData } from './mock-products';

interface ProductGridProps {
  products?: ProductItemData[];
  title?: string;
  onAddToCart?: (product: ProductItemData) => void;
  onCompare?: (product: ProductItemData) => void;
}

export default function ProductGrid({
  products = FEATURED_PRODUCTS,
  title = 'SẢN PHẨM NỔI BẬT',
  onAddToCart,
  onCompare,
}: ProductGridProps) {
  return (
    <section className="w-full my-6">
      {/* Tiêu đề mục nếu có */}
      {title && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-6 bg-[#b80012] rounded-full" />
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 uppercase tracking-tight">
              {title}
            </h2>
          </div>
          <span className="text-xs sm:text-sm font-medium text-slate-500 hover:text-[#b80012] transition-colors cursor-pointer">
            Xem tất cả ({products.length}) &rarr;
          </span>
        </div>
      )}

      {/* Lưới sản phẩm chuẩn responsive 2 đến 5 cột */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onCompare={onCompare}
          />
        ))}
      </div>
    </section>
  );
}
