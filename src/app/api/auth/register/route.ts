import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { verifyTurnstileToken } from '@/lib/turnstile';

export const runtime = 'edge';

type RegisterRequest = {
  email?: string;
  password?: string;
  full_name?: string;
  phone?: string;
  turnstile_token?: string;
};

type RegisterUserRow = {
  id: string | number;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  role?: string | null;
  total_orders?: number | null;
  total_spent?: number | null;
  rank?: string | null;
};

type RegisterEnv = CloudflareEnv & { DB: D1Database };

export async function POST(request: Request) {
  let body: RegisterRequest;

  try {
    body = (await request.json()) as RegisterRequest;
  } catch {
    return Response.json({ message: 'Dữ liệu yêu cầu không hợp lệ.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const fullName = body.full_name?.trim() || '';
  const phone = body.phone?.trim() || '';
  const turnstileToken = body.turnstile_token;

  if (!email || !password || !turnstileToken) {
    return Response.json({ message: 'Vui lòng nhập đầy đủ email, mật khẩu và CAPTCHA' }, { status: 400 });
  }

  if (!(await verifyTurnstileToken(turnstileToken))) {
    return Response.json({ message: 'Xác minh CAPTCHA không hợp lệ hoặc đã hết hạn' }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const runtimeEnv = env as RegisterEnv;

  if (!runtimeEnv.DB) {
    return Response.json({ message: 'D1 database chưa được cấu hình trên Worker.' }, { status: 500 });
  }

  const existingUser = await runtimeEnv.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: string | number }>();

  if (existingUser) {
    return Response.json({ message: 'Email này đã được đăng ký tài khoản' }, { status: 409 });
  }

  const insertResult = await runtimeEnv.DB.prepare(
    `INSERT INTO users
      (email, password_hash, full_name, phone, role, total_orders, total_spent, rank)
     VALUES (?, ?, ?, ?, 'user', 0, 0, 'bronze')`,
  )
    .bind(email, password, fullName, phone)
    .run();

  const insertedId = insertResult.meta.last_row_id;
  const user = await runtimeEnv.DB.prepare(
    `SELECT id, email, full_name, phone, role, total_orders, total_spent, rank
     FROM users WHERE id = ?`,
  )
    .bind(insertedId)
    .first<RegisterUserRow>();

  if (!user) {
    return Response.json({ message: 'Không thể đọc thông tin tài khoản vừa đăng ký.' }, { status: 500 });
  }

  return Response.json(
    {
      success: true,
      message: 'Đăng ký tài khoản thành công',
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name ?? '',
        phone: user.phone ?? '',
        role: user.role ?? 'user',
        totalOrders: user.total_orders ?? 0,
        totalSpent: user.total_spent ?? 0,
        rank: user.rank ?? 'bronze',
        isSuperuser: user.role === 'admin',
      },
      access_token: `cf_token_${user.id}_${Date.now()}`,
    },
    { status: 201 },
  );
}
