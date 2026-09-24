'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import BrandManagement from '@/components/admin/BrandManagement';
import ProductManagement, { AdminProductItem } from '@/components/admin/product/ProductManagement';
import ProductDetailManagement from '@/components/admin/product/ProductDetailManagement';

const SECTION_TITLES: Record<string, string> = {
  overview: 'Thống kê tổng quan',
  users: 'Quản lý người dùng',
  orders: 'Quản lý đơn hàng',
  vietqr: 'Cấu hình VietQR',
  vouchers: 'Quản lý voucher & mã giảm giá',
  brands: 'Quản lý hãng',
  products: 'Quản lý sản phẩm',
  media: 'Quản lý ảnh banner',
  reviews: 'Quản lý đánh giá sản phẩm',
  blogs: 'Quản lý tin tức & Blog',
  hotsale: 'Quản lý chương trình Hot sale',
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSection = searchParams.get('section') || 'brands';
  const [activeSection, setActiveSection] = useState(initialSection);
  const [selectedProduct, setSelectedProduct] = useState<AdminProductItem | null>(null);

  useEffect(() => {
    const s = searchParams.get('section');
    if (s && s !== activeSection) {
      setActiveSection(s);
      if (s !== 'products' && s !== 'product-detail') {
        setSelectedProduct(null);
      }
    }
  }, [searchParams, activeSection]);

  const handleSelectSection = (section: string) => {
    setActiveSection(section);
    setSelectedProduct(null);
    router.push(`/dashboard?section=${section}`, { scroll: false });
  };

  const handleOpenProductDetail = (p: AdminProductItem) => {
    setSelectedProduct(p);
  };

  const handleBackToProductList = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="w-screen relative left-1/2 -translate-x-1/2 min-h-[calc(100vh-80px)] px-3 sm:px-5 py-3 flex gap-4 bg-white overflow-x-hidden font-['Signika',sans-serif]">
      {/* CỘT TRÁI (AdminSidebar): Cố định độ rộng w-52 */}
      <AdminSidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
      />

      {/* CỘT PHẢI: Content panel dãn hết phần còn lại */}
      <main className="flex-1 min-w-0 w-full bg-[#fafafa] rounded-xl p-3 sm:p-4 border border-slate-100/80">

        {/* QUẢN LÝ HÃNG */}
        {activeSection === 'brands' && <BrandManagement />}

        {/* QUẢN LÝ SẢN PHẨM & CHI TIẾT SẢN PHẨM */}
        {activeSection === 'products' && (
          selectedProduct ? (
            <ProductDetailManagement
              product={selectedProduct}
              onBack={handleBackToProductList}
              onUpdateProduct={(updated) => setSelectedProduct(updated)}
            />
          ) : (
            <ProductManagement onOpenDetail={handleOpenProductDetail} />
          )
        )}

        {/* CÁC MỤC KHÁC ĐANG PHÁT TRIỂN */}
        {activeSection !== 'brands' && activeSection !== 'products' && (
          <div className="w-full py-16 text-center bg-white rounded-xl border border-slate-100 p-8 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-3">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-lg font-black text-slate-900 uppercase">
              {SECTION_TITLES[activeSection] || `Khu vực ${activeSection.toUpperCase()}`}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Chức năng đang được kết nối với cơ sở dữ liệu. Vui lòng chuyển sang mục &ldquo;Quản lý hãng&rdquo; hoặc &ldquo;Quản lý sản phẩm&rdquo; để trải nghiệm.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => handleSelectSection('brands')}
                className="px-4 py-2 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Quản lý hãng
              </button>
              <button
                type="button"
                onClick={() => handleSelectSection('products')}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition cursor-pointer"
              >
                Quản lý sản phẩm
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-bold">Đang tải Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
