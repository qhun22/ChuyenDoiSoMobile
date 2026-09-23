export const runtime = 'nodejs';

const PROVINCES_URL = 'https://production.cas.so/address-kit/2025-07-01/provinces';

export async function GET() {
  const response = await fetch(PROVINCES_URL, { cache: 'no-store' });
  if (!response.ok) return Response.json({ message: 'Không thể tải danh sách tỉnh/thành phố.' }, { status: response.status });
  return Response.json(await response.json());
}