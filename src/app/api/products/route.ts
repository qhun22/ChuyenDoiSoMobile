import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { NextResponse } from 'next/server';
import { FEATURED_PRODUCTS } from '@/components/product/mock-products';

export const runtime = 'nodejs';

export interface DbProductItem {
  id: number | string;
  name: string;
  slug: string;
  brand: string;
  image: string;
  price: number;
  original_price: number;
  discount_percent: number;
  stock: number;
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
  created_at?: string;
}

type ProductEnv = CloudflareEnv & { DB?: D1Database };

// Initial seed data generator
const INITIAL_PRODUCTS: DbProductItem[] = FEATURED_PRODUCTS.map((p, idx) => ({
  id: Number(p.id) || idx + 1,
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
  created_at: '2026-02-24 10:00:00',
}));

// Fallback in-memory store for local development
let devProductsStore: DbProductItem[] = [...INITIAL_PRODUCTS];

async function getDatabase(): Promise<D1Database | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const database = (env as ProductEnv)?.DB;
    if (!database) return null;

    // Check & create products table if not exists
    const table = await database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'products'").first();
    if (!table) {
      await database.prepare(`CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        brand TEXT NOT NULL,
        image TEXT,
        price INTEGER NOT NULL,
        original_price INTEGER NOT NULL,
        discount_percent INTEGER DEFAULT 0,
        stock INTEGER DEFAULT 0,
        in_stock INTEGER DEFAULT 1,
        specifications TEXT,
        youtube_id TEXT,
        skus TEXT,
        folders TEXT,
        variants TEXT,
        color_images TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`).run();

      // Seed initial products
      for (const p of INITIAL_PRODUCTS) {
        await database.prepare(`INSERT OR IGNORE INTO products (
          id, name, slug, brand, image, price, original_price, discount_percent, stock, in_stock,
          specifications, youtube_id, skus, folders, variants, color_images, description, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
          p.id,
          p.name,
          p.slug,
          p.brand,
          p.image,
          p.price,
          p.original_price,
          p.discount_percent,
          p.stock,
          p.inStock ? 1 : 0,
          p.specifications || '{}',
          p.youtubeId || '',
          JSON.stringify(p.skus || []),
          JSON.stringify(p.folders || []),
          JSON.stringify(p.variants || []),
          JSON.stringify(p.colorImages || []),
          p.description || '',
          p.created_at || '2026-02-24 10:00:00'
        ).run();
      }
    }

    return database;
  } catch {
    return null;
  }
}

// Convert D1 database row to standard Product item object
function mapDbRowToProduct(row: any): DbProductItem {
  let skus: string[] = [];
  let folders: string[] = [];
  let variants: any[] = [];
  let colorImages: any[] = [];

  try { skus = typeof row.skus === 'string' ? JSON.parse(row.skus) : (row.skus || []); } catch {}
  try { folders = typeof row.folders === 'string' ? JSON.parse(row.folders) : (row.folders || []); } catch {}
  try { variants = typeof row.variants === 'string' ? JSON.parse(row.variants) : (row.variants || []); } catch {}
  try { colorImages = typeof row.color_images === 'string' ? JSON.parse(row.color_images) : (row.color_images || []); } catch {}

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    image: row.image,
    price: Number(row.price),
    original_price: Number(row.original_price),
    discount_percent: Number(row.discount_percent || 0),
    stock: Number(row.stock || 0),
    inStock: Boolean(row.in_stock),
    specifications: row.specifications || '{}',
    youtubeId: row.youtube_id || '',
    skus,
    folders,
    variants,
    colorImages,
    description: row.description || '',
    created_at: row.created_at,
  };
}

// GET /api/products
export async function GET() {
  const db = await getDatabase();
  if (db) {
    try {
      const results = await db.prepare("SELECT * FROM products ORDER BY id DESC").all();
      const list = (results.results || []).map(mapDbRowToProduct);
      return NextResponse.json({ success: true, data: list });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message, data: devProductsStore }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, data: devProductsStore });
}

// POST /api/products (Thêm sản phẩm mới)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    if (!name) {
      return NextResponse.json({ success: false, error: 'Tên sản phẩm không được để trống' }, { status: 400 });
    }

    const brand = String(body.brand || 'APPLE').trim().toUpperCase();
    const slug = body.slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const original_price = typeof body.original_price === 'number' ? Math.max(0, body.original_price) : 0;
    const price = typeof body.price === 'number' ? Math.max(0, body.price) : 0;
    const discount_percent = (original_price > 0 && price > 0 && original_price > price)
      ? Math.round(((original_price - price) / original_price) * 100)
      : 0;
    const stock = typeof body.stock === 'number' ? Math.max(0, body.stock) : 0;
    const inStock = stock > 0;
    const image = body.image?.trim() || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=80';
    const specifications = typeof body.specifications === 'string' ? body.specifications : '{}';
    const youtubeId = body.youtubeId || '';
    const skus = Array.isArray(body.skus) ? body.skus : [`SKU-${Date.now()}`];
    const folders = Array.isArray(body.folders) ? body.folders : ['Mặt trước & Màn hình', 'Mặt lưng & Camera', 'Góc cạnh viền máy'];
    const variants = Array.isArray(body.variants) ? body.variants : [];
    const colorImages = Array.isArray(body.colorImages) ? body.colorImages : [];
    const description = body.description || `<p>Mô tả chi tiết sản phẩm <strong>${name}</strong>.</p>`;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const db = await getDatabase();
    if (db) {
      const insert = await db.prepare(`INSERT INTO products (
        name, slug, brand, image, price, original_price, discount_percent, stock, in_stock,
        specifications, youtube_id, skus, folders, variants, color_images, description, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
        name,
        slug,
        brand,
        image,
        price,
        original_price,
        discount_percent,
        stock,
        inStock ? 1 : 0,
        specifications,
        youtubeId,
        JSON.stringify(skus),
        JSON.stringify(folders),
        JSON.stringify(variants),
        JSON.stringify(colorImages),
        description,
        now
      ).run();

      const newId = insert.meta.last_row_id;
      const createdItem: DbProductItem = {
        id: newId,
        name,
        slug,
        brand,
        image,
        price,
        original_price,
        discount_percent,
        stock,
        inStock,
        specifications,
        youtubeId,
        skus,
        folders,
        variants,
        colorImages,
        description,
        created_at: now,
      };

      return NextResponse.json({ success: true, data: createdItem });
    }

    // Fallback in-memory
    const newId = devProductsStore.length > 0 ? Math.max(...devProductsStore.map((p) => Number(p.id))) + 1 : 1;
    const newProduct: DbProductItem = {
      id: newId,
      name,
      slug,
      brand,
      image,
      price,
      original_price,
      discount_percent,
      stock,
      inStock,
      specifications,
      youtubeId,
      skus,
      folders,
      variants,
      colorImages,
      description,
      created_at: now,
    };
    devProductsStore.unshift(newProduct);

    return NextResponse.json({ success: true, data: newProduct });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/products (Cập nhật sản phẩm)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID sản phẩm không hợp lệ' }, { status: 400 });
    }

    const name = String(body.name || '').trim();
    const brand = body.brand ? String(body.brand).trim().toUpperCase() : undefined;
    const slug = body.slug?.trim() || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined);
    const image = body.image?.trim();
    const price = body.price !== undefined ? Number(body.price) : undefined;
    const original_price = body.original_price !== undefined ? Number(body.original_price) : undefined;
    const stock = body.stock !== undefined ? Number(body.stock) : undefined;
    const inStock = stock !== undefined ? stock > 0 : undefined;
    const specifications = body.specifications !== undefined ? (typeof body.specifications === 'string' ? body.specifications : JSON.stringify(body.specifications)) : undefined;
    const youtubeId = body.youtubeId !== undefined ? String(body.youtubeId) : undefined;
    const skus = Array.isArray(body.skus) ? JSON.stringify(body.skus) : undefined;
    const folders = Array.isArray(body.folders) ? JSON.stringify(body.folders) : undefined;
    const variants = Array.isArray(body.variants) ? JSON.stringify(body.variants) : undefined;
    const colorImages = Array.isArray(body.colorImages) ? JSON.stringify(body.colorImages) : undefined;
    const description = body.description !== undefined ? String(body.description) : undefined;

    const db = await getDatabase();
    if (db) {
      await db.prepare(`UPDATE products SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        brand = COALESCE(?, brand),
        image = COALESCE(?, image),
        price = COALESCE(?, price),
        original_price = COALESCE(?, original_price),
        stock = COALESCE(?, stock),
        in_stock = COALESCE(?, in_stock),
        specifications = COALESCE(?, specifications),
        youtube_id = COALESCE(?, youtube_id),
        skus = COALESCE(?, skus),
        folders = COALESCE(?, folders),
        variants = COALESCE(?, variants),
        color_images = COALESCE(?, color_images),
        description = COALESCE(?, description)
      WHERE id = ?`).bind(
        name || null,
        slug || null,
        brand || null,
        image || null,
        price !== undefined ? price : null,
        original_price !== undefined ? original_price : null,
        stock !== undefined ? stock : null,
        inStock !== undefined ? (inStock ? 1 : 0) : null,
        specifications !== undefined ? specifications : null,
        youtubeId !== undefined ? youtubeId : null,
        skus !== undefined ? skus : null,
        folders !== undefined ? folders : null,
        variants !== undefined ? variants : null,
        colorImages !== undefined ? colorImages : null,
        description !== undefined ? description : null,
        id
      ).run();

      return NextResponse.json({ success: true, message: 'Cập nhật sản phẩm thành công' });
    }

    // Fallback in-memory
    const index = devProductsStore.findIndex((p) => Number(p.id) === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy sản phẩm cần sửa' }, { status: 404 });
    }

    devProductsStore[index] = {
      ...devProductsStore[index],
      ...(name ? { name } : {}),
      ...(slug ? { slug } : {}),
      ...(brand ? { brand } : {}),
      ...(image ? { image } : {}),
      ...(price !== undefined ? { price } : {}),
      ...(original_price !== undefined ? { original_price } : {}),
      ...(stock !== undefined ? { stock, inStock: stock > 0 } : {}),
      ...(specifications !== undefined ? { specifications } : {}),
      ...(youtubeId !== undefined ? { youtubeId } : {}),
      ...(body.skus ? { skus: body.skus } : {}),
      ...(body.folders ? { folders: body.folders } : {}),
      ...(body.variants ? { variants: body.variants } : {}),
      ...(body.colorImages ? { colorImages: body.colorImages } : {}),
      ...(description !== undefined ? { description } : {}),
    };

    return NextResponse.json({ success: true, data: devProductsStore[index] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/products (Xóa sản phẩm)
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = Number(url.searchParams.get('id'));
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID sản phẩm không hợp lệ' }, { status: 400 });
    }

    const db = await getDatabase();
    if (db) {
      await db.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
      return NextResponse.json({ success: true, message: 'Xóa sản phẩm thành công' });
    }

    // Fallback in-memory
    devProductsStore = devProductsStore.filter((p) => Number(p.id) !== id);
    return NextResponse.json({ success: true, message: 'Xóa sản phẩm thành công' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
