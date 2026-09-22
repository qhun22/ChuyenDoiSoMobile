import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import ChatBotWidget from "@/components/chat/ChatBotWidget";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mobile Store",
  description: "Cua hang thiet bi di dong",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi">
      <body>
        <Header />
        {children}
        <Footer />
        <ChatBotWidget />
      </body>
    </html>
  );
}
