import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';

export const runtime = 'nodejs';

type AddressRow = {
  id: number;
  user_email?: string | null;
  user_id?: string | null;
  name: string;
  phone: string;
  province: string;
  detail: string;
  is_default: number;
  created_at?: string;
};

type AddressPayload = {
  user_email?: string;
  user_id?: string | number;
  name?: string;
  phone?: string;
  province?: string;
  detail?: string;
  isDefault?: boolean;
};

type AddressEnv = CloudflareEnv & { DB: D1Database };

// Lưu trữ in-memory toàn cục cho môi trường Local Development (không bị mất khi HMR)
const globalForAddresses = globalThis as unknown as { devAddresses?: Map<string, AddressRow[]> };
if (!globalForAddresses.devAddresses) {
  const initialMap = new Map<string, AddressRow[]>();
  const defaultList: AddressRow[] = [
    {
      id: 1,
      user_email: 'admin@hotmail.com',
      user_id: 'dev-admin',
      name: 'Quản Trị Viên',
      phone: '0987654321',
      province: 'Phường Xuân Hòa, Thành phố Hà Nội',
      detail: 'Số 123 Đường Cầu Giấy',
      is_default: 1,
      created_at: new Date().toISOString(),
    },
  ];
  initialMap.set('admin@hotmail.com', defaultList);
  initialMap.set('dev-admin', defaultList);
  globalForAddresses.devAddresses = initialMap;
}
const devAddresses = globalForAddresses.devAddresses;

function getIdentity(request: Request, body?: AddressPayload) {
  const url = new URL(request.url);
  const email = body?.user_email?.trim() || request.headers.get('x-user-email')?.trim() || url.searchParams.get('user_email')?.trim();
  const id = String(body?.user_id ?? request.headers.get('x-user-id') ?? url.searchParams.get('user_id') ?? '').trim();
  return { email: email?.toLowerCase(), id: id || 'dev-admin' };
}

function toAddress(row: AddressRow) {
  return { id: row.id, name: row.name, phone: row.phone, province: row.province, detail: row.detail, isDefault: Boolean(row.is_default) };
}

async function getDatabase() {
  let database: D1Database | undefined;
  try {
    const { env } = await getCloudflareContext({ async: true });
    database = (env as AddressEnv)?.DB;
  } catch {
    return null;
  }
  if (!database) return null;

  try {
    const table = await database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'addresses'").first();
    if (!table) {
      await database.prepare(`CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        user_id TEXT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        province TEXT NOT NULL,
        detail TEXT NOT NULL,
        is_default INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`).run();
      return database;
    }

    const columns = await database.prepare('PRAGMA table_info(addresses)').all<{ name: string }>();
    const names = new Set((columns.results ?? []).map((column) => column.name));
    if (!names.has('user_email')) {
      await database.prepare('ALTER TABLE addresses ADD COLUMN user_email TEXT').run();
    }
    if (!names.has('name')) {
      await database.prepare('ALTER TABLE addresses ADD COLUMN name TEXT').run();
      if (names.has('full_name')) {
        await database.prepare('UPDATE addresses SET name = full_name WHERE name IS NULL').run();
      }
    }
    if (!names.has('created_at')) {
      await database.prepare('ALTER TABLE addresses ADD COLUMN created_at DATETIME').run();
      await database.prepare('UPDATE addresses SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL').run();
    }
  } catch {
    // Bỏ qua lỗi D1 schema check nếu quyền bị giới hạn
  }
  return database;
}

function hasIdentity(identity: ReturnType<typeof getIdentity>) {
  return Boolean(identity.email || identity.id);
}

function identityWhere(identity: ReturnType<typeof getIdentity>) {
  return identity.email && identity.id
    ? { sql: '(user_email = ? OR user_id = ?)', values: [identity.email, identity.id] }
    : identity.email
      ? { sql: 'user_email = ?', values: [identity.email] }
      : { sql: 'user_id = ?', values: [identity.id] };
}

export async function GET(request: Request) {
  const identity = getIdentity(request);
  if (!hasIdentity(identity)) return Response.json({ message: 'Chưa xác định được người dùng.' }, { status: 401 });
  const database = await getDatabase();
  
  if (!database) {
    const keys = [identity.email, identity.id, 'admin@hotmail.com', 'dev-admin'].filter(Boolean) as string[];
    let rows: AddressRow[] = [];
    for (const key of keys) {
      const found = devAddresses.get(key);
      if (found && found.length > 0) {
        rows = found;
        break;
      }
    }
    const uniqueRows = rows.filter((row, index, all) => all.findIndex((item) => item.id === row.id) === index);
    return Response.json({ addresses: uniqueRows.sort((a, b) => b.is_default - a.is_default || b.id - a.id).map(toAddress) });
  }

  const where = identityWhere(identity);
  try {
    const result = await database.prepare(`SELECT id, user_email, user_id, name, phone, province, detail, is_default, created_at FROM addresses WHERE ${where.sql} ORDER BY is_default DESC, created_at DESC, id DESC`).bind(...where.values).all<AddressRow>();
    return Response.json({ addresses: (result.results ?? []).map(toAddress) });
  } catch {
    return Response.json({ addresses: [] });
  }
}

export async function POST(request: Request) {
  let body: AddressPayload;
  try { 
    body = (await request.json()) as AddressPayload; 
  } catch { 
    return Response.json({ message: 'Dữ liệu địa chỉ không hợp lệ.' }, { status: 400 }); 
  }
  
  const identity = getIdentity(request, body);
  const name = body.name?.trim();
  const phone = body.phone?.trim();
  const province = body.province?.trim();
  const detail = body.detail?.trim();
  
  if (!name || !phone || !province || !detail) {
    return Response.json({ message: 'Vui lòng nhập đầy đủ thông tin địa chỉ.' }, { status: 400 });
  }

  const database = await getDatabase();
  if (!database) {
    const keys = [identity.email, identity.id, 'admin@hotmail.com', 'dev-admin'].filter(Boolean) as string[];
    let current: AddressRow[] = [];
    for (const key of keys) {
      if (devAddresses.has(key)) {
        current = devAddresses.get(key)!;
        break;
      }
    }
    
    const shouldBeDefault = Boolean(body.isDefault || current.length === 0);
    const newAddress: AddressRow = { 
      id: Date.now(), 
      user_email: identity.email || 'admin@hotmail.com', 
      user_id: identity.id || 'dev-admin', 
      name, 
      phone, 
      province, 
      detail, 
      is_default: shouldBeDefault ? 1 : 0, 
      created_at: new Date().toISOString() 
    };
    
    const updated = shouldBeDefault 
      ? [newAddress, ...current.map((item) => ({ ...item, is_default: 0 }))] 
      : [newAddress, ...current];
      
    for (const key of keys) {
      devAddresses.set(key, updated);
    }
    
    return Response.json({ address: toAddress(newAddress) }, { status: 201 });
  }

  try {
    const where = identityWhere(identity);
    const firstAddress = await database.prepare(`SELECT id FROM addresses WHERE ${where.sql} LIMIT 1`).bind(...where.values).first();
    const shouldBeDefault = Boolean(body.isDefault || !firstAddress);
    
    if (shouldBeDefault) {
      await database.prepare(`UPDATE addresses SET is_default = 0 WHERE ${where.sql}`).bind(...where.values).run();
    }
    
    const email = identity.email || identity.id || 'admin@hotmail.com';
    const userId = identity.id || 'dev-admin';
    
    const result = await database.prepare(
      'INSERT INTO addresses (user_email, user_id, name, phone, province, detail, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(email, userId, name, phone, province, detail, shouldBeDefault ? 1 : 0).run();
    
    const newId = Number(result?.meta?.last_row_id) || Date.now();
    return Response.json({ 
      address: toAddress({ 
        id: newId, 
        user_email: email, 
        user_id: userId, 
        name, 
        phone, 
        province, 
        detail, 
        is_default: shouldBeDefault ? 1 : 0 
      }) 
    }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi cơ sở dữ liệu';
    return Response.json({ message: `Không thể lưu địa chỉ: ${msg}` }, { status: 500 });
  }
}

async function updateDefault(request: Request) {
  let body: AddressPayload = {};
  try { body = (await request.json()) as AddressPayload; } catch { /* Optional body */ }
  const identity = getIdentity(request, body);
  const url = new URL(request.url);
  const addressId = Number(url.searchParams.get('id') ?? url.searchParams.get('address_id'));
  
  if (!Number.isFinite(addressId)) {
    return Response.json({ message: 'Thông tin địa chỉ không hợp lệ.' }, { status: 400 });
  }
  
  const database = await getDatabase();
  if (!database) {
    const keys = [identity.email, identity.id, 'admin@hotmail.com', 'dev-admin'].filter(Boolean) as string[];
    for (const key of keys) {
      const list = devAddresses.get(key) ?? [];
      devAddresses.set(key, list.map((address) => ({ ...address, is_default: address.id === addressId ? 1 : 0 })));
    }
    return Response.json({ success: true });
  }

  try {
    const where = identityWhere(identity);
    await database.prepare(`UPDATE addresses SET is_default = CASE WHEN id = ? THEN 1 ELSE 0 END WHERE ${where.sql}`).bind(addressId, ...where.values).run();
    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false, message: 'Lỗi cập nhật địa chỉ mặc định' }, { status: 500 });
  }
}

export const PATCH = updateDefault;
export const PUT = updateDefault;

export async function DELETE(request: Request) {
  const identity = getIdentity(request);
  const url = new URL(request.url);
  const addressId = Number(url.searchParams.get('id') ?? url.searchParams.get('address_id'));
  
  if (!Number.isFinite(addressId)) {
    return Response.json({ message: 'Thông tin xóa địa chỉ không hợp lệ.' }, { status: 400 });
  }
  
  const database = await getDatabase();
  if (!database) {
    const keys = [identity.email, identity.id, 'admin@hotmail.com', 'dev-admin'].filter(Boolean) as string[];
    for (const key of keys) {
      const list = devAddresses.get(key) ?? [];
      devAddresses.set(key, list.filter((address) => address.id !== addressId));
    }
    return Response.json({ success: true });
  }

  try {
    const where = identityWhere(identity);
    await database.prepare(`DELETE FROM addresses WHERE id = ? AND ${where.sql}`).bind(addressId, ...where.values).run();
    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false, message: 'Lỗi xóa địa chỉ' }, { status: 500 });
  }
}