import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

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
    const mimeType = file.type;
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

    // Prepare upload directory: public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique safe file name
    const originalName = file.name || 'image.png';
    const ext = path.extname(originalName) || '.png';
    const baseName = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    const filename = `${baseName}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // Write file to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Return public relative URL (accessible via browser at /uploads/...)
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error('Lỗi khi tải ảnh lên:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý lưu ảnh máy chủ' },
      { status: 500 }
    );
  }
}
