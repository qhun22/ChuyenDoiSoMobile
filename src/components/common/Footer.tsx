'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [contactInput, setContactInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubscribed(true);
      setContactInput('');
    }, 600);
  };

  return (
    <footer className="w-full bg-black text-[#888888] font-['Signika',sans-serif] mt-14 select-none">
      {/* =========================================================================
          PHẦN 1: TOP FOOTER (Form đăng ký + Hotline/Email + Social tròn)
          ========================================================================= */}
      <div className="border-b border-[#222222] py-9">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Cột trái: Form nhận tin (5 cột) */}
            <div className="md:col-span-5 space-y-2">
              <h2 className="text-sm sm:text-[15px] font-black uppercase tracking-wider text-white">
                NHẬN TƯ VẤN VÀ ƯU ĐÃI
              </h2>
              <p className="text-[12px] text-[#888888] leading-relaxed">
                Đăng ký ngay hôm nay để nhận được những ưu đãi đặc biệt và tư vấn miễn phí từ chúng tôi!
              </p>
              
              <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1 max-w-[420px]">
                <input
                  type="text"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  placeholder="Email hoặc số điện thoại"
                  required
                  className="flex-1 h-10 px-3.5 bg-black border border-[#444444] rounded text-xs text-white placeholder:text-[#666666] focus:outline-none focus:border-white transition"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-4 bg-white hover:bg-slate-200 text-black text-xs font-black tracking-wide rounded flex items-center gap-1.5 transition active:scale-95 disabled:opacity-70 cursor-pointer shrink-0"
                >
                  <span>{subscribed ? 'ĐÃ ĐĂNG KÝ' : 'ĐĂNG KÝ NGAY'}</span>
                  {!subscribed && <span className="text-sm font-bold"></span>}
                </button>
              </form>
            </div>

            {/* Cột giữa: LIÊN HỆ TRỰC TIẾP (4 cột) */}
            <div className="md:col-span-4 space-y-2.5 md:pl-8">
              <h3 className="text-sm sm:text-[15px] font-black uppercase tracking-wider text-white">
                LIÊN HỆ TRỰC TIẾP
              </h3>
              <div className="space-y-2 text-xs">
                {/* Hotline */}
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#222222] flex items-center justify-center text-white shrink-0">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#777777]">Hotline</span>
                    <a href="tel:0327221005" className="font-bold text-white hover:underline">
                      032.722.1005
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#222222] flex items-center justify-center text-white shrink-0">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#777777]">Email</span>
                    <a href="mailto:qhun22@gmail.com" className="font-bold text-white hover:underline">
                      qhun22@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: KẾT NỐI VỚI CHÚNG TÔI (3 cột) */}
            <div className="md:col-span-3 space-y-2.5">
              <h3 className="text-sm sm:text-[15px] font-black uppercase tracking-wider text-white">
                KẾT NỐI VỚI CHÚNG TÔI
              </h3>
              <div className="flex items-center gap-2.5">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center transition-colors text-xs font-bold"
                >
                  f
                </a>
                <a
                  href="https://zalo.me/0327221005"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Zalo"
                  className="w-8 h-8 rounded-full bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center transition-colors text-[10px] font-extrabold tracking-tighter"
                >
                  Zalo
                </a>
                <a
                  href="#"
                  aria-label="TikTok"
                  className="w-8 h-8 rounded-full bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center transition-colors text-xs"
                >
                  ♪
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center transition-colors text-xs"
                >
                  📷
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PHẦN 2: 5 CỘT MENU LIÊN KẾT
          ========================================================================= */}
      <div className="py-10">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-[12px]">
            {/* CỘT 1: TÀI KHOẢN */}
            <div className="space-y-4">
              <h4 className="font-black text-white uppercase tracking-wider text-xs">
                TÀI KHOẢN
              </h4>
              <nav className="flex flex-col space-y-1.5">
                <Link href="/profile" className="hover:text-white transition">Tài khoản QHUN22</Link>
                <Link href="/register" className="hover:text-white transition">Đăng ký thành viên</Link>
                <Link href="/cart" className="hover:text-white transition">Ưu đãi & Đặc quyền</Link>
              </nav>

              <h5 className="font-black text-white uppercase tracking-wider text-xs pt-2">
                TÀI LIỆU - TUYỂN DỤNG
              </h5>
              <nav className="flex flex-col space-y-1.5">
                <Link href="/order-tracking" className="hover:text-white transition">Đăng ký bản quyền</Link>
                <Link href="#" className="hover:text-white transition">Tuyển dụng cộng tác</Link>
              </nav>
            </div>

            {/* CỘT 2: CHÍNH SÁCH */}
            <div className="space-y-4">
              <h4 className="font-black text-white uppercase tracking-wider text-xs">
                CHÍNH SÁCH
              </h4>
              <nav className="flex flex-col space-y-1.5">
                <Link href="#" className="hover:text-white transition">Chính sách đổi trả tại cửa hàng</Link>
                <Link href="#" className="hover:text-white transition">Chính sách đổi trả online</Link>
                <Link href="#" className="hover:text-white transition">Chính sách khuyến mãi</Link>
                <Link href="#" className="hover:text-white transition">Chính sách bảo mật</Link>
                <Link href="#" className="hover:text-white transition">Chính sách giao hàng</Link>
              </nav>
            </div>

            {/* CỘT 3: CHĂM SÓC KHÁCH HÀNG */}
            <div className="space-y-4">
              <h4 className="font-black text-white uppercase tracking-wider text-xs">
                CHĂM SÓC KHÁCH HÀNG
              </h4>
              <nav className="flex flex-col space-y-1.5">
                <Link href="/order-tracking" className="hover:text-white transition">Tra cứu đơn hàng</Link>
                <Link href="#" className="hover:text-white transition">Hỏi đáp - FAQs</Link>
              </nav>

              <h5 className="font-black text-white uppercase tracking-wider text-xs pt-2">
                KIẾN THỨC MUA SẮM
              </h5>
              <nav className="flex flex-col space-y-1.5">
                <Link href="/search" className="hover:text-white transition">Hướng dẫn chọn máy</Link>
                <Link href="/blog" className="hover:text-white transition">Blog</Link>
              </nav>
            </div>

            {/* CỘT 4: VỀ QHUN22 */}
            <div className="space-y-4">
              <h4 className="font-black text-white uppercase tracking-wider text-xs">
                VỀ QHUN22
              </h4>
              <nav className="flex flex-col space-y-1.5">
                <Link href="/" className="hover:text-white transition">Trang chủ</Link>
                <Link href="/search" className="hover:text-white transition">Sản phẩm</Link>
                <Link href="#" className="hover:text-white transition">Chính sách bảo hành</Link>
                <Link href="#" className="hover:text-white transition">Cam kết chất lượng</Link>
                <Link href="#" className="hover:text-white transition">Câu chuyện thương hiệu</Link>
              </nav>
            </div>

            {/* CỘT 5: ĐỊA CHỈ LIÊN HỆ */}
            <div className="space-y-4 col-span-2 md:col-span-1">
              <h4 className="font-black text-white uppercase tracking-wider text-xs">
                ĐỊA CHỈ LIÊN HỆ
              </h4>
              <div className="space-y-2.5 text-[11px] leading-relaxed">
                <p>
                  Cửa hàng: B2, Tầng B2, Hanoi Centre, 175 Nguyễn Thái Học, Đống Đa, Hà Nội
                </p>
                <p>
                  Trung tâm vận hành: Lô C8, KCN Lại Yên, Xã Lại Yên, Huyện Hoài Đức, Thành phố Hà Nội
                </p>
              </div>

              {/* Huy hiệu Bộ Công Thương (chuẩn badge màu xanh dương) */}
              <div className="pt-1">
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PHẦN 3: COPYRIGHT ĐÁY TRANG
          ========================================================================= */}
      <div className="border-t border-[#1a1a1a] py-4 text-center text-[11px] text-[#666666]">
        <div className="max-w-[1240px] mx-auto px-4">
          <p>© 2026 QHUN22 MOBILE.</p>
        </div>
      </div>
    </footer>
  );
}