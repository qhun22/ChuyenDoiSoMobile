import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import FloatingContact from '@/components/common/FloatingContact';
import ScrollToTop from '@/components/common/ScrollToTop';
import CompareBar from '@/components/common/CompareBar';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'QHUN22 Mobile - Điện Thoại Chính Hãng',
  description: 'QHUN22 Mobile – mua điện thoại iPhone, Samsung, Xiaomi, OPPO chính hãng, giá tốt, trả góp 0%, giao hàng toàn quốc.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Signika:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f8f9fa] text-slate-800 font-['Signika',sans-serif]">
        <div id="qhPageWrap" className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-3">
            {children}
          </main>
          <Footer />
          <FloatingContact />
          <ScrollToTop />
          <CompareBar />
        </div>
        <Toaster
          position="top-right"
          closeButton
          duration={5000}
          gap={12}
          className="notification-container"
          toastOptions={{
            classNames: {
              toast: 'notification-toast',
              title: 'notification-text',
              description: 'notification-text',
              icon: 'notification-icon',
            },
          }}
        />
      </body>
    </html>
  );
}