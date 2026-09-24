'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import BrandManagement from '@/components/admin/BrandManagement';
import { useRouter } from 'next/navigation';

export default function AdminBrandsPage() {
  const router = useRouter();

  const handleSelectSection = (section: string) => {
    router.push(`/dashboard?section=${section}`);
  };

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] px-4 sm:px-6 py-4 flex flex-col md:flex-row gap-5 bg-white min-h-[calc(100vh-80px)] font-['Signika',sans-serif] items-stretch">
      <AdminSidebar
        activeSection="brands"
        onSelectSection={handleSelectSection}
      />
      <main className="flex-1 min-w-0 bg-[#fafafa] rounded-xl p-4 sm:p-6 border border-slate-100/80">
        <BrandManagement />
      </main>
    </div>
  );

}
