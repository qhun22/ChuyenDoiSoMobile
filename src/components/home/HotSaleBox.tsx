'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface ProductItem {
  id: number | string;
  name: string;
  slug: string;
  image?: string;
  price: number;
  discounted_price?: number;
  original_price?: number;
  stock?: number;
}

interface HotSaleBoxProps {
  suggestedProducts?: ProductItem[];
  bestSellerProducts?: ProductItem[];
  hotSaleProducts?: ProductItem[];
  hotSaleEndTimestamp?: number;
}

function formatVND(amount?: number) {
  if (amount === undefined || amount === null) return '';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

export default function HotSaleBox({
  suggestedProducts = [],
  bestSellerProducts = [],
  hotSaleProducts = [],
  hotSaleEndTimestamp = 0,
}: HotSaleBoxProps) {
  const [activeTab, setActiveTab] = useState<'suggested' | 'bestseller' | 'hotsale'>('suggested');
  const [hoveredTab, setHoveredTab] = useState<'suggested' | 'bestseller' | 'hotsale' | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    const target =
      hotSaleEndTimestamp > 0
        ? hotSaleEndTimestamp < 1e12
          ? hotSaleEndTimestamp * 1000
          : hotSaleEndTimestamp
        : new Date().setHours(24, 0, 0, 0);

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        days: d.toString().padStart(2, '0'),
        hours: h.toString().padStart(2, '0'),
        minutes: m.toString().padStart(2, '0'),
        seconds: s.toString().padStart(2, '0'),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [hotSaleEndTimestamp]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);

  const currentProducts =
    activeTab === 'suggested'
      ? suggestedProducts
      : activeTab === 'bestseller'
      ? bestSellerProducts
      : hotSaleProducts;

  const visibleCards = 5;
  const maxIndex = Math.max(0, currentProducts.length - visibleCards);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    /* =========================================================================
       [NOTE 1]: TOÀN BỘ KHỐI HỘP
       ========================================================================= */
    <section className="relative w-full mt-[45px] mb-6 font-['Signika',sans-serif]">
      
      {/* =========================================================================
          [NOTE 2]: LỚP 1 - NẮP HỘP (2026_header_bg.png)
          ========================================================================= */}
      <div
        className="relative z-0 mx-auto flex items-start justify-between px-6 sm:px-10 pt-2"
        style={{
          width: '1230px',
          maxWidth: '100%',
          height: '82px',
          background: "url('/images/hotsale/2026_header_bg.png') center top / 100% 100% no-repeat",
        }}
      >
        {/* =========================================================================
            [NOTE 3]: CỤM 3 NÚT TAB (RÚT THẺ VẬT LÝ)
            ========================================================================= */}
        <div className="flex items-end gap-2.5 sm:gap-3.5 -translate-y-[20px]">
          {/* TAB 1: GỢI Ý */}
          <button
            type="button"
            onClick={() => setActiveTab('suggested')}
            onMouseEnter={() => setHoveredTab('suggested')}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              width: '142px',
              height: '50px',
              backgroundImage: "url('/images/hotsale/hs-tab-title-20-10.webp')",
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: activeTab === 'suggested' ? 'brightness(1) saturate(1)' : 'brightness(0.48) saturate(0.75)',
              transform: activeTab === 'suggested' ? 'translateY(-10px)' : hoveredTab === 'suggested' ? 'translateY(-2px)' : 'translateY(2px)',
            }}
            className={`relative flex items-center justify-center rounded-t-xl transition-all duration-300 ease-out cursor-pointer overflow-hidden ${
              activeTab === 'suggested' ? 'z-20 opacity-100' : 'opacity-100'
            }`}
          >
            <span className="text-sm sm:text-base font-black uppercase italic tracking-wider text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] z-10 select-none">
              GỢI Ý
            </span>
          </button>

          {/* TAB 2: BÁN CHẠY */}
          <button
            type="button"
            onClick={() => setActiveTab('bestseller')}
            onMouseEnter={() => setHoveredTab('bestseller')}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              width: '142px',
              height: '50px',
              backgroundImage: "url('/images/hotsale/hs-tab-title-20-10.webp')",
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: activeTab === 'bestseller' ? 'brightness(1) saturate(1)' : 'brightness(0.48) saturate(0.75)',
              transform: activeTab === 'bestseller' ? 'translateY(-10px)' : hoveredTab === 'bestseller' ? 'translateY(-2px)' : 'translateY(2px)',
            }}
            className={`relative flex items-center justify-center rounded-t-xl transition-all duration-300 ease-out cursor-pointer overflow-hidden ${
              activeTab === 'bestseller' ? 'z-20 opacity-100' : 'opacity-100'
            }`}
          >
            <span className="text-sm sm:text-base font-black uppercase italic tracking-wider text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] z-10 select-none">
              BÁN CHẠY
            </span>
          </button>

          {/* TAB 3: HOTSALE */}
          <button
            type="button"
            onClick={() => setActiveTab('hotsale')}
            onMouseEnter={() => setHoveredTab('hotsale')}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              width: '142px',
              height: '50px',
              backgroundImage: "url('/images/hotsale/hs-tab-title-20-10.webp')",
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: activeTab === 'hotsale' ? 'brightness(1) saturate(1)' : 'brightness(0.48) saturate(0.75)',
              transform: activeTab === 'hotsale' ? 'translateY(-10px)' : hoveredTab === 'hotsale' ? 'translateY(-2px)' : 'translateY(2px)',
            }}
            className={`relative flex items-center justify-center rounded-t-xl transition-all duration-300 ease-out cursor-pointer overflow-hidden ${
              activeTab === 'hotsale' ? 'z-20 opacity-100' : 'opacity-100'
            }`}
          >
            <span className="text-sm sm:text-base font-black uppercase italic tracking-wider text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] z-10 select-none">
              HOTSALE
            </span>
          </button>
        </div>

        {/* =========================================================================
            [NOTE 4]: ĐỒNG HỒ ĐẾM NGƯỢC (HIỂN THỊ CHUNG XUYÊN SUỐT CẢ 3 TAB)
            ========================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-white pt-2 -translate-y-[5px]">
          <span className="text-[11px] sm:text-xs font-black uppercase italic tracking-wider text-yellow-300">
            KẾT THÚC SAU
          </span>
          <div className="flex items-center gap-1 text-xs sm:text-sm font-black text-yellow-300">
            <span className="bg-black/85 px-1.5 py-0.5 rounded min-w-[22px] text-center border border-yellow-400/30">
              {timeLeft.days}
            </span>
            :
            <span className="bg-black/85 px-1.5 py-0.5 rounded min-w-[22px] text-center border border-yellow-400/30">
              {timeLeft.hours}
            </span>
            :
            <span className="bg-black/85 px-1.5 py-0.5 rounded min-w-[22px] text-center border border-yellow-400/30">
              {timeLeft.minutes}
            </span>
            :
            <span className="bg-black/85 px-1.5 py-0.5 rounded min-w-[22px] text-center border border-yellow-400/30">
              {timeLeft.seconds}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          [NOTE 5]: LỚP 2 - THÂN HỘP (2026_body_bg_desk.webp)
          ========================================================================= */}
      <div
        className="relative z-10 mx-auto px-4 sm:px-5 pt-3 pb-5 flex flex-col justify-center"
        style={{
          width: '1250px',
          maxWidth: '100%',
          minHeight: '420px',
          marginTop: '-40px',
          background: "url('/images/hotsale/2026_body_bg_desk.webp') center / 100% 100% no-repeat",
        }}
      >
        {/* =========================================================================
            [NOTE 6]: 4 ICON LÌ XÌ TRANG TRÍ (TĂNG KÍCH THƯỚC LÊN w-16 h-16 ~ 64px)
            ========================================================================= */}
        {/* Góc trên trái */}
        <div className="absolute -top-0.5 -left-0.5 w-14 h-14 sm:w-25 sm:h-25 pointer-events-none z-20">
          <Image src="/images/hotsale/2026_left_icon.webp" alt="" fill className="object-contain" unoptimized />
        </div>
        {/* Góc dưới trái */}
        <div className="absolute -bottom-0.5 -left-0.5 w-14 h-14 sm:w-18 sm:h-18 pointer-events-none z-20">
          <Image src="/images/hotsale/2026_right_icon.webp" alt="" fill className="object-contain" unoptimized />
        </div>
        {/* Góc trên phải */}
        <div className="absolute -top-0.5 -right-0.5 w-14 h-14 sm:w-25 sm:h-25 pointer-events-none z-20">
          <Image src="/images/hotsale/2026_right_icon.webp" alt="" fill className="object-contain" unoptimized />
        </div>
        {/* Góc dưới phải */}
        <div className="absolute -bottom-0.5 -right-0.5 w-14 h-14 sm:w-25 sm:h-25 pointer-events-none z-20">
          <Image src="/images/hotsale/2026_left_icon.webp" alt="" fill className="object-contain" unoptimized />
        </div>

        {/* =========================================================================
            [NOTE 7]: HAI NÚT PREV / NEXT
            ========================================================================= */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          aria-label="Trang trước"
          style={{ left: '8px' }}
          className="absolute top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg border border-slate-200 transition hover:bg-slate-100 disabled:opacity-0 disabled:pointer-events-none active:scale-95 cursor-pointer"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentIndex >= maxIndex}
          aria-label="Trang sau"
          style={{ right: '8px' }}
          className="absolute top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg border border-slate-200 transition hover:bg-slate-100 disabled:opacity-0 disabled:pointer-events-none active:scale-95 cursor-pointer"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* =========================================================================
            [NOTE 8]: KHUNG CARDS SẢN PHẨM
            ========================================================================= */}
        <div className="w-full overflow-hidden px-3">
          {currentProducts && currentProducts.length > 0 ? (
            <div
              className="flex gap-2 sm:gap-3 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * 20.6}%)`,
              }}
            >
              {currentProducts.map((product) => {
                const currentPrice = product.discounted_price || product.price;
                const hasOldPrice =
                  product.original_price && product.original_price > currentPrice;

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="relative flex flex-col justify-between w-[calc(50%-4px)] sm:w-[calc(33.33%-6px)] md:w-[calc(20%-9.6px)] h-[320px] shrink-0 rounded-2xl bg-white p-3 border border-red-50 shadow-sm hover:shadow-md transition"
                  >
                    <div className="relative w-full h-[180px] overflow-hidden rounded-xl mb-2 flex items-center justify-center">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          unoptimized
                          className="object-contain p-2 hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-xs text-slate-300">No Image</div>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 justify-between">
                      <h3 className="line-clamp-2 text-xs sm:text-sm font-semibold text-slate-900 min-h-[36px] hover:text-[#d70018]">
                        {product.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
                        <span className="text-sm sm:text-base font-black text-[#d70018]">
                          {formatVND(currentPrice)}
                        </span>
                        {hasOldPrice && (
                          <span className="text-[11px] text-slate-400 line-through">
                            {formatVND(product.original_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="w-full py-16 text-center text-white font-medium text-sm">
              Chưa có dữ liệu sản phẩm trong mục này.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}