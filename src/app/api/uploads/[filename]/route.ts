import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { R2Bucket } from '@cloudflare/workers-types';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

type UploadEnv = CloudflareEnv & {
  BUCKET?: R2Bucket;
  R2_BUCKET?: R2Bucket;
  MY_BUCKET?: R2Bucket;
  UPLOADS?: R2Bucket;
};

// Map file extensions to content types
const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    if (!filename || filename.includes('..')) {
      return new Response('Tên tệp không hợp lệ', { status: 400 });
    }

    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // 1. Thử lấy ảnh từ Cloudflare R2 Bucket
    try {
      const { env } = await getCloudflareContext({ async: true });
      const cfEnv = env as UploadEnv;
      const r2Bucket = cfEnv?.BUCKET || cfEnv?.R2_BUCKET || cfEnv?.MY_BUCKET || cfEnv?.UPLOADS;

      if (r2Bucket) {
        const object = await r2Bucket.get(filename);
        if (object) {
          const headers = new Headers();
          (object.writeHttpMetadata as (headers: any) => void)(headers);
          if (object.httpEtag) {
            headers.set('etag', object.httpEtag);
          }
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');
          if (!headers.get('Content-Type')) {
            headers.set('Content-Type', contentType);
          }

          return new Response(object.body as unknown as BodyInit, {
            headers,
          });
        }
      }
    } catch {
      // Bỏ qua lỗi Cloudflare context khi test local
    }

    // 2. Fallback tìm file từ thư mục local public/uploads
    try {
      const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
      const fileBuffer = await fs.readFile(filePath);

      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } catch {
      return new Response('Không tìm thấy tệp ảnh', { status: 404 });
    }
  } catch (error: any) {
    return new Response(`Lỗi máy chủ: ${error.message}`, { status: 500 });
  }
}
