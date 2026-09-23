'use client';

import { useState } from 'react';
import Link from 'next/link';

type ProfileTab = 'dashboard' | 'address' | 'password' | 'student' | 'coupon' | 'history' | 'refund';

interface UserProfile {
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  rank: 'bronze' | 'silver' | 'gold' | 'diamond';
  isSuperuser?: boolean;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('address');

  // Dữ liệu mẫu hiển thị (sau này nối API Django chỉ cần thay vào state này)
  const [user] = useState<UserProfile>({
    name: 'ADMIN',
    email: 'admin@hotmail.com',
    totalOrders: 2,
    totalSpent: 116900000,
    rank: 'silver',
    isSuperuser: true,
  });

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  return (
    <div className="w-full bg-[#f8fafc] py-6 sm:py-8 font-['Signika',sans-serif]">
      <div className="w-full space-y-4">
        
        {/* =========================================================================
            KHỐI 1: THẺ THÔNG TIN NGƯỜI DÙNG & THỐNG KÊ (Card trắng trên cùng)
            ========================================================================= */}
        <div className="w-full bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
          {/* Avatar + Tên + Email */}
          <div className="flex items-center gap-4 min-w-[220px]">
            <div className="w-14 h-14 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div className="text-base font-black uppercase text-slate-900 tracking-wider">
                {user.name}
              </div>
              <div className="text-xs text-slate-400 mt-0.5 font-medium">
                {user.email}
              </div>
            </div>
          </div>

          <div className="hidden lg:block h-10 w-[1px] bg-slate-100" />

          {/* Thống kê 1: Tổng đơn */}
          <div className="flex items-center gap-3.5 min-w-[180px]">
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <div className="text-base font-black text-slate-900 leading-tight">
                {user.totalOrders}
              </div>
              <div className="text-[12px] text-slate-400 font-medium">
                Tổng số đơn hàng đã mua
              </div>
            </div>
          </div>

          <div className="hidden lg:block h-10 w-[1px] bg-slate-100" />

          {/* Thống kê 2: Tổng chi tiêu */}
          <div className="flex items-center gap-3.5 min-w-[200px]">
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-base font-black text-slate-900 leading-tight">
                {formatVND(user.totalSpent)}
              </div>
              <div className="text-[12px] text-slate-400 font-medium">
                Tổng số tiền đã tiêu dùng
              </div>
            </div>
          </div>

          <div className="hidden lg:block h-10 w-[1px] bg-slate-100" />

          {/* Thống kê 3: Hạng thành viên */}
          <div className="flex items-center gap-3 min-w-[140px]">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="text-sm font-bold text-slate-700">
              Hạng: <span className="text-slate-500 font-semibold">Bạc</span>
            </div>
          </div>

          <div className="hidden lg:block h-10 w-[1px] bg-slate-100" />

          {/* Đăng xuất */}
          <button
            type="button"
            className="flex flex-col items-center justify-center w-20 h-16 rounded-xl border border-slate-200 text-slate-600 hover:text-[#d70018] hover:border-red-200 transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-[11px] font-medium mt-1">Đăng xuất</span>
          </button>
        </div>

        {/* =========================================================================
            KHỐI 2: THANH TAB ĐIỀU HƯỚNG
            ========================================================================= */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 px-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between min-w-[860px]">
            {/* Dashboard nếu là Admin */}
            {user.isSuperuser && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 py-4 px-3 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#d70018] transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Dashboard</span>
              </Link>
            )}

            {/* Sổ địa chỉ */}
            <button
              type="button"
              onClick={() => setActiveTab('address')}
              className={`relative flex items-center gap-2 py-4 px-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'address' ? 'text-[#d70018]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Sổ địa chỉ</span>
              {activeTab === 'address' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#d70018] rounded-full" />
              )}
            </button>

            {/* Đổi mật khẩu */}
            <button
              type="button"
              onClick={() => setActiveTab('password')}
              className={`relative flex items-center gap-2 py-4 px-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'password' ? 'text-[#d70018]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Đổi mật khẩu</span>
              {activeTab === 'password' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#d70018] rounded-full" />
              )}
            </button>

            {/* Student - Teacher */}
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`relative flex items-center gap-2 py-4 px-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'student' ? 'text-[#d70018]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Student - Teacher</span>
              {activeTab === 'student' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#d70018] rounded-full" />
              )}
            </button>

            {/* Mã giảm giá */}
            <button
              type="button"
              onClick={() => setActiveTab('coupon')}
              className={`relative flex items-center gap-2 py-4 px-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'coupon' ? 'text-[#d70018]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span>Mã giảm giá</span>
              {activeTab === 'coupon' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#d70018] rounded-full" />
              )}
            </button>

            {/* Lịch sử mua hàng */}
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`relative flex items-center gap-2 py-4 px-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'history' ? 'text-[#d70018]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Lịch sử mua hàng</span>
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#d70018] rounded-full" />
              )}
            </button>

            {/* Hoàn tiền */}
            <button
              type="button"
              onClick={() => setActiveTab('refund')}
              className={`relative flex items-center gap-2 py-4 px-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'refund' ? 'text-[#d70018]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Hoàn tiền</span>
              {activeTab === 'refund' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#d70018] rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* =========================================================================
            KHỐI 3: NỘI DUNG TAB (Mặc định đang ở Tab Sổ Địa Chỉ)
            ========================================================================= */}
        {activeTab === 'address' && (
          <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              
              {/* CỘT TRÁI: FORM THÊM ĐỊA CHỈ MỚI */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center gap-2 text-base font-bold text-[#d70018]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-900">Thêm địa chỉ mới</span>
                </div>

                <form className="space-y-3.5 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Họ tên
                      </label>
                      <input
                        type="text"
                        placeholder="Nhập họ tên"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#d70018] bg-slate-50/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        placeholder="Nhập số điện thoại"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#d70018] bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tỉnh/Thành phố
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#d70018] bg-slate-50/50 text-slate-600"
                      required
                    >
                      <option value="">-- Chọn Tỉnh/Thành phố --</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Quận/Huyện
                      </label>
                      <select
                        disabled
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-100 text-slate-400 cursor-not-allowed"
                      >
                        <option value="">-- Chọn Quận/Huyện --</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phường/Xã
                      </label>
                      <select
                        disabled
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-100 text-slate-400 cursor-not-allowed"
                      >
                        <option value="">-- Chọn Phường/Xã --</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Địa chỉ chi tiết
                    </label>
                    <input
                      type="text"
                      placeholder="Số nhà, tên đường, tòa nhà..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#d70018] bg-slate-50/50"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="addrDefault"
                      className="w-4 h-4 rounded border-slate-300 text-[#d70018] accent-[#d70018] cursor-pointer"
                    />
                    <label htmlFor="addrDefault" className="text-xs text-slate-600 select-none cursor-pointer">
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 rounded-xl bg-[#d70018] text-white font-bold text-sm hover:bg-[#bf0015] active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span className="text-lg leading-none">+</span>
                    <span>Thêm địa chỉ</span>
                  </button>
                </form>
              </div>

              {/* CỘT PHẢI: DANH SÁCH ĐỊA CHỈ */}
              <div className="lg:col-span-6 space-y-4 flex flex-col justify-start">
                <div className="flex items-center gap-2 text-base font-bold text-[#d70018]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-slate-900">Danh sách địa chỉ của bạn</span>
                </div>

                {/* Empty State: Icon vị trí + Text thông báo đúng ảnh mẫu */}
                <div className="w-full flex-1 min-h-[340px] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-3.5">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Chưa có địa chỉ nào
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Thêm địa chỉ giao hàng ở bên trái nhé!
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}