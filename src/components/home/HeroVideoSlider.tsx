'use client';

import { useState, useEffect, useRef } from 'react';

interface SlideItem {
  id: number;
  src: string;
  title?: string;
}

const SLIDES: SlideItem[] = [
  { id: 0, src: '/videos/applv1.mp4' },
  { id: 1, src: '/videos/sams.mp4' },
  { id: 2, src: '/videos/xiao.mp4' },
  { id: 3, src: '/videos/ooppv1.mp4' },
];

export default function HeroVideoSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === currentSlide) {
        video.currentTime = 0;
        video.play().catch(() => {
          // Bỏ qua lỗi chặn autoplay từ trình duyệt
        });
      } else {
        video.pause();
      }
    });
  }, [currentSlide]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative w-full overflow-hidden rounded-2xl bg-black shadow-md">
      {/* Khống chế chiều cao video chuẩn để đẩy cụm banner vừa sát mép đáy màn hình */}
      <div className="relative w-full h-[220px] sm:h-[300px] md:h-[370px] lg:h-[405px]">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <video
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              src={slide.src}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
        ))}

        {/* Nút Prev - Đứng yên không phóng to khi hover */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Slide trước"
          className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/70"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Nút Next - Đứng yên không phóng to khi hover */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Slide sau"
          className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/70"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots điều hướng */}
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => handleDotClick(index)}
              aria-label={`Slide ${index + 1}`}
              className={`h-2 transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? 'w-6 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}