import { NextResponse } from 'next/server';
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy tệp ảnh tải lên' },
        { status: 400 }
      );
    }

    // Validate mime type
    const mimeType = file.type || 'image/png';
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Định dạng tệp không hợp lệ, vui lòng chọn file ảnh (PNG, JPG, WEBP, SVG,...)' },
        { status: 400 }
      );
    }

    // Check size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Dung lượng ảnh tối đa là 10MB' },
        { status: 400 }
      );
    }

    // Generate unique safe file name
    const originalName = file.name || 'image.png';
    const ext = path.extname(originalName) || '.png';
    const baseName = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    const filename = `${baseName}-${Date.now()}${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Kiểm tra lưu trữ vào Cloudflare R2 Bucket (nếu đang chạy trên Cloudflare)
    let r2Bucket: R2Bucket | undefined;
    try {
      const { env } = await getCloudflareContext({ async: true });
      const cfEnv = env as UploadEnv;
      r2Bucket = cfEnv?.BUCKET || cfEnv?.R2_BUCKET || cfEnv?.MY_BUCKET || cfEnv?.UPLOADS;
    } catch {
      // Môi trường local không có cloudflare context
    }

    if (r2Bucket) {
      // Lưu file trực tiếp vào Cloudflare R2
      await (r2Bucket as any).put(filename, arrayBuffer, {
        httpMetadata: {
          contentType: mimeType,
          cacheControl: 'public, max-age=31536000, immutable',
        },
      });

      const publicUrl = `/api/uploads/${filename}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename,
        storage: 'cloudflare-r2',
        size: file.size,
        type: mimeType,
      });
    }

    // 2. Fallback cho môi trường Local Development: Lưu vào public/uploads
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, filename);
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/${filename}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename,
        storage: 'local-filesystem',
        size: file.size,
        type: mimeType,
      });
    } catch {
      // Trong trường hợp filesystem không ghi được, trả về data URL hoặc fallback
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;
      return NextResponse.json({
        success: true,
        url: dataUrl,
        filename,
        storage: 'base64-fallback',
        size: file.size,
        type: mimeType,
      });
    }
  } catch (error: any) {
    console.error('Lỗi khi tải ảnh lên:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý lưu ảnh máy chủ' },
      { status: 500 }
    );
  }
}
