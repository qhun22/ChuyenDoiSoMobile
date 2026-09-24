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

// Cache state in memory / session to prevent re-loading on client tab changes
let hasLoadedProductsOnce = false;

interface ProductManagementProps {
  onOpenDetail?: (product: AdminProductItem) => void;
  updatedProduct?: AdminProductItem | null;
}

export default function ProductManagement({ onOpenDetail, updatedProduct }: ProductManagementProps) {
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [brands, setBrands] = useState<string[]>(DEFAULT_BRANDS);
  const [loading, setLoading] = useState(() => !hasLoadedProductsOnce);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock' | 'discount'>('all');
  const [submitting, setSubmitting] = useState(false);

  // Fetch products from database (with session caching)
  const fetchProducts = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        try {
          const cached = sessionStorage.getItem('admin_cached_products');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setProducts(parsed);
              hasLoadedProductsOnce = true;
              setLoading(false);
              return;
            }
          }
        } catch {}
      }

      const startTime = Date.now();
      if (!hasLoadedProductsOnce) setLoading(true);

      const res = await fetch('/api/products');
      const data = await res.json();

      const elapsed = Date.now() - startTime;
      const remaining = !hasLoadedProductsOnce ? Math.max(0, 3000 - elapsed) : 0;

      setTimeout(() => {
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
          try {
            sessionStorage.setItem('admin_cached_products', JSON.stringify(data.data));
          } catch {}
        }
        hasLoadedProductsOnce = true;
        setLoading(false);
      }, remaining);
    } catch {
      setTimeout(() => {
        toast.error('Không thể tải danh sách sản phẩm');
        hasLoadedProductsOnce = true;
        setLoading(false);
      }, !hasLoadedProductsOnce ? 3000 : 0);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Sync updated product from detail screen
  useEffect(() => {
    if (updatedProduct) {
      setProducts((prev) => {
        const next = prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
        try {
          sessionStorage.setItem('admin_cached_products', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  }, [updatedProduct]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form State (Chỉ giữ 3 trường: Hãng, Tên, Ảnh đại diện)
  const [currentProduct, setCurrentProduct] = useState<AdminProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<AdminProductItem | null>(null);
  const [formBrand, setFormBrand] = useState('');
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load brands from API (with session caching)
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('admin_cached_brands');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBrands(parsed);
          return;
        }
      }
    } catch {}

    fetch('/api/brands')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          const brandNames = data.data.map((b: { name: string }) => b.name.toUpperCase());
          setBrands(brandNames);
          try {
            sessionStorage.setItem('admin_cached_brands', JSON.stringify(brandNames));
          } catch {}
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
    setFormBrand('');
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

  // Xử lý upload ảnh lưu vào thư mục local qua /api/upload
  const [uploadingImage, setUploadingImage] = useState(false);
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        setFormImage(data.url);
        toast.success('Đã tải ảnh lên thư mục local thành công!');
      } else {
        toast.error(data.error || 'Tải ảnh thất bại');
      }
    } catch {
      toast.error('Lỗi khi tải ảnh lên máy chủ');
    } finally {
      setUploadingImage(false);
    }
  };

  // Lưu Form Thêm / Sửa nhanh
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBrand) {
      toast.error('Vui lòng chọn hãng sản phẩm');
      return;
    }
    if (!formName.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }

    const slug = formName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    try {
      setSubmitting(true);
      if (isEditMode && currentProduct) {
        const res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentProduct.id,
            name: formName,
            slug,
            brand: formBrand,
            image: formImage || currentProduct.image,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(`Đã cập nhật sản phẩm "${formName}" vào database`);
          setIsModalOpen(false);
          fetchProducts(true);
        } else {
          toast.error(data.error || 'Cập nhật thất bại');
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            slug,
            brand: formBrand,
            image: formImage || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=80',
            stock: 0,
            original_price: 0,
            price: 0,
            discount_percent: 0,
            variants: [],
            skus: [],
            colorImages: [],
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(`Đã lưu sản phẩm "${formName}" vào database`);
          setIsModalOpen(false);
          fetchProducts(true);
        } else {
          toast.error(data.error || 'Thêm sản phẩm thất bại');
        }
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  // Mở modal xác nhận xóa
  const handleOpenDeleteModal = (p: AdminProductItem) => {
    setDeletingProduct(p);
    setIsDeleteModalOpen(true);
  };

  // Xác nhận xóa
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/products?id=${deletingProduct.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã xóa sản phẩm "${deletingProduct.name}" khỏi database`);
        setIsDeleteModalOpen(false);
        setDeletingProduct(null);
        fetchProducts();
      } else {
        toast.error(data.error || 'Xóa sản phẩm thất bại');
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-3.5 font-['Signika',sans-serif]">
      {/* 1. THANH TIÊU ĐỀ & TÁC VỤ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/60">
        <div>
          <h1 className="text-lg font-black text-slate-900 uppercase tracking-wide">
            Quản lý sản phẩm
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
            Quản lý thông tin, giá bán, kho hàng và biến thể chi tiết
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Ô Tìm kiếm Real-time */}
          <div className="relative w-40 sm:w-52">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="w-full h-7 px-2.5 pr-6 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#b80012] transition"
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
            className="h-7 px-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-[#b80012] cursor-pointer"
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
            className="h-7 px-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </button>

          {/* Nút + Thêm sản phẩm */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1 h-7 px-3 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white font-medium text-xs shadow-xs transition active:scale-95 cursor-pointer shrink-0"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* 2. 5 BOX THỐNG KÊ HÀNG NGANG */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 w-full mb-3.5">
        {/* Box 1: Tổng số sản phẩm */}
        <div
          onClick={() => setSelectedStockFilter('all')}
          className={`p-2.5 rounded-xl border transition cursor-pointer ${
            selectedStockFilter === 'all'
              ? 'bg-white border-slate-300 shadow-2xs ring-1 ring-slate-300/50'
              : 'bg-white border-slate-100 shadow-2xs hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng sản phẩm</span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-800 mt-0.5 leading-tight">{totalCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Toàn bộ kho hàng</p>
        </div>

        {/* Box 2: Đang bán (Còn hàng) */}
        <div
          onClick={() => setSelectedStockFilter('in_stock')}
          className={`p-2.5 rounded-xl border transition cursor-pointer ${
            selectedStockFilter === 'in_stock'
              ? 'bg-white border-slate-300 shadow-2xs ring-1 ring-slate-300/50'
              : 'bg-white border-slate-100 shadow-2xs hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Đang bán (Còn hàng)</span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-800 mt-0.5 leading-tight">{inStockCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Sẵn sàng giao ngay</p>
        </div>

        {/* Box 3: Hết hàng */}
        <div
          onClick={() => setSelectedStockFilter('out_of_stock')}
          className={`p-2.5 rounded-xl border transition cursor-pointer ${
            selectedStockFilter === 'out_of_stock'
              ? 'bg-white border-slate-300 shadow-2xs ring-1 ring-slate-300/50'
              : 'bg-white border-slate-100 shadow-2xs hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Hết hàng</span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-800 mt-0.5 leading-tight">{outOfStockCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Cần nhập thêm hàng</p>
        </div>

        {/* Box 4: Giảm giá / Khuyến mãi */}
        <div
          onClick={() => setSelectedStockFilter('discount')}
          className={`p-2.5 rounded-xl border transition cursor-pointer ${
            selectedStockFilter === 'discount'
              ? 'bg-white border-slate-300 shadow-2xs ring-1 ring-slate-300/50'
              : 'bg-white border-slate-100 shadow-2xs hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Giảm giá / Ưu đãi</span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-800 mt-0.5 leading-tight">{discountCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Đang chạy khuyến mãi</p>
        </div>

        {/* Box 5: Kết quả hiển thị */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs hover:border-slate-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kết quả hiển thị</span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-800 mt-0.5 leading-tight">{filteredCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Theo tiêu chí lọc</p>
        </div>
      </div>

      {/* 3. BẢNG DANH SÁCH SẢN PHẨM */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="w-full overflow-x-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-2 px-2.5 w-10 text-center whitespace-nowrap">STT</th>
                <th className="py-2 px-2.5 w-12 text-center whitespace-nowrap">Ảnh</th>
                <th className="py-2 px-2.5 min-w-[200px] text-left whitespace-nowrap">Tên sản phẩm</th>
                <th className="py-2 px-2.5 w-24 text-left whitespace-nowrap">Hãng</th>
                <th className="py-2 px-2.5 w-20 text-center whitespace-nowrap">Tồn kho</th>
                <th className="py-2 px-2.5 w-24 text-right whitespace-nowrap">Giá gốc</th>
                <th className="py-2 px-2.5 w-14 text-center whitespace-nowrap">Giảm</th>
                <th className="py-2 px-2.5 w-28 text-right whitespace-nowrap">Giá treo</th>
                <th className="py-2 px-2.5 w-32 text-center whitespace-nowrap">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin text-[#b80012]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-xs font-medium text-slate-500">Đang tải dữ liệu sản phẩm...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                    {/* STT */}
                    <td className="align-middle py-2 px-2.5 w-10 text-center font-semibold text-slate-400 text-xs whitespace-nowrap">
                      {idx + 1}
                    </td>

                    {/* Cột Ảnh */}
                    <td className="align-middle py-2 px-2.5 w-12 text-center">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 overflow-hidden flex items-center justify-center p-0.5 mx-auto shrink-0">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-contain mx-auto"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&auto=format&fit=crop&q=60';
                            }}
                          />
                        ) : (
                          <span className="text-[9px] text-slate-400 font-bold">N/A</span>
                        )}
                      </div>
                    </td>

                    {/* Cột Tên sản phẩm */}
                    <td className="align-middle py-2 px-2.5 min-w-[200px] text-left">
                      <div>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm block leading-tight">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          /{p.slug}
                        </span>
                      </div>
                    </td>

                    {/* Cột Hãng */}
                    <td className="align-middle py-2 px-2.5 w-24 text-left whitespace-nowrap font-medium text-slate-600 text-xs">
                      {p.brand}
                    </td>

                    {/* Cột Tồn kho */}
                    <td className="align-middle py-2 px-2.5 w-20 text-center whitespace-nowrap">
                      {(p.stock ?? 0) === 0 ? (
                        <span className="font-semibold text-slate-400 text-xs">
                          0
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-700 text-xs">
                          {p.stock}
                        </span>
                      )}
                    </td>

                    {/* Cột Giá gốc */}
                    <td className="align-middle py-2 px-2.5 w-24 text-right whitespace-nowrap text-slate-400 line-through text-xs">
                      {formatVND(p.original_price ?? 0)}
                    </td>

                    {/* Cột Giảm (%) */}
                    <td className="align-middle py-2 px-2.5 w-14 text-center whitespace-nowrap text-rose-600 font-bold text-xs">
                      {p.discount_percent > 0 ? (
                        <span>-{p.discount_percent}%</span>
                      ) : (
                        <span className="text-slate-300 font-normal">0%</span>
                      )}
                    </td>

                    {/* Cột Giá treo (Giá bán) */}
                    <td className="align-middle py-2 px-2.5 w-28 text-right whitespace-nowrap text-[#b80012] font-bold text-xs sm:text-sm">
                      {formatVND(p.price ?? 0)}
                    </td>

                    {/* Cột Hành động: [Chi tiết] [Sửa] [Xóa] */}
                    <td className="align-middle py-2 px-2.5 w-32 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                        {/* Chi tiết */}
                        <button
                          type="button"
                          onClick={() => onOpenDetail && onOpenDetail(p)}
                          className="h-6 px-2 text-[10px] rounded font-medium border inline-flex items-center justify-center bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 transition cursor-pointer"
                        >
                          Chi tiết
                        </button>

                        {/* Sửa nhanh */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(p)}
                          className="h-6 px-2 text-[10px] rounded font-medium border inline-flex items-center justify-center bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 transition cursor-pointer"
                        >
                          Sửa
                        </button>

                        {/* Xóa */}
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(p)}
                          className="h-6 px-2 text-[10px] rounded font-medium border inline-flex items-center justify-center bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 transition cursor-pointer"
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
        <div
          className="admin-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="admin-modal-box max-w-lg">
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
                    <option value="" disabled>
                      -- Vui lòng chọn hãng --
                    </option>
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
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="h-7 px-2.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        {uploadingImage ? 'Đang tải ảnh...' : 'Chọn ảnh từ máy'}
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
        <div
          className="admin-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDeleteModalOpen(false);
          }}
        >
          <div className="admin-modal-box max-w-sm p-5 text-center space-y-3.5">
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
