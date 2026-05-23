import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import GlobalHeader from "@/components/global-header";
import BanGuard from "@/components/auth/ban-guard"; 
import { auth } from "@/auth";

// ИМПОРТИРУЕМ НАШ ТРЕКЕР
import OnlineTracker from "@/components/auth/online-tracker";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Nexus | HHHforum",
  description: "Современный форум",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="ru">
      <body className={`${inter.className} bg-[#030303] text-gray-200 antialiased min-h-screen`}>
        <BanGuard>
          
          {/* ЕСЛИ ЮЗЕР АВТОРИЗОВАН - ЗАПУСКАЕМ ТРЕКЕР */}
          {session?.user && <OnlineTracker />}

          <GlobalHeader />
          <main className="w-full">
            {children}
          </main>
        </BanGuard>
      </body>
    </html>
  );
}