'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { AdminProductItem } from './ProductManagement';
import RichTextEditor from './RichTextEditor';

interface ProductDetailManagementProps {
  product: AdminProductItem;
  onBack: () => void;
  onUpdateProduct?: (updatedProduct: AdminProductItem) => void;
}

type DetailTab = 'general' | 'sku' | 'folders' | 'colors' | 'storage' | 'description';

export default function ProductDetailManagement({
  product: initialProduct,
  onBack,
  onUpdateProduct,
}: ProductDetailManagementProps) {
  const [product, setProduct] = useState<AdminProductItem>(initialProduct);
  const [activeTab, setActiveTab] = useState<DetailTab>('general');

  // Tab 1: Chi tiết sản phẩm
  const [productName, setProductName] = useState(product.name);
  const [productStock, setProductStock] = useState(product.stock);
  const [specJson, setSpecJson] = useState(product.specifications || '{\n  "screen": "6.1 inch OLED",\n  "chip": "Apple A16 Bionic",\n  "ram": "6 GB",\n  "storage": "128 GB"\n}');
  const [youtubeId, setYoutubeId] = useState(product.youtubeId || '');
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Tab 2: SKU
  const [skus, setSkus] = useState<string[]>(product.skus && product.skus.length > 0 ? product.skus : [`SKU-${product.id}-128G`, `SKU-${product.id}-256G`]);
  const [newSkuInput, setNewSkuInput] = useState('');
  const [isSkuListOpen, setIsSkuListOpen] = useState(true);

  // Tab 3: Thư mục
  const [folders, setFolders] = useState<string[]>(
    product.folders && product.folders.length > 0
      ? product.folders
      : ['Mặt trước & Màn hình', 'Mặt lưng & Camera', 'Góc cạnh viền máy']
  );
  const [newFolderInput, setNewFolderInput] = useState('');
  const [isFolderListOpen, setIsFolderListOpen] = useState(true);

  // Tab 4: Màu - Ảnh sản phẩm
  const [selectedFolderForColor, setSelectedFolderForColor] = useState(folders[0] || 'Mặt trước & Màn hình');
  const [selectedSkuForColor, setSelectedSkuForColor] = useState(skus[0] || `SKU-${product.id}`);
  const [colorNameInput, setColorNameInput] = useState('');
  const [colorImageInput, setColorImageInput] = useState(product.image || '');
  const [colorImagesList, setColorImagesList] = useState(
    product.colorImages && product.colorImages.length > 0
      ? product.colorImages
      : []
  );
  const colorFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingColorImage, setUploadingColorImage] = useState(false);

  // Tab 5: Dung lượng
  const [variantOrigPrice, setVariantOrigPrice] = useState<number>(product.original_price || 0);
  const [variantPrice, setVariantPrice] = useState<number>(product.price || 0);
  const [variantStorage, setVariantStorage] = useState('128GB');
  const [variantColor, setVariantColor] = useState(colorNameInput || 'Tiêu chuẩn');
  const [variantsList, setVariantsList] = useState(
    product.variants && product.variants.length > 0
      ? product.variants
      : []
  );

  // Tính % giảm giá tự động cho biến thể
  const variantDiscountPercent = variantOrigPrice > variantPrice
    ? Math.round(((variantOrigPrice - variantPrice) / variantOrigPrice) * 100)
    : 0;

  // Tab 6: Thông tin sản phẩm
  const [descriptionHtml, setDescriptionHtml] = useState(
    product.description ||
      `<p><strong>${product.name}</strong> là dòng smartphone thế hệ mới đột phá với thiết kế viền siêu mỏng, hiệu năng dẫn đầu phân khúc và cụm camera sắc nét vượt trội.</p>\n<p>Sản phẩm chính hãng hỗ trợ trả góp 0%, bảo hành 12 tháng tại các trung tâm trên toàn quốc.</p>`
  );

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  // Helper to persist detail changes to Cloudflare D1 / database
  const persistProductToDb = async (updated: AdminProductItem, successMessage: string) => {
    setProduct(updated);
    if (onUpdateProduct) onUpdateProduct(updated);
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(successMessage);
      } else {
        toast.error(data.error || 'Lưu thất bại');
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ');
    }
  };

  // 1. Xử lý Tab 1 (Chi tiết sản phẩm)
  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          JSON.parse(content); // Validate JSON
          setSpecJson(content);
          toast.success('Đã tải và nạp file JSON thông số thành công!');
        } catch {
          toast.error('File không đúng định dạng JSON hợp lệ');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearJson = () => {
    setSpecJson('{\n}');
    toast.info('Đã xóa dữ liệu thông số JSON');
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      JSON.parse(specJson);
    } catch {
      toast.error('Thông số kỹ thuật chưa đúng cú pháp JSON!');
      return;
    }
    const updated: AdminProductItem = {
      ...product,
      name: productName,
      stock: Number(productStock),
      specifications: specJson,
      youtubeId,
    };
    persistProductToDb(updated, 'Đã lưu thông tin chi tiết sản phẩm vào database!');
  };

  const handleSaveYoutube = () => {
    const updated: AdminProductItem = { ...product, youtubeId };
    persistProductToDb(updated, 'Đã lưu ID video YouTube vào database!');
  };

  // 2. Xử lý Tab 2 (SKU)
  const handleAddSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkuInput.trim()) {
      toast.error('Vui lòng nhập mã SKU');
      return;
    }
    if (skus.includes(newSkuInput.trim())) {
      toast.warning('Mã SKU này đã tồn tại');
      return;
    }
    const nextSkus = [...skus, newSkuInput.trim()];
    setSkus(nextSkus);
    setNewSkuInput('');
    const updated: AdminProductItem = { ...product, skus: nextSkus };
    persistProductToDb(updated, `Đã thêm SKU "${newSkuInput.trim()}" vào database`);
  };

  const handleDeleteSku = (skuToDelete: string) => {
    const nextSkus = skus.filter((s) => s !== skuToDelete);
    setSkus(nextSkus);
    const updated: AdminProductItem = { ...product, skus: nextSkus };
    persistProductToDb(updated, `Đã xóa SKU "${skuToDelete}"`);
  };

  // 3. Xử lý Tab 3 (Thư mục)
  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderInput.trim()) {
      toast.error('Vui lòng nhập tên thư mục');
      return;
    }
    if (folders.includes(newFolderInput.trim())) {
      toast.warning('Thư mục này đã tồn tại');
      return;
    }
    const nextFolders = [...folders, newFolderInput.trim()];
    setFolders(nextFolders);
    setNewFolderInput('');
    const updated: AdminProductItem = { ...product, folders: nextFolders };
    persistProductToDb(updated, `Đã thêm thư mục "${newFolderInput.trim()}" vào database`);
  };

  const handleDeleteFolder = (folderToDelete: string) => {
    const nextFolders = folders.filter((f) => f !== folderToDelete);
    setFolders(nextFolders);
    const updated: AdminProductItem = { ...product, folders: nextFolders };
    persistProductToDb(updated, `Đã xóa thư mục "${folderToDelete}"`);
  };

  // 4. Xử lý Tab 4 (Màu - Ảnh sản phẩm)
  const handleAddColorImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorNameInput.trim()) {
      toast.error('Vui lòng nhập tên màu sắc');
      return;
    }
    const newEntry = {
      id: String(Date.now()),
      folder: selectedFolderForColor,
      sku: selectedSkuForColor,
      colorName: colorNameInput.trim(),
      imageUrl: colorImageInput || product.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=80',
    };
    const nextList = [newEntry, ...colorImagesList];
    setColorImagesList(nextList);
    const updated: AdminProductItem = { ...product, colorImages: nextList };
    persistProductToDb(updated, `Đã lưu màu "${colorNameInput}" vào database`);
  };

  const handleDeleteColorImage = (id: string) => {
    const nextList = colorImagesList.filter((item) => item.id !== id);
    setColorImagesList(nextList);
    const updated: AdminProductItem = { ...product, colorImages: nextList };
    persistProductToDb(updated, 'Đã xóa màu ảnh');
  };

  // 5. Xử lý Tab 5 (Dung lượng)
  const handleAddVariant = (e: React.FormEvent) => {
    e.preventDefault();
    const origP = Number(variantOrigPrice) || 0;
    const p = Number(variantPrice) || 0;
    const disc = origP > p && origP > 0 ? Math.round(((origP - p) / origP) * 100) : 0;
    const newVariant = {
      id: String(Date.now()),
      color: variantColor,
      storage: variantStorage,
      original_price: origP,
      price: p,
      discount_percent: disc,
    };
    const nextList = [...variantsList, newVariant];
    setVariantsList(nextList);

    const activeVariants = nextList.filter((v) => v.price > 0);
    const primary = activeVariants.length > 0 
      ? activeVariants.reduce((min, curr) => (curr.price < min.price ? curr : min), activeVariants[0])
      : nextList[0];

    const updated: AdminProductItem = {
      ...product,
      variants: nextList,
      price: primary ? primary.price : product.price,
      original_price: primary ? primary.original_price : product.original_price,
      discount_percent: primary ? primary.discount_percent : product.discount_percent,
    };
    persistProductToDb(updated, `Đã thêm biến thể ${variantStorage} - ${variantColor}`);
  };

  const handleDeleteVariant = (id: string) => {
    const nextList = variantsList.filter((v) => v.id !== id);
    setVariantsList(nextList);

    const activeVariants = nextList.filter((v) => v.price > 0);
    const primary = activeVariants.length > 0 
      ? activeVariants.reduce((min, curr) => (curr.price < min.price ? curr : min), activeVariants[0])
      : nextList[0];

    const updated: AdminProductItem = {
      ...product,
      variants: nextList,
      price: primary ? primary.price : 0,
      original_price: primary ? primary.original_price : 0,
      discount_percent: primary ? primary.discount_percent : 0,
    };
    persistProductToDb(updated, 'Đã xóa biến thể dung lượng');
  };

  const handleSaveAllVariants = () => {
    const activeVariants = variantsList.filter((v) => v.price > 0);
    const primary = activeVariants.length > 0 
      ? activeVariants.reduce((min, curr) => (curr.price < min.price ? curr : min), activeVariants[0])
      : variantsList[0];

    const updated: AdminProductItem = {
      ...product,
      variants: variantsList,
      price: primary ? primary.price : product.price,
      original_price: primary ? primary.original_price : product.original_price,
      discount_percent: primary ? primary.discount_percent : product.discount_percent,
    };
    persistProductToDb(updated, 'Đã lưu tất cả biến thể dung lượng vào database!');
  };

  // 6. Xử lý Tab 6 (Thông tin sản phẩm)
  const handleSaveDescription = () => {
    const updated: AdminProductItem = { ...product, description: descriptionHtml };
    persistProductToDb(updated, 'Đã lưu bài viết mô tả sản phẩm vào database!');
  };

  const NAV_TABS = [
    { id: 'general', label: 'Chi tiết sản phẩm' },
    { id: 'sku', label: 'SKU' },
    { id: 'folders', label: 'Thư mục' },
    { id: 'colors', label: 'Màu - Ảnh sản phẩm' },
    { id: 'storage', label: 'Dung lượng' },
    { id: 'description', label: 'Thông tin sản phẩm' },
  ];

  return (
    <div className="w-full space-y-4 font-['Signika',sans-serif]">
      {/* THANH HEADER ĐIỀU HƯỚNG QUAY LẠI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="h-7 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Quay lại</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Cấu hình:</span>
              <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-wide">
                {product.name}
              </h1>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px] tracking-wide">
                {product.brand}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            Giá bán: <strong className="text-slate-900">{formatVND(product.price)}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500 font-medium">
            Tồn kho: <strong className="text-slate-900">{product.stock}</strong>
          </span>
        </div>
      </div>

      {/* BỐ CỤC 2 CỘT (TABS DỌC + NỘI DUNG CHI TIẾT) */}
      <div className="flex flex-col md:flex-row gap-4 items-start w-full">
        {/* CỘT TRÁI: MENU TABS DỌC (~200px) */}
        <div className="w-full md:w-48 lg:w-52 shrink-0 bg-white border border-slate-100 rounded-xl shadow-2xs p-2 space-y-1">
          {NAV_TABS.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as DetailTab)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-slate-50 text-[#b80012] font-bold border-l-2 border-[#b80012] pl-2.5 shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50/80 font-medium'
                }`}
              >
                <span className="w-4 text-center font-bold text-[11px] text-slate-400">
                  {idx + 1}.
                </span>
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CỘT PHẢI: NỘI DUNG TỪNG TAB */}
        <div className="flex-1 w-full min-w-0 bg-white border border-slate-100 rounded-xl shadow-2xs p-5">
          {/* =========================================================================
              TAB 1: CHI TIẾT SẢN PHẨM
              ========================================================================= */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold uppercase text-slate-900">
                  1. Chi tiết thông số sản phẩm
                </h2>
              </div>

              <form onSubmit={handleSaveGeneral} className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên sản phẩm
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      required
                      className="w-full h-8 px-3 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#b80012] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số lượng trong kho
                    </label>
                    <input
                      type="number"
                      value={productStock}
                      onChange={(e) => setProductStock(Number(e.target.value))}
                      min={0}
                      required
                      className="w-full h-8 px-3 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#b80012] transition"
                    />
                  </div>
                </div>

                {/* Khu vực Thông số kỹ thuật JSON */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Thông số kỹ thuật (Định dạng JSON)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={jsonFileInputRef}
                        onChange={handleJsonUpload}
                        accept=".json,application/json"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => jsonFileInputRef.current?.click()}
                        className="h-7 px-2.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold transition cursor-pointer"
                      >
                        Chọn file JSON
                      </button>
                      <button
                        type="button"
                        onClick={handleClearJson}
                        className="h-7 px-2.5 rounded border border-red-200 text-[#b80012] hover:bg-red-50 text-[11px] font-semibold transition cursor-pointer"
                      >
                        Xóa file JSON
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={specJson}
                    onChange={(e) => setSpecJson(e.target.value)}
                    rows={6}
                    className="w-full p-3 bg-slate-50/70 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#b80012] transition"
                    placeholder={`{\n  "screen": "6.1 inch",\n  "chip": "Apple A16"\n}`}
                  />
                </div>

                {/* Khu vực ID YouTube */}
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ID Video YouTube
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={youtubeId}
                      onChange={(e) => setYoutubeId(e.target.value)}
                      placeholder="Ví dụ: dQw4w9WgXcQ hoặc URL video"
                      className="flex-1 h-8 px-3 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#b80012] transition"
                    />
                    <button
                      type="button"
                      onClick={handleSaveYoutube}
                      className="h-8 px-3 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                    >
                      Lưu ID
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="h-8 px-4 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    Lưu chi tiết
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              TAB 2: SKU
              ========================================================================= */}
          {activeTab === 'sku' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold uppercase text-slate-900">
                  2. Quản lý danh sách mã SKU
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tạo mã định danh duy nhất cho từng phân loại sản phẩm
                </p>
              </div>

              {/* Form Nhập SKU */}
              <form onSubmit={handleAddSku} className="flex items-center gap-2 pt-1">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newSkuInput}
                    onChange={(e) => setNewSkuInput(e.target.value)}
                    placeholder="Nhập mã SKU mới (ví dụ: SKU-IP16-256G-TITAN)..."
                    className="w-full h-8 px-3 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#b80012] transition uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="h-8 px-3.5 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                >
                  Lưu SKU
                </button>
              </form>

              {/* Accordion / Card xem danh sách đã thêm */}
              <div className="border border-slate-100 rounded-xl overflow-hidden pt-1">
                <button
                  type="button"
                  onClick={() => setIsSkuListOpen(!isSkuListOpen)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50/70 text-xs font-bold text-slate-800 cursor-pointer hover:bg-slate-100/70 transition"
                >
                  <span>Danh sách mã SKU đã thêm ({skus.length})</span>
                  <span className="text-slate-400">{isSkuListOpen ? '▲ Thu gọn' : '▼ Mở rộng'}</span>
                </button>

                {isSkuListOpen && (
                  <div className="p-3 bg-white space-y-2">
                    {skus.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-3">Chưa có mã SKU nào.</p>
                    ) : (
                      skus.map((sku, index) => (
                        <div
                          key={sku}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50/60 border border-slate-100 text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[11px] font-bold w-5">{index + 1}.</span>
                            <span className="font-bold text-slate-800">{sku}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteSku(sku)}
                            className="text-[11px] text-[#b80012] hover:underline font-sans cursor-pointer"
                          >
                            Xóa
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: THƯ MỤC
              ========================================================================= */}
          {activeTab === 'folders' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold uppercase text-slate-900">
                  3. Quản lý thư mục lưu trữ ảnh
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tạo các nhóm thư mục để phân loại góc chụp và album hình ảnh
                </p>
              </div>

              {/* Form Nhập Thư mục */}
              <form onSubmit={handleAddFolder} className="flex items-center gap-2 pt-1">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newFolderInput}
                    onChange={(e) => setNewFolderInput(e.target.value)}
                    placeholder="Nhập tên thư mục (ví dụ: Mặt trước, Mặt lưng, Phụ kiện đi kèm)..."
                    className="w-full h-8 px-3 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#b80012] transition"
                  />
                </div>
                <button
                  type="submit"
                  className="h-8 px-3.5 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                >
                  Lưu thư mục
                </button>
              </form>

              {/* Accordion Xem danh sách đã thêm */}
              <div className="border border-slate-100 rounded-xl overflow-hidden pt-1">
                <button
                  type="button"
                  onClick={() => setIsFolderListOpen(!isFolderListOpen)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50/70 text-xs font-bold text-slate-800 cursor-pointer hover:bg-slate-100/70 transition"
                >
                  <span>Danh sách thư mục đã tạo ({folders.length})</span>
                  <span className="text-slate-400">{isFolderListOpen ? '▲ Thu gọn' : '▼ Mở rộng'}</span>
                </button>

                {isFolderListOpen && (
                  <div className="p-3 bg-white space-y-2">
                    {folders.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-3">Chưa có thư mục nào.</p>
                    ) : (
                      folders.map((folder, index) => (
                        <div
                          key={folder}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50/60 border border-slate-100 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[11px] font-bold w-5">{index + 1}.</span>
                            <span className="font-semibold text-slate-800">{folder}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteFolder(folder)}
                            className="text-[11px] text-[#b80012] hover:underline cursor-pointer"
                          >
                            Xóa
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: MÀU - ẢNH SẢN PHẨM
              ========================================================================= */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold uppercase text-slate-900">
                  4. Màu sắc & Hình ảnh sản phẩm
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gán ảnh tương ứng theo từng thư mục, SKU và màu sắc phiên bản
                </p>
              </div>

              <form onSubmit={handleAddColorImage} className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chọn thư mục
                    </label>
                    <select
                      value={selectedFolderForColor}
                      onChange={(e) => setSelectedFolderForColor(e.target.value)}
                      className="w-full h-8 px-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#b80012] cursor-pointer"
                    >
                      {folders.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chọn SKU
                    </label>
                    <select
                      value={selectedSkuForColor}
                      onChange={(e) => setSelectedSkuForColor(e.target.value)}
                      className="w-full h-8 px-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#b80012] cursor-pointer"
                    >
                      {skus.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên màu sắc
                    </label>
                    <input
                      type="text"
                      value={colorNameInput}
                      onChange={(e) => setColorNameInput(e.target.value)}
                      placeholder="Ví dụ: Titan Sa Mạc, Đen Nhám..."
                      className="w-full h-8 px-3 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#b80012] transition"
                      required
                    />
                  </div>
                </div>

                {/* Khu vực Upload / URL ảnh màu */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hình ảnh màu sắc
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center p-1 shrink-0">
                      {colorImageInput ? (
                        <img src={colorImageInput} alt="Preview" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400">Chưa có ảnh</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        ref={colorFileInputRef}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setUploadingColorImage(true);
                            const formData = new FormData();
                            formData.append('file', file);
                            const res = await fetch('/api/upload', {
                              method: 'POST',
                              body: formData,
                            });
                            const data = await res.json();
                            if (data.success && data.url) {
                              setColorImageInput(data.url);
                              toast.success('Đã tải ảnh màu sắc lên thư mục local!');
                            } else {
                              toast.error(data.error || 'Tải ảnh thất bại');
                            }
                          } catch {
                            toast.error('Lỗi khi tải ảnh lên máy chủ');
                          } finally {
                            setUploadingColorImage(false);
                          }
                        }}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={uploadingColorImage}
                          onClick={() => colorFileInputRef.current?.click()}
                          className="h-7 px-2.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                          {uploadingColorImage ? 'Đang tải ảnh...' : 'Chọn tệp ảnh'}
                        </button>
                        <span className="text-[11px] text-slate-400">hoặc dán đường dẫn ảnh:</span>
                      </div>
                      <input
                        type="text"
                        value={colorImageInput}
                        onChange={(e) => setColorImageInput(e.target.value)}
                        placeholder="https://example.com/color-image.jpg"
                        className="w-full h-7 px-2.5 bg-slate-50/50 border border-slate-200 rounded text-[11px] text-slate-800 focus:outline-none focus:border-[#b80012] transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="h-8 px-4 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    Lưu ảnh màu
                  </button>
                </div>
              </form>

              {/* Danh sách ảnh màu đã lưu */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 mb-2">
                  Danh sách màu - ảnh đã tạo ({colorImagesList.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {colorImagesList.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.colorName}
                          className="w-10 h-10 rounded object-contain bg-white border border-slate-200 shrink-0 p-0.5"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{item.colorName}</p>
                          <p className="text-[10px] text-slate-400 truncate">{item.folder}</p>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{item.sku}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteColorImage(item.id)}
                        className="text-[11px] text-[#b80012] hover:underline shrink-0 cursor-pointer"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 5: DUNG LƯỢNG (BIẾN THỂ)
              ========================================================================= */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold uppercase text-slate-900">
                  5. Quản lý dung lượng & Biến thể giá
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cấu hình giá gốc, giá sau giảm và % khuyến mãi theo từng phân loại bộ nhớ
                </p>
              </div>

              {/* Form thêm biến thể */}
              <form onSubmit={handleAddVariant} className="space-y-3 pt-1">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Giá gốc (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={variantOrigPrice}
                      onChange={(e) => setVariantOrigPrice(Number(e.target.value))}
                      min={0}
                      step={10000}
                      required
                      className="w-full h-8 px-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#b80012]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Giá sau giảm (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={variantPrice}
                      onChange={(e) => setVariantPrice(Number(e.target.value))}
                      min={0}
                      step={10000}
                      required
                      className="w-full h-8 px-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#b80012]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chọn màu
                    </label>
                    <input
                      type="text"
                      value={variantColor}
                      onChange={(e) => setVariantColor(e.target.value)}
                      placeholder="Titan Tự Nhiên"
                      required
                      className="w-full h-8 px-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#b80012]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dung lượng
                    </label>
                    <input
                      type="text"
                      value={variantStorage}
                      onChange={(e) => setVariantStorage(e.target.value)}
                      placeholder="128GB, 256GB..."
                      required
                      className="w-full h-8 px-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#b80012]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      % Giảm giá
                    </label>
                    <input
                      type="text"
                      value={`-${variantDiscountPercent}%`}
                      readOnly
                      className="w-full h-8 px-2.5 bg-red-50/60 border border-red-100 rounded-lg text-xs font-bold text-[#b80012] text-center"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="h-8 px-3.5 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    + Thêm biến thể
                  </button>
                </div>
              </form>

              {/* Bảng danh sách biến thể */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-700">
                    Danh sách biến thể dung lượng ({variantsList.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleSaveAllVariants}
                    className="h-7 px-3 rounded bg-[#b80012] hover:bg-[#99000f] text-white text-[11px] font-semibold transition cursor-pointer"
                  >
                    Lưu tất cả biến thể
                  </button>
                </div>

                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-[11px] font-semibold uppercase">
                        <th className="py-2 px-3 w-10 text-center">STT</th>
                        <th className="py-2 px-3">Màu sắc</th>
                        <th className="py-2 px-3 w-28">Dung lượng</th>
                        <th className="py-2 px-3 w-32 text-right">Giá gốc</th>
                        <th className="py-2 px-3 w-32 text-right">Giá bán</th>
                        <th className="py-2 px-3 w-20 text-center">% Giảm</th>
                        <th className="py-2 px-3 w-16 text-right">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                      {variantsList.map((v, idx) => (
                        <tr key={v.id} className="hover:bg-slate-50/60">
                          <td className="py-2 px-3 text-center text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{v.color}</td>
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-[11px] text-slate-700">
                              {v.storage}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right text-slate-400 line-through">
                            {formatVND(v.original_price)}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">
                            {formatVND(v.price)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {v.discount_percent > 0 ? (
                              <span className="text-[10px] font-bold text-[#b80012] bg-red-50 px-1.5 py-0.5 rounded">
                                -{v.discount_percent}%
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteVariant(v.id)}
                              className="text-[11px] text-[#b80012] hover:underline cursor-pointer"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 6: THÔNG TIN SẢN PHẨM (BÀI VIẾT)
              ========================================================================= */}
          {activeTab === 'description' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold uppercase text-slate-900">
                  6. Bài viết giới thiệu chi tiết sản phẩm
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Soạn thảo nội dung đánh giá, tính năng nổi bật và thông tin tư vấn
                </p>
              </div>

              {/* Rich Text Editor chuyên nghiệp */}
              <div className="pt-1">
                <RichTextEditor
                  value={descriptionHtml}
                  onChange={setDescriptionHtml}
                  placeholder="Soạn thảo bài viết giới thiệu chi tiết sản phẩm..."
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveDescription}
                  className="h-8 px-4 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
                >
                  Lưu bài viết
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
