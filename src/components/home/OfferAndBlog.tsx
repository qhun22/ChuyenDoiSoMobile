'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BannerItem {
  id: number;
  title: string;
  image: string;
  link: string;
}

const BANNERS_DATA: BannerItem[] = [
  {
    id: 1,
    title: 'Redmi A7 Pro',
    image: '/images/banners/redmi-banner.webp',
    link: '/products/redmi-a7-pro',
  },
  {
    id: 2,
    title: 'Galaxy S25 Ultra',
    image: '/images/banners/s25-banner.webp',
    link: '/products/galaxy-s25-ultra',
  },
  {
    id: 3,
    title: 'Học sinh - Sinh viên',
    image: '/images/banners/student-banner.webp',
    link: '/promotions/student',
  },
  {
    id: 4,
    title: 'Find X9 Series',
    image: '/images/banners/find-x9.webp',
    link: '/products/oppo-find-x9',
  },
];

export default function OfferAndBlog() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [withTransition, setWithTransition] = useState(true);
  const totalItems = BANNERS_DATA.length; // 4
  const isJumpingRef = useRef(false);

  // Mảng mở rộng thêm các phần tử đầu để loop mượt 1-2 -> 2-3 -> 3-4 -> 4-1
  const extendedBanners = [...BANNERS_DATA, ...BANNERS_DATA, ...BANNERS_DATA.slice(0, 2)];

  const handleNext = () => {
    if (isJumpingRef.current) return;
    setWithTransition(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (isJumpingRef.current) return;
    if (currentIndex === 0) {
      // Nhảy không animation tới cuối rồi lùi
      setWithTransition(false);
      setCurrentIndex(totalItems);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWithTransition(true);
          setCurrentIndex(totalItems - 1);
        });
      });
    } else {
      setWithTransition(true);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Xử lý Infinite Loop không giật khi hoàn tất transition
  const handleTransitionEnd = () => {
    if (currentIndex >= totalItems) {
      // Khi đã lướt mượt xong sang 4-1 (index 4), lập tức reset về 0 mà không có transition
      isJumpingRef.current = true;
      setWithTransition(false);
      setCurrentIndex(currentIndex - totalItems);
      // Mở lại transition ở frame tiếp theo
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isJumpingRef.current = false;
          setWithTransition(true);
        });
      });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full group overflow-hidden rounded-2xl mb-10 select-none border border-black/10 shadow-sm">
      {/* Container căn lề cân bằng */}
      <div className="-mx-1.5 sm:-mx-2 relative">
        <div
          onTransitionEnd={handleTransitionEnd}
          className="flex"
          style={{
            transform: `translate3d(-${currentIndex * 50}%, 0, 0)`,
            transition: withTransition
              ? 'transform 700ms cubic-bezier(0.25, 1, 0.5, 1)'
              : 'none',
          }}
        >
          {extendedBanners.map((banner, index) => (
            <div
              key={`${banner.id}-${index}`}
              className="w-1/2 shrink-0 px-1.5 sm:px-2"
            >
              <Link
                href={banner.link}
                className="relative block w-full aspect-[28/9] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-200 hover:-translate-y-0.5 bg-slate-100 isolate [transform:translateZ(0)]"
              >
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  unoptimized
                  className="object-cover rounded-2xl pointer-events-none"
                  sizes="(max-width: 768px) 50vw, 50vw"
                  priority
                />
              </Link>
            </div>
          ))}
        </div>
      </div>


      {/* Nút lùi (Prev) */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Banner trước"
        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md backdrop-blur hover:bg-white transition opacity-0 group-hover:opacity-100 z-20 active:scale-90 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Nút tới (Next) */}
      <button
        type="button"
        onClick={handleNext}
        aria-label="Banner sau"
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md backdrop-blur hover:bg-white transition opacity-0 group-hover:opacity-100 z-20 active:scale-90 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}