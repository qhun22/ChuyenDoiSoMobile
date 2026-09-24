'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

export interface BrandItem {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  product_count?: number;
  created_at?: string;
}

const INITIAL_BRANDS: BrandItem[] = [
  { id: 1, name: 'APPLE', slug: 'apple', logo: '/icons/logo_iphone_ngang_eac93ff477.webp', product_count: 5, created_at: '2026-02-24 10:00:00' },
  { id: 2, name: 'BENCO', slug: 'benco', logo: null, product_count: 0, created_at: '2026-02-28 10:00:00' },
  { id: 3, name: 'HONOR', slug: 'honor', logo: null, product_count: 0, created_at: '2026-02-28 10:00:00' },
  { id: 4, name: 'OPPO', slug: 'oppo', logo: null, product_count: 1, created_at: '2026-02-24 10:00:00' },
  { id: 5, name: 'REALME', slug: 'realme', logo: null, product_count: 1, created_at: '2026-02-28 10:00:00' },
  { id: 6, name: 'RED MAGIC', slug: 'red-magic', logo: null, product_count: 1, created_at: '2026-02-28 10:00:00' },
  { id: 7, name: 'SAMSUNG', slug: 'samsung', logo: '/icons/logo_samsung_ngang_1624d75bd8.webp', product_count: 1, created_at: '2026-02-24 10:00:00' },
  { id: 8, name: 'TECNO', slug: 'tecno', logo: null, product_count: 0, created_at: '2026-02-28 10:00:00' },
  { id: 9, name: 'VIVO', slug: 'vivo', logo: null, product_count: 1, created_at: '2026-02-28 10:00:00' },
  { id: 10, name: 'XIAOMI', slug: 'xiaomi', logo: '/icons/logo_xiaomi_ngang_0faf267234.webp', product_count: 1, created_at: '2026-02-24 10:00:00' },
];

export default function BrandManagement() {
  const [brands, setBrands] = useState<BrandItem[]>(INITIAL_BRANDS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');


  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form States
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<BrandItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Brands from API (3s loading pattern)
  const fetchBrands = async () => {
    try {
      setLoading(true);
      const startTime = Date.now();
      const res = await fetch('/api/brands');
      const data = await res.json();
      
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 3000 - elapsed);
      setTimeout(() => {
        if (data.success && Array.isArray(data.data)) {
          setBrands(data.data);
        }
        setLoading(false);
      }, remaining);
    } catch {
      setTimeout(() => {
        toast.error('Không thể tải danh sách hãng');
        setLoading(false);
      }, 3000);
    }
  };


  useEffect(() => {
    fetchBrands();
  }, []);

  // Filtered Brands
  const filteredBrands = useMemo(() => {
    if (!searchTerm.trim()) return brands;
    const term = searchTerm.toLowerCase().trim();
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.slug.toLowerCase().includes(term)
    );
  }, [brands, searchTerm]);

  // Statistics
  const totalCount = brands.length;
  const withProductsCount = brands.filter((b) => (b.product_count ?? 0) > 0).length;
  const withoutProductsCount = brands.filter((b) => (b.product_count ?? 0) === 0).length;
  const filteredCount = filteredBrands.length;

  // Auto generate slug when name changes in Add Modal
  const handleNameChange = (val: string) => {
    setFormName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormSlug(autoSlug);
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormName('');
    setFormSlug('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (brand: BrandItem) => {
    setEditingBrand(brand);
    setFormName(brand.name);
    setFormSlug(brand.slug);
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (brand: BrandItem) => {
    setDeletingBrand(brand);
    setIsDeleteModalOpen(true);
  };

  // Handle Add Brand
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Vui lòng nhập tên hãng');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, slug: formSlug }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã thêm hãng "${formName.toUpperCase()}" thành công`);
        setIsAddModalOpen(false);
        fetchBrands();
      } else {
        toast.error(data.error || 'Thêm hãng thất bại');
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Brand
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand || !formName.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/brands', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingBrand.id, name: formName, slug: formSlug }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã cập nhật hãng "${formName.toUpperCase()}" thành công`);
        setIsEditModalOpen(false);
        setEditingBrand(null);
        fetchBrands();
      } else {
        toast.error(data.error || 'Cập nhật thất bại');
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Brand
  const handleDeleteConfirm = async () => {
    if (!deletingBrand) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/brands?id=${deletingBrand.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã xóa hãng "${deletingBrand.name}" thành công`);
        setIsDeleteModalOpen(false);
        setDeletingBrand(null);
        fetchBrands();
      } else {
        toast.error(data.error || 'Xóa hãng thất bại');
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '2026-02-24';
    return dateStr.split(' ')[0] || dateStr;
  };

  return (
    <div className="w-full space-y-3.5 font-['Signika',sans-serif]">
      {/* 1. THANH TIÊU ĐỀ & TÁC VỤ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/60">
        <div>
          <h1 className="text-lg font-black text-slate-900 uppercase tracking-wide">
            Quản lý hãng
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
            Quản lý hệ thống thương hiệu và liên kết sản phẩm
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Ô Tìm kiếm Real-time */}
          <div className="relative w-44 sm:w-56">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm tên hãng..."
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

          {/* Nút Thêm Hãng */}
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-1 h-7 px-3 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white font-medium text-xs shadow-xs transition active:scale-95 cursor-pointer shrink-0"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm hãng</span>
          </button>
        </div>
      </div>

      {/* 2. 4 THẺ THỐNG KÊ HÀNG NGANG (Thu gọn, tinh tế) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mb-3.5">
        {/* Box 1: Tổng số hãng */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs hover:border-slate-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng số hãng</span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-800 mt-0.5 leading-tight">{totalCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Hãng trong hệ thống</p>
        </div>

        {/* Box 2: Có sản phẩm */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs hover:border-slate-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Có sản phẩm</span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-800 mt-0.5 leading-tight">{withProductsCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Đã gắn sản phẩm</p>
        </div>

        {/* Box 3: Chưa có sản phẩm */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs hover:border-slate-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Chưa có sản phẩm</span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-800 mt-0.5 leading-tight">{withoutProductsCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Cần bổ sung liên kết</p>
        </div>

        {/* Box 4: Kết quả hiển thị */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs hover:border-slate-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kết quả hiển thị</span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-800 mt-0.5 leading-tight">{filteredCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Theo bộ lọc hiện tại</p>
        </div>
      </div>

      {/* 3. BẢNG DANH SÁCH HÃNG */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="w-full overflow-x-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-2 px-2.5 w-12 text-center whitespace-nowrap">STT</th>
                <th className="py-2 px-2.5 min-w-[200px] text-left whitespace-nowrap">Hãng</th>
                <th className="py-2 px-2.5 w-24 text-center whitespace-nowrap">Số SP</th>
                <th className="py-2 px-2.5 w-32 text-left whitespace-nowrap">Ngày thêm</th>
                <th className="py-2 px-2.5 w-28 text-center whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin text-[#b80012]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-xs font-medium text-slate-500">Đang tải dữ liệu hãng...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Không tìm thấy hãng nào phù hợp với từ khóa &ldquo;{searchTerm}&rdquo;
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand, idx) => (
                  <tr
                    key={brand.id}
                    className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                  >
                    {/* STT */}
                    <td className="align-middle py-2 px-2.5 w-12 text-center font-semibold text-slate-400 text-xs whitespace-nowrap">
                      {idx + 1}
                    </td>

                    {/* Tên Hãng */}
                    <td className="align-middle py-2 px-2.5 min-w-[200px] text-left">
                      <div>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm block leading-tight">
                          {brand.name.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          /{brand.slug}
                        </span>
                      </div>
                    </td>

                    {/* Số SP */}
                    <td className="align-middle py-2 px-2.5 w-24 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          (brand.product_count ?? 0) > 0
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-slate-50 text-slate-400 border border-slate-100'
                        }`}
                      >
                        {brand.product_count ?? 0}
                      </span>
                    </td>

                    {/* Ngày thêm */}
                    <td className="align-middle py-2 px-2.5 w-32 text-left whitespace-nowrap text-xs text-slate-500">
                      {formatDate(brand.created_at)}
                    </td>

                    {/* Hành động: Sửa & Xóa nhỏ gọn */}
                    <td className="align-middle py-2 px-2.5 w-28 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                        {/* Nút Sửa */}
                        <button
                          type="button"
                          onClick={() => openEditModal(brand)}
                          className="h-6 px-2 text-[10px] rounded font-medium border inline-flex items-center justify-center bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 transition cursor-pointer"
                        >
                          Sửa
                        </button>

                        {/* Nút Xóa */}
                        <button
                          type="button"
                          onClick={() => openDeleteModal(brand)}
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
          MODAL THÊM HÃNG
          ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                Thêm hãng mới
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên hãng <span className="text-[#b80012]">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: GOOGLE PIXEL"
                  autoFocus
                  required
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#b80012] bg-slate-50/50 transition uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đường dẫn (Slug)
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="google-pixel"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#b80012] bg-slate-50/50 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu hãng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL SỬA HÃNG
          ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                Đổi tên hãng
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên hãng <span className="text-[#b80012]">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#b80012] bg-slate-50/50 transition uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đường dẫn (Slug)
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 focus:outline-none focus:border-[#b80012] bg-slate-50/50 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL XÁC NHẬN XÓA
          ========================================================================= */}
      {isDeleteModalOpen && deletingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-5 text-center space-y-4">
            <div className="w-11 h-11 rounded-full bg-red-50 text-[#b80012] mx-auto flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase">
                Xác nhận xóa hãng?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Bạn có chắc chắn muốn xóa hãng <strong className="text-slate-800">{deletingBrand.name}</strong> không? Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
