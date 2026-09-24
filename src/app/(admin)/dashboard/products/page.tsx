'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ProductManagement, { AdminProductItem } from '@/components/admin/product/ProductManagement';
import ProductDetailManagement from '@/components/admin/product/ProductDetailManagement';

export default function AdminProductsPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<AdminProductItem | null>(null);

  const handleSelectSection = (section: string) => {
    router.push(`/dashboard?section=${section}`);
  };

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[calc(100vh-80px)] px-3 sm:px-5 py-3 flex gap-4 bg-white overflow-x-hidden font-['Signika',sans-serif]">
      <AdminSidebar
        activeSection="products"
        onSelectSection={handleSelectSection}
      />
      <main className="flex-1 min-w-0 w-full bg-[#fafafa] rounded-xl p-3 sm:p-4 border border-slate-100/80">
        <div className={selectedProduct ? 'hidden' : 'block'}>
          <ProductManagement
            onOpenDetail={(p) => setSelectedProduct(p)}
            updatedProduct={selectedProduct}
          />
        </div>
        {selectedProduct && (
          <ProductDetailManagement
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            onUpdateProduct={(updated) => setSelectedProduct(updated)}
          />
        )}
      </main>
    </div>
  );

}
