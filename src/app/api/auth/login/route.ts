import { getCloudflareContext as getRequestContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';

export const runtime = 'edge';

type LoginRequest = {
  email?: string;
  password?: string;
  turnstile_token?: string;
};

type LoginUserRow = {
  id: string | number;
  email: string;
  name?: string | null;
  total_orders?: number | null;
  total_spent?: number | null;
  rank?: string | null;
  is_superuser?: number | boolean | null;
};

type LoginEnv = CloudflareEnv & {
  DB: D1Database;
  TURNSTILE_SECRET_KEY?: string;
};

export async function POST(request: Request) {
  let body: LoginRequest;

  try {
    body = (await request.json()) as LoginRequest;
  } catch {
    return Response.json({ detail: 'Dữ liệu yêu cầu không hợp lệ.' }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password;
  const turnstileToken = body.turnstile_token;

  if (!email || !password || !turnstileToken) {
    return Response.json({ detail: 'Vui lòng nhập đầy đủ thông tin đăng nhập.' }, { status: 400 });
  }

  const { env } = await getRequestContext({ async: true });
  const runtimeEnv = env as LoginEnv;
  const turnstileSecret = runtimeEnv.TURNSTILE_SECRET_KEY ?? process.env.TURNSTILE_SECRET_KEY;

  if (!turnstileSecret) {
    return Response.json({ detail: 'Turnstile chưa được cấu hình trên Worker.' }, { status: 500 });
  }

  const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: turnstileSecret, response: turnstileToken }),
  });
  const turnstileResult = (await turnstileResponse.json()) as { success?: boolean };

  if (!turnstileResponse.ok || turnstileResult.success !== true) {
    return Response.json({ detail: 'Xác thực Cloudflare Turnstile thất bại.' }, { status: 400 });
  }

  if (!runtimeEnv.DB) {
    return Response.json({ detail: 'D1 database chưa được cấu hình trên Worker.' }, { status: 500 });
  }

  const result = await runtimeEnv.DB.prepare(
    'SELECT * FROM users WHERE email = ? AND password_hash = ?',
  )
    .bind(email, password)
    .first<LoginUserRow>();

  if (!result) {
    return Response.json({ detail: 'Email hoặc mật khẩu không chính xác' }, { status: 401 });
  }

  return Response.json({
    success: true,
    access_token: `dev-access-${crypto.randomUUID()}`,
    refresh_token: `dev-refresh-${crypto.randomUUID()}`,
    user: {
      id: result.id,
      email: result.email,
      name: result.name ?? '',
      totalOrders: result.total_orders ?? 0,
      totalSpent: result.total_spent ?? 0,
      rank: result.rank ?? 'bronze',
      isSuperuser: Boolean(result.is_superuser),
    },
  });
}
