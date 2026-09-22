'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CompareBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [compareItems, setCompareItems] = useState<any[]>([]);

  if (compareItems.length === 0) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-800">
            <i className="ri-arrow-left-right-line mr-1 text-red-600"></i> So sánh ({compareItems.length}/3)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCompareItems([])}
            className="text-xs text-slate-500 hover:text-red-600 px-2 py-1"
          >
            Xóa tất cả
          </button>
          <Link
            href="/compare"
            className="rounded bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
          >
            So sánh ngay
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="text-lg text-slate-400 hover:text-slate-600 ml-2"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
}