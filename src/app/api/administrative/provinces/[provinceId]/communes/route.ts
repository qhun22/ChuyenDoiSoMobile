export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ provinceId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { provinceId } = await context.params;
  const response = await fetch(`https://production.cas.so/address-kit/2025-07-01/provinces/${encodeURIComponent(provinceId)}/communes`, { cache: 'no-store' });
  if (!response.ok) return Response.json({ message: 'Không thể tải danh sách phường/xã.' }, { status: response.status });
  return Response.json(await response.json());
}