'use client';

import Image from 'next/image';
import Link from 'next/link';

interface BlogPost {
  id: number | string;
  title: string;
  summary?: string;
  image?: string;
  slug?: string;
  category?: string;
}

interface UuDaiDaProps {
  banners?: string[];
  blogs?: BlogPost[];
}

export default function UuDaiDa({
  banners = [
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
  ],
  blogs = [
    {
      id: 1,
      title: 'OPPO, Huawei chuẩn bị "đổ bộ" tháng 4 với loạt flagship cực đỉnh',
      summary: 'Các siêu phẩm smartphone màn hình gập và camera tiềm vọng thế hệ mới sắp sửa trình làng.',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=400&auto=format&fit=crop',
      slug: 'oppo-huawei-flagship',
      category: 'OPPO, HUAWEI',
    },
    {
      id: 2,
      title: 'Samsung Galaxy Wide Fold lộ cấu hình: Màn hình 7.6 inch, pin khủng',
      summary: 'Nâng cấp nếp gấp gần như vô hình cùng vi xử lý Snapdragon tối ưu riêng cho đa nhiệm.',
      image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=400&auto=format&fit=crop',
      slug: 'samsung-galaxy-wide-fold',
      category: 'SAMSUNG',
    },
    {
      id: 3,
      title: 'Huawei Enjoy 90 Pro Max sẽ ra mắt vào ngày 25/3 với chip Kirin',
      summary: 'Dung lượng pin 6000mAh hỗ trợ sạc siêu nhanh cùng kết nối vệ tinh tiên tiến.',
      image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=400&auto=format&fit=crop',
      slug: 'huawei-enjoy-90-pro-max',
      category: 'HUAWEI',
    },
    {
      id: 4,
      title: 'Xiaomi 18 Pro dự kiến sẽ là flagship nhỏ gọn đáng mong đợi',
      summary: 'Ống kính quang học Leica danh tiếng kết hợp thân máy mỏng nhẹ tinh tế từng chi tiết.',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&auto=format&fit=crop',
      slug: 'xiaomi-18-pro',
      category: 'XIAOMI',
    },
  ],
}: UuDaiDaProps) {
  // Đảm bảo chỉ lấy tối đa đúng 4 bài viết
  const displayBlogs = blogs.slice(0, 4);

  return (
    <div className="w-full max-w-[1250px] mx-auto px-2 sm:px-4 my-6 font-['Signika',sans-serif]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* =========================================================================
            BOX 1: ƯU ĐÃI ĐA NỀN TẢNG (8 CỘT)
            ========================================================================= */}
        <section className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-xs font-black shadow-sm">
              %
            </span>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-red-600 select-none">
              ƯU ĐÃI ĐA NỀN TẢNG
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
            {banners.slice(0, 4).map((imgUrl, idx) => (
              <div
                key={`banner-${idx}`}
                className="group relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100 shadow-sm border border-slate-100 cursor-pointer"
              >
                <Image
                  src={imgUrl}
                  alt={`Ưu đãi ${idx + 1}`}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300" />
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            BOX 2: BLOG (4 CỘT) - GIÃN ĐỀU KHỚP 100% CHIỀU CAO CỘT TRÁI
            ========================================================================= */}
        <section className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 sm:p-5 flex flex-col">
          {/* Header Blog */}
          <div className="flex items-center justify-between gap-2 mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-red-600 text-white text-xs shadow-sm">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </span>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-red-600 select-none">
                BLOG
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-xs font-semibold text-slate-400 hover:text-red-600 transition"
            >
            </Link>
          </div>

          {/* Danh sách 4 tin - Dùng flex-1 & flex-col justify-between để chia đều khoảng cách */}
          <div className="flex-1 flex flex-col justify-between gap-2">
            {displayBlogs.map((blog, idx) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug || blog.id}`}
                className={`group flex items-center gap-3 p-2 rounded-xl transition hover:bg-slate-50 ${
                  idx !== displayBlogs.length - 1 ? 'border-b border-slate-100/80 pb-3' : ''
                }`}
              >
                {/* Thumbnail vuông to rõ ràng */}
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-100 shadow-sm">
                  {blog.image ? (
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      unoptimized
                      className="object-cover transition duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200" />
                  )}
                </div>

                {/* Nội dung bài viết */}
                <div className="flex-1 min-w-0">
                  {blog.category && (
                    <span className="inline-block text-[10px] font-black text-red-600 uppercase tracking-wide mb-0.5">
                      {blog.category}
                    </span>
                  )}
                  <h3 className="line-clamp-2 text-xs sm:text-[13px] font-bold text-slate-800 group-hover:text-red-600 transition-colors leading-snug">
                    {blog.title}
                  </h3>
                  {blog.summary && (
                    <p className="line-clamp-1 text-[11px] text-slate-400 mt-0.5 font-normal leading-normal">
                      {blog.summary}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}