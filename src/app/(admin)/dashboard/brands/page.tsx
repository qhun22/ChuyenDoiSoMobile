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
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[calc(100vh-80px)] px-3 sm:px-5 py-3 flex gap-4 bg-white overflow-x-hidden font-['Signika',sans-serif]">
      <AdminSidebar
        activeSection="brands"
        onSelectSection={handleSelectSection}
      />
      <main className="flex-1 min-w-0 w-full bg-[#fafafa] rounded-xl p-3 sm:p-4 border border-slate-100/80">
        <BrandManagement />
      </main>
    </div>
  );

}
