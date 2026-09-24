import HeroVideoSlider from '@/components/home/HeroVideoSlider';
import OfferAndBlog from '@/components/home/OfferAndBlog';
import BrandScroll from '@/components/home/BrandScroll';
import HotSaleBox from '@/components/home/HotSaleBox';
import ProductFilterGrid from '@/components/home/ProductFilterGrid';
import VideoShortsReview from '@/components/home/VideoShortsReview';
import UuDaiDa from '@/components/home/UuDaiDa';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import { FEATURED_PRODUCTS } from '@/components/product/mock-products';

// Danh sách hãng tương thích cho bộ lọc
const BRANDS_DATA = [
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

// Dữ liệu sản phẩm mẫu có bổ sung thông số phục vụ bộ lọc nâng cao
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'iPhone 15 128GB Chính Hãng',
    slug: 'iphone-15',
    brand: 'iphone',
    image: '/icons/logo_iphone_ngang_eac93ff477.webp',
    price: 17990000,
    original_price: 19990000,
    discount_percent: 10,
    stock: 10,
    os: 'ios',
    rom: 'lte128',
    ram: '6',
  },
  {
    id: 2,
    name: 'iPhone 14 Pro Max 128GB',
    slug: 'iphone-14-pro-max',
    brand: 'iphone',
    image: '/icons/logo_iphone_ngang_eac93ff477.webp',
    price: 26990000,
    original_price: 29990000,
    discount_percent: 10,
    stock: 5,
    os: 'ios',
    rom: 'lte128',
    ram: '6',
  },
  {
    id: 3,
    name: 'iPhone 17 Pro Max 1TB Cam Vũ Trụ',
    slug: 'iphone-17-pro-max',
    brand: 'iphone',
    image: '/icons/logo_iphone_ngang_eac93ff477.webp',
    price: 34190000,
    original_price: 37990000,
    discount_percent: 10,
    stock: 12,
    os: 'ios',
    rom: '1tb',
    ram: '12',
  },
  {
    id: 4,
    name: 'Samsung Galaxy S25 Ultra 512GB',
    slug: 'galaxy-s25-ultra',
    brand: 'samsung',
    image: '/icons/logo_samsung_ngang_1624d75bd8.webp',
    price: 29040000,
    original_price: 33300000,
    discount_percent: 12,
    stock: 8,
    os: 'android',
    rom: '512',
    ram: '12',
  },
  {
    id: 5,
    name: 'iPhone 17 tiêu chuẩn 256GB',
    slug: 'iphone-17',
    brand: 'iphone',
    image: '/icons/logo_iphone_ngang_eac93ff477.webp',
    price: 22490000,
    original_price: 24990000,
    discount_percent: 10,
    stock: 15,
    os: 'ios',
    rom: '256',
    ram: '8',
  },
  {
    id: 6,
    name: 'Xiaomi 15 Ultra Camera Leica',
    slug: 'xiaomi-15-ultra',
    brand: 'xiaomi',
    image: '/icons/logo_xiaomi_ngang_0faf267234.webp',
    price: 24990000,
    original_price: 26990000,
    discount_percent: 7,
    stock: 6,
    os: 'android',
    rom: '512',
    ram: '16',
  },
];

export default function HomePage() {
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
        suggestedProducts={FEATURED_PRODUCTS}
        bestSellerProducts={FEATURED_PRODUCTS}
        hotSaleProducts={FEATURED_PRODUCTS}
      />

      {/* 5. Bộ lọc & Sản phẩm nổi bật */}
      <ProductFilterGrid
        brands={BRANDS_DATA}
        products={FEATURED_PRODUCTS}
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