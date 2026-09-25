'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { AdminProductItem } from './ProductManagement';
import RichTextEditor from './RichTextEditor';
import { ColorImageItem } from '@/components/product-detail/types';

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
  const [activeTab, setActiveTab] = useState<DetailTab>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('admin_active_detail_tab') as DetailTab | null;
      if (saved && ['general', 'sku', 'folders', 'colors', 'storage', 'description'].includes(saved)) {
        return saved;
      }
    }
    return 'general';
  });

  const handleTabChange = (tab: DetailTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('admin_active_detail_tab', tab);
    }
  };

  // Helper định dạng hiển thị tiền tệ và xử lý số an toàn, chống nhảy phím khi gõ Telex/VNI (VIE) hoặc US
  const formatInputCurrency = (val: string | number) => {
    if (val === '' || val === null || val === undefined) return '';
    const digits = String(val).replace(/\D/g, '');
    if (!digits) return '';
    const clean = digits.replace(/^0+(?=\d)/, '');
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseCurrencyDigits = (val: string | number) => {
    if (!val) return 0;
    return Number(String(val).replace(/\D/g, '')) || 0;
  };

  // Tab 1: Chi tiết sản phẩm
  const [productName, setProductName] = useState(product.name);
  const [productStock, setProductStock] = useState<string>(String(product.stock ?? 0));
  const [specJson, setSpecJson] = useState(product.specifications || '{\n  "screen": "6.1 inch OLED",\n  "chip": "Apple A16 Bionic",\n  "ram": "6 GB",\n  "storage": "128 GB"\n}');
  const [youtubeId, setYoutubeId] = useState(product.youtubeId || '');
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Tab 2: SKU (Mặc định thu gọn lại)
  const [skus, setSkus] = useState<string[]>(product.skus && product.skus.length > 0 ? product.skus : []);
  const [newSkuInput, setNewSkuInput] = useState('');
  const [isSkuListOpen, setIsSkuListOpen] = useState(false);

  // Tab 3: Thư mục (Mặc định thu gọn lại)
  const [folders, setFolders] = useState<string[]>(
    product.folders && product.folders.length > 0 ? product.folders : []
  );
  const [newFolderInput, setNewFolderInput] = useState('');
  const [isFolderListOpen, setIsFolderListOpen] = useState(false);

  // Tab 4: Màu - Ảnh sản phẩm
  const [selectedFolderForColor, setSelectedFolderForColor] = useState(folders[0] || '');
  const [selectedSkuForColor, setSelectedSkuForColor] = useState(skus[0] || '');
  const [colorNameInput, setColorNameInput] = useState('');
  const [colorImageInput, setColorImageInput] = useState('');
  const [stagedImages, setStagedImages] = useState<string[]>([]);
  const [colorImagesList, setColorImagesList] = useState(
    product.colorImages && product.colorImages.length > 0
      ? product.colorImages
      : []
  );
  const colorFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingColorImage, setUploadingColorImage] = useState(false);
  const [draggedStagedIndex, setDraggedStagedIndex] = useState<number | null>(null);
  const [dragOverStagedIndex, setDragOverStagedIndex] = useState<number | null>(null);
  const [draggedSavedIndex, setDraggedSavedIndex] = useState<number | null>(null);
  const [dragOverSavedIndex, setDragOverSavedIndex] = useState<number | null>(null);
  const [expandedColors, setExpandedColors] = useState<Record<string, boolean>>({});
  const [editingColorName, setEditingColorName] = useState<string | null>(null);

  // Nhóm danh sách ảnh màu theo Tên màu sắc (khai báo trước availableColors)
  const groupedColorImages = useMemo(() => {
    const map = new Map<
      string,
      {
        colorName: string;
        folder: string;
        sku: string;
        items: (ColorImageItem & { globalIndex: number })[];
      }
    >();

    colorImagesList.forEach((item, index) => {
      const key = (item.colorName || 'Mặc định').trim();
      if (!map.has(key)) {
        map.set(key, {
          colorName: key,
          folder: item.folder || '',
          sku: item.sku || '',
          items: [],
        });
      }
      map.get(key)!.items.push({ ...item, globalIndex: index });
    });

    return Array.from(map.values());
  }, [colorImagesList]);

  // Tab 5: Dung lượng & Biến thể giá
  const [variantOrigPrice, setVariantOrigPrice] = useState<string>('');
  const [variantPrice, setVariantPrice] = useState<string>('');
  const [variantStorage, setVariantStorage] = useState('');
  const [selectedColorsForVariant, setSelectedColorsForVariant] = useState<string[]>([]);
  const [expandedStorages, setExpandedStorages] = useState<Record<string, boolean>>({});
  const [editingStorageName, setEditingStorageName] = useState<string | null>(null);
  const [variantsList, setVariantsList] = useState(
    product.variants && product.variants.length > 0
      ? product.variants
      : []
  );

  // Nhóm danh sách biến thể theo Dung lượng
  const groupedVariants = useMemo(() => {
    const map = new Map<
      string,
      {
        storage: string;
        minPrice: number;
        maxPrice: number;
        items: (typeof variantsList[0] & { globalIndex: number })[];
      }
    >();

    variantsList.forEach((v, index) => {
      const key = (v.storage || 'Tiêu chuẩn').trim();
      if (!map.has(key)) {
        map.set(key, {
          storage: key,
          minPrice: v.price || 0,
          maxPrice: v.price || 0,
          items: [],
        });
      }
      const g = map.get(key)!;
      g.items.push({ ...v, globalIndex: index });
      if (v.price > 0 && (g.minPrice === 0 || v.price < g.minPrice)) g.minPrice = v.price;
      if (v.price > g.maxPrice) g.maxPrice = v.price;
    });

    return Array.from(map.values());
  }, [variantsList]);

  // Danh sách các màu có sẵn đúng từ Tab 4 (Màu - Ảnh sản phẩm)
  const availableColors = useMemo(() => {
    return groupedColorImages.map((g) => ({
      id: g.colorName,
      name: g.colorName,
      sku: g.sku,
      displayName: g.sku ? `${g.sku} - ${g.colorName}` : g.colorName,
    }));
  }, [groupedColorImages]);

  const handleToggleColorSelection = (colorName: string) => {
    setSelectedColorsForVariant((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName]
    );
  };

  const handleSelectAllColors = () => {
    setSelectedColorsForVariant(availableColors.map((c) => c.name));
  };

  const handleDeselectAllColors = () => {
    setSelectedColorsForVariant([]);
  };

  // Tính % giảm giá tự động cho biến thể
  const numOrig = parseCurrencyDigits(variantOrigPrice);
  const numPrice = parseCurrencyDigits(variantPrice);
  const variantDiscountPercent =
    numOrig > 0 && numPrice > 0 && numOrig > numPrice
      ? Math.round(((numOrig - numPrice) / numOrig) * 100)
      : 0;

  // Xử lý ô nhập giá tiền: nhập số tự nhiên mượt mà không bị giật/nhảy số khi dùng Unikey / EVKey, tự format dấu chấm khi blur
  const handlePriceInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const raw = e.target.value;
    if (!raw.trim()) {
      setter('');
      return;
    }
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      setter('');
      return;
    }
    const clean = digits.replace(/^0+(?=\d)/, '');
    setter(clean);
  };

  const handlePriceInputFocus = (
    e: React.FocusEvent<HTMLInputElement>,
    value: string,
    setter: (val: string) => void
  ) => {
    e.target.select();
    const digits = value.replace(/\D/g, '');
    if (digits && digits !== value) {
      setter(digits);
    }
  };

  const handlePriceInputBlur = (
    value: string,
    setter: (val: string) => void
  ) => {
    if (!value || !value.trim()) return;
    const formatted = formatInputCurrency(value);
    setter(formatted);
  };

  // Tab 6: Thông tin sản phẩm
  const [descriptionHtml, setDescriptionHtml] = useState(
    product.description ||
      `<p><strong>${product.name}</strong> là dòng smartphone thế hệ mới đột phá với thiết kế viền siêu mỏng, hiệu năng dẫn đầu phân khúc và cụm camera sắc nét vượt trội.</p>\n<p>Sản phẩm chính hãng hỗ trợ trả góp 0%, bảo hành 12 tháng tại các trung tâm trên toàn quốc.</p>`
  );

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const lastSyncedProductIdRef = useRef<string | number | null>(initialProduct.id);

  // Tự động đồng bộ khi product prop cập nhật từ server (chống ghi đè khi đang gõ phím)
  useEffect(() => {
    if (!initialProduct) return;
    setProduct(initialProduct);

    // Nếu chuyển sang xem sản phẩm khác hoàn toàn thì mới reset toàn bộ form
    if (String(initialProduct.id) !== String(lastSyncedProductIdRef.current)) {
      lastSyncedProductIdRef.current = initialProduct.id;
      setProductName(initialProduct.name || '');
      setProductStock(String(initialProduct.stock ?? 0));
      if (initialProduct.specifications) setSpecJson(initialProduct.specifications);
      if (initialProduct.youtubeId !== undefined) setYoutubeId(initialProduct.youtubeId);
      if (initialProduct.skus) setSkus(initialProduct.skus);
      if (initialProduct.folders) setFolders(initialProduct.folders);
      if (initialProduct.colorImages) setColorImagesList(initialProduct.colorImages);
      if (initialProduct.variants) setVariantsList(initialProduct.variants);
      if (initialProduct.original_price !== undefined) setVariantOrigPrice(formatInputCurrency(initialProduct.original_price));
      if (initialProduct.price !== undefined) setVariantPrice(formatInputCurrency(initialProduct.price));
      if (initialProduct.description) setDescriptionHtml(initialProduct.description);
    } else {
      // Cùng 1 sản phẩm: chỉ phục hồi danh sách nếu trước đó bị rỗng
      if (initialProduct.colorImages && initialProduct.colorImages.length > 0 && colorImagesList.length === 0) {
        setColorImagesList(initialProduct.colorImages);
      }
      if (initialProduct.variants && initialProduct.variants.length > 0 && variantsList.length === 0) {
        setVariantsList(initialProduct.variants);
      }
      if (initialProduct.skus && initialProduct.skus.length > 0 && skus.length === 0) {
        setSkus(initialProduct.skus);
      }
      if (initialProduct.folders && initialProduct.folders.length > 0 && folders.length === 0) {
        setFolders(initialProduct.folders);
      }
    }
  }, [initialProduct]);

  // Helper to persist detail changes to Cloudflare D1 / database
  const persistProductToDb = async (updated: AdminProductItem, successMessage: string) => {
    setProduct(updated);
    if (onUpdateProduct) onUpdateProduct(updated);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('admin_active_product_detail', JSON.stringify(updated));
      } catch {}
    }
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

  const handleDownloadJson = () => {
    try {
      const parsed = JSON.parse(specJson || '{}');
      const formatted = JSON.stringify(parsed, null, 2);
      const blob = new Blob([formatted], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeSlug = (product.slug || productName || 'thong-so-ky-thuat')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      a.download = `${safeSlug}-specifications.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Đã tải xuống file JSON thông số kỹ thuật!');
    } catch {
      toast.error('Nội dung JSON hiện tại không hợp lệ để tải xuống');
    }
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
      stock: parseCurrencyDigits(productStock),
      specifications: specJson,
      youtubeId,
    };
    persistProductToDb(updated, 'Đã lưu thông tin chi tiết sản phẩm!');
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
    persistProductToDb(updated, `Đã thêm SKU "${newSkuInput.trim()}" `);
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
    persistProductToDb(updated, `Đã thêm thư mục "${newFolderInput.trim()}" `);
  };

  const handleDeleteFolder = (folderToDelete: string) => {
    const nextFolders = folders.filter((f) => f !== folderToDelete);
    setFolders(nextFolders);
    const updated: AdminProductItem = { ...product, folders: nextFolders };
    persistProductToDb(updated, `Đã xóa thư mục "${folderToDelete}"`);
  };

  // 4. Xử lý Tab 4 (Màu - Ảnh sản phẩm)
  const handleUploadMultipleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingColorImage(true);
      const fileList = Array.from(files);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const formData = new FormData();
        formData.append('file', file);
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (data.success && data.url) {
            uploadedUrls.push(data.url);
          }
        } catch (err) {
          console.error('Lỗi khi tải ảnh', file.name, err);
        }
      }

      if (uploadedUrls.length > 0) {
        setStagedImages((prev) => [...prev, ...uploadedUrls]);
        toast.success(`Đã tải lên ${uploadedUrls.length} ảnh!`);
      } else {
        toast.error('Không thể tải ảnh lên máy chủ, vui lòng thử lại');
      }
    } catch {
      toast.error('Lỗi kết nối khi tải ảnh');
    } finally {
      setUploadingColorImage(false);
      if (colorFileInputRef.current) {
        colorFileInputRef.current.value = '';
      }
    }
  };

  const handleAddImageUrlToStaged = () => {
    const url = colorImageInput.trim();
    if (!url) return;
    setStagedImages((prev) => [...prev, url]);
    setColorImageInput('');
    toast.success('Đã thêm đường dẫn ảnh vào danh sách chờ!');
  };

  const handleRemoveStagedImage = (indexToRemove: number) => {
    setStagedImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // Drag & drop sắp xếp cho ảnh đang chờ lưu (Staged images)
  const handleStagedDragStart = (e: React.DragEvent, index: number) => {
    setDraggedStagedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleStagedDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStagedIndex !== index) {
      setDragOverStagedIndex(index);
    }
  };

  const handleStagedDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedStagedIndex === null || draggedStagedIndex === targetIndex) {
      setDraggedStagedIndex(null);
      setDragOverStagedIndex(null);
      return;
    }
    const next = [...stagedImages];
    const [movedItem] = next.splice(draggedStagedIndex, 1);
    next.splice(targetIndex, 0, movedItem);
    setStagedImages(next);
    setDraggedStagedIndex(null);
    setDragOverStagedIndex(null);
    toast.info('Đã đổi thứ tự ảnh!');
  };

  const handleStagedDragEnd = () => {
    setDraggedStagedIndex(null);
    setDragOverStagedIndex(null);
  };

  // Drag & drop sắp xếp cho danh sách ảnh đã tạo (Saved color images)
  const handleSavedDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSavedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleSavedDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSavedIndex !== index) {
      setDragOverSavedIndex(index);
    }
  };

  const handleSavedDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedSavedIndex === null || draggedSavedIndex === targetIndex) {
      setDraggedSavedIndex(null);
      setDragOverSavedIndex(null);
      return;
    }
    const nextList = [...colorImagesList];
    const [movedItem] = nextList.splice(draggedSavedIndex, 1);
    nextList.splice(targetIndex, 0, movedItem);
    setColorImagesList(nextList);
    setDraggedSavedIndex(null);
    setDragOverSavedIndex(null);

    const updated: AdminProductItem = { ...product, colorImages: nextList };
    persistProductToDb(updated, 'Đã cập nhật và lưu thứ tự ảnh sản phẩm');
  };

  const handleSavedDragEnd = () => {
    setDraggedSavedIndex(null);
    setDragOverSavedIndex(null);
  };

  const handleMoveSavedImage = (index: number, direction: 'prev' | 'next') => {
    const targetIndex = direction === 'prev' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= colorImagesList.length) return;
    const nextList = [...colorImagesList];
    const [moved] = nextList.splice(index, 1);
    nextList.splice(targetIndex, 0, moved);
    setColorImagesList(nextList);
    const updated: AdminProductItem = { ...product, colorImages: nextList };
    persistProductToDb(updated, 'Đã đổi thứ tự ảnh');
  };

  const toggleColorExpand = (colorName: string) => {
    setExpandedColors((prev) => ({
      ...prev,
      [colorName]: !prev[colorName],
    }));
  };

  const handleDeleteColorGroup = (colorName: string) => {
    const nextList = colorImagesList.filter(
      (item) => (item.colorName || '').trim().toLowerCase() !== colorName.trim().toLowerCase()
    );
    setColorImagesList(nextList);
    const updated: AdminProductItem = { ...product, colorImages: nextList };
    persistProductToDb(updated, `Đã xóa toàn bộ ảnh của màu "${colorName}"`);
  };

  const handleStartEditColorGroup = (group: {
    colorName: string;
    folder: string;
    sku: string;
    items: (ColorImageItem & { globalIndex: number })[];
  }) => {
    setEditingColorName(group.colorName);
    setColorNameInput(group.colorName);
    setSelectedFolderForColor(group.folder || folders[0] || '');
    setSelectedSkuForColor(group.sku || skus[0] || '');
    setStagedImages(group.items.map((it) => it.imageUrl));
    setColorImageInput('');

    const formElement = document.getElementById('color-image-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    toast.info(`Đang sửa màu "${group.colorName}". Bạn có thể chỉnh sửa tên, ảnh rồi bấm Cập nhật.`);
  };

  const handleCancelEditColorGroup = () => {
    setEditingColorName(null);
    setColorNameInput('');
    setStagedImages([]);
    setColorImageInput('');
  };

  const handleAddColorImage = (e: React.FormEvent) => {
    e.preventDefault();
    const finalColorName = colorNameInput.trim();
    if (!finalColorName) {
      toast.error('Vui lòng nhập tên màu sắc');
      return;
    }

    const imagesToSave = [...stagedImages];
    if (colorImageInput.trim() && !imagesToSave.includes(colorImageInput.trim())) {
      imagesToSave.push(colorImageInput.trim());
    }

    if (imagesToSave.length === 0) {
      toast.error('Vui lòng chọn tệp ảnh từ máy tính hoặc dán link ảnh');
      return;
    }

    const newEntries = imagesToSave.map((imgUrl, index) => ({
      id: `${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
      folder: selectedFolderForColor || '',
      sku: selectedSkuForColor || '',
      colorName: finalColorName,
      imageUrl: imgUrl,
    }));

    let nextList: typeof colorImagesList;
    if (editingColorName) {
      const withoutOld = colorImagesList.filter(
        (it) => (it.colorName || '').trim().toLowerCase() !== editingColorName.trim().toLowerCase()
      );
      nextList = [...withoutOld, ...newEntries];
    } else {
      nextList = [...newEntries, ...colorImagesList];
    }

    setColorImagesList(nextList);
    setStagedImages([]);
    setColorImageInput('');
    setColorNameInput('');
    const prevEditing = editingColorName;
    setEditingColorName(null);

    const updated: AdminProductItem = { ...product, colorImages: nextList };
    persistProductToDb(
      updated,
      prevEditing
        ? `Đã cập nhật màu "${finalColorName}" (${newEntries.length} ảnh)!`
        : `Đã lưu ${newEntries.length} ảnh cho màu "${finalColorName}"`
    );
  };

  const handleDeleteColorImage = (id: string) => {
    const nextList = colorImagesList.filter((item) => item.id !== id);
    setColorImagesList(nextList);
    const updated: AdminProductItem = { ...product, colorImages: nextList };
    persistProductToDb(updated, 'Đã xóa ảnh màu');
  };

  // 5. Xử lý Tab 5 (Dung lượng)
  const toggleStorageExpand = (storageName: string) => {
    setExpandedStorages((prev) => ({
      ...prev,
      [storageName]: !prev[storageName],
    }));
  };

  const handleDeleteStorageGroup = (storageName: string) => {
    const nextList = variantsList.filter(
      (v) => (v.storage || '').trim().toLowerCase() !== storageName.trim().toLowerCase()
    );
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
    persistProductToDb(updated, `Đã xóa toàn bộ biến thể của dung lượng "${storageName}"`);
  };

  const handleStartEditStorageGroup = (group: {
    storage: string;
    items: (typeof variantsList[0] & { globalIndex: number })[];
  }) => {
    setEditingStorageName(group.storage);
    setVariantStorage(group.storage);
    const first = group.items[0];
    if (first) {
      setVariantOrigPrice(formatInputCurrency(first.original_price));
      setVariantPrice(formatInputCurrency(first.price));
    }
    setSelectedColorsForVariant(group.items.map((it) => it.color));

    const formElement = document.getElementById('storage-variant-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    toast.info(`Đang sửa dung lượng "${group.storage}". Bạn có thể chỉnh giá, chọn lại màu rồi bấm Cập nhật.`);
  };

  const handleCancelEditStorageGroup = () => {
    setEditingStorageName(null);
    setSelectedColorsForVariant([]);
    setVariantStorage('');
    setVariantOrigPrice('');
    setVariantPrice('');
  };

  const handleAddVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedColorsForVariant.length === 0) {
      toast.error('Vui lòng chọn ít nhất một màu sắc ở cột bên trái');
      return;
    }
    const cleanStorage = variantStorage.trim();
    if (!cleanStorage) {
      toast.error('Vui lòng nhập dung lượng (ví dụ: 128GB, 256GB...)');
      return;
    }

    const origP = parseCurrencyDigits(variantOrigPrice);
    const p = parseCurrencyDigits(variantPrice);
    const disc = origP > 0 && p > 0 && origP > p ? Math.round(((origP - p) / origP) * 100) : 0;

    const newEntries = selectedColorsForVariant.map((colorName, idx) => ({
      id: `${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      color: colorName,
      storage: cleanStorage,
      original_price: origP,
      price: p,
      discount_percent: disc,
    }));

    let nextList: typeof variantsList;
    if (editingStorageName) {
      const withoutOld = variantsList.filter(
        (v) => (v.storage || '').trim().toLowerCase() !== editingStorageName.trim().toLowerCase()
      );
      nextList = [...withoutOld, ...newEntries];
    } else {
      const existingKeys = new Set(newEntries.map((e) => `${e.storage}_${e.color}`.toLowerCase()));
      const withoutDuplicates = variantsList.filter((v) => !existingKeys.has(`${v.storage}_${v.color}`.toLowerCase()));
      nextList = [...withoutDuplicates, ...newEntries];
    }

    setVariantsList(nextList);
    const prevEditing = editingStorageName;
    setEditingStorageName(null);
    setSelectedColorsForVariant([]);
    setVariantStorage('');
    setVariantOrigPrice('');
    setVariantPrice('');

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
    persistProductToDb(
      updated,
      prevEditing
        ? `Đã cập nhật dung lượng "${cleanStorage}" (${newEntries.length} biến thể)!`
        : `Đã lưu ${newEntries.length} biến thể cho dung lượng "${cleanStorage}"!`
    );
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
    persistProductToDb(updated, 'Đã lưu tất cả biến thể dung lượng!');
  };

  // 6. Xử lý Tab 6 (Thông tin sản phẩm)
  const handleSaveDescription = () => {
    const updated: AdminProductItem = { ...product, description: descriptionHtml };
    persistProductToDb(updated, 'Đã lưu bài viết mô tả sản phẩm!');
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
                onClick={() => handleTabChange(tab.id as DetailTab)}
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
                      type="text"
                      inputMode="numeric"
                      value={productStock}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (!raw.trim()) {
                          setProductStock('');
                          return;
                        }
                        const digits = raw.replace(/\D/g, '');
                        if (!digits) {
                          setProductStock('');
                          return;
                        }
                        const clean = digits.replace(/^0+(?=\d)/, '');
                        setProductStock(clean);
                      }}
                      onBlur={() => {
                        if (!productStock || !productStock.trim()) {
                          setProductStock('0');
                        }
                      }}
                      placeholder="0"
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
                        className="h-7 px-2.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                      >
                        <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Chọn file JSON</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadJson}
                        className="h-7 px-2.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                        title="Tải cấu hình thông số JSON hiện tại về máy tính"
                      >
                        <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Tải file JSON</span>
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
                  <input
                    type="text"
                    value={youtubeId}
                    onChange={(e) => setYoutubeId(e.target.value)}
                    placeholder="Ví dụ: dQw4w9WgXcQ hoặc URL video"
                    className="w-full h-8 px-3 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#b80012] transition"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="h-8 px-4 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    Lưu chi tiết sản phẩm
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
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tải lên một hoặc nhiều hình ảnh từ máy tính, xem trước các ảnh đã chọn và xóa nhanh ảnh thừa bằng nút (x).
                </p>
              </div>

              <form id="color-image-form" onSubmit={handleAddColorImage} className="space-y-3.5 pt-1">
                {editingColorName && (
                  <div className="p-2.5 px-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-2 text-xs text-amber-800">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      <span>Đang chỉnh sửa màu <strong>"{editingColorName}"</strong> ({stagedImages.length} ảnh)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelEditColorGroup}
                      className="text-xs font-bold text-amber-900 hover:underline cursor-pointer"
                    >
                      Hủy sửa
                    </button>
                  </div>
                )}
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
                      {folders.length === 0 ? (
                        <option value="">(Chưa tạo thư mục)</option>
                      ) : (
                        folders.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))
                      )}
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
                      {skus.length === 0 ? (
                        <option value="">(Chưa tạo SKU)</option>
                      ) : (
                        skus.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên màu sắc <span className="text-red-500">*</span>
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
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Tải lên hình ảnh sản phẩm (chọn 1 hoặc nhiều ảnh)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Hỗ trợ: PNG, JPG, WEBP (tối đa 10MB/ảnh)
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={colorFileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleUploadMultipleImages}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      disabled={uploadingColorImage}
                      onClick={() => colorFileInputRef.current?.click()}
                      className="h-8 px-3.5 rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-slate-400 text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-2xs"
                    >
                      {uploadingColorImage ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-[#b80012]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          <span>Đang tải ảnh...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-[#b80012]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Chọn tệp ảnh từ máy tính</span>
                        </>
                      )}
                    </button>

                    <span className="text-[11px] text-slate-400 font-medium">hoặc nhập link ảnh:</span>

                    <div className="flex items-center gap-1 flex-1 min-w-[200px]">
                      <input
                        type="text"
                        value={colorImageInput}
                        onChange={(e) => setColorImageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImageUrlToStaged();
                          }
                        }}
                        placeholder="Dán link ảnh (https://...)"
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#b80012] transition"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrlToStaged}
                        className="h-8 px-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition shrink-0 cursor-pointer"
                        title="Thêm link ảnh vào danh sách chờ"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>

                  {/* KHU VỰC HIỂN THỊ ẢNH XEM TRƯỚC (MINI VUÔNG NGAY DƯỚI CHÂN CÓ NÚT X ĐỎ Ở GÓC) */}
                  {stagedImages.length > 0 && (
                    <div className="pt-2.5 border-t border-slate-200/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span>Ảnh đã chọn ({stagedImages.length})</span>
                          <span className="text-[11px] font-normal text-slate-500">
                            - Bấm nút <strong className="text-red-600">✕</strong> ở góc để xóa ảnh không dùng
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setStagedImages([])}
                          className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                        >
                          Xóa tất cả ({stagedImages.length})
                        </button>
                      </div>

                      {/* Hàng ảnh mini vuông chuẩn kích thước - KÉO THẢ SẮP XẾP THỨ TỰ */}
                      <div className="flex flex-wrap items-center gap-3.5 pt-2 pb-1 px-1">
                        {stagedImages.map((imgUrl, idx) => {
                          const isDragging = draggedStagedIndex === idx;
                          const isDragOver = dragOverStagedIndex === idx && draggedStagedIndex !== idx;
                          return (
                            <div
                              key={`${imgUrl}-${idx}`}
                              draggable
                              onDragStart={(e) => handleStagedDragStart(e, idx)}
                              onDragOver={(e) => handleStagedDragOver(e, idx)}
                              onDrop={(e) => handleStagedDrop(e, idx)}
                              onDragEnd={handleStagedDragEnd}
                              className={`relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl border-2 bg-white p-1 transition-all select-none cursor-grab active:cursor-grabbing flex items-center justify-center ${
                                isDragging
                                  ? 'opacity-30 scale-90 border-slate-400'
                                  : isDragOver
                                  ? 'border-[#b80012] scale-105 shadow-md ring-2 ring-red-200'
                                  : 'border-slate-200 shadow-2xs hover:border-[#b80012]'
                              }`}
                              style={{ position: 'relative' }}
                              title="Kéo thả để sắp xếp lại thứ tự ảnh"
                            >
                              <img
                                src={imgUrl}
                                alt={`Ảnh ${idx + 1}`}
                                className="w-full h-full object-contain rounded-lg select-none pointer-events-none"
                              />
                              {/* Thứ tự ảnh */}
                              <span className="absolute bottom-0.5 left-1 text-[9px] font-bold text-slate-500 bg-white/90 px-1 rounded shadow-2xs">
                                #{idx + 1}
                              </span>
                              {/* Nút X đỏ ghim chuẩn xác 100% tại góc trên bên phải */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveStagedImage(idx);
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '-7px',
                                  right: '-7px',
                                  width: '20px',
                                  height: '20px',
                                  zIndex: 30,
                                }}
                                className="rounded-full bg-[#b80012] hover:bg-red-700 text-white flex items-center justify-center shadow-md transition transform hover:scale-110 cursor-pointer border-2 border-white"
                                title="Xóa ảnh này"
                              >
                                <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-slate-400 italic mt-1.5 flex items-center gap-1">
                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        Mẹo: Nhấp và giữ chuột vào ảnh để kéo thả đổi thứ tự (#1 sẽ là ảnh hiển thị đầu tiên).
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  {editingColorName && (
                    <button
                      type="button"
                      onClick={handleCancelEditColorGroup}
                      className="h-8 px-3.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                  )}
                  <button
                    type="submit"
                    className="h-8 px-5 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>
                      {editingColorName
                        ? `Cập nhật màu "${colorNameInput || editingColorName}"`
                        : `Lưu ${stagedImages.length > 0 ? `${stagedImages.length} ` : ''}ảnh màu`}
                    </span>
                  </button>
                </div>
              </form>

              {/* Danh sách ảnh màu đã lưu - GỘP THEO MÀU */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Danh sách màu sắc đã tạo ({groupedColorImages.length} nhóm màu, {colorImagesList.length} ảnh)</span>
                  </h3>
                </div>

                {groupedColorImages.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400">Chưa có ảnh màu nào được thêm cho sản phẩm này.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupedColorImages.map((group) => {
                      const isExpanded = !!expandedColors[group.colorName];
                      const primaryImage = group.items[0]?.imageUrl || '';

                      return (
                        <div
                          key={group.colorName}
                          className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden transition"
                        >
                          {/* THANH TIÊU ĐỀ GỘP MÀU: ẢNH ĐẠI DIỆN MINI (#1) + TÊN MÀU + THÔNG TIN + NÚT MỞ RỘNG / XÓA */}
                          <div
                            onClick={() => toggleColorExpand(group.colorName)}
                            className="p-3 bg-slate-50/70 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between gap-3 transition select-none"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Ảnh đại diện mini vuông sạch đẹp */}
                              <div className="relative w-12 h-12 rounded-lg border border-slate-200 bg-white p-1 shrink-0 flex items-center justify-center shadow-2xs">
                                {primaryImage ? (
                                  <img
                                    src={primaryImage}
                                    alt={group.colorName}
                                    className="w-full h-full object-contain rounded"
                                  />
                                ) : (
                                  <span className="text-[9px] text-slate-400">No img</span>
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-slate-900 truncate">
                                    {group.colorName}
                                  </h4>
                                  <span className="text-[11px] font-semibold text-[#b80012] bg-red-50 px-2 py-0.5 rounded-full border border-red-100 shrink-0">
                                    {group.items.length} ảnh
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  {group.folder ? (
                                    <span className="text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]">
                                       {group.folder}
                                    </span>
                                  ) : null}
                                  {group.sku ? (
                                    <span className="text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded font-mono truncate max-w-[120px]">
                                      SKU: {group.sku}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            {/* Cụm nút hành động bên phải */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEditColorGroup(group);
                                }}
                                className="h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                                title={`Sửa màu "${group.colorName}"`}
                              >
                                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Sửa</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteColorGroup(group.colorName);
                                }}
                                className="h-7 px-2.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                                title={`Xóa toàn bộ ảnh của màu "${group.colorName}"`}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Xóa màu</span>
                              </button>

                              <div className="h-7 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                                <span>{isExpanded ? 'Thu gọn' : `Xem ${group.items.length} ảnh`}</span>
                                <svg
                                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* KHU VỰC CHI TIẾT CÁC ẢNH KHI MỞ RỘNG */}
                          {isExpanded && (
                            <div className="p-3.5 border-t border-slate-100 bg-white space-y-2.5">
                              <div className="flex items-center justify-between">
                                <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                                  <span>Chi tiết {group.items.length} ảnh của màu "{group.colorName}":</span>
                                  <span className="text-slate-400 font-normal italic">
                                    (Kéo thả để sắp xếp lại thứ tự, ảnh #1 sẽ làm đại diện)
                                  </span>
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                                {group.items.map((item, idxInGroup) => {
                                  const isPrimary = idxInGroup === 0;
                                  const isDragging = draggedSavedIndex === item.globalIndex;
                                  const isDragOver = dragOverSavedIndex === item.globalIndex && draggedSavedIndex !== item.globalIndex;

                                  return (
                                    <div
                                      key={item.id}
                                      draggable
                                      onDragStart={(e) => handleSavedDragStart(e, item.globalIndex)}
                                      onDragOver={(e) => handleSavedDragOver(e, item.globalIndex)}
                                      onDrop={(e) => handleSavedDrop(e, item.globalIndex)}
                                      onDragEnd={handleSavedDragEnd}
                                      className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl border-2 bg-white p-1.5 transition-all select-none cursor-grab active:cursor-grabbing flex items-center justify-center ${
                                        isDragging
                                          ? 'opacity-30 scale-90 border-slate-400'
                                          : isDragOver
                                          ? 'border-[#b80012] scale-105 shadow-md ring-2 ring-red-200'
                                          : isPrimary
                                          ? 'border-[#b80012] shadow-2xs ring-2 ring-red-50'
                                          : 'border-slate-200 shadow-2xs hover:border-slate-400'
                                      }`}
                                      style={{ position: 'relative' }}
                                      title={`Ảnh #${idxInGroup + 1} - Kéo thả để đổi vị trí`}
                                    >
                                      <img
                                        src={item.imageUrl}
                                        alt={`${group.colorName} ${idxInGroup + 1}`}
                                        className="w-full h-full object-contain rounded-lg select-none pointer-events-none"
                                      />

                                      {/* Nút X đỏ ở góc trên bên phải để xóa ảnh lẻ này */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteColorImage(item.id);
                                        }}
                                        style={{
                                          position: 'absolute',
                                          top: '-7px',
                                          right: '-7px',
                                          width: '20px',
                                          height: '20px',
                                          zIndex: 30,
                                        }}
                                        className="rounded-full bg-[#b80012] hover:bg-red-700 text-white flex items-center justify-center shadow-md transition transform hover:scale-110 cursor-pointer border-2 border-white"
                                        title="Xóa ảnh này khỏi màu"
                                      >
                                        <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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
              </div>

              {/* Banner thông báo đang chỉnh sửa dung lượng */}
              {editingStorageName && (
                <div className="flex items-center justify-between px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>
                      Đang chỉnh sửa dung lượng: <strong className="font-bold text-amber-900">{editingStorageName}</strong>. Hãy sửa thông số rồi bấm Cập nhật.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEditStorageGroup}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                  >
                    Hủy sửa
                  </button>
                </div>
              )}

              {/* Form thêm biến thể theo giao diện gọn 2 cột không cần cuộn */}
              <form id="storage-variant-form" onSubmit={handleAddVariant} className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* CỘT TRÁI: Chọn màu (xanh dương nhạt bo viền) */}
                  <div className="md:col-span-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">
                        Chọn màu <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Đã chọn: <strong style={{ color: '#0284c7' }} className="font-bold">{selectedColorsForVariant.length}</strong>/{availableColors.length} màu
                      </span>
                    </div>

                    {/* Danh sách các màu có thể chọn (bo viền xanh dương nhạt) */}
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {availableColors.length === 0 ? (
                        <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-800 text-xs text-center space-y-1">
                          <p className="font-semibold">Chưa có danh sách màu</p>
                          <p className="text-[11px] text-amber-700">
                            Hãy thêm ảnh màu ở mục <strong>4. Màu - Ảnh sản phẩm</strong>.
                          </p>
                        </div>
                      ) : (
                        availableColors.map((c) => {
                          const isSelected = selectedColorsForVariant.includes(c.name);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleToggleColorSelection(c.name)}
                              style={{
                                border: isSelected ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                                backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                                color: isSelected ? '#0369a1' : '#334155',
                                boxShadow: isSelected ? '0 1px 3px rgba(2, 132, 199, 0.12)' : 'none',
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer"
                            >
                              <span>{c.displayName}</span>
                              {isSelected ? (
                                <svg className="w-4 h-4 shrink-0" style={{ color: '#0284c7' }} fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <div className="w-3.5 h-3.5 rounded" style={{ border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Quick actions cho màu */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={handleSelectAllColors}
                        className="text-[11px] font-semibold text-slate-700 hover:text-sky-700 bg-slate-100 hover:bg-sky-50 px-2.5 py-1 rounded-md transition cursor-pointer border border-slate-200"
                      >
                        Chọn tất cả
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAllColors}
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition cursor-pointer border border-slate-200"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  </div>

                  {/* CỘT PHẢI: Dung lượng, Giá gốc, Giá bán, % Giảm và Duy nhất 1 Nút Đỏ */}
                  <div className="md:col-span-6 space-y-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-800">
                          Dung lượng <span className="text-red-500">*</span>
                        </label>
                        {/* Gợi ý nhanh dung lượng */}
                        <div className="flex flex-wrap items-center gap-1">
                          {['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setVariantStorage(st)}
                              style={variantStorage === st ? { backgroundColor: '#e0f2fe', color: '#0369a1', borderColor: '#7dd3fc' } : {}}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer border ${
                                variantStorage === st
                                  ? ''
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={variantStorage}
                        onChange={(e) => setVariantStorage(e.target.value)}
                        placeholder="Nhập dung lượng (vd: 128GB, 256GB...)"
                        required
                        className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block text-[11px] font-semibold text-slate-700">
                            Giá gốc (VNĐ)
                          </label>
                          {parseCurrencyDigits(variantOrigPrice) > 0 && (
                            <span className="text-[10px] text-slate-500 font-bold">
                              {formatVND(parseCurrencyDigits(variantOrigPrice))}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={variantOrigPrice}
                          onFocus={(e) => handlePriceInputFocus(e, variantOrigPrice, setVariantOrigPrice)}
                          onBlur={() => handlePriceInputBlur(variantOrigPrice, setVariantOrigPrice)}
                          onChange={(e) => handlePriceInputChange(e, setVariantOrigPrice)}
                          placeholder="0"
                          className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block text-[11px] font-semibold text-slate-700">
                            Giá bán (VNĐ)
                          </label>
                          {parseCurrencyDigits(variantPrice) > 0 && (
                            <span className="text-[10px] text-slate-500 font-bold">
                              {formatVND(parseCurrencyDigits(variantPrice))}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={variantPrice}
                          onFocus={(e) => handlePriceInputFocus(e, variantPrice, setVariantPrice)}
                          onBlur={() => handlePriceInputBlur(variantPrice, setVariantPrice)}
                          onChange={(e) => handlePriceInputChange(e, setVariantPrice)}
                          placeholder="0"
                          className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5 text-center">
                          % Giảm
                        </label>
                        <input
                          type="text"
                          value={variantDiscountPercent > 0 ? `-${variantDiscountPercent}%` : '0%'}
                          readOnly
                          className="w-full h-8 px-1 bg-red-50/80 border border-red-200 rounded-lg text-xs font-bold text-[#b80012] text-center"
                        />
                      </div>
                    </div>

                    {/* Duy nhất 1 nút đỏ để Thêm / Cập nhật */}
                    <button
                      type="submit"
                      style={{ backgroundColor: '#b80012', color: '#ffffff' }}
                      className="w-full h-9 rounded-lg bg-[#b80012] hover:bg-[#99000f] text-white text-xs font-bold shadow-xs active:scale-[0.99] transition cursor-pointer flex items-center justify-center text-center"
                    >
                      <span>
                        {editingStorageName
                          ? `Cập nhật dung lượng "${variantStorage}" (${selectedColorsForVariant.length} màu)`
                          : selectedColorsForVariant.length > 0
                          ? `Lưu biến thể (${selectedColorsForVariant.length} màu đã chọn)`
                          : 'Lưu biến thể (Chọn màu bên trái)'}
                      </span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Danh sách biến thể dung lượng đã tạo (dạng Accordion gộp theo dung lượng giống Tab 4) */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold text-slate-700">
                    Danh sách biến thể dung lượng ({groupedVariants.length} nhóm dung lượng, {variantsList.length} biến thể)
                  </h3>
                </div>

                {groupedVariants.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    Chưa có biến thể dung lượng nào. Hãy chọn màu, nhập dung lượng và giá ở trên rồi bấm Lưu.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {groupedVariants.map((group) => {
                      const isExpanded = !!expandedStorages[group.storage];
                      return (
                        <div
                          key={group.storage}
                          className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs transition hover:border-slate-300"
                        >
                          {/* TIÊU ĐỀ NHÓM DUNG LƯỢNG (ACCORDION HEADER - ĐỒNG BỘ 100% VỚI MỤC 4) */}
                          <div
                            onClick={() => toggleStorageExpand(group.storage)}
                            className="p-3.5 bg-slate-50/50 hover:bg-slate-100/60 transition cursor-pointer flex items-center justify-between gap-3 select-none"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              {/* Icon thẻ dung lượng */}
                              <div className="w-12 h-12 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800 shadow-2xs">
                                {group.storage}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-slate-900 truncate">
                                    Dung lượng {group.storage}
                                  </h4>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#b80012]">
                                    {group.items.length} biến thể
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 truncate mt-0.5">
                                  Giá bán: <strong className="text-slate-800 font-bold">{formatVND(group.minPrice)}</strong>
                                  {group.minPrice !== group.maxPrice && ` ~ ${formatVND(group.maxPrice)}`}
                                </p>
                              </div>
                            </div>

                            {/* Cụm nút hành động bên phải (đồng bộ hoàn toàn với Mục 4) */}
                            <div className="flex items-center gap-2 shrink-0">
                              {/* Nút Sửa */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEditStorageGroup(group);
                                }}
                                className="h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                                title={`Sửa dung lượng "${group.storage}"`}
                              >
                                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Sửa</span>
                              </button>

                              {/* Nút Xóa toàn bộ nhóm dung lượng */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteStorageGroup(group.storage);
                                }}
                                className="h-7 px-2.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                                title={`Xóa toàn bộ biến thể của dung lượng "${group.storage}"`}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Xóa nhóm</span>
                              </button>

                              {/* Nút Xem / Thu gọn */}
                              <div className="h-7 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                                <span>{isExpanded ? 'Thu gọn' : `Xem ${group.items.length} biến thể`}</span>
                                <svg
                                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* KHU VỰC CHI TIẾT BẢNG KHI MỞ RỘNG */}
                          {isExpanded && (
                            <div className="p-3 border-t border-slate-100 bg-white">
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
                                      <th className="py-2 px-3 w-16 text-right">Xóa lẻ</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                                    {group.items.map((v, idx) => (
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
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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
