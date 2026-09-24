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
    <div className="-mx-2 sm:-mx-4 -my-3 w-[calc(100%+1rem)] sm:w-[calc(100%+2rem)] flex flex-col md:flex-row min-h-screen bg-white font-['Signika',sans-serif] items-stretch">
      <AdminSidebar
        activeSection="brands"
        onSelectSection={handleSelectSection}
      />
      <main className="flex-1 w-full min-w-0 p-6 sm:p-8 bg-[#fafafa]">
        <BrandManagement />
      </main>
    </div>
  );
}
