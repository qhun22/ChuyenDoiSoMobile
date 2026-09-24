'use client';

import { useState, useEffect } from 'react';
import HeroVideoSlider from '@/components/home/HeroVideoSlider';
import OfferAndBlog from '@/components/home/OfferAndBlog';
import BrandScroll from '@/components/home/BrandScroll';
import HotSaleBox from '@/components/home/HotSaleBox';
import ProductFilterGrid from '@/components/home/ProductFilterGrid';
import VideoShortsReview from '@/components/home/VideoShortsReview';
import UuDaiDa from '@/components/home/UuDaiDa';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import { FEATURED_PRODUCTS } from '@/components/product/mock-products';

// Danh sách hãng tương thích mặc định
const DEFAULT_BRANDS = [
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
];

export default function HomePage() {
  const [products, setProducts] = useState<any[]>(FEATURED_PRODUCTS);
  const [brands, setBrands] = useState(DEFAULT_BRANDS);

  useEffect(() => {
    // 1. Fetch live products from database API
    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setProducts(data.data);
        }
      })
      .catch(() => {});

    // 2. Fetch live brands from database API
    fetch('/api/brands')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setBrands(
            data.data.map((b: any) => ({
              name: b.name,
              slug: b.slug || b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      {/* 1. Header Slider Banner */}
      <HeroVideoSlider />

      {/* 2. Hai banner phụ đầu trang (Say Hi! S-STUDENT / SALE CHÀO ĐẠI LỄ) */}
      <OfferAndBlog />

      {/* 3. Dải Hãng nổi bật cuộn vô tận */}
      <BrandScroll />

      {/* 4. Khối HotSale Hộp Tết */}
      <HotSaleBox
        suggestedProducts={products}
        bestSellerProducts={products}
        hotSaleProducts={products}
      />

      {/* 5. Bộ lọc & Sản phẩm nổi bật */}
      <ProductFilterGrid
        brands={brands}
        products={products}
      />

      {/* 6. Review Sản Phẩm (Video Shorts dọc) */}
      <VideoShortsReview />

      {/* 7. Khối Ưu Đãi Đa Nền Tảng (4 banner) + Blog tin tức */}
      <UuDaiDa />

      {/* 8. Tại Sao Nên Chọn Chúng Tôi? (4 tiêu chí USP) */}
      <WhyChooseUs />
    </div>
  );
}