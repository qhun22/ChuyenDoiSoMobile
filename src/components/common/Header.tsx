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
      {/* ================= THANH HEADER MOBILE ================= */}
      <div className="flex md:hidden items-center justify-between px-3 py-2 border-b border-slate-100">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-1.5 text-2xl text-slate-700"
          aria-label="Mở menu"
        >
          <i className="ri-menu-line"></i>
        </button>
        <Link href="/" className="relative h-9 w-32">
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
          className="p-1.5 text-2xl text-slate-700"
          aria-label="Tìm kiếm"
        >
          <i className="ri-search-line"></i>
        </button>
      </div>

      {/* ================= THANH HEADER PC ================= */}
      <div className="hidden md:block border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="relative h-10 w-44 shrink-0">
            <Image
              src="/logos/sean.gif"
              alt="QHUN22 Mobile"
              fill
              className="object-contain"
              priority
            />
          </Link>

          {/* Form tìm kiếm PC + Autocomplete */}
          <div ref={searchBoxRef} className="relative flex-1 max-w-xl">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && setShowPcDropdown(true)}
                placeholder="Nhập sản phẩm mà bạn muốn tìm..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-11 text-sm outline-none transition focus:border-red-600 focus:bg-white"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600"
                aria-label="Tìm kiếm"
              >
                <i className="ri-search-line text-lg"></i>
              </button>
            </form>

            {/* Dropdown gợi ý sản phẩm PC */}
            {showPcDropdown && pcSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-slate-100 bg-white p-3 shadow-xl z-50 max-h-96 overflow-y-auto">
                <div className="text-xs font-bold uppercase text-slate-400 mb-2">Sản phẩm gợi ý</div>
                {pcSuggestions.map((item) => (
                  <Link
                    key={item.id || item.slug}
                    href={`/products/${item.slug}`}
                    onClick={() => setShowPcDropdown(false)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition"
                  >
                    <div className="relative h-10 w-10 shrink-0 bg-slate-100 rounded overflow-hidden">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill className="object-contain" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">{item.name}</div>
                      {item.brand && <div className="text-[11px] text-slate-400">{item.brand}</div>}
                    </div>
                    {item.price && item.price > 0 && (
                      <div className="text-xs font-bold text-red-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 4 Icon Actions */}
          <div className="flex items-center gap-5 text-slate-700">
            {/* Yêu thích */}
            <Link href="/profile" className="flex items-center gap-2 hover:text-red-600 transition">
              <div className="relative text-2xl">
                <i className="ri-heart-line"></i>
                <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {counts.wishlist}
                </span>
              </div>
              <div className="text-xs leading-tight">
                <span className="block text-slate-400">Danh Sách</span>
                <span className="font-semibold">Yêu thích</span>
              </div>
            </Link>

            {/* Giỏ hàng */}
            <Link href="/cart" className="flex items-center gap-2 hover:text-red-600 transition">
              <div className="relative text-2xl">
                <i className="ri-shopping-cart-2-line"></i>
                <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {counts.cart}
                </span>
              </div>
              <div className="text-xs leading-tight">
                <span className="block text-slate-400">Thanh Toán</span>
                <span className="font-semibold">Giỏ hàng</span>
              </div>
            </Link>

            {/* Tra cứu đơn */}
            <Link href="/checkout" className="flex items-center gap-2 hover:text-red-600 transition">
              <div className="relative text-2xl">
                <i className="ri-file-list-3-line"></i>
                <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {counts.order}
                </span>
              </div>
              <div className="text-xs leading-tight">
                <span className="block text-slate-400">Kiểm tra</span>
                <span className="font-semibold">Tra cứu đơn</span>
              </div>
            </Link>

            {/* Tài khoản */}
            <Link href="/login" className="flex items-center gap-2 hover:text-red-600 transition">
              <div className="text-2xl">
                <i className="ri-user-3-line"></i>
              </div>
              <div className="text-xs leading-tight">
                <span className="block text-slate-400">Xin chào</span>
                <span className="font-semibold">Đăng nhập</span>
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
                <div className="relative h-8 w-28">
                  <Image src="/logos/sean.gif" alt="QHUN22" fill className="object-contain" />
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-2xl text-slate-500">
                  <i className="ri-close-line"></i>
                </button>
              </div>

              <div className="py-3 text-sm text-slate-500">
                Xin chào, <strong className="text-slate-800">Khách</strong>
              </div>

              <nav className="space-y-1 text-sm font-medium">
                <Link
                  href="/"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-50"
                >
                  <i className="ri-home-5-line text-lg"></i> Trang chủ
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-50"
                >
                  <i className="ri-shopping-cart-2-line text-lg"></i> Giỏ hàng
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-50"
                >
                  <i className="ri-file-list-3-line text-lg"></i> Tra cứu đơn
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-50"
                >
                  <i className="ri-login-box-line text-lg"></i> Đăng nhập
                </Link>
              </nav>
            </div>

            <div className="text-xs text-slate-400 border-t pt-4">
              Hotline hỗ trợ: <a href="tel:0327221005" className="text-red-600 font-bold">032.722.1005</a>
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE SEARCH PANEL (LIVE SEARCH) ================= */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col h-full">
          <div className="flex items-center gap-2 border-b p-3">
            <button onClick={() => setIsSearchOpen(false)} className="text-2xl text-slate-600 p-1">
              <i className="ri-arrow-left-line"></i>
            </button>
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center">
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập sản phẩm bạn cần tìm..."
                className="w-full text-sm outline-none px-2"
              />
              <button type="submit" className="text-xl text-slate-600 p-1">
                <i className="ri-search-2-line"></i>
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Nếu đang gõ có kết quả */}
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
                          <div className="text-[11px] font-bold text-red-600">
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
              /* Khi chưa gõ: Hiện Lịch sử & Xu hướng */
              <div className="space-y-6">
                {/* Lịch sử tìm kiếm */}
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
                            <i className="ri-history-line text-slate-400"></i> {rec}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => removeRecent(e, rec)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Xu hướng */}
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
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                      >
                        <i className="ri-fire-line text-red-500 mr-1"></i> {tag}
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