import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { verifyTurnstileToken } from '@/lib/turnstile';

export const runtime = 'edge';

type LoginRequest = {
  email?: string;
  password?: string;
  turnstile_token?: string;
};

type LoginUserRow = {
  id: string | number;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  role?: string | null;
  total_orders?: number | null;
  total_spent?: number | null;
  rank?: string | null;
};

type LoginEnv = CloudflareEnv & { DB: D1Database };

const isDevelopment = process.env.NODE_ENV === 'development';

function createDevelopmentLoginResponse() {
  const userId = 'dev-admin';

  return Response.json({
    success: true,
    message: 'Đăng nhập thành công',
    user: {
      id: userId,
      email: 'admin@gmail.com',
      name: 'Admin Dev',
      phone: '',
      role: 'admin',
      totalOrders: 0,
      totalSpent: 0,
      rank: 'diamond',
      isSuperuser: true,
    },
    access_token: `cf_token_${userId}_${Date.now()}`,
  });
}

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
    return Response.json({ message: 'Vui lòng nhập đầy đủ thông tin đăng nhập.' }, { status: 400 });
  }

  if (!(await verifyTurnstileToken(turnstileToken))) {
    return Response.json({ message: 'Xác minh CAPTCHA không hợp lệ hoặc đã hết hạn' }, { status: 400 });
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const runtimeEnv = env as LoginEnv;

    if (!runtimeEnv.DB) {
      if (isDevelopment && email === 'admin@gmail.com' && password === 'admin123') {
        return createDevelopmentLoginResponse();
      }

      return Response.json({ message: 'D1 database chưa được cấu hình trên Worker.' }, { status: 500 });
    }

    const result = await runtimeEnv.DB.prepare(
      'SELECT * FROM users WHERE email = ? AND password_hash = ?',
    )
      .bind(email, password)
      .first<LoginUserRow>();

    if (!result) {
      return Response.json({ message: 'Email hoặc mật khẩu không chính xác' }, { status: 401 });
    }

    return Response.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        id: result.id,
        email: result.email,
        name: result.full_name ?? '',
        phone: result.phone ?? '',
        role: result.role ?? 'user',
        totalOrders: result.total_orders ?? 0,
        totalSpent: result.total_spent ?? 0,
        rank: result.rank ?? 'bronze',
        isSuperuser: result.role === 'admin',
      },
      access_token: `cf_token_${result.id}_${Date.now()}`,
    });
  } catch (error) {
    if (isDevelopment && email === 'admin@gmail.com' && password === 'admin123') {
      return createDevelopmentLoginResponse();
    }

    console.error('Auth login failed:', error);
    return Response.json({ message: 'Không thể kết nối cơ sở dữ liệu.' }, { status: 500 });
  }
}
