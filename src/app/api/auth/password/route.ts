import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { findDevUser } from '@/lib/dev-auth-store';

export const runtime = 'edge';

type PasswordRequest = { user_email?: string; user_id?: string | number; current_password?: string; new_password?: string };
type PasswordHistoryRow = { id: number; changed_at: string; ip_address: string };
type PasswordEnv = CloudflareEnv & { DB: D1Database };
const devPasswords = new Map<string, string>();
const devHistory = new Map<string, PasswordHistoryRow[]>();

function identity(request: Request, body?: PasswordRequest) {
  return {
    email: body?.user_email?.trim().toLowerCase() || request.headers.get('x-user-email')?.trim().toLowerCase() || '',
    id: String(body?.user_id ?? request.headers.get('x-user-id') ?? '').trim(),
  };
}

function ip(request: Request) {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

function formatHistory(row: PasswordHistoryRow) {
  return { id: row.id, changedAt: row.changed_at, ipAddress: row.ip_address };
}

async function database() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as PasswordEnv).DB;
    if (!db) return null;
    await db.prepare(`CREATE TABLE IF NOT EXISTS password_change_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_email TEXT NOT NULL, user_id TEXT,
      changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ip_address TEXT NOT NULL
    )`).run();
    return db;
  } catch { return null; }
}

export async function GET(request: Request) {
  const user = identity(request);
  if (!user.email && !user.id) return Response.json({ message: 'Chưa xác định được người dùng.' }, { status: 401 });
  const db = await database();
  if (!db) return Response.json({ history: (devHistory.get(user.email || user.id) ?? []).map(formatHistory) });
  const result = user.email && user.id
    ? await db.prepare('SELECT id, changed_at, ip_address FROM password_change_history WHERE user_email = ? OR user_id = ? ORDER BY changed_at DESC, id DESC').bind(user.email, user.id).all<PasswordHistoryRow>()
    : await db.prepare(`SELECT id, changed_at, ip_address FROM password_change_history WHERE ${user.email ? 'user_email' : 'user_id'} = ? ORDER BY changed_at DESC, id DESC`).bind(user.email || user.id).all<PasswordHistoryRow>();
  return Response.json({ history: (result.results ?? []).map(formatHistory) });
}

export async function POST(request: Request) {
  let body: PasswordRequest;
  try { body = await request.json() as PasswordRequest; } catch { return Response.json({ message: 'Dữ liệu không hợp lệ.' }, { status: 400 }); }
  const user = identity(request, body);
  const current = body.current_password || '';
  const next = body.new_password || '';
  if ((!user.email && !user.id) || !current || next.length < 6) return Response.json({ message: 'Thông tin đổi mật khẩu chưa đầy đủ.' }, { status: 400 });
  if (current === next) return Response.json({ message: 'Mật khẩu mới phải khác mật khẩu hiện tại.' }, { status: 400 });
  const db = await database();
  const addressIp = ip(request);
  if (!db) {
    const key = user.email || user.id;
    const devUser = user.email ? findDevUser(user.email) : undefined;
    const expected = devPasswords.get(key) || devUser?.password || (user.email === 'admin@gmail.com' ? 'admin123' : '');
    if (expected !== current) return Response.json({ message: 'Mật khẩu hiện tại không đúng.' }, { status: 401 });
    devPasswords.set(key, next);
    const row = { id: Date.now(), changed_at: new Date().toISOString(), ip_address: addressIp };
    devHistory.set(key, [row, ...(devHistory.get(key) ?? [])]);
    return Response.json({ historyEntry: formatHistory(row) });
  }
  const account = user.email
    ? await db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').bind(user.email).first<{ id: string | number; email: string; password_hash: string }>()
    : await db.prepare('SELECT id, email, password_hash FROM users WHERE id = ?').bind(user.id).first<{ id: string | number; email: string; password_hash: string }>();
  if (!account || account.password_hash !== current) return Response.json({ message: 'Mật khẩu hiện tại không đúng.' }, { status: 401 });
  await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(next, account.id).run();
  const result = await db.prepare('INSERT INTO password_change_history (user_email, user_id, ip_address) VALUES (?, ?, ?)').bind(account.email, String(account.id), addressIp).run();
  return Response.json({ historyEntry: { id: Number(result.meta.last_row_id), changedAt: new Date().toISOString(), ipAddress: addressIp } });
}