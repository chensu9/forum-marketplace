import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import GlobalHeader from "@/components/global-header";
import BanGuard from "@/components/auth/ban-guard"; // Проверь, правильный ли здесь путь к твоему BanGuard
import { auth } from "@/auth";

// Инициализируем современный шрифт с поддержкой кириллицы
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
          {/* Глобальная шапка */}
          <GlobalHeader />
          
          {/* Основной контент страниц */}
          <main className="w-full">
            {children}
          </main>
        </BanGuard>
      </body>
    </html>
  );
}