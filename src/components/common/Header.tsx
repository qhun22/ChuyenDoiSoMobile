'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface SuggestionItem {
  id?: number;
  name: string;
  slug?: string;
  image?: string;
  brand?: string;
  price?: number;
}

const RECENT_KEY = 'qhMobRecentSearches';
const MAX_RECENT = 8;

export default function Header() {
  const router = useRouter();

  // State Drawer & Search Panel Mobile
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // Search PC & Mobile
  const [query, setQuery] = useState('');
  const [pcSuggestions, setPcSuggestions] = useState<SuggestionItem[]>([]);
  const [showPcDropdown, setShowPcDropdown] = useState(false);
  const [mobLiveResults, setMobLiveResults] = useState<SuggestionItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Badges
  const [counts] = useState({
    wishlist: 0,
    cart: 0,
    order: 0,
  });

  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUserName = () => {
      try {
        const storedUser = localStorage.getItem('user_info');
        if (!storedUser) {
          setUserName(null);
          return;
        }

        const user = JSON.parse(storedUser) as { name?: string; full_name?: string; email?: string };
        const displayName = user.name || user.full_name || user.email || '';
        setUserName(displayName ? displayName.toUpperCase() : null);
      } catch {
        setUserName(null);
      }
    };

    loadUserName();
    window.addEventListener('auth-state-changed', loadUserName);
    window.addEventListener('storage', loadUserName);

    return () => {
      window.removeEventListener('auth-state-changed', loadUserName);
      window.removeEventListener('storage', loadUserName);
    };
  }, []);

  // Đọc lịch sử tìm kiếm từ LocalStorage
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      setRecentSearches(data);
    } catch {
      setRecentSearches([]);
    }
  }, []);

  const saveRecent = (q: string) => {
    if (!q || q.length < 2) return;
    const filtered = recentSearches.filter((item) => item !== q);
    const updated = [q, ...filtered].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const removeRecent = (e: React.MouseEvent, q: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item !== q);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  // Autocomplete fetcher
  useEffect(() => {
    if (query.trim().length < 2) {
      setPcSuggestions([]);
      setMobLiveResults([]);
      setShowPcDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/products/?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          const items = (data.results || data.items || []).map((p: any) => ({
            id: p.id,
            name: p.title || p.name,
            slug: p.slug,
            image: p.featured_image || p.image,
            brand: p.brand_name || '',
            price: p.base_price || p.price || 0,
          }));
          setPcSuggestions(items);
          setMobLiveResults(items);
          setShowPcDropdown(true);
        }
      } catch {
        setPcSuggestions([]);
        setMobLiveResults([]);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside để đóng autocomplete PC
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowPcDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveRecent(query.trim());
    setShowPcDropdown(false);
    setIsSearchOpen(false);
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm font-['Signika',sans-serif]">
      {/* ================= THANH HEADER MOBILE (<= 768px) ================= */}
      <div className="flex md:hidden items-center justify-between px-3 py-2 border-b border-slate-100">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-1.5 text-slate-700"
          aria-label="Mở menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/" className="relative h-10 w-36">
          <Image
            src="/logos/sean.gif"
            alt="QHUN22 Mobile"
            fill
            className="object-contain"
            priority
          />
        </Link>
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-1.5 text-slate-700"
          aria-label="Tìm kiếm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* ================= THANH HEADER PC (> 768px) ================= */}
      <div className="hidden md:block border-b border-gray-100 py-2.5 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 flex items-center justify-between gap-6">
          
          {/* 1. Logo shop */}
          <Link href="/" className="relative h-11 w-44 shrink-0 flex items-center">
            <Image
              src="/logos/sean.gif"
              alt="QHUN22 Mobile"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>

          {/* 2. Ô tìm kiếm chuẩn gọn */}
          <div ref={searchBoxRef} className="relative w-[500px] shrink-0">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center rounded-xl border-2 border-[#b8001f] bg-white overflow-hidden shadow-xs h-10"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && setShowPcDropdown(true)}
                placeholder="Nhập sản phẩm mà bạn muốn tìm..."
                className="w-full px-4 text-[13px] text-slate-800 placeholder:text-gray-400 outline-none bg-transparent"
                autoComplete="off"
              />
              <button
                type="submit"
                className="bg-[#b8001f] hover:bg-[#99001a] h-full px-5 text-white flex items-center justify-center transition shrink-0 cursor-pointer"
                aria-label="Tìm kiếm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* Dropdown gợi ý autocomplete PC */}
            {showPcDropdown && pcSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50 max-h-96 overflow-y-auto">
                <div className="text-xs font-bold uppercase text-slate-400 mb-2 px-1">Sản phẩm gợi ý</div>
                {pcSuggestions.map((item) => (
                  <Link
                    key={item.id || item.slug}
                    href={`/products/${item.slug}`}
                    onClick={() => setShowPcDropdown(false)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition"
                  >
                    <div className="relative h-11 w-11 shrink-0 bg-slate-100 rounded overflow-hidden">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill className="object-contain" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">{item.name}</div>
                      {item.brand && <div className="text-[11px] text-slate-400">{item.brand}</div>}
                    </div>
                    {item.price && item.price > 0 && (
                      <div className="text-xs font-bold text-[#b8001f]">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 3. 4 Nút chức năng bên phải */}
          <div className="flex items-center gap-8 text-gray-700 shrink-0 select-none">
            {/* 1. Yêu thích */}
            <Link href="/profile" className="flex items-center gap-2 hover:text-[#b8001f] transition group">
              <div className="relative leading-none text-gray-700 group-hover:text-[#b8001f]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-[#b8001f] text-[9px] font-bold text-white leading-none">
                  {counts.wishlist}
                </span>
              </div>
              <div className="text-[11px] leading-tight">
                <span className="block text-gray-400 font-normal">Danh Sách</span>
                <span className="font-bold text-gray-700 group-hover:text-[#b8001f]">Yêu thích</span>
              </div>
            </Link>

            {/* 2. Giỏ hàng */}
            <Link href="/cart" className="flex items-center gap-2 hover:text-[#b8001f] transition group">
              <div className="relative leading-none text-gray-700 group-hover:text-[#b8001f]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-[#b8001f] text-[9px] font-bold text-white leading-none">
                  {counts.cart}
                </span>
              </div>
              <div className="text-[11px] leading-tight">
                <span className="block text-gray-400 font-normal">Thanh Toán</span>
                <span className="font-bold text-gray-700 group-hover:text-[#b8001f]">Giỏ hàng</span>
              </div>
            </Link>

            {/* 3. Tra cứu đơn */}
            <Link href="/checkout" className="flex items-center gap-2 hover:text-[#b8001f] transition group">
              <div className="relative leading-none text-gray-700 group-hover:text-[#b8001f]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-[#b8001f] text-[9px] font-bold text-white leading-none">
                  {counts.order}
                </span>
              </div>
              <div className="text-[11px] leading-tight">
                <span className="block text-gray-400 font-normal">Kiểm tra</span>
                <span className="font-bold text-gray-700 group-hover:text-[#b8001f]">Tra cứu đơn</span>
              </div>
            </Link>

            {/* 4. Đăng nhập - Trỏ thẳng về /login */}
            <Link href={userName ? '/profile' : '/login'} className="flex items-center gap-2 hover:text-[#b8001f] transition group cursor-pointer">
              <div className="leading-none text-gray-700 group-hover:text-[#b8001f]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-[11px] leading-tight">
                <span className="block text-gray-400 font-normal">Xin chào</span>
                <span className="font-bold text-gray-700 group-hover:text-[#b8001f]">{userName || 'Đăng nhập'}</span>
              </div>
            </Link>
          </div>

        </div>
      </div>

      {/* ================= MOBILE DRAWER TRƯỢT TỪ TRÁI ================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85%] bg-white p-5 shadow-2xl flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between border-b pb-4">
                <div className="relative h-9 w-32">
                  <Image src="/logos/sean.gif" alt="QHUN22" fill className="object-contain" />
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-slate-500 p-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="py-3 text-sm text-slate-500">
                Xin chào, <strong className="text-slate-800">{userName || 'Khách'}</strong>
              </div>

              <nav className="space-y-1 text-sm font-medium">
                <Link
                  href="/"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Trang chủ
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Giỏ hàng
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Tra cứu đơn
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Đăng nhập
                </Link>
              </nav>
            </div>

            <div className="text-xs text-slate-400 border-t pt-4">
              Hotline hỗ trợ: <a href="tel:0327221005" className="text-[#b8001f] font-bold">032.722.1005</a>
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE SEARCH PANEL ================= */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col h-full">
          <div className="flex items-center gap-2 border-b p-3">
            <button onClick={() => setIsSearchOpen(false)} className="text-slate-600 p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center">
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập sản phẩm bạn cần tìm..."
                className="w-full text-sm outline-none px-2 text-slate-800"
              />
              <button type="submit" className="text-[#b8001f] p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {query.length >= 2 ? (
              <div>
                <div className="text-xs font-bold uppercase text-slate-400 mb-2">Kết quả tìm kiếm</div>
                {mobLiveResults.length > 0 ? (
                  mobLiveResults.map((item) => (
                    <Link
                      key={item.id || item.slug}
                      href={`/products/${item.slug}`}
                      onClick={() => {
                        saveRecent(item.name);
                        setIsSearchOpen(false);
                      }}
                      className="flex items-center gap-3 py-2.5 border-b border-slate-50"
                    >
                      <div className="relative h-10 w-10 shrink-0 bg-slate-100 rounded">
                        {item.image && (
                          <Image src={item.image} alt={item.name} fill className="object-contain" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate">{item.name}</div>
                        {item.price && item.price > 0 && (
                          <div className="text-[11px] font-bold text-[#b8001f]">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 py-4 text-center">Không tìm thấy sản phẩm nào</div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="text-xs font-bold uppercase text-slate-400 mb-2">Tìm kiếm gần đây</div>
                    <ul className="divide-y divide-slate-100">
                      {recentSearches.map((rec, i) => (
                        <li
                          key={i}
                          onClick={() => {
                            setQuery(rec);
                            router.push(`/products?q=${encodeURIComponent(rec)}`);
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center justify-between py-2 text-xs text-slate-700 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {rec}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => removeRecent(e, rec)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold uppercase text-slate-400 mb-2">Xu hướng tìm kiếm</div>
                  <div className="flex flex-wrap gap-2">
                    {['iPhone 17', 'Samsung Galaxy S25', 'Xiaomi', 'RedMagic', 'OPPO'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setQuery(tag);
                          saveRecent(tag);
                          setIsSearchOpen(false);
                          router.push(`/products?q=${encodeURIComponent(tag)}`);
                        }}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span className="text-red-500">🔥</span> {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}