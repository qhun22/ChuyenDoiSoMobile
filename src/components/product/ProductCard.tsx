'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductItemData } from './mock-products';

interface ProductCardProps {
  product: ProductItemData;
  onAddToCart?: (product: ProductItemData) => void;
  onCompare?: (product: ProductItemData) => void;
}

function formatVND(amount?: number) {
  if (amount === undefined || amount === null || amount <= 0) return '';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

export default function ProductCard({ product, onAddToCart, onCompare }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCompare) {
      onCompare(product);
    }
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const isAvailable = (product.stock !== undefined && product.stock !== null)
    ? Number(product.stock) > 0
    : Boolean(product.inStock ?? true);

  const displayPrice = product.price || 0;
  const originalPrice = product.original_price || 0;
  const hasOriginalPrice = originalPrice > displayPrice;

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-100 p-3 sm:p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-300 overflow-hidden hover:border-slate-200">
      {/* 1. Huy hiệu giảm giá góc trên bên trái */}
      {product.discount_percent > 0 && (
        <div className="absolute top-0 left-0 z-10 bg-[#b80012] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-br-xl shadow-xs">
          -{product.discount_percent}%
        </div>
      )}

      {/* 2. Nút Trái tim yêu thích góc trên bên phải (xuất hiện khi hover) */}
      <button
        type="button"
        onClick={handleToggleLike}
        aria-label="Yêu thích"
        className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#b80012] transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
      >
        <svg
          className={`w-4 h-4 transition-colors ${isLiked ? 'fill-[#b80012] text-[#b80012]' : 'fill-none stroke-current'}`}
          viewBox="0 0 24 24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </button>

      {/* Link bao quanh ảnh và thông tin chi tiết */}
      <Link href={`/products/${product.slug}`} className="block flex-1">
        {/* 3. Khung ảnh sản phẩm tỉ lệ vuông */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 flex items-center justify-center p-2 bg-white">
          <Image
            src={product.image || '/icons/logo_iphone_ngang_eac93ff477.webp'}
            alt={product.name}
            fill
            unoptimized
            className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </div>

        {/* 4. Thanh ngang ngăn cách giữa tỉ lệ ảnh và thông tin chi tiết */}
        <div className="w-full h-px bg-slate-100 mb-3" />

        {/* 5. Tên sản phẩm */}
        <h3
          className="font-bold text-[13.5px] sm:text-sm text-slate-800 line-clamp-1 leading-snug group-hover:text-[#b80012] transition-colors mb-2 text-left"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* 4. Khối giá tiền (căn chỉnh chiều cao đồng đều) */}
        <div className="mb-2.5 flex flex-col justify-end min-h-[40px]">
          {hasOriginalPrice ? (
            <span className="text-[11.5px] text-slate-400 line-through font-normal leading-tight">
              {formatVND(originalPrice)}
            </span>
          ) : (
            <span className="text-[11.5px] leading-tight select-none opacity-0">
              0đ
            </span>
          )}
          <span className="text-base sm:text-[17px] font-black text-[#b80012] tracking-tight leading-none mt-0.5">
            {displayPrice > 0 ? formatVND(displayPrice) : '0đ'}
          </span>
        </div>

        {/* 5. Hàng trạng thái (Còn hàng / Hết hàng & Trả góp 0%) */}
        <div className="flex items-center gap-1.5 mb-3">
          {/* Nhãn tình trạng kho */}
          {isAvailable ? (
            <span className="flex-1 py-1 px-1.5 rounded-lg bg-[#dcfce7] text-[#16a34a] text-[11px] font-bold text-center whitespace-nowrap">
              Còn hàng
            </span>
          ) : (
            <span className="flex-1 py-1 px-1.5 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-bold text-center whitespace-nowrap">
              Hết hàng
            </span>
          )}

          {/* Nhãn trả góp 0% */}
          <span className="flex-1 py-1 px-1.5 rounded-lg bg-[#fef9c3] text-[#ca8a04] text-[11px] font-bold text-center whitespace-nowrap">
            Trả góp 0%
          </span>
        </div>
      </Link>

      {/* 6. Chân thẻ: 2 nút bấm ngang */}
      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100/80">
        {/* Nút Thêm giỏ */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className={`flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 ${
            isAvailable
              ? 'bg-[#b80012] hover:bg-[#99000f] text-white shadow-xs cursor-pointer'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          }`}
        >
          {/* Cart Icon */}
          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
          <span className="truncate">{isAvailable ? 'Thêm giỏ' : 'Hết hàng'}</span>
        </button>

        {/* Nút So sánh */}
        <button
          type="button"
          onClick={handleCompare}
          className="flex items-center justify-center gap-1.5 h-8 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer"
        >
          {/* Compare 2-way Arrows Icon */}
          <svg className="w-3.5 h-3.5 stroke-current shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3l4 4-4 4" />
            <path d="M20 7H4" />
            <path d="M8 21l-4-4 4-4" />
            <path d="M4 17h16" />
          </svg>
          <span className="truncate">So sánh</span>
        </button>
      </div>
    </div>
  );
}