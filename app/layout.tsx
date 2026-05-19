import type { Metadata } from "next";
import "@uploadthing/react/styles.css";
import "./globals.css";
import { auth } from "@/auth";
import GlobalHeader from "@/components/global-header";

export const metadata: Metadata = {
  title: "hatehatehateforum | CLI",
  description: "Terminal based forum",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="ru">
      <body className="bg-[#0A0A0A] text-[#4AF626] font-mono selection:bg-[#4AF626] selection:text-[#0A0A0A] antialiased min-h-screen flex flex-col crt-overlay">
        
        <GlobalHeader session={session} />

        {/* ДОБАВЛЕНО max-w-[1600px] mx-auto, чтобы контент не растягивался на ульра-широких мониторах */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-6 relative z-10">
          {children}
        </main>

      </body>
    </html>
  );
}