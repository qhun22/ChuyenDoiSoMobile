export type DevAuthUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'user' | 'admin';
};

export const DEV_AUTH_COOKIE = 'qh_dev_auth_user';

type DevAuthGlobal = typeof globalThis & {
  __qhDevAuthUsers?: DevAuthUser[];
};

const devGlobal = globalThis as DevAuthGlobal;
const users = devGlobal.__qhDevAuthUsers ?? (devGlobal.__qhDevAuthUsers = []);

export function findDevUser(email: string) {
  return users.find((user) => user.email === email);
}

export function addDevUser(user: Omit<DevAuthUser, 'id'>) {
  const newUser: DevAuthUser = {
    ...user,
    id: `dev-user-${Date.now()}-${users.length + 1}`,
  };
  users.push(newUser);
  return newUser;
}

export function updateDevUserPassword(email: string, password: string) {
  const user = findDevUser(email);
  if (!user) return false;
  user.password = password;
  return true;
}

export function createDevAccessToken(userId: string) {
  return `cf_dev_token_${userId}_${Date.now()}`;
}

export function setDevAuthCookie(response: Response, user: DevAuthUser) {
  const value = encodeURIComponent(JSON.stringify(user));
  response.headers.set(
    'Set-Cookie',
    `${DEV_AUTH_COOKIE}=${value}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`,
  );
}

export function findDevUserFromRequest(request: Request, email: string, password: string) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookieValue = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${DEV_AUTH_COOKIE}=`))
    ?.slice(DEV_AUTH_COOKIE.length + 1);

  if (!cookieValue) return undefined;

  try {
    const user = JSON.parse(decodeURIComponent(cookieValue)) as DevAuthUser;
    return user.email === email && user.password === password ? user : undefined;
  } catch {
    return undefined;
  }
}