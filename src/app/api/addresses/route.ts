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
const devAddresses = new Map<string, AddressRow[]>();

function getIdentity(request: Request, body?: AddressPayload) {
  const url = new URL(request.url);
  const email = body?.user_email?.trim() || request.headers.get('x-user-email')?.trim() || url.searchParams.get('user_email')?.trim();
  const id = String(body?.user_id ?? request.headers.get('x-user-id') ?? url.searchParams.get('user_id') ?? '').trim();
  return { email: email?.toLowerCase(), id };
}

function toAddress(row: AddressRow) {
  return { id: row.id, name: row.name, phone: row.phone, province: row.province, detail: row.detail, isDefault: Boolean(row.is_default) };
}

async function getDatabase() {
  let database: D1Database | undefined;
  try {
    const { env } = await getCloudflareContext({ async: true });
    database = (env as AddressEnv).DB;
  } catch {
    return null;
  }
  if (!database) return null;

  const table = await database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'addresses'").first();
  if (!table) {
    await database.prepare(`CREATE TABLE addresses (
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
    if (names.has('user_id')) {
      await database.prepare('UPDATE addresses SET user_email = (SELECT email FROM users WHERE users.id = addresses.user_id) WHERE user_email IS NULL').run();
    }
  }
  if (!names.has('name')) {
    await database.prepare('ALTER TABLE addresses ADD COLUMN name TEXT').run();
    if (names.has('full_name')) await database.prepare('UPDATE addresses SET name = full_name WHERE name IS NULL').run();
  }
  if (!names.has('created_at')) await database.prepare('ALTER TABLE addresses ADD COLUMN created_at DATETIME').run();
  await database.prepare('UPDATE addresses SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL').run();
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
  const where = identityWhere(identity);
  if (!database) {
    const rows = [...(identity.email ? devAddresses.get(identity.email) ?? [] : []), ...(identity.id ? devAddresses.get(identity.id) ?? [] : [])];
    const uniqueRows = rows.filter((row, index, all) => all.findIndex((item) => item.id === row.id) === index);
    return Response.json({ addresses: uniqueRows.sort((a, b) => b.is_default - a.is_default || String(b.created_at).localeCompare(String(a.created_at)) || b.id - a.id).map(toAddress) });
  }
  const result = await database.prepare(`SELECT id, user_email, user_id, name, phone, province, detail, is_default, created_at FROM addresses WHERE ${where.sql} ORDER BY is_default DESC, created_at DESC, id DESC`).bind(...where.values).all<AddressRow>();
  return Response.json({ addresses: (result.results ?? []).map(toAddress) });
}

export async function POST(request: Request) {
  let body: AddressPayload;
  try { body = (await request.json()) as AddressPayload; } catch { return Response.json({ message: 'Dữ liệu địa chỉ không hợp lệ.' }, { status: 400 }); }
  const identity = getIdentity(request, body);
  const name = body.name?.trim();
  const phone = body.phone?.trim();
  const province = body.province?.trim();
  const detail = body.detail?.trim();
  if (!hasIdentity(identity) || !name || !phone || !province || !detail) return Response.json({ message: 'Vui lòng nhập đầy đủ thông tin địa chỉ.' }, { status: 400 });

  const database = await getDatabase();
  if (!database) {
    const key = identity.email || identity.id;
    const current = devAddresses.get(key) ?? [];
    const address: AddressRow = { id: Date.now(), user_email: identity.email, user_id: identity.id, name, phone, province, detail, is_default: body.isDefault || current.length === 0 ? 1 : 0, created_at: new Date().toISOString() };
    const next = body.isDefault ? current.map((item) => ({ ...item, is_default: 0 })) : current;
    devAddresses.set(key, [address, ...next]);
    return Response.json({ address: toAddress(address) }, { status: 201 });
  }

  const where = identityWhere(identity);
  const firstAddress = await database.prepare(`SELECT id FROM addresses WHERE ${where.sql} LIMIT 1`).bind(...where.values).first();
  const shouldBeDefault = Boolean(body.isDefault || !firstAddress);
  if (shouldBeDefault) await database.prepare(`UPDATE addresses SET is_default = 0 WHERE ${where.sql}`).bind(...where.values).run();
  const email = identity.email || identity.id;
  const result = await database.prepare('INSERT INTO addresses (user_email, user_id, name, phone, province, detail, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(email, identity.id || null, name, phone, province, detail, shouldBeDefault ? 1 : 0).run();
  return Response.json({ address: toAddress({ id: Number(result.meta.last_row_id), user_email: email, user_id: identity.id, name, phone, province, detail, is_default: shouldBeDefault ? 1 : 0 }) }, { status: 201 });
}

async function updateDefault(request: Request) {
  let body: AddressPayload = {};
  try { body = (await request.json()) as AddressPayload; } catch { /* PATCH may use only headers and query parameters. */ }
  const identity = getIdentity(request, body);
  const url = new URL(request.url);
  const addressId = Number(url.searchParams.get('id') ?? url.searchParams.get('address_id'));
  if (!hasIdentity(identity) || !Number.isFinite(addressId)) return Response.json({ message: 'Thông tin địa chỉ không hợp lệ.' }, { status: 400 });
  const database = await getDatabase();
  if (!database) {
    const keys = [identity.email, identity.id].filter(Boolean) as string[];
    for (const key of keys) devAddresses.set(key, (devAddresses.get(key) ?? []).map((address) => ({ ...address, is_default: address.id === addressId ? 1 : 0 })));
    return Response.json({ success: true });
  }
  const where = identityWhere(identity);
  const target = await database.prepare(`SELECT id FROM addresses WHERE id = ? AND ${where.sql}`).bind(addressId, ...where.values).first();
  if (!target) return Response.json({ message: 'Không tìm thấy địa chỉ.' }, { status: 404 });
  await database.prepare(`UPDATE addresses SET is_default = CASE WHEN id = ? THEN 1 ELSE 0 END WHERE ${where.sql}`).bind(addressId, ...where.values).run();
  return Response.json({ success: true });
}

export const PATCH = updateDefault;
export const PUT = updateDefault;

export async function DELETE(request: Request) {
  const identity = getIdentity(request);
  const url = new URL(request.url);
  const addressId = Number(url.searchParams.get('id') ?? url.searchParams.get('address_id'));
  if (!hasIdentity(identity) || !Number.isFinite(addressId)) return Response.json({ message: 'Thông tin xóa địa chỉ không hợp lệ.' }, { status: 400 });
  const database = await getDatabase();
  if (!database) {
    for (const key of [identity.email, identity.id].filter(Boolean) as string[]) devAddresses.set(key, (devAddresses.get(key) ?? []).filter((address) => address.id !== addressId));
    return Response.json({ success: true });
  }
  const where = identityWhere(identity);
  const result = await database.prepare(`DELETE FROM addresses WHERE id = ? AND ${where.sql}`).bind(addressId, ...where.values).run();
  if (!result.meta.changes) return Response.json({ message: 'Không tìm thấy địa chỉ.' }, { status: 404 });
  return Response.json({ success: true });
}