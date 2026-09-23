import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { createDevAccessToken, findDevUser, findDevUserFromRequest, type DevAuthUser } from '@/lib/dev-auth-store';

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

function createDevelopmentLoginResponse(user: DevAuthUser = {
  id: 'dev-admin',
  email: 'admin@gmail.com',
  password: 'admin123',
  name: 'QUANG HUY',
  phone: '',
  role: 'admin',
}) {
  return Response.json({
    success: true,
    message: 'Đăng nhập thành công',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      totalOrders: 0,
      totalSpent: 0,
      rank: 'diamond',
      isSuperuser: user.role === 'admin',
    },
    access_token: createDevAccessToken(user.id),
  });
}

function findDevelopmentLoginUser(request: Request, email: string, password: string) {
  if (email === 'admin@gmail.com' && password === 'admin123') {
    return createDevelopmentLoginResponse();
  }

  const user = findDevUser(email);
  const cookieUser = findDevUserFromRequest(request, email, password);
  const validUser = user && user.password === password ? user : cookieUser;
  return validUser ? createDevelopmentLoginResponse(validUser) : null;
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

  let runtimeEnv: LoginEnv | undefined;

  try {
    const { env } = await getCloudflareContext({ async: true });
    runtimeEnv = env as LoginEnv;
  } catch (error) {
    if (isDevelopment) {
      return findDevelopmentLoginUser(request, email, password) ?? Response.json({ message: 'Email hoặc mật khẩu không chính xác' }, { status: 401 });
    }

    console.error('Cloudflare context unavailable during login:', error);
    return Response.json({ message: 'Không thể kết nối môi trường Cloudflare.' }, { status: 500 });
  }

  if (!runtimeEnv.DB) {
    if (isDevelopment) {
      return findDevelopmentLoginUser(request, email, password) ?? Response.json({ message: 'Email hoặc mật khẩu không chính xác' }, { status: 401 });
    }

    return Response.json({ message: 'D1 database chưa được cấu hình trên Worker.' }, { status: 500 });
  }

  try {
    const result = await runtimeEnv.DB.prepare(
      'SELECT * FROM users WHERE email = ? AND password_hash = ?',
    )
      .bind(email, password)
      .first<LoginUserRow>();

    if (!result && isDevelopment) {
      return findDevelopmentLoginUser(request, email, password) ?? Response.json({ message: 'Email hoặc mật khẩu không chính xác' }, { status: 401 });
    }

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
    if (isDevelopment) {
      return findDevelopmentLoginUser(request, email, password) ?? Response.json({ message: 'Email hoặc mật khẩu không chính xác' }, { status: 401 });
    }

    console.error('Auth login failed:', error);
    return Response.json({ message: 'Không thể kết nối cơ sở dữ liệu.' }, { status: 500 });
  }
}
