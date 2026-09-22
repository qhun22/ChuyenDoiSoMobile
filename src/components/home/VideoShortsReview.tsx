'use client';

import { useState } from 'react';

interface ReviewVideoItem {
  id: number;
  title: string;
  src: string;
}

const REVIEW_VIDEOS: ReviewVideoItem[] = [
  { id: 1, title: 'Redmi 9 Power Review', src: 'https://www.youtube-nocookie.com/embed/l-FBAfNRoCo' },
  { id: 2, title: 'Nothing Phone 3a Unboxing', src: 'https://www.youtube-nocookie.com/embed/WoRySc2P4KM' },
  { id: 3, title: 'Review điện thoại Shorts', src: 'https://www.youtube-nocookie.com/embed/Pc1P-Xch0YU' },
  { id: 4, title: 'iPhone 13 vs Samsung A53', src: 'https://www.youtube-nocookie.com/embed/HCHKwLL5VQw' },
  { id: 5, title: 'Xiaomi 17 Pro Max Quick Review', src: 'https://www.youtube-nocookie.com/embed/hzz9qEh0W8g' },
];

export default function VideoShortsReview() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const maxIndex = Math.max(0, REVIEW_VIDEOS.length - 5);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section className="w-full max-w-[1250px] mx-auto px-2 sm:px-4 my-6 font-['Signika',sans-serif]">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-sm">
            <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-red-600 select-none">
            Review Sản Phẩm
          </h2>
        </div>

        {/* Slider Frame */}
        <div className="relative group">
          {/* Nút Prev */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="Slide trước"
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-md border border-slate-200 transition hover:bg-slate-50 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          {/* Nút Next */}
          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            aria-label="Slide sau"
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-md border border-slate-200 transition hover:bg-slate-50 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          {/* Video List */}
          <div className="w-full overflow-hidden">
            <div
              className="flex gap-3 sm:gap-4 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * 20.6}%)`,
              }}
            >
              {REVIEW_VIDEOS.map((item) => (
                <div
                  key={item.id}
                  className="relative shrink-0 w-[calc(50%-6px)] sm:w-[calc(33.33%-10px)] md:w-[calc(20%-12.8px)] aspect-[9/16] rounded-xl overflow-hidden bg-slate-900 border border-slate-100 shadow-sm"
                >
                  <iframe
                    referrerPolicy="strict-origin-when-cross-origin"
                    src={item.src}
                    title={item.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}