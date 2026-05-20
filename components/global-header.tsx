"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UnreadCounter from "@/components/messages/unread-counter";

export default function GlobalHeader({ session }: { session: any }) {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <header className="w-full border-b border-[#4AF626]/30 bg-[#0A0A0A]/90 backdrop-blur-sm p-4 sticky top-0 z-50">
      {/* Добавили max-w-[1600px] mx-auto для ограничения ширины */}
      <div className="flex flex-wrap items-center justify-between w-full h-full max-w-[1600px] mx-auto gap-4">
        
        {/* ЛЕВАЯ ЧАСТЬ: Логотип */}
        <div className="flex flex-col shrink-0">
          <Link href="/">
            <h1 className="text-2xl font-bold tracking-tight text-[#4AF626] text-glow leading-none cursor-pointer hover:text-white transition">
              hatehatehateforum<span className="animate-console-cursor">_</span>
            </h1>
          </Link>
          <div className="text-[10px] text-[#4AF626]/60 mt-1 uppercase tracking-widest">
            <span>SYS.v1.0.0</span> | <span>Term: nexus-srv</span>
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: Вся навигация (flex-wrap спасает от багов Tailwind) */}
        <div className="flex flex-wrap items-center gap-5 text-sm font-bold">
          
          {/* Ссылки разделов (УБРАЛИ hidden md:flex) */}
          <nav className="flex flex-wrap items-center gap-5">
            <Link href="/" className="hover:text-white hover:text-glow transition">[ Темы ]</Link>
            <Link href="/users" className="hover:text-white hover:text-glow transition">[ Пользователи ]</Link>
            <Link href="/market" className="hover:text-white hover:text-glow transition">[ Маркет ]</Link>
            <UnreadCounter />
          </nav>

          {/* Панель юзера и кнопка создания */}
          <div className="flex flex-wrap items-center gap-4 border-l border-[#4AF626]/30 pl-5">
            {session?.user ? (
              <>
                <Link href={`/profile/${session.user.username}`} className="text-white text-glow">
                  USR: {session.user.username}
                </Link>
                <Link href="/api/auth/signout" className="text-red-500 hover:text-red-400 hover:shadow-[0_0_8px_rgba(239,68,68,0.6)] transition">
                  [ Выход ]
                </Link>
              </>
            ) : (
              <Link href="/login" className="hover:text-white hover:text-glow transition">
                [ Войти ]
              </Link>
            )}
            <Link href="/create" className="bg-[#4AF626] text-[#0A0A0A] px-4 py-1.5 hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all font-bold text-xs uppercase">
              &gt; NEW_THREAD
            </Link>
          </div>
          
        </div>

      </div>
    </header>
  );
}