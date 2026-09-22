'use client';

export default function WhyChooseUs() {
  return (
    <section className="w-full max-w-[1250px] mx-auto px-2 sm:px-4 my-8 font-['Signika',sans-serif]">
      {/* =========================================================================
          TIÊU ĐỀ: ĐEN TÍM NHẸ QUÉT SÁNG (SHIMMER)
          ========================================================================= */}
      <div className="flex items-center justify-center gap-3 my-6 -translate-y-[6px]">
        {/* Line mảnh mờ bên trái */}
        <div className="h-[1.5px] w-10 sm:w-16 bg-gradient-to-r from-transparent to-slate-400/40 rounded-full" />

        {/* Chữ đen tím nhẹ quét sáng */}
        <span className="relative text-base sm:text-xl font-extrabold uppercase tracking-widest bg-gradient-to-r from-slate-900 via-purple-700 to-slate-900 bg-[length:200%_auto] bg-clip-text text-transparent animate-text-shimmer select-none cursor-default">
          TẠI SAO NÊN CHỌN CHÚNG TÔI?
        </span>

        {/* Line mảnh mờ bên phải */}
        <div className="h-[1.5px] w-10 sm:w-16 bg-gradient-to-l from-transparent to-slate-400/40 rounded-full" />
      </div>

      {/* =========================================================================
          LƯỚI 4 TIÊU CHÍ BASIC (KHÔNG BOX NỀN TRẮNG, KHÔNG VIỀN)
          ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 pt-2">
        {/* MỤC 1: Hàng Chính Hãng */}
        <div className="flex flex-col items-center text-center group cursor-default">
          <div className="w-12 h-12 flex items-center justify-center text-red-600 mb-2 transition-transform duration-300 group-hover:scale-110">
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800">
            Hàng Chính Hãng
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1 max-w-[210px] leading-snug">
            Cam kết 100% sản phẩm chính hãng, đầy đủ phụ kiện.
          </p>
        </div>

        {/* MỤC 2: Đổi Trả Dễ Dàng */}
        <div className="flex flex-col items-center text-center group cursor-default">
          <div className="w-12 h-12 flex items-center justify-center text-red-600 mb-2 transition-transform duration-300 group-hover:scale-110">
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800">
            Đổi Trả Dễ Dàng
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1 max-w-[210px] leading-snug">
            Hỗ trợ đổi trả trong 7 ngày nếu lỗi kỹ thuật.
          </p>
        </div>

        {/* MỤC 3: Giao Hàng Nhanh */}
        <div className="flex flex-col items-center text-center group cursor-default">
          <div className="w-12 h-12 flex items-center justify-center text-red-600 mb-2 transition-transform duration-300 group-hover:scale-110">
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800">
            Giao Hàng Nhanh
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1 max-w-[210px] leading-snug">
            Giao hàng toàn quốc từ 1-2 ngày làm việc.
          </p>
        </div>

        {/* MỤC 4: Bảo Hành Uy Tín */}
        <div className="flex flex-col items-center text-center group cursor-default">
          <div className="w-12 h-12 flex items-center justify-center text-red-600 mb-2 transition-transform duration-300 group-hover:scale-110">
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800">
            Bảo Hành Uy Tín
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1 max-w-[210px] leading-snug">
            Bảo hành chính hãng từ 6-12 tháng.
          </p>
        </div>
      </div>
    </section>
  );
}