import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export interface BrandRow {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  product_count?: number;
  created_at?: string;
}

type BrandEnv = CloudflareEnv & { DB?: D1Database };

// Mẫu 10 hãng mặc định
const INITIAL_BRANDS: BrandRow[] = [
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

// Fallback in-memory trong môi trường dev
let devBrandsStore: BrandRow[] = [...INITIAL_BRANDS];

async function getDatabase(): Promise<D1Database | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const database = (env as BrandEnv)?.DB;
    if (!database) return null;

    // Kiểm tra & tạo bảng brands nếu chưa tồn tại
    const table = await database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'brands'").first();
    if (!table) {
      await database.prepare(`CREATE TABLE brands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        logo TEXT,
        product_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`).run();

      // Seed 10 hãng mặc định
      for (const b of INITIAL_BRANDS) {
        await database.prepare(`INSERT OR IGNORE INTO brands (id, name, slug, logo, product_count, created_at) VALUES (?, ?, ?, ?, ?, ?)`).bind(
          b.id,
          b.name,
          b.slug,
          b.logo || null,
          b.product_count || 0,
          b.created_at || '2026-02-24 10:00:00'
        ).run();
      }
    }

    return database;
  } catch {
    return null;
  }
}

// GET /api/brands
export async function GET() {
  const db = await getDatabase();
  if (db) {
    try {
      const results = await db.prepare("SELECT * FROM brands ORDER BY id ASC").all<BrandRow>();
      return NextResponse.json({ success: true, data: results.results || [] });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message, data: devBrandsStore }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, data: devBrandsStore });
}

// POST /api/brands (Thêm hãng mới)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim().toUpperCase();
    if (!name) {
      return NextResponse.json({ success: false, error: 'Tên hãng không được để trống' }, { status: 400 });
    }

    const slug = body.slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const logo = body.logo?.trim() || null;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const db = await getDatabase();
    if (db) {
      const insert = await db.prepare("INSERT INTO brands (name, slug, logo, product_count, created_at) VALUES (?, ?, ?, 0, ?)").bind(
        name,
        slug,
        logo,
        now
      ).run();

      return NextResponse.json({
        success: true,
        data: {
          id: insert.meta.last_row_id,
          name,
          slug,
          logo,
          product_count: 0,
          created_at: now,
        },
      });
    }

    // Fallback in-memory
    const exists = devBrandsStore.some((b) => b.name === name || b.slug === slug);
    if (exists) {
      return NextResponse.json({ success: false, error: 'Tên hãng hoặc slug đã tồn tại' }, { status: 400 });
    }

    const newBrand: BrandRow = {
      id: devBrandsStore.length > 0 ? Math.max(...devBrandsStore.map((b) => Number(b.id))) + 1 : 1,
      name,
      slug,
      logo,
      product_count: 0,
      created_at: now,
    };
    devBrandsStore.push(newBrand);

    return NextResponse.json({ success: true, data: newBrand });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/brands (Sửa hãng)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    const name = String(body.name || '').trim().toUpperCase();
    if (!id || !name) {
      return NextResponse.json({ success: false, error: 'ID và tên hãng không hợp lệ' }, { status: 400 });
    }

    const slug = body.slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const logo = body.logo !== undefined ? body.logo : null;

    const db = await getDatabase();
    if (db) {
      await db.prepare("UPDATE brands SET name = ?, slug = ?, logo = COALESCE(?, logo) WHERE id = ?").bind(
        name,
        slug,
        logo,
        id
      ).run();

      return NextResponse.json({ success: true, message: 'Cập nhật hãng thành công' });
    }

    // Fallback in-memory
    const index = devBrandsStore.findIndex((b) => b.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy hãng cần sửa' }, { status: 404 });
    }

    devBrandsStore[index] = {
      ...devBrandsStore[index],
      name,
      slug,
      logo: logo !== null ? logo : devBrandsStore[index].logo,
    };

    return NextResponse.json({ success: true, data: devBrandsStore[index] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/brands (Xóa hãng)
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = Number(url.searchParams.get('id'));
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID không hợp lệ' }, { status: 400 });
    }

    const db = await getDatabase();
    if (db) {
      await db.prepare("DELETE FROM brands WHERE id = ?").bind(id).run();
      return NextResponse.json({ success: true, message: 'Xóa hãng thành công' });
    }

    // Fallback in-memory
    devBrandsStore = devBrandsStore.filter((b) => b.id !== id);
    return NextResponse.json({ success: true, message: 'Xóa hãng thành công' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
