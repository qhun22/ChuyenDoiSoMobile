'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { ProductItemData } from '@/components/product/mock-products';

export interface Brand {
  name: string;
  slug: string;
}

export interface ProductItem {
  id: number | string;
  name: string;
  slug: string;
  image?: string;
  price: number;
  original_price?: number;
  discount_percent?: number;
  stock?: number;
  brand?: string;
  os?: string;
  rom?: string;
  connections?: string[];
  battery?: string;
  network?: string[];
  ram?: string;
  memory_card?: string;
  screen_size?: string;
  screen_standard?: string[];
  refresh_rate?: string[];
  camera?: string[];
  special?: string[];
}

interface ProductFilterGridProps {
  brands?: Brand[];
  products?: ProductItem[];
}

function formatVND(amount?: number) {
  if (amount === undefined || amount === null) return '';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

export default function ProductFilterGrid({
  brands = [
    { name: 'Apple', slug: 'iphone' },
    { name: 'Samsung', slug: 'samsung' },
    { name: 'Xiaomi', slug: 'xiaomi' },
    { name: 'OPPO', slug: 'oppo' },
    { name: 'Vivo', slug: 'vivo' },
    { name: 'Realme', slug: 'realme' },
    { name: 'Honor', slug: 'honor' },
    { name: 'Red Magic', slug: 'redmagic' },
    { name: 'Tecno', slug: 'tecno' },
    { name: 'Benco', slug: 'benco' },
  ],
  products = [],
}: ProductFilterGridProps) {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedSortPrice, setSelectedSortPrice] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Toàn bộ 12 nhóm thông số lọc nâng cao
  const [advFilters, setAdvFilters] = useState<{
    os: string[];
    rom: string[];
    connections: string[];
    battery: string;
    network: string[];
    ram: string[];
    memory_card: string;
    screen_size: string;
    screen_standard: string[];
    refresh_rate: string[];
    camera: string[];
    special: string[];
  }>({
    os: [],
    rom: [],
    connections: [],
    battery: 'all',
    network: [],
    ram: [],
    memory_card: 'all',
    screen_size: 'all',
    screen_standard: [],
    refresh_rate: [],
    camera: [],
    special: [],
  });

  const handleCheckboxToggle = (group: keyof typeof advFilters, value: string) => {
    setAdvFilters((prev) => {
      const currentList = prev[group] as string[];
      const exists = currentList.includes(value);
      return {
        ...prev,
        [group]: exists ? currentList.filter((v) => v !== value) : [...currentList, value],
      };
    });
  };

  const handleResetFilters = () => {
    setSelectedBrand('');
    setSelectedPriceRange('');
    setSelectedSortPrice('');
    setAdvFilters({
      os: [],
      rom: [],
      connections: [],
      battery: 'all',
      network: [],
      ram: [],
      memory_card: 'all',
      screen_size: 'all',
      screen_standard: [],
      refresh_rate: [],
      camera: [],
      special: [],
    });
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedBrand) {
      result = result.filter(
        (p) => p.brand?.toLowerCase() === selectedBrand.toLowerCase() || p.slug.includes(selectedBrand)
      );
    }

    if (selectedPriceRange) {
      const [min, max] = selectedPriceRange.split('-').map(Number);
      result = result.filter((p) => {
        const million = p.price / 1_000_000;
        return million >= min && million <= max;
      });
    }

    if (advFilters.os.length > 0) {
      result = result.filter((p) => p.os && advFilters.os.includes(p.os));
    }
    if (advFilters.rom.length > 0) {
      result = result.filter((p) => p.rom && advFilters.rom.includes(p.rom));
    }
    if (advFilters.ram.length > 0) {
      result = result.filter((p) => p.ram && advFilters.ram.includes(p.ram));
    }

    if (selectedSortPrice === 'asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (selectedSortPrice === 'desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedBrand, selectedPriceRange, selectedSortPrice, advFilters]);

  return (
    <div className="w-full max-w-[1250px] mx-auto px-2 sm:px-4 my-8 font-['Signika',sans-serif]">
      {/* =========================================================================
          1. TIÊU ĐỀ SẢN PHẨM NỔI BẬT: CHUẨN CẤU TRÚC SHIMMER & LINE NHƯ BRANDSCROLL
          ========================================================================= */}
      <div className="flex items-center justify-center gap-3 my-6 -translate-y-[6px]">
        {/* Line mảnh mờ bên trái */}
        <div className="h-[1.5px] w-10 sm:w-16 bg-gradient-to-r from-transparent to-slate-400/40 rounded-full" />

        {/* Chữ đen tím nhẹ quét sáng */}
        <span className="relative text-base sm:text-xl font-extrabold uppercase tracking-widest bg-gradient-to-r from-slate-900 via-purple-700 to-slate-900 bg-[length:200%_auto] bg-clip-text text-transparent animate-text-shimmer select-none cursor-default">
          SẢN PHẨM NỔI BẬT
        </span>

        {/* Line mảnh mờ bên phải */}
        <div className="h-[1.5px] w-10 sm:w-16 bg-gradient-to-l from-transparent to-slate-400/40 rounded-full" />
      </div>

      {/* =========================================================================
          2. THANH BỘ LỌC DÀN ĐỀU MỘT HÀNG
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.06)] p-3 sm:p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full">
          {/* 3 SELECT DÀN ĐỀU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
            {/* Hãng */}
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full h-11 pl-4 pr-9 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
              >
                <option value="">Tất cả hãng</option>
                {brands.map((brand) => (
                  <option key={brand.slug} value={brand.slug}>
                    {brand.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Mức giá */}
            <div className="relative">
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full h-11 pl-4 pr-9 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
              >
                <option value="">Tất cả mức giá</option>
                <option value="0-2">Dưới 2 triệu</option>
                <option value="2-4">Từ 2 - 4 triệu</option>
                <option value="4-7">Từ 4 - 7 triệu</option>
                <option value="7-13">Từ 7 - 13 triệu</option>
                <option value="13-20">Từ 13 - 20 triệu</option>
                <option value="20-999">Trên 20 triệu</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Sắp xếp */}
            <div className="relative">
              <select
                value={selectedSortPrice}
                onChange={(e) => setSelectedSortPrice(e.target.value)}
                className="w-full h-11 pl-4 pr-9 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
              >
                <option value="">Mặc định</option>
                <option value="asc">Thấp tới cao</option>
                <option value="desc">Cao tới thấp</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* 2 Nút Lọc nâng cao & Reset */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 h-11 px-5 rounded-xl bg-[#c00015] hover:bg-[#a60012] text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 01.8 1.6L14 13v5a1 1 0 01-1.447.894l-2-1A1 1 0 0110 17v-4L3.2 4.6A1 1 0 013 4z" />
              </svg>
              <span>Lọc nâng cao</span>
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. DANH SÁCH CARD SẢN PHẨM (CHUẨN 5 CỘT RESPONSIVE)
          ========================================================================= */}
      {filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredProducts.map((product) => {
            const cardData: ProductItemData = {
              id: product.id,
              name: product.name,
              slug: product.slug,
              brand: product.brand,
              image: product.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=80',
              price: Number(product.price) || 0,
              original_price: Number(product.original_price) || 0,
              discount_percent: Number(product.discount_percent) || 0,
              stock: product.stock !== undefined && product.stock !== null ? Number(product.stock) : 0,
              inStock: (product.stock !== undefined && product.stock !== null) ? Number(product.stock) > 0 : Boolean(product.inStock),
              installment0: true,
            };

            return (
              <ProductCard
                key={product.id}
                product={cardData}
              />
            );
          })}
        </div>
      ) : (
        <div className="w-full py-16 text-center text-slate-500 font-medium text-sm bg-white rounded-2xl border border-slate-200">
          Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
        </div>
      )}

      {/* =========================================================================
          4. SLIDE-OVER DRAWER: ĐẦY ĐỦ 12 MỤC THÔNG SỐ (CARD VIỀN RIÊNG BIỆT)
          ========================================================================= */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-[#f8fafc] z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header Drawer */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h3 className="font-black text-slate-800 tracking-wide text-sm sm:text-base">
              HÃY CHỌN THÔNG SỐ
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body Drawer: 12 card riêng biệt */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
          {/* 1. Hệ điều hành */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
            <h4 className="font-bold text-slate-800 text-sm">Hệ điều hành</h4>
            <div className="space-y-2">
              {[
                { label: 'iOS', val: 'ios' },
                { label: 'Android', val: 'android' },
              ].map((item) => (
                <label key={item.val} className="flex items-center gap-2.5 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={advFilters.os.includes(item.val)}
                    onChange={() => handleCheckboxToggle('os', item.val)}
                    className="w-4 h-4 rounded border-slate-300 text-[#c00015] focus:ring-[#c00015] cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 2. Dung lượng ROM */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
            <h4 className="font-bold text-slate-800 text-sm">Dung lượng ROM</h4>
            <div className="space-y-2">
              {[
                { label: '≤128 GB', val: 'lte128' },
                { label: '256 GB', val: '256' },
                { label: '512 GB', val: '512' },
                { label: '1 TB', val: '1tb' },
              ].map((item) => (
                <label key={item.val} className="flex items-center gap-2.5 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={advFilters.rom.includes(item.val)}
                    onChange={() => handleCheckboxToggle('rom', item.val)}
                    className="w-4 h-4 rounded border-slate-300 text-[#c00015] focus:ring-[#c00015] cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Kết nối */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
            <h4 className="font-bold text-slate-800 text-sm">Kết nối</h4>
            <div className="space-y-2">
              {[
                { label: 'NFC', val: 'nfc' },
                { label: 'Bluetooth', val: 'bluetooth' },
                { label: 'Hồng ngoại', val: 'infrared' },
              ].map((item) => (
                <label key={item.val} className="flex items-center gap-2.5 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={advFilters.connections.includes(item.val)}
                    onChange={() => handleCheckboxToggle('connections', item.val)}
                    className="w-4 h-4 rounded border-slate-300 text-[#c00015] focus:ring-[#c00015] cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Hiệu năng và Pin */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
            <h4 className="font-bold text-slate-800 text-sm">Hiệu năng và Pin</h4>
            <div className="space-y-2">
              {[
                { label: 'Tất cả', val: 'all' },
                { label: 'Dưới 3000 mAh', val: 'lt3000' },
                { label: 'Pin từ 3000 - 4000 mAh', val: '3000_4000' },
                { label: 'Pin từ 4000 - 5500 mAh', val: '4000_5500' },
                { label: 'Pin trâu: trên 5500 mAh', val: 'gt5500' },
              ].map((item) => (
                <label key={item.val} className="flex items-center gap-2.5 cursor-pointer text-slate-700 select-none">
                  <input
                    type="radio"
                    name="battery"
                    value={item.val}
                    checked={advFilters.battery === item.val}
                    onChange={(e) => setAdvFilters((prev) => ({ ...prev, battery: e.target.value }))}
                    className="w-4 h-4 text-[#c00015] border-slate-300 focus:ring-[#c00015] cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 5. Hỗ trợ mạng */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
            <h4 className="font-bold text-slate-800 text-sm">Hỗ trợ mạng</h4>
            <div className="space-y-2">
              {[
                { label: '5G', val: '5g' },
                { label: '4G', val: '4g' },
              ].map((item) => (
                <label key={item.val} className="flex items-center gap-2.5 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={advFilters.network.includes(item.val)}
                    onChange={() => handleCheckboxToggle('network', item.val)}
                    className="w-4 h-4 rounded border-slate-300 text-[#c00015] focus:ring-[#c00015] cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 6. RAM */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
            <h4 className="font-bold text-slate-800 text-sm">RAM</h4>
            <div className="space-y-2">
              {['16', '12', '8', '6', '4', '3'].map((val) => (
                <label key={val} className="flex items-center gap-2.5 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={advFilters.ram.includes(val)}
                    onChange={() => handleCheckboxToggle('ram', val)}
                    className="w-4 h-4 rounded border-slate-300 text-[#c00015] focus:ring-[#c00015] cursor-pointer"
                  />
                  <span>{val} GB</span>
                </label>
              ))}
            </div>
          </div>

          {/* 7. Thẻ nhớ */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
            <h4 className="font-bold text-slate-800 text-sm">Thẻ nhớ</h4>
            <div className="space-y-2">
              {[
                { label: 'Tất cả', val: 'all' },
                { label: 'MicroSD', val: 'microsd' },
                { label: 'Không', val: 'none' },
              ].map((item) => (
                <label key={item.val} className="flex items-center gap-2.5 cursor-pointer text-slate-700 select-none">
                  <input
                    type="radio"
                    name="memory_card"
                    value={item.val}
                    checked={advFilters.memory_card === item.val}
                    onChange={(e) => setAdvFilters((prev) => ({ ...prev, memory_card: e.target.value }))}
                    className="w-4 h-4 text-[#c00015] border-slate-300 focus:ring-[#c00015] cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 8. Màn hình */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
            <h4 className="font-bold text-slate-800 text-sm">Màn hình</h4>
            <div className="space-y-2">
              {[
                { label: 'Tất cả', val: 'all' },
                { label: 'Màn hình nhỏ', val: 'small' },
                { label: 'Từ 5 - 6.5 inch', val: '5_65' },
                { label: 'Từ 6.5 - 6.8 inch', val: '65_68' },
                { label: 'Trên 6.8 inch', val: 'gt68' },
              ].map((item) => (
                <label key={item.val} className="flex items-center gap-2.5 cursor-pointer text-slate-700 select-none">
                  <input
                    type="radio"
                    name="screen_size"
                    value={item.val}
                    checked={advFilters.screen_size === item.val}
                    onChange={(e) => setAdvFilters((prev) => ({ ...prev, screen_size: e.target.value }))}
                    className="w-4 h-4 text-[#c00015] border-slate-300 focus:ring-[#c00015] cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 9. Chuẩn màn hình */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
            <h4 className="font-bold text-slate-800 text-sm">Chuẩn màn hình</h4>
            <div className="space-y-2">
              {[
                { label: 'Retina (iPhone)', val: 'retina' },
                { label: '2K/2K+', val: '2k' },
                { label: '1.5K', val: '1_5k' },
                { label: 'FHD/FHD+', val: 'fhd' },
                { label: 'HD/HD+', val: 'hd' },
                { label: 'QXGA', val: 'qxga' },
                { label: 'QQVGA/QVGA', val: 'qvga' },
              ].map((item) => (
                <label key={item.val} className="flex items-center gap-2.5 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={advFilters.screen_standard.includes(item.val)}
                    onChange={() => handleCheckboxToggle('screen_standard', item.val)}
                    className="w-4 h-4 rounded border-slate-300 text-[#c00015] focus:ring-[#c00015] cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 10. Tần số quét */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
            <h4 className="font-bold text-slate-800 text-sm">Tần số quét</h4>
            <div className="space-y-2">
              {[
                { label: 'Trên 144 Hz', val: 'gt144' },
                { label: '120 Hz', val: '120' },
                { label: '90 Hz', val: '90' },
                { label: '60 Hz', val: '60' },
              ].map((item) => (
                <label key={item.val} className="flex items-center gap-2.5 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={advFilters.refresh_rate.includes(item.val)}
                    onChange={() => handleCheckboxToggle('refresh_rate', item.val)}
                    className="w-4 h-4 rounded border-slate-300 text-[#c00015] focus:ring-[#c00015] cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 11. Camera */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
            <h4 className="font-bold text-slate-800 text-sm">Camera</h4>
            <div className="space-y-2">
              {[
                { label: 'Tất cả', val: 'all' },
                { label: 'Quay phim Slow Motion', val: 'slowmo' },
                { label: 'AI Camera', val: 'ai_camera' },
                { label: 'Hiệu ứng làm đẹp', val: 'beauty' },
                { label: 'Zoom quang học', val: 'optical_zoom' },
                { label: 'Chống rung OIS', val: 'ois' },
                { label: 'Chụp macro', val: 'macro' },
                { label: 'Chụp góc rộng', val: 'wide' },
                { label: 'Chụp xóa phông', val: 'portrait' },
              ].map((item) => (
                <label key={item.val} className="flex items-center gap-2.5 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={advFilters.camera.includes(item.val)}
                    onChange={() => handleCheckboxToggle('camera', item.val)}
                    className="w-4 h-4 rounded border-slate-300 text-[#c00015] focus:ring-[#c00015] cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 12. Tính năng đặc biệt */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
            <h4 className="font-bold text-slate-800 text-sm">Tính năng đặc biệt</h4>
            <div className="space-y-2">
              {[
                { label: 'Tất cả', val: 'all' },
                { label: 'Sạc không dây', val: 'wireless_charge' },
                { label: 'Sạc ngược cho thiết bị khác', val: 'reverse_charge' },
              ].map((item) => (
                <label key={item.val} className="flex items-center gap-2.5 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={advFilters.special.includes(item.val)}
                    onChange={() => handleCheckboxToggle('special', item.val)}
                    className="w-4 h-4 rounded border-slate-300 text-[#c00015] focus:ring-[#c00015] cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Drawer */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex-1 flex items-center justify-center gap-1.5 h-11 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 font-bold transition cursor-pointer"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Xóa lọc nâng cao</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="flex-1 flex items-center justify-center gap-1.5 h-11 bg-[#c00015] hover:bg-[#a60012] text-white rounded-xl font-bold transition cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>Áp dụng bộ lọc</span>
          </button>
        </div>
      </aside>
    </div>
  );
}