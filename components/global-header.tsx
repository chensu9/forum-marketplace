import Link from "next/link";
import { auth } from "@/auth";
import BalanceDisplay from "@/components/economy/balance-display";
import UnreadCounter from "@/components/messages/unread-counter";

export default async function GlobalHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#1A1A1B] border-b border-[#343536] text-white">
      <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* 1. НОВЫЙ ЛОГОТИП (HHHforum) */}
        <Link href="/" className="flex items-center hover:opacity-80 transition shrink-0">
          <div className="flex -space-x-1.5 text-2xl font-black tracking-tighter">
            <span className="text-blue-500 animate-bounce drop-shadow-md" style={{ animationDelay: '0s' }}>H</span>
            <span className="text-purple-500 animate-bounce relative z-10 drop-shadow-md" style={{ animationDelay: '0.15s' }}>H</span>
            <span className="text-orange-500 animate-bounce relative z-20 drop-shadow-md" style={{ animationDelay: '0.3s' }}>H</span>
          </div>
          <span className="text-xl font-bold ml-1 text-gray-100 tracking-tight">forum</span>
        </Link>

        {/* 2. СТРОКА ПОИСКА (Пока заглушка для красоты) */}
        <div className="flex-1 max-w-2xl hidden md:flex items-center bg-[#272729] border border-[#343536] hover:border-[#D7DADC] hover:bg-[#1A1A1B] rounded-full px-4 h-10 transition">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Поиск по Nexus..." 
            className="bg-transparent border-none outline-none w-full text-sm text-gray-200 placeholder-gray-400" 
          />
        </div>

        {/* 3. НАВИГАЦИЯ И ПРОФИЛЬ */}
        <div className="flex items-center gap-3 shrink-0">
          
          <BalanceDisplay />
          <UnreadCounter />

          {session?.user ? (
            <div className="flex items-center gap-3 ml-2 border-l border-[#343536] pl-3">
              {/* Кнопка "Создать пост" */}
              <Link href="/submit" className="hidden sm:flex items-center gap-1 bg-gray-200 hover:bg-white text-black px-3 py-1.5 rounded-full text-sm font-semibold transition">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                 </svg>
                 Создать
              </Link>

              {/* Мини-профиль */}
              <div className="flex items-center gap-2 cursor-pointer hover:bg-[#272729] p-1 pr-2 rounded-md transition border border-transparent hover:border-[#343536] group relative">
                 <div className="w-7 h-7 bg-gradient-to-tr from-gray-600 to-gray-500 rounded-md overflow-hidden">
                   {/* Тут потом можно вывести аватарку */}
                 </div>
                 <div className="hidden sm:block text-xs font-medium text-gray-200">
                    {session.user.username}
                 </div>
                 
                 {/* Выпадающее меню при наведении (Профиль / Выход) */}
                 <div className="absolute top-full right-0 mt-2 w-48 bg-[#1A1A1B] border border-[#343536] rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden">
                    <Link href={`/profile/${session.user.username}`} className="px-4 py-3 text-sm text-gray-200 hover:bg-[#272729]">Мой профиль</Link>
                    <Link href="/market" className="px-4 py-3 text-sm text-gray-200 hover:bg-[#272729]">Маркетплейс</Link>
                    <div className="border-t border-[#343536]"></div>
                    <Link href="/api/auth/signout" className="px-4 py-3 text-sm text-red-400 hover:bg-[#272729]">Выйти</Link>
                 </div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold transition ml-2">
              Войти
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}