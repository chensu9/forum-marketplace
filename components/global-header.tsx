import Link from "next/link";
import { auth } from "@/auth";
import BalanceDisplay from "@/components/economy/balance-display";
import UnreadCounter from "@/components/messages/unread-counter";

export default async function GlobalHeader() {
  const session = await auth();

  return (
    <header className="w-full max-w-7xl mx-auto mb-8 font-mono">
      {/* Ширина max-w-7xl — стандарт для широких экранов, чтобы шапка была вровень с контентом */}
      
      {/* 1. ЛОГОТИП И ВЕРСИЯ */}
      <div className="mb-4">
        <Link href="/" className="text-2xl sm:text-3xl font-bold text-[#4AF626] text-glow hover:opacity-80 transition block w-fit">
          hatehatehateforum_
        </Link>
        <div className="text-[10px] text-[#4AF626]/50 uppercase tracking-widest mt-1">
          SYS.V2.0.0 | TERM: NEXUS-SRV
        </div>
      </div>

      {/* 2. НАВИГАЦИОННАЯ ПАНЕЛЬ (ЧИСТАЯ, БЕЗ АДМИНКИ) */}
      <nav className="flex flex-wrap items-center justify-between gap-4 w-full mb-6 border-y border-[#4AF626]/20 py-3">
        
        {/* Ссылки слева */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <Link href="/" className="hover:text-white transition text-[11px] sm:text-xs font-bold uppercase tracking-widest">
            [ Темы ]
          </Link>
          <Link href="/users" className="hover:text-white transition text-[11px] sm:text-xs font-bold uppercase tracking-widest">
            [ Пользователи ]
          </Link>
          <Link href="/market" className="hover:text-white transition text-[11px] sm:text-xs font-bold uppercase tracking-widest">
            [ Маркет ]
          </Link>
        </div>

        {/* Экономика и сообщения справа */}
        <div className="flex flex-wrap items-center gap-3">
          <BalanceDisplay />
          <UnreadCounter />
        </div>

      </nav>

      {/* 3. ПАНЕЛЬ ПОЛЬЗОВАТЕЛЯ */}
      <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
        {session?.user ? (
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-white">
              <span className="text-[#4AF626]/70">USR:</span> {session.user.username || session.user.name || "UNKNOWN"}
            </span>
            
            <Link href="/api/auth/signout" className="text-red-500 hover:text-white transition">
              [ Выход ]
            </Link>
            
            <Link href="/submit" className="bg-[#4AF626] text-[#0A0A0A] px-4 py-2 hover:bg-white transition ml-2 sm:ml-4">
              &gt; НОВЫЙ ТРЕД
            </Link>
          </div>
        ) : (
          <Link href="/login" className="text-[#4AF626] hover:text-white transition">
            [ ВХОД В СИСТЕМУ ]
          </Link>
        )}
      </div>

    </header>
  );
}