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
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-white font-['Signika',sans-serif] items-stretch">
      <AdminSidebar
        activeSection="products"
        onSelectSection={handleSelectSection}
      />
      <main className="flex-1 w-full min-w-0 p-6 sm:p-8 bg-[#fafafa]">
        {selectedProduct ? (
          <ProductDetailManagement
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            onUpdateProduct={(updated) => setSelectedProduct(updated)}
          />
        ) : (
          <ProductManagement onOpenDetail={(p) => setSelectedProduct(p)} />
        )}
      </main>
    </div>
  );
}
