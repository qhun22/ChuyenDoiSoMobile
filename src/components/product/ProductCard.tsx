'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ProductItemData } from './mock-products';

interface ProductCardProps {
  product: ProductItemData;
  onAddToCart?: (product: ProductItemData) => void;
  onCompare?: (product: ProductItemData) => void;
}

function formatVND(amount?: number) {
  if (amount === undefined || amount === null) return '';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

export default function ProductCard({ product, onAddToCart, onCompare }: ProductCardProps) {
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

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-100 p-2.5 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden hover:border-slate-200">
      {/* 1. Huy hiệu giảm giá góc trên bên trái */}
      {product.discount_percent > 0 && (
        <div className="absolute top-0 left-0 z-10 bg-[#b80012] text-white text-[11px] font-bold px-2 py-0.5 rounded-br-xl shadow-xs">
          -{product.discount_percent}%
        </div>
      )}

      {/* Link bao quanh ảnh và thông tin chi tiết */}
      <Link href={`/products/${product.slug}`} className="block flex-1">
        {/* 2. Khung ảnh sản phẩm tỉ lệ vuông */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50/50 mb-2.5 flex items-center justify-center p-2">
          <Image
            src={product.image}
            alt={product.name}
            fill
            unoptimized
            className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </div>

        {/* 3. Tên sản phẩm giới hạn 2 dòng */}
        <h3 className="font-bold text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-[#b80012] transition-colors mb-2 min-h-[38px]" title={product.name}>
          {product.name}
        </h3>

        {/* 4. Khối giá tiền */}
        <div className="mb-2.5 flex flex-col gap-0.5">
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs text-slate-400 line-through font-medium">
              {formatVND(product.original_price)}
            </span>
          )}
          <span className="text-base font-extrabold text-[#b80012]">
            {formatVND(product.price)}
          </span>
        </div>

        {/* 5. Hàng trạng thái (Còn hàng & Trả góp 0%) */}
        <div className="flex items-center justify-between gap-1.5 mb-3">
          {/* Nhãn còn hàng */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10.5px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Còn hàng
          </span>

          {/* Nhãn trả góp 0% */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[10.5px] font-semibold">
            <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Trả góp 0%
          </span>
        </div>
      </Link>

      {/* 6. Chân thẻ: 2 nút bấm ngang */}
      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
        {/* Nút Thêm giỏ */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-[#b80012] hover:bg-[#9c000f] text-white text-xs font-semibold shadow-xs hover:shadow transition-all duration-200 active:scale-95 cursor-pointer"
        >
          {/* Inline Cart SVG */}
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="truncate">Thêm giỏ</span>
        </button>

        {/* Nút So sánh */}
        <button
          type="button"
          onClick={handleCompare}
          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer"
        >
          {/* Inline Compare / 2-way arrows SVG */}
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span className="truncate">So sánh</span>
        </button>
      </div>
    </div>
  );
}