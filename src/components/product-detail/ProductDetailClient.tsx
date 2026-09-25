'use client';

import { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ProductCard from '@/components/product/ProductCard';
import { ProductItemData } from '@/components/product/mock-products';
import {
  ProductDetailData,
  VariantItem,
  SpecificationGroup,
  ReviewItem,
} from './types';

interface ProductDetailClientProps {
  product: ProductDetailData;
  relatedProducts?: ProductItemData[];
}

function formatVND(amount?: number) {
  if (amount === undefined || amount === null || amount <= 0) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

// 7 Tiêu chí cam kết sản phẩm chuẩn
const COMMITMENTS = [
  {
    text: 'Miễn phí vận chuyển toàn quốc – Giao hỏa tốc 2H nội thành',
    icon: (
      <svg className="w-3.5 h-3.5 text-[#b80012]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h2m-8 0a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
  },
  {
    text: 'Bảo hành chính hãng Apple 12 tháng toàn quốc',
    icon: (
      <svg className="w-3.5 h-3.5 text-[#b80012]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    text: 'Máy mới 100% nguyên Seal – Chưa Active – Lỗi đổi mới trong 12 tháng',
    icon: (
      <svg className="w-3.5 h-3.5 text-[#b80012]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    text: 'Giá đã bao gồm VAT – Xuất hóa đơn đầy đủ',
    icon: (
      <svg className="w-3.5 h-3.5 text-[#b80012]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
  },
  {
    text: 'Hỗ trợ kiểm tra IMEI/Serial chính hãng trước khi nhận hàng',
    icon: (
      <svg className="w-3.5 h-3.5 text-[#b80012]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    text: 'Hỗ trợ trả góp 0% – Thu cũ đổi mới giá cao',
    icon: (
      <svg className="w-3.5 h-3.5 text-[#b80012]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    text: 'Kiểm tra hàng trước khi thanh toán – Hỗ trợ kỹ thuật trọn đời',
    icon: (
      <svg className="w-3.5 h-3.5 text-[#b80012]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

// Dữ liệu đánh giá mẫu
const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Nguyễn Văn Minh',
    rating: 5,
    date: '2 ngày trước',
    comment: 'Máy cầm đầm tay, viền màn hình siêu mỏng, màu sắc hiển thị rất tươi. Giao hàng chưa đầy 1 tiếng là nhận được, shop tư vấn cực kỳ nhiệt tình!',
    verified: true,
  },
  {
    id: 'rev-2',
    author: 'Trần Thị Thu Hà',
    rating: 5,
    date: '1 tuần trước',
    comment: 'Hàng chính hãng nguyên seal, check IMEI bảo hành đủ 12 tháng. Trả góp 0% duyệt siêu nhanh. Đánh giá 5 sao cho chất lượng dịch vụ!',
    verified: true,
  },
];

export default function ProductDetailClient({
  product,
  relatedProducts = [],
}: ProductDetailClientProps) {
  const router = useRouter();

  // 1. Biến thể Dung lượng & Màu sắc
  const availableVariants = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.map((variant) => {
        const rawVariant = variant as VariantItem & {
          color_name?: string;
          storage?: string | number;
          price?: number | string;
          original_price?: number | string;
        };
        const colorName = String(rawVariant.color_name ?? rawVariant.color ?? '').trim();

        return {
          ...variant,
          storage: String(rawVariant.storage ?? '').trim(),
          color: colorName,
          color_name: colorName,
          price: Number(rawVariant.price) || 0,
          original_price: Number(rawVariant.original_price) || 0,
          sku: rawVariant.sku ? String(rawVariant.sku).trim() : undefined,
        };
      });
    }
    return [
      {
        id: 'default-1',
        storage: '256GB',
        color: 'Tiêu chuẩn',
        color_name: 'Tiêu chuẩn',
        price: product.price,
        original_price: product.original_price,
        discount_percent: product.discount_percent,
        stock: product.stock,
        sku: undefined,
        image: product.image,
      },
    ];
  }, [product]);

  // Danh sách các dung lượng duy nhất
  const storageOptions = useMemo(() => {
    const list: string[] = [];
    availableVariants.forEach((v) => {
      if (v.storage && !list.includes(v.storage)) {
        list.push(v.storage);
      }
    });
    return list.length > 0 ? list : ['256GB'];
  }, [availableVariants]);

  const [selectedStorage, setSelectedStorage] = useState<string>(
    storageOptions[0] || '256GB'
  );

  // Lọc màu sắc khả dụng theo dung lượng đang chọn
  const colorOptionsForStorage = useMemo(() => {
    const variantsForStorage = availableVariants.filter(
      (v) => String(v.storage).trim() === String(selectedStorage).trim()
    );
    const colors: { name: string; variant: VariantItem; image?: string }[] = [];
    variantsForStorage.forEach((v) => {
      if (!colors.some((c) => c.name === v.color)) {
        const colorImg =
          product.colorImages?.find(
            (ci) => v.color.toLowerCase().includes(ci.colorName.toLowerCase()) ||
              ci.colorName.toLowerCase().includes(v.color.toLowerCase())
          )?.imageUrl || v.image || product.image;

        colors.push({ name: v.color || 'Tiêu chuẩn', variant: v, image: colorImg });
      }
    });
    return colors.length > 0
      ? colors
      : [{ name: 'Tiêu chuẩn', variant: availableVariants[0], image: product.image }];
  }, [availableVariants, selectedStorage, product.colorImages, product.image]);

  const [selectedColor, setSelectedColor] = useState<string>(
    colorOptionsForStorage[0]?.name || 'Tiêu chuẩn'
  );

  const findVariant = (storageVal: string, colorVal: string) => {
    return (
      availableVariants.find((v) => {
        const matchStorage = String(v.storage).trim() === String(storageVal).trim();
        const variantColor = String(v.color_name ?? v.color ?? '');
        const variantSku = String(v.sku ?? '');
        const matchColor =
          variantColor === colorVal ||
          variantColor.includes(colorVal) ||
          (variantSku && colorVal.includes(variantSku));
        return matchStorage && matchColor;
      }) ||
      availableVariants.find(
        (v) => String(v.storage).trim() === String(storageVal).trim()
      ) ||
      availableVariants[0]
    );
  };

  const currentVariant = useMemo(
    () => findVariant(selectedStorage, selectedColor),
    [selectedStorage, selectedColor, availableVariants]
  );

  // Cập nhật giá theo biến thể đang chọn
  const currentPrice = currentVariant?.price || product.price || 0;
  const currentOriginalPrice = currentVariant?.original_price || product.original_price || 0;
  const isOutOfStock =
    (currentVariant?.stock !== undefined ? currentVariant.stock <= 0 : product.stock <= 0) ||
    !product.inStock;

  // SKU hiện tại
  const currentSku = useMemo(() => {
    return currentVariant?.sku || '-';
  }, [currentVariant]);

  // 2. Danh sách ảnh Media (ưu tiên theo đúng thứ tự đã kéo thả sắp xếp trong Admin)
  const allImages = useMemo(() => {
    const list: string[] = [];

    if (product.colorImages && product.colorImages.length > 0) {
      product.colorImages.forEach((c) => {
        if (c.imageUrl && !list.includes(c.imageUrl)) {
          list.push(c.imageUrl);
        }
      });
    }

    if (product.image && !list.includes(product.image)) {
      list.push(product.image);
    }

    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80');
    }
    return list;
  }, [product.image, product.colorImages]);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Khi đổi màu sắc
  const handleSelectColor = (colorName: string) => {
    setSelectedColor(colorName);
    if (product.colorImages && product.colorImages.length > 0) {
      const matchedColorImg = product.colorImages.find(
        (c) => c.colorName.toLowerCase() === colorName.toLowerCase()
      );
      if (matchedColorImg) {
        const foundIdx = allImages.indexOf(matchedColorImg.imageUrl);
        if (foundIdx !== -1) {
          setActiveImageIndex(foundIdx);
        }
      }
    }
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  // 3. Quản lý 3 Modal / Drawer trượt phải
  const [activeDrawer, setActiveDrawer] = useState<'specs' | 'description' | 'gallery' | null>(null);

  // 4. Quản lý Đánh giá
  const [reviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);

  // 5. Thêm vào giỏ hàng & Mua ngay
  const handleAddToCart = (redirectCheckout = false) => {
    try {
      const rawCart = localStorage.getItem('cart_items');
      const cart = rawCart ? JSON.parse(rawCart) : [];
      const itemToAdd = {
        id: Date.now(),
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: allImages[activeImageIndex] || product.image,
        storage: selectedStorage,
        color: selectedColor,
        sku: currentSku,
        price: currentPrice,
        original_price: currentOriginalPrice,
        quantity: 1,
      };

      cart.push(itemToAdd);
      localStorage.setItem('cart_items', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart_updated'));

      if (redirectCheckout) {
        toast.success('Đang chuyển tới trang thanh toán...');
        router.push('/checkout');
      } else {
        toast.success(`Đã thêm "${product.name} (${selectedStorage} - ${selectedColor})" vào giỏ hàng!`);
      }
    } catch {
      toast.error('Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  // Xử lý thông số kỹ thuật
  const parsedSpecs: SpecificationGroup[] = useMemo(() => {
    if (!product.specifications) return [];
    try {
      const raw = JSON.parse(product.specifications);
      if (Array.isArray(raw?.groups)) {
        return raw.groups as SpecificationGroup[];
      }
      if (typeof raw === 'object' && raw !== null) {
        const items = Object.entries(raw).map(([key, val]) => ({
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
          value: String(val),
        }));
        return [{ name: 'Thông số chung', items }];
      }
      return [];
    } catch {
      return [];
    }
  }, [product.specifications]);

  const [activeSpecGroupTab, setActiveSpecGroupTab] = useState<number>(0);

  // Installment price per month (6 months)
  const installmentPerMonth = Math.round(currentPrice / 6);

  return (
    <div className="w-full bg-[#fdfdfd] text-slate-800 font-['Signika',sans-serif] min-h-screen">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-4 overflow-x-hidden space-y-2">
        {/* =========================================================================
            1. BREADCRUMB & TIÊU ĐỀ SẢN PHẨM (NẰM TRÊN HẲN 2 CỘT)
            ========================================================================= */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#b80012] transition">
            Trang chủ
          </Link>
          <span className="text-slate-300">›</span>
          <Link
            href={`/products?brand=${encodeURIComponent(product.brand.toLowerCase())}`}
            className="hover:text-[#b80012] transition font-medium uppercase"
          >
            {product.brand}
          </Link>
          <span className="text-slate-300">›</span>
          <span className="text-slate-700 font-medium">
            {product.name}
          </span>
        </nav>

        {/* Tiêu đề sản phẩm đặt ngay dưới Breadcrumb */}
        <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-6 leading-tight">
          {product.name}
        </h1>

        {/* =========================================================================
            2. PRODUCT GRID (2 CỘT CHÍNH: CỘT ẢNH & CỘT THÔNG TIN)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          {/* CỘT TRÁI (Ảnh đại diện & Dải thẻ màu/tiện ích bên dưới - Mở rộng để các nút to rõ ràng) */}
          <div className="lg:col-span-6 w-full flex flex-col items-center">
            {/* Khung ảnh chính cố định kích thước */}
            <div className="w-full max-w-[480px] aspect-square mx-auto flex items-center justify-center p-2 bg-white relative">
              {/* Ảnh chính trọn vẹn ở chính giữa */}
              <Image
                src={allImages[activeImageIndex] || product.image}
                alt={product.name}
                width={440}
                height={440}
                priority
                className="w-auto h-auto max-w-[92%] max-h-[92%] object-contain mx-auto block"
                sizes="(max-width: 1024px) 100vw, 480px"
              />

              {/* Nút Prev / Next ảnh dạng tròn viền mờ */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-600 absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                    aria-label="Ảnh trước"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                    aria-label="Ảnh kế tiếp"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Hàng nút dưới ảnh (Thumbnails & Action buttons - Kích thước lớn, dễ nhìn, hiển thị đầy đủ tên) */}
            <div className="w-full max-w-[480px] mx-auto flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar py-1.5 px-0.5">
              {/* Các thẻ chọn màu */}
              {colorOptionsForStorage.map((opt) => {
                const isSelected = selectedColor === opt.name;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => handleSelectColor(opt.name)}
                    className={`flex-none w-[84px] min-w-[84px] max-w-[84px] h-[82px] rounded-xl border p-1.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all overflow-hidden ${
                      isSelected
                        ? 'border-[#b80012] bg-rose-50/20 text-[#b80012] shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 shrink-0 relative flex items-center justify-center mb-1 overflow-hidden">
                      <Image
                        src={opt.image || allImages[0] || product.image}
                        alt={opt.name}
                        fill
                        className="object-contain"
                        sizes="28px"
                      />
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-medium leading-tight line-clamp-2 w-full px-0.5 block text-center ${isSelected ? 'text-[#b80012] font-semibold' : 'text-slate-700'}`}>
                      {opt.name}
                    </span>
                  </button>
                );
              })}

              {/* Nút Thông số kỹ thuật */}
              <button
                type="button"
                onClick={() => setActiveDrawer('specs')}
                className="flex-none w-[84px] min-w-[84px] max-w-[84px] h-[82px] rounded-xl border border-slate-200 bg-white hover:border-slate-300 p-1.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all text-slate-700 hover:text-[#b80012] overflow-hidden"
              >
                <div className="w-7 h-7 flex items-center justify-center shrink-0 mb-1">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium leading-tight line-clamp-2 w-full px-0.5 block text-center">
                  Thông số kỹ thuật
                </span>
              </button>

              {/* Nút Thông tin sản phẩm */}
              <button
                type="button"
                onClick={() => setActiveDrawer('description')}
                className="flex-none w-[84px] min-w-[84px] max-w-[84px] h-[82px] rounded-xl border border-slate-200 bg-white hover:border-slate-300 p-1.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all text-slate-700 hover:text-[#b80012] overflow-hidden"
              >
                <div className="w-7 h-7 flex items-center justify-center shrink-0 mb-1">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium leading-tight line-clamp-2 w-full px-0.5 block text-center">
                  Thông tin sản phẩm
                </span>
              </button>

              {/* Nút Xem chi tiết ảnh */}
              <button
                type="button"
                onClick={() => setActiveDrawer('gallery')}
                className="flex-none w-[84px] min-w-[84px] max-w-[84px] h-[82px] rounded-xl border border-slate-200 bg-white hover:border-slate-300 p-1.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all text-slate-700 hover:text-[#b80012] overflow-hidden"
              >
                <div className="w-7 h-7 flex items-center justify-center shrink-0 mb-1">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium leading-tight line-clamp-2 w-full px-0.5 block text-center">
                  Xem chi tiết ảnh
                </span>
              </button>
            </div>
          </div>

          {/* CỘT PHẢI (Thông tin & Biến thể - Gọn gàng, ngắn lại để cân đối với cột ảnh) */}
          <div className="lg:col-span-6 w-full max-w-[490px] flex flex-col gap-4">
            {/* Hàng Giá & SKU */}
            <div className="space-y-1">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-[#b80012] tracking-tight">
                    {formatVND(currentPrice)}
                  </span>
                  {currentOriginalPrice > currentPrice && (
                    <span className="text-sm text-slate-400 line-through font-normal">
                      {formatVND(currentOriginalPrice)}
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  SKU: <span className="font-bold text-slate-700">{currentVariant?.sku || '-'}</span>
                </div>
              </div>

              {/* Dòng chữ Trả góp 0% màu xanh lá */}
              <div className="text-xs sm:text-sm font-semibold text-[#008848] flex items-center gap-1 cursor-pointer hover:underline mt-1">
                <span>
                  Trả góp 0% thẻ TD/CTTC chỉ từ {formatVND(installmentPerMonth)} x 6 tháng &gt;
                </span>
              </div>
            </div>

            {/* Khối Lựa chọn dung lượng (Chia lưới 3 cột) */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800">
                Lựa chọn dung lượng
              </label>
              <div className="grid grid-cols-3 gap-2.5 w-full">
                {storageOptions.map((storage) => {
                  const isSelected = selectedStorage === storage;
                  const matchingVariant = availableVariants.find((v) => v.storage === storage);
                  return (
                    <button
                      key={storage}
                      type="button"
                      onClick={() => {
                        setSelectedStorage(storage);
                        const validColors = availableVariants.filter(
                          (v) => String(v.storage).trim() === String(storage).trim()
                        );
                        const nextColor =
                          validColors.length > 0 &&
                          !validColors.some((c) => c.color_name === selectedColor)
                            ? validColors[0].color_name
                            : selectedColor;
                        if (nextColor !== selectedColor) {
                          setSelectedColor(nextColor);
                        }
                      }}
                      className={`relative w-full h-[54px] rounded-lg border px-2 py-1 flex flex-col items-center justify-center text-center transition-all cursor-pointer overflow-hidden bg-white ${
                        isSelected
                          ? 'border-[#b80012] shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800 truncate w-full text-center block leading-tight">
                        {storage}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 truncate w-full text-center block mt-0.5 leading-tight">
                        {formatVND(matchingVariant?.price || currentPrice)}
                      </span>

                      {/* Góc tam giác tích chọn */}
                      {isSelected && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#b80012] rounded-tl-md flex items-center justify-center text-white text-[8px] font-black pointer-events-none">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Khối Lựa chọn màu (Chia lưới 3 cột) */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800">
                Lựa chọn màu
              </label>
              <div className="grid grid-cols-3 gap-2.5 w-full">
                {colorOptionsForStorage.map((opt) => {
                  const isSelected = selectedColor === opt.name;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => handleSelectColor(opt.name)}
                      className={`relative w-full h-[46px] px-2.5 py-1 rounded-lg border flex items-center gap-2 text-left transition-all cursor-pointer overflow-hidden bg-white ${
                        isSelected
                          ? 'border-[#b80012] shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-200 bg-slate-50 shrink-0 overflow-hidden relative flex items-center justify-center">
                        <Image
                          src={opt.image || allImages[0] || product.image}
                          alt={opt.name}
                          fill
                          className="object-contain"
                          sizes="20px"
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-800 truncate flex-1 min-w-0 leading-tight">
                        {opt.name}
                      </span>

                      {/* Góc tam giác tích chọn */}
                      {isSelected && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#b80012] rounded-tl-md flex items-center justify-center text-white text-[8px] font-black pointer-events-none">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2 Nút Mua hàng */}
            <div className="grid grid-cols-2 gap-3 w-full pt-1">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => handleAddToCart(false)}
                className="h-11 sm:h-12 w-full text-xs sm:text-sm font-bold rounded-xl bg-white border border-[#b80012] hover:bg-rose-50 text-[#b80012] flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Thêm vào giỏ hàng</span>
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => handleAddToCart(true)}
                className="h-11 sm:h-12 w-full text-xs sm:text-sm font-bold rounded-xl bg-[#b80012] hover:bg-[#9e000f] text-white flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Mua ngay</span>
              </button>
            </div>

            {/* Banner ưu đãi Học sinh - Sinh viên - Giáo viên */}
            <div className="relative overflow-hidden rounded-2xl p-3.5 sm:px-4 bg-gradient-to-r from-[#dbe1ff] via-[#f7e4ef] to-[#fdecf3] border border-indigo-100 flex items-center justify-between gap-3 shadow-2xs mt-0.5">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                  DÀNH CHO
                </span>
                <h4 className="text-sm sm:text-base font-black text-[#1e1b4b] leading-tight">
                  Học sinh - Sinh viên - Giáo viên
                </h4>
                <p className="text-[11px] text-slate-500">
                  Ưu đãi hấp dẫn dành riêng cho cộng đồng giáo dục
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border-2 border-white shadow-md flex flex-col items-center justify-center shrink-0">
                  <span className="text-[7.5px] sm:text-[8.5px] font-bold text-slate-800 leading-none">
                    GIẢM ĐẾN
                  </span>
                  <span className="text-xs sm:text-sm font-black text-[#b80012] leading-none mt-0.5">
                    50%
                  </span>
                </div>

                <Link
                  href="/profile?tab=student"
                  className="text-xs sm:text-sm font-bold text-slate-800 hover:text-[#b80012] flex items-center gap-0.5 shrink-0 whitespace-nowrap transition"
                >
                  <span>Xác thực ngay &gt;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. KHỐI NỘI DUNG MỞ RỘNG (YOUTUBE & CAM KẾT SẢN PHẨM)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch w-full pt-2">
          {/* Cột trái: Video về sản phẩm */}
          <div className="md:col-span-6 bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-2xs flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-[#b80012]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Video về sản phẩm
              </h3>
            </div>
            <div className="relative w-full flex-1 min-h-[260px] sm:min-h-[290px] aspect-video rounded-xl overflow-hidden bg-slate-900 shadow-xs mt-2">
              <iframe
                src={`https://www.youtube.com/embed/${product.youtubeId || 'dQw4w9WgXcQ'}?autoplay=1&mute=1&loop=1&playlist=${product.youtubeId || 'dQw4w9WgXcQ'}`}
                title={`Video review ${product.name}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>

          {/* Cột phải: Cam kết sản phẩm */}
          <div className="md:col-span-6 bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-2xs flex flex-col justify-between h-full">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-[#b80012]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Cam kết sản phẩm
              </h3>
            </div>

            <div className="flex-1 flex flex-col justify-between py-1 space-y-2 sm:space-y-0">
              {COMMITMENTS.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-1">
                  <div className="w-6 h-6 rounded-full bg-red-50 text-[#b80012] border border-red-100 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <p className="text-xs sm:text-[13px] font-medium text-slate-700 leading-snug">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. ĐÁNH GIÁ SẢN PHẨM
            ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#b80012]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Đánh giá sản phẩm
            </h3>
          </div>

          {/* Hộp thông báo Vui lòng Đăng nhập */}
          <div className="bg-slate-50/80 rounded-xl border border-slate-100 p-3.5 flex items-center gap-2.5 text-xs sm:text-sm text-slate-600">
            <svg className="w-4 h-4 text-[#b80012] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>
              Vui lòng{' '}
              <Link href="/login" className="text-[#b80012] font-bold hover:underline">
                Đăng nhập
              </Link>{' '}
              để đánh giá sản phẩm.
            </span>
          </div>

          {/* Danh sách review mẫu */}
          <div className="divide-y divide-slate-100 pt-1">
            {reviews.map((rev) => (
              <div key={rev.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{rev.author}</span>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                         Đã mua hàng
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{rev.date}</span>
                </div>

                {/* Số sao */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            5. SẢN PHẨM LIÊN QUAN
            ========================================================================= */}
        {relatedProducts.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1 h-5 bg-[#b80012] rounded-full" />
                <h3 className="text-base sm:text-lg font-bold uppercase text-slate-900">
                  Sản phẩm tương tự
                </h3>
              </div>
              <Link
                href={`/products?brand=${encodeURIComponent(product.brand.toLowerCase())}`}
                className="text-xs font-semibold text-[#b80012] hover:underline"
              >
                Xem tất cả ›
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {relatedProducts.slice(0, 5).map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          DRAWER 1: THÔNG SỐ KỸ THUẬT
          ========================================================================= */}
      {activeDrawer === 'specs' && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold uppercase text-slate-900">
                  Thông số kỹ thuật chi tiết
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{product.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDrawer(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {parsedSpecs.length > 0 ? (
                <>
                  {parsedSpecs.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
                      {parsedSpecs.map((group, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveSpecGroupTab(idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                            activeSpecGroupTab === idx
                              ? 'bg-[#b80012] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {group.name}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left border-collapse">
                      <tbody>
                        {(parsedSpecs[activeSpecGroupTab]?.items || []).map((spec, sIdx) => (
                          <tr
                            key={sIdx}
                            className={sIdx % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'}
                          >
                            <td className="py-2.5 px-3.5 font-semibold text-slate-600 w-1/3 border-b border-slate-100">
                              {spec.label}
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-900 font-medium border-b border-slate-100">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Chưa có dữ liệu thông số kỹ thuật chi tiết cho sản phẩm này.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveDrawer(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
              >
                Đóng thông số
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DRAWER 2: THÔNG TIN SẢN PHẨM
          ========================================================================= */}
      {activeDrawer === 'description' && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold uppercase text-slate-900">
                  Thông tin & Bài viết chi tiết
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{product.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDrawer(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
              {product.description ? (
                <div
                  className="prose prose-slate max-w-none text-xs sm:text-sm [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-4 [&_h2]:mb-1 [&_p]:mb-2 [&_p]:text-slate-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_img]:rounded-xl [&_img]:border [&_img]:my-3"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Chưa có bài viết mô tả chi tiết cho sản phẩm này.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveDrawer(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
              >
                Đóng bài viết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          LIGHTBOX 3: GALLERY BỘ SƯU TẬP
          ========================================================================= */}
      {activeDrawer === 'gallery' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in">
          <div className="flex items-center justify-between text-white">
            <div>
              <h4 className="text-sm font-bold">{product.name}</h4>
              <p className="text-xs text-slate-400">
                Ảnh {activeImageIndex + 1} / {allImages.length}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveDrawer(null)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer text-sm"
            >
              ✕
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center max-h-[75vh] my-auto">
            <img
              src={allImages[activeImageIndex] || product.image}
              alt="Gallery item"
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
            />

            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition cursor-pointer"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition cursor-pointer"
                >
                  ›
                </button>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
            {allImages.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-12 h-12 rounded-lg border-2 overflow-hidden bg-slate-900 transition p-0.5 shrink-0 ${
                  idx === activeImageIndex ? 'border-[#b80012] scale-105' : 'border-white/30 opacity-60'
                }`}
              >
                <img src={imgUrl} alt="Thumb" className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
