import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { addDevUser, createDevAccessToken, findDevUser, setDevAuthCookie } from '@/lib/dev-auth-store';

export const runtime = 'edge';

type RegisterRequest = {
  email?: string;
  password?: string;
  password_confirmation?: string;
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

const isDevelopment = process.env.NODE_ENV === 'development';

function createDevRegisterResponse(email: string, password: string, fullName: string, phone: string) {
  if (findDevUser(email)) {
    return Response.json({ message: 'Email đã tồn tại.' }, { status: 409 });
  }

  const user = addDevUser({ email, password, name: fullName, phone, role: 'user' });
  const response = Response.json(
    {
      success: true,
      message: 'Đăng ký tài khoản thành công',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        totalOrders: 0,
        totalSpent: 0,
        rank: 'bronze',
        isSuperuser: false,
      },
      access_token: createDevAccessToken(user.id),
    },
    { status: 201 },
  );
  setDevAuthCookie(response, user);
  return response;
}

export async function POST(request: Request) {
  let body: RegisterRequest;

  try {
    body = (await request.json()) as RegisterRequest;
  } catch {
    return Response.json({ message: 'Dữ liệu yêu cầu không hợp lệ.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const passwordConfirmation = body.password_confirmation;
  const fullName = body.full_name?.trim() || '';
  const phone = body.phone?.trim() || '';
  const turnstileToken = body.turnstile_token;

  if (!fullName || !email || !phone || !password || !passwordConfirmation || !turnstileToken) {
    return Response.json({ message: 'Vui lòng nhập đầy đủ họ tên, email, số điện thoại, mật khẩu và CAPTCHA.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ message: 'Email không đúng định dạng.' }, { status: 400 });
  }

  if (!/^\+?[0-9\s-]{9,15}$/.test(phone)) {
    return Response.json({ message: 'Số điện thoại không đúng định dạng.' }, { status: 400 });
  }

  if (password.length < 6) {
    return Response.json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' }, { status: 400 });
  }

  if (password !== passwordConfirmation) {
    return Response.json({ message: 'Mật khẩu xác nhận không khớp.' }, { status: 400 });
  }

  if (!(await verifyTurnstileToken(turnstileToken))) {
    return Response.json({ message: 'Xác minh CAPTCHA không hợp lệ hoặc đã hết hạn' }, { status: 400 });
  }

  let runtimeEnv: RegisterEnv | undefined;

  try {
    const { env } = await getCloudflareContext({ async: true });
    runtimeEnv = env as RegisterEnv;
  } catch (error) {
    if (isDevelopment) {
      return createDevRegisterResponse(email, password, fullName, phone);
    }

    console.error('Cloudflare context unavailable during registration:', error);
    return Response.json({ message: 'Không thể kết nối môi trường Cloudflare.' }, { status: 500 });
  }

  if (!runtimeEnv.DB) {
    if (isDevelopment) {
      return createDevRegisterResponse(email, password, fullName, phone);
    }

    return Response.json({ message: 'D1 database chưa được cấu hình trên Worker.' }, { status: 500 });
  }

  try {
    const existingUser = await runtimeEnv.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first<{ id: string | number }>();

    if (existingUser) {
      return Response.json({ message: 'Email này đã được đăng ký tài khoản.' }, { status: 409 });
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
  } catch (error) {
    if (isDevelopment) {
      return createDevRegisterResponse(email, password, fullName, phone);
    }

    console.error('Auth registration failed:', error);
    return Response.json({ message: 'Không thể tạo tài khoản lúc này. Vui lòng thử lại sau.' }, { status: 500 });
  }
}
