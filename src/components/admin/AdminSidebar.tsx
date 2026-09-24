'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export interface AdminNavItem {
  id: string;
  name: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
}

interface AdminSidebarProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
}

function AdminSidebarContent({ activeSection, onSelectSection }: AdminSidebarProps) {
  const searchParams = useSearchParams();
  const currentSection = activeSection || searchParams.get('section') || 'brands';

  const NAV_ITEMS: AdminNavItem[] = [
    {
      id: 'overview',
      name: 'Thống kê',
      href: '/dashboard?section=overview',
      icon: (active) => (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-[#b80012]' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'users',
      name: 'Người dùng',
      href: '/dashboard?section=users',
      icon: (active) => (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-[#b80012]' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'orders',
      name: 'Đơn hàng',
      href: '/dashboard?section=orders',
      icon: (active) => (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-[#b80012]' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      id: 'vietqr',
      name: 'VietQR',
      href: '/dashboard?section=vietqr',
      icon: (active) => (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-[#b80012]' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
    },
    {
      id: 'vouchers',
      name: 'Voucher',
      href: '/dashboard?section=vouchers',
      icon: (active) => (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-[#b80012]' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
    },
    {
      id: 'brands',
      name: 'Quản lý hãng',
      href: '/dashboard?section=brands',
      icon: (active) => (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-[#b80012]' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'products',
      name: 'Quản lý sản phẩm',
      href: '/dashboard?section=products',
      icon: (active) => (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-[#b80012]' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'media',
      name: 'Ảnh banner',
      href: '/dashboard?section=media',
      icon: (active) => (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-[#b80012]' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'reviews',
      name: 'Đánh giá',
      href: '/dashboard?section=reviews',
      icon: (active) => (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-[#b80012]' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      id: 'blogs',
      name: 'Blog',
      href: '/dashboard?section=blogs',
      icon: (active) => (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-[#b80012]' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
    {
      id: 'hotsale',
      name: 'Hot sale',
      href: '/dashboard?section=hotsale',
      icon: (active) => (
        <svg className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-[#b80012]' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-full md:w-56 lg:w-60 shrink-0 bg-white border-r border-slate-100 min-h-screen p-4 flex flex-col justify-between font-['Signika',sans-serif]">
      <div className="space-y-3">

        {/* Danh sách Menu dọc */}
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-slate-50 text-[#b80012] font-bold border-l-2 border-[#b80012] pl-2.5'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50/80 font-medium'
                }`}
              >
                {item.icon(isActive)}
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Về trang chủ */}
      <div className="pt-3 border-t border-slate-100 mt-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold transition"
        >
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Về trang chủ</span>
        </Link>
      </div>
    </aside>
  );
}

export default function AdminSidebar(props: AdminSidebarProps) {
  return (
    <Suspense
      fallback={
        <aside className="w-full md:w-56 shrink-0 bg-white border-r border-slate-200 p-4 min-h-[calc(100vh-80px)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-5 bg-slate-100 rounded w-2/3 animate-pulse"></div>
            <div className="space-y-2 pt-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 bg-slate-100 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </aside>
      }
    >
      <AdminSidebarContent {...props} />
    </Suspense>
  );
}

