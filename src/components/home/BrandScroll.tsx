'use client';

import Image from 'next/image';
import Link from 'next/link';

interface BrandItem {
  name: string;
  slug: string;
  logo: string;
}

const BRANDS: BrandItem[] = [
  { name: 'Apple', slug: 'apple', logo: '/icons/logo_iphone_ngang_eac93ff477.webp' },
  { name: 'Samsung', slug: 'samsung', logo: '/icons/logo_samsung_ngang_1624d75bd8.webp' },
  { name: 'Xiaomi', slug: 'xiaomi', logo: '/icons/logo_xiaomi_ngang_0faf267234.webp' },
  { name: 'OPPO', slug: 'oppo', logo: '/icons/logo_oppo_ngang_68d31fcd73.webp' },
  { name: 'Vivo', slug: 'vivo', logo: '/icons/logo_vivo_ngang_45494ff733.webp' },
  { name: 'Realme', slug: 'realme', logo: '/icons/logo_realme_ngang_0185815a13.webp' },
  { name: 'Honor', slug: 'honor', logo: '/icons/logo_honor_ngang_814fca59e4.webp' },
  { name: 'Red Magic', slug: 'red-magic', logo: '/icons/logo_redmagic_ngang_505d29c537.webp' },
  { name: 'Tecno', slug: 'tecno', logo: '/icons/logo_tecno_ngang_c587e5f1fa.webp' },
  { name: 'Benco', slug: 'benco', logo: '/icons/logo_benco_ngang_d31d9c3b77.webp' },
];

export default function BrandScroll() {
  return (
    <section className="w-full my-4 font-['Signika',sans-serif]">
      {/* Tiêu đề HÃNG NỔI BẬT căn giữa chuẩn font Signika */}
<div className="flex items-center justify-center gap-3 my-4 font-['Signika',sans-serif] -translate-y-[6px]">
  {/* Line mảnh mờ bên trái */}
  <div className="h-[1.5px] w-10 sm:w-16 bg-gradient-to-r from-transparent to-slate-400/40 rounded-full" />
  
  {/* Chữ đen tím nhẹ quét sáng */}
  <span className="relative text-base sm:text-xl font-extrabold uppercase tracking-widest bg-gradient-to-r from-slate-900 via-purple-700 to-slate-900 bg-[length:200%_auto] bg-clip-text text-transparent animate-text-shimmer">
    HÃNG NỔI BẬT
  </span>

  {/* Line mảnh mờ bên phải */}
  <div className="h-[1.5px] w-10 sm:w-16 bg-gradient-to-l from-transparent to-slate-400/40 rounded-full" />
</div>

      {/* Dải Carousel cuộn vô tận */}
      <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_30px,_black_calc(100%-30px),transparent_100%)]">
        <div className="flex w-max gap-3.5 py-1 animate-marquee hover:[animation-play-state:paused]">
          {/* Lần 1 */}
          {BRANDS.map((brand, idx) => (
            <BrandCard key={`b1-${idx}`} brand={brand} />
          ))}

          {/* Lần 2 để loop liền mạch */}
          {BRANDS.map((brand, idx) => (
            <BrandCard key={`b2-${idx}`} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandCard({ brand }: { brand: BrandItem }) {
  return (
    <Link
      href={`/products?brand=${brand.slug}`}
      title={brand.name}
      className="flex h-11 sm:h-12 w-28 sm:w-32 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white px-3 shadow-sm transition hover:scale-105 hover:border-red-400 hover:shadow-md"
    >
      <div className="relative h-6 w-full">
        <Image
          src={brand.logo}
          alt={brand.name}
          fill
          unoptimized
          className="object-contain"
        />
      </div>
    </Link>
  );
}