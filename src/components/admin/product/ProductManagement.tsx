'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { FEATURED_PRODUCTS, ProductItemData } from '@/components/product/mock-products';

export interface AdminProductItem {
  id: number | string;
  name: string;
  slug: string;
  brand: string;
  image: string;
  stock: number;
  original_price: number;
  price: number;
  discount_percent: number;
  inStock: boolean;
  specifications?: string;
  youtubeId?: string;
  skus?: string[];
  folders?: string[];
  variants?: {
    id: string;
    color: string;
    storage: string;
    original_price: number;
    price: number;
    discount_percent: number;
  }[];
  colorImages?: {
    id: string;
    folder: string;
    sku: string;
    colorName: string;
    imageUrl: string;
  }[];
  description?: string;
}

const DEFAULT_BRANDS = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'OPPO',
  'Vivo',
  'Realme',
  'Red Magic',
  'Honor',
  'Tecno',
  'Benco',
];

interface ProductManagementProps {
  onOpenDetail?: (product: AdminProductItem) => void;
}

export default function ProductManagement({ onOpenDetail }: ProductManagementProps) {
  // Chuyển đổi mock data sang state danh sách quản trị
  const [products, setProducts] = useState<AdminProductItem[]>(() => {
    return FEATURED_PRODUCTS.map((p, idx) => ({
      id: p.id || idx + 1,
      name: p.name,
      slug: p.slug,
      brand: p.brand ? p.brand.toUpperCase() : 'APPLE',
      image: p.image || '/icons/logo_iphone_ngang_eac93ff477.webp',
      stock: p.stock ?? (p.inStock ? 10 : 0),
      original_price: p.original_price,
      price: p.price,
      discount_percent: p.discount_percent || Math.round(((p.original_price - p.price) / p.original_price) * 100) || 0,
      inStock: p.inStock,
      specifications: JSON.stringify(
        {
          screen: p.screen_size ? `${p.screen_size} inch` : '6.1 inch OLED',
          chip: p.os === 'ios' ? 'Apple A16 / A17 Bionic' : 'Snapdragon 8 Gen 3',
          ram: p.ram ? `${p.ram} GB` : '8 GB',
          storage: p.rom ? `${p.rom.replace('lte', '')} GB` : '128 GB',
          battery: p.battery ? `${p.battery} mAh` : '4000 mAh',
        },
        null,
        2
      ),
      youtubeId: 'dQw4w9WgXcQ',
      skus: [`SKU-${p.id}-128G`, `SKU-${p.id}-256G`],
      folders: ['Mặt trước & Màn hình', 'Mặt lưng & Camera', 'Góc cạnh viền máy'],
      variants: [
        {
          id: '1',
          color: 'Titan Tự Nhiên',
          storage: '128GB',
          original_price: p.original_price,
          price: p.price,
          discount_percent: p.discount_percent,
        },
        {
          id: '2',
          color: 'Đen Không Gian',
          storage: '256GB',
          original_price: p.original_price + 2000000,
          price: p.price + 1800000,
          discount_percent: p.discount_percent,
        },
      ],
      colorImages: [
        {
          id: '1',
          folder: 'Mặt trước & Màn hình',
          sku: `SKU-${p.id}-128G`,
          colorName: 'Titan Tự Nhiên',
          imageUrl: p.image,
        },
      ],
      description: `<p><strong>${p.name}</strong> mang đến trải nghiệm đột phá với hiệu năng vượt trội, màn hình sắc nét và thời lượng pin ấn tượng cả ngày dài.</p>`,
    }));
  });

  const [brands, setBrands] = useState<string[]>(DEFAULT_BRANDS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock' | 'discount'>('all');

  // 3s loading timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form State (Chỉ giữ 3 trường: Hãng, Tên, Ảnh đại diện)
  const [currentProduct, setCurrentProduct] = useState<AdminProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<AdminProductItem | null>(null);
  const [formBrand, setFormBrand] = useState(DEFAULT_BRANDS[0]);
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load brands from API if available
  useEffect(() => {
    fetch('/api/brands')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setBrands(data.data.map((b: { name: string }) => b.name.toUpperCase()));
        }
      })
      .catch(() => {});
  }, []);


  // Lọc sản phẩm theo Search & Filter
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchBrand = !selectedBrandFilter || p.brand.toLowerCase() === selectedBrandFilter.toLowerCase();

      let matchStock = true;
      if (selectedStockFilter === 'in_stock') {
        matchStock = (p.stock ?? 0) > 0;
      } else if (selectedStockFilter === 'out_of_stock') {
        matchStock = (p.stock ?? 0) === 0;
      } else if (selectedStockFilter === 'discount') {
        matchStock = p.discount_percent > 0;
      }

      return matchSearch && matchBrand && matchStock;
    });
  }, [products, searchTerm, selectedBrandFilter, selectedStockFilter]);

  // Thống kê 5 Box
  const totalCount = products.length;
  const inStockCount = products.filter((p) => (p.stock ?? 0) > 0).length;
  const outOfStockCount = products.filter((p) => (p.stock ?? 0) === 0).length;
  const discountCount = products.filter((p) => p.discount_percent > 0).length;
  const filteredCount = filteredProducts.length;

  // Format tiền tệ VNĐ
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  // Reset bộ lọc
  const handleReset = () => {
    setSearchTerm('');
    setSelectedBrandFilter('');
    setSelectedStockFilter('all');
    toast.info('Đã đặt lại bộ lọc tìm kiếm');
  };

  // Mở Modal Thêm mới (Chỉ 3 trường: Hãng, Tên, Ảnh đại diện)
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setCurrentProduct(null);
    setFormBrand(brands[0] || 'APPLE');
    setFormName('');
    setFormImage('https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=80');
    setIsModalOpen(true);
  };

  // Mở Modal Chỉnh sửa nhanh
  const handleOpenEditModal = (p: AdminProductItem) => {
    setIsEditMode(true);
    setCurrentProduct(p);
    setFormBrand(p.brand);
    setFormName(p.name);
    setFormImage(p.image);
    setIsModalOpen(true);
  };

  // Xử lý upload ảnh mô phỏng
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setFormImage(fakeUrl);
      toast.success('Đã tải ảnh lên thành công');
    }
  };

  // Lưu Form Thêm / Sửa nhanh
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }

    const slug = formName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (isEditMode && currentProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === currentProduct.id
            ? {
                ...p,
                name: formName,
                slug,
                brand: formBrand,
                image: formImage || p.image,
              }
            : p
        )
      );
      toast.success(`Đã cập nhật sản phẩm "${formName}"`);
    } else {
      const defaultOriginalPrice = 17990000;
      const defaultPrice = 15990000;
      const discount = Math.round(((defaultOriginalPrice - defaultPrice) / defaultOriginalPrice) * 100);

      const newProduct: AdminProductItem = {
        id: Date.now(),
        name: formName,
        slug,
        brand: formBrand,
        price: defaultPrice,
        original_price: defaultOriginalPrice,
        stock: 10,
        inStock: true,
        discount_percent: discount,
        image: formImage || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=80',
        specifications: JSON.stringify({ screen: '6.1 inch', chip: 'Mới nhất', ram: '8 GB', storage: '128 GB' }, null, 2),
        youtubeId: '',
        skus: [`SKU-${Date.now()}`],
        folders: ['Ảnh chính', 'Mặt lưng'],
        variants: [
          {
            id: '1',
            color: 'Mặc định',
            storage: '128GB',
            original_price: defaultOriginalPrice,
            price: defaultPrice,
            discount_percent: discount,
          },
        ],
        colorImages: [],
        description: `<p>Mô tả chi tiết sản phẩm <strong>${formName}</strong>.</p>`,
      };
      setProducts((prev) => [newProduct, ...prev]);
      toast.success(`Đã thêm sản phẩm "${formName}"`);
    }

    setIsModalOpen(false);
  };

  // Mở modal xác nhận xóa
  const handleOpenDeleteModal = (p: AdminProductItem) => {
    setDeletingProduct(p);
    setIsDeleteModalOpen(true);
  };

  // Xác nhận xóa
  const handleConfirmDelete = () => {
    if (!deletingProduct) return;
    setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
    toast.success(`Đã xóa sản phẩm "${deletingProduct.name}"`);
    setIsDeleteModalOpen(false);
    setDeletingProduct(null);
  };

  return (
    <div className="w-full space-y-5 font-['Signika',sans-serif]">
      {/* 1. THANH TIÊU ĐỀ & TÁC VỤ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wide">
            Quản lý sản phẩm
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Quản lý thông tin, giá bán, kho hàng và biến thể chi tiết
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Ô Tìm kiếm Real-time */}
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="w-full h-8 px-3 pr-7 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#b80012] transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Lọc nhanh theo Hãng */}
          <select
            value={selectedBrandFilter}
            onChange={(e) => setSelectedBrandFilter(e.target.value)}
            className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-[#b80012] cursor-pointer"
          >
            <option value="">Tất cả hãng</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Nút Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="h-8 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </button>

          {/* Nút + Thêm sản phẩm */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer shrink-0"
          >
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* 2. 5 BOX THỐNG KÊ HÀNG NGANG (Gọn gàng p-3 text-xl font-bold) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
        {/* Box 1: Tổng số sản phẩm */}
        <div
          onClick={() => setSelectedStockFilter('all')}
          className={`p-3 rounded-xl border transition cursor-pointer ${
            selectedStockFilter === 'all'
              ? 'bg-white border-[#b80012] ring-1 ring-[#b80012]/30 shadow-xs'
              : 'bg-white border-slate-100 shadow-2xs hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng sản phẩm</span>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 leading-tight">{totalCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Toàn bộ kho hàng</p>
        </div>

        {/* Box 2: Đang bán (Còn hàng) */}
        <div
          onClick={() => setSelectedStockFilter('in_stock')}
          className={`p-3 rounded-xl border transition cursor-pointer ${
            selectedStockFilter === 'in_stock'
              ? 'bg-white border-[#b80012] ring-1 ring-[#b80012]/30 shadow-xs'
              : 'bg-white border-slate-100 shadow-2xs hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Đang bán (Còn hàng)</span>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 leading-tight">{inStockCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Sẵn sàng giao ngay</p>
        </div>

        {/* Box 3: Hết hàng */}
        <div
          onClick={() => setSelectedStockFilter('out_of_stock')}
          className={`p-3 rounded-xl border transition cursor-pointer ${
            selectedStockFilter === 'out_of_stock'
              ? 'bg-white border-[#b80012] ring-1 ring-[#b80012]/30 shadow-xs'
              : 'bg-white border-slate-100 shadow-2xs hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Hết hàng</span>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 leading-tight">{outOfStockCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Cần nhập thêm hàng</p>
        </div>

        {/* Box 4: Giảm giá / Khuyến mãi */}
        <div
          onClick={() => setSelectedStockFilter('discount')}
          className={`p-3 rounded-xl border transition cursor-pointer ${
            selectedStockFilter === 'discount'
              ? 'bg-white border-[#b80012] ring-1 ring-[#b80012]/30 shadow-xs'
              : 'bg-white border-slate-100 shadow-2xs hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Giảm giá / Ưu đãi</span>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 leading-tight">{discountCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Đang chạy khuyến mãi</p>
        </div>

        {/* Box 5: Kết quả hiển thị */}
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kết quả hiển thị</span>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 leading-tight">{filteredCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Theo tiêu chí lọc</p>
        </div>
      </div>

      {/* 3. BẢNG DANH SÁCH SẢN PHẨM */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3 w-12 text-center">STT</th>
                <th className="py-2.5 px-3 w-14 text-center">Ảnh</th>
                <th className="py-2.5 px-3 min-w-[180px]">Tên sản phẩm</th>
                <th className="py-2.5 px-3 w-24">Hãng</th>
                <th className="py-2.5 px-3 w-20 text-center">Tồn kho</th>
                <th className="py-2.5 px-3 w-28 text-right">Giá gốc</th>
                <th className="py-2.5 px-3 w-16 text-center">Giảm</th>
                <th className="py-2.5 px-3 w-28 text-right">Giá treo</th>
                <th className="py-2.5 px-3 w-44 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2.5">
                      <svg className="w-5 h-5 animate-spin text-[#b80012]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-xs font-medium text-slate-500">Đang tải dữ liệu sản phẩm...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (

                filteredProducts.map((p, idx) => (

                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* STT */}
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-400 text-xs">
                      {idx + 1}
                    </td>

                    {/* Ảnh Thumbnail 36x36 */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200/80 overflow-hidden flex items-center justify-center p-0.5 mx-auto shrink-0">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&auto=format&fit=crop&q=60';
                            }}
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold">N/A</span>
                        )}
                      </div>
                    </td>

                    {/* Tên sản phẩm */}
                    <td className="py-2.5 px-3">
                      <div>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm block leading-tight">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          /{p.slug}
                        </span>
                      </div>
                    </td>

                    {/* Hãng */}
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px] tracking-wide">
                        {p.brand}
                      </span>
                    </td>

                    {/* Tồn kho */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          (p.stock ?? 0) > 0
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-red-50 text-[#b80012] border border-red-100'
                        }`}
                      >
                        {p.stock ?? 0}
                      </span>
                    </td>

                    {/* Giá gốc */}
                    <td className="py-2.5 px-3 text-right text-slate-400 line-through">
                      {formatVND(p.original_price)}
                    </td>

                    {/* Giảm */}
                    <td className="py-2.5 px-3 text-center">
                      {p.discount_percent > 0 ? (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-red-50 text-[#b80012] text-[10px] font-bold">
                          -{p.discount_percent}%
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Giá treo (Bán) */}
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatVND(p.price)}
                    </td>

                    {/* Hành động: [Chi tiết] [Sửa] [Xóa] */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Chi tiết */}
                        <button
                          type="button"
                          onClick={() => onOpenDetail && onOpenDetail(p)}
                          className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer"
                        >
                          Chi tiết
                        </button>

                        {/* Sửa nhanh */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(p)}
                          className="rounded border border-amber-200 bg-amber-50/50 px-2 py-1 text-[11px] font-medium text-amber-800 hover:bg-amber-100/70 hover:border-amber-300 transition cursor-pointer"
                        >
                          Sửa
                        </button>

                        {/* Xóa */}
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(p)}
                          className="rounded border border-red-200 bg-red-50/40 px-2 py-1 text-[11px] font-medium text-[#b80012] hover:bg-red-50 hover:border-red-300 transition cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL THÊM / SỬA NHANH SẢN PHẨM
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4">
              {/* Chọn Hãng & Tên sản phẩm */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chọn hãng <span className="text-[#b80012]">*</span>
                  </label>
                  <select
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    required
                    className="w-full h-8 px-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#b80012] cursor-pointer"
                  >
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên sản phẩm <span className="text-[#b80012]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nhập tên sản phẩm..."
                    autoFocus
                    required
                    className="w-full h-8 px-3 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#b80012] transition"
                  />
                </div>
              </div>

              {/* Khu vực Tải ảnh / Thumbnail */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ảnh sản phẩm đại diện
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center p-1 shrink-0">
                    {formImage ? (
                      <img src={formImage} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-slate-400 text-center">Chưa có ảnh</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-7 px-2.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold transition cursor-pointer"
                      >
                        Chọn ảnh từ máy
                      </button>
                      <span className="text-[11px] text-slate-400">hoặc dán URL:</span>
                    </div>
                    <input
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="https://example.com/image.png"
                      className="w-full h-7 px-2.5 bg-slate-50/50 border border-slate-200 rounded text-[11px] text-slate-800 focus:outline-none focus:border-[#b80012] transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
                >
                  {isEditMode ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL XÁC NHẬN XÓA
          ========================================================================= */}
      {isDeleteModalOpen && deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-5 text-center space-y-3.5">
            <div className="w-11 h-11 rounded-full bg-red-50 text-[#b80012] mx-auto flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase">
                Xác nhận xóa sản phẩm?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Bạn có chắc chắn muốn xóa sản phẩm <strong className="text-slate-800">{deletingProduct.name}</strong> không? Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
