import { Metadata } from 'next';
import Link from 'next/link';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import ProductDetailClient from '@/components/product-detail/ProductDetailClient';
import { ProductDetailData } from '@/components/product-detail/types';
import { FEATURED_PRODUCTS, ProductItemData } from '@/components/product/mock-products';

export const runtime = 'nodejs';

type ProductEnv = CloudflareEnv & { DB?: D1Database };

// Helper map D1 row sang ProductDetailData
function mapDbRowToProductDetail(row: any): ProductDetailData {
  let skus: string[] = [];
  let folders: string[] = [];
  let variants: any[] = [];
  let colorImages: any[] = [];

  try { skus = typeof row.skus === 'string' ? JSON.parse(row.skus) : (row.skus || []); } catch {}
  try { folders = typeof row.folders === 'string' ? JSON.parse(row.folders) : (row.folders || []); } catch {}
  try { variants = typeof row.variants === 'string' ? JSON.parse(row.variants) : (row.variants || []); } catch {}
  try { colorImages = typeof row.color_images === 'string' ? JSON.parse(row.color_images) : (row.color_images || []); } catch {}

  const origPrice = Number(row.original_price || row.price || 0);
  const price = Number(row.price || 0);
  const discount = Number(row.discount_percent) || (origPrice > price && origPrice > 0 ? Math.round(((origPrice - price) / origPrice) * 100) : 0);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand ? String(row.brand).toUpperCase() : 'APPLE',
    image: row.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
    price,
    original_price: origPrice,
    discount_percent: discount,
    stock: Number(row.stock ?? 10),
    inStock: Boolean(row.in_stock ?? true),
    specifications: row.specifications || '{}',
    youtubeId: row.youtube_id || 'dQw4w9WgXcQ',
    skus,
    folders,
    variants,
    colorImages,
    description: row.description || `<p><strong>${row.name}</strong> là dòng smartphone chính hãng bảo hành 12 tháng, hỗ trợ trả góp 0% và giao hàng toàn quốc.</p>`,
  };
}

// Lấy thông tin sản phẩm từ D1 Database hoặc mock data
async function getProductBySlug(slug: string): Promise<ProductDetailData | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const database = (env as ProductEnv)?.DB;

    if (database) {
      const row = await database
        .prepare('SELECT * FROM products WHERE slug = ?')
        .bind(slug)
        .first();

      if (row) {
        return mapDbRowToProductDetail(row);
      }
    }
  } catch {
    // Không có context Cloudflare (local development)
  }

  // Fallback: Tìm trong FEATURED_PRODUCTS
  const found = FEATURED_PRODUCTS.find(
    (p) => p.slug.toLowerCase() === slug.toLowerCase()
  );

  if (found) {
    const origPrice = found.original_price || found.price;
    const price = found.price;
    const discount = found.discount_percent || (origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0);

    return {
      id: found.id,
      name: found.name,
      slug: found.slug,
      brand: found.brand ? found.brand.toUpperCase() : 'APPLE',
      image: found.image,
      price,
      original_price: origPrice,
      discount_percent: discount,
      stock: found.stock ?? 10,
      inStock: found.inStock,
      installment0: found.installment0,
      specifications: JSON.stringify({
        groups: [
          {
            name: 'Màn hình & Hiển thị',
            items: [
              { label: 'Kích thước màn hình', value: found.screen_size ? `${found.screen_size} inch` : '6.1 inch' },
              { label: 'Công nghệ màn hình', value: 'Super Retina XDR OLED' },
              { label: 'Tần số quét', value: found.refresh_rate?.[0] ? `${found.refresh_rate[0]}Hz` : '60Hz' },
            ],
          },
          {
            name: 'Hiệu năng & Bộ nhớ',
            items: [
              { label: 'Hệ điều hành', value: found.os === 'ios' ? 'iOS' : 'Android' },
              { label: 'Bộ nhớ RAM', value: found.ram ? `${found.ram} GB` : '8 GB' },
              { label: 'Bộ nhớ trong (ROM)', value: found.rom ? `${found.rom.replace('lte', '')} GB` : '128 GB' },
            ],
          },
          {
            name: 'Pin & Sạc',
            items: [
              { label: 'Dung lượng pin', value: found.battery ? `${found.battery.replace('gt', '>').replace('_', ' - ')} mAh` : '4000 mAh' },
              { label: 'Công nghệ sạc', value: 'Sạc nhanh 20W, sạc không dây' },
            ],
          },
        ],
      }),
      youtubeId: 'dQw4w9WgXcQ',
      skus: [],
      folders: [],
      variants: [
        {
          id: 'v-1',
          storage: '128GB',
          color: 'Titan Tự Nhiên',
          original_price: origPrice,
          price: price,
          discount_percent: discount,
          stock: 10,
        },
        {
          id: 'v-2',
          storage: '256GB',
          color: 'Đen Không Gian',
          original_price: origPrice + 2000000,
          price: price + 1800000,
          discount_percent: discount,
          stock: 8,
        },
        {
          id: 'v-3',
          storage: '512GB',
          color: 'Trắng Titan',
          original_price: origPrice + 5000000,
          price: price + 4500000,
          discount_percent: discount,
          stock: 5,
        },
      ],
      colorImages: [
        {
          id: 'c-1',
          colorName: 'Titan Tự Nhiên',
          imageUrl: found.image,
        },
      ],
      description: `<p><strong>${found.name}</strong> là mẫu điện thoại thông minh cao cấp sở hữu phong cách thiết kế hiện đại, màn hình sắc nét và hiệu năng hàng đầu phân khúc.</p>\n<p>Sản phẩm chính hãng hỗ trợ trả góp 0% lãi suất, bảo hành 12 tháng tại các trung tâm trên toàn quốc và giao hàng nhanh trong 2H.</p>`,
    };
  }

  return null;
}

// Lấy danh sách sản phẩm tương tự
async function getRelatedProducts(brand: string, currentSlug: string): Promise<ProductItemData[]> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const database = (env as ProductEnv)?.DB;

    if (database) {
      const results = await database
        .prepare('SELECT * FROM products WHERE slug != ? ORDER BY id DESC LIMIT 5')
        .bind(currentSlug)
        .all();

      if (results.results && results.results.length > 0) {
        return (results.results as any[]).map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          brand: r.brand,
          image: r.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=80',
          original_price: Number(r.original_price || r.price || 0),
          price: Number(r.price || 0),
          discount_percent: Number(r.discount_percent || 0),
          inStock: Boolean(r.in_stock ?? true),
          stock: Number(r.stock ?? 10),
          installment0: true,
        }));
      }
    }
  } catch {}

  // Fallback từ FEATURED_PRODUCTS
  const filtered = FEATURED_PRODUCTS.filter(
    (p) => p.slug.toLowerCase() !== currentSlug.toLowerCase()
  );
  return filtered.slice(0, 5);
}

// Dynamic SEO Metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Sản phẩm không tồn tại | Chuyển Đổi Số Mobile',
      description: 'Không tìm thấy sản phẩm yêu cầu',
    };
  }

  const priceStr = new Intl.NumberFormat('vi-VN').format(product.price);
  return {
    title: `${product.name} - Giá Tốt Nhất ${priceStr}đ | Chuyển Đổi Số Mobile`,
    description: `Mua ${product.name} chính hãng giá chỉ ${priceStr}đ. Hỗ trợ trả góp 0%, bảo hành 12 tháng, giao hàng hỏa tốc trong 2H tại Chuyển Đổi Số Mobile.`,
    openGraph: {
      title: `${product.name} - ${priceStr}đ`,
      description: `Mua ${product.name} chính hãng ưu đãi trả góp 0% tại Chuyển Đổi Số Mobile`,
      images: [product.image],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <main className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-['Signika',sans-serif]">
        <div className="w-16 h-16 rounded-full bg-red-50 text-[#b80012] flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Không tìm thấy sản phẩm
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6">
          Sản phẩm có đường dẫn &ldquo;{slug}&rdquo; có thể đã ngừng kinh doanh hoặc đường dẫn không chính xác.
        </p>
        <Link
          href="/products"
          className="h-10 px-6 rounded-xl bg-[#b80012] hover:bg-[#99000f] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow-md"
        >
          <span>← Quay lại danh mục sản phẩm</span>
        </Link>
      </main>
    );
  }

  const related = await getRelatedProducts(product.brand, product.slug);

  return (
    <main className="w-full">
      <ProductDetailClient product={product} relatedProducts={related} />
    </main>
  );
}
