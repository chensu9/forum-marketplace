import Link from "next/link";
import { auth } from "@/auth";
import BalanceDisplay from "@/components/economy/balance-display";
import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";
// Импортируем наш новый экшен для кнопки "Прочитать все"
import { markAllNotificationsAsRead } from "@/lib/actions/user";

export default async function GlobalHeader() {
  const session = await auth();

  const isAdminOrMod = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";

  let dbUser = null;
  let notifications: any[] = [];
  let unreadCount = 0;

  if (session?.user?.id) {
    // 1. Параллельно запрашиваем аватарку юзера и его уведомления
    const [userResult, notificationsResult] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { image: true }
      }),
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 10 // Показываем последние 10 штук в дропдауне
      })
    ]);

    dbUser = userResult;
    notifications = notificationsResult;
    
    // Считаем количество именно непрочитанных алертов
    unreadCount = notifications.filter(n => !n.isRead).length;
  }

  // Локальный обработчик для вызова серверного экшена очистки точек
  async function handleMarkAllAsRead() {
    "use server";
    await markAllNotificationsAsRead();
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#1A1A1B] border-b border-[#343536] text-white">
      <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* 1. ЛОГОТИП */}
        <Link href="/" className="flex items-center transition shrink-0 group cursor-pointer">
          <div className="flex text-3xl font-black tracking-tighter">
            <div className="flex items-center text-blue-500 drop-shadow-md">
              <span>h</span>
              <span className="max-w-0 overflow-hidden group-hover:max-w-[60px] transition-[max-width] duration-500 ease-in-out">ate</span>
            </div>
            <div className="flex items-center text-purple-500 drop-shadow-md -ml-0.5 group-hover:ml-0 transition-all duration-500">
              <span>h</span>
              <span className="max-w-0 overflow-hidden group-hover:max-w-[60px] transition-[max-width] duration-500 ease-in-out">ate</span>
            </div>
            <div className="flex items-center text-orange-500 drop-shadow-md -ml-0.5 group-hover:ml-0 transition-all duration-500">
              <span>h</span>
              <span className="max-w-0 overflow-hidden group-hover:max-w-[60px] transition-[max-width] duration-500 ease-in-out">ate</span>
            </div>
          </div>
          <span className="text-2xl font-bold ml-1 text-gray-100 tracking-tight">forum</span>
        </Link>

        {/* 2. ПОИСК */}
        <div className="flex-1 max-w-2xl hidden md:flex items-center bg-[#272729] border border-[#343536] hover:border-[#D7DADC] focus-within:border-gray-300 focus-within:bg-[#1A1A1B] rounded-full px-4 h-10 transition">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Поиск по HHH..." 
            className="bg-transparent border-none outline-none w-full text-sm text-gray-200 placeholder-gray-400" 
          />
        </div>

        {/* 3. НАВИГАЦИЯ, КОЛОКОЛЬЧИК И ПРОФИЛЬ */}
        <div className="flex items-center gap-3 shrink-0">
          
          <BalanceDisplay />

          {session?.user ? (
            <div className="flex items-center gap-1 sm:gap-3 ml-2 border-l border-[#343536] pl-3">
              
              {/* Чат */}
              <Link href="/messages" className="p-2 hover:bg-[#272729] rounded-full transition relative group" title="Сообщения">
                <svg className="w-6 h-6 text-gray-300 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </Link>

              {/* === ОЖИВШИЙ СПИСОК УВЕДОМЛЕНИЙ === */}
              <div className="relative group cursor-pointer">
                <div className="p-2 hover:bg-[#272729] rounded-full transition relative">
                  <svg className="w-6 h-6 text-gray-300 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  
                  {/* Красная (оранжевая) точка горит ТОЛЬКО если есть непрочитанные */}
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-[#1A1A1B]"></span>
                  )}
                </div>
                
                {/* Дропдаун */}
                <div className="absolute top-full right-[-60px] sm:right-0 mt-2 w-85 bg-[#1A1A1B] border border-[#343536] rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-[#343536] font-bold text-gray-100 flex justify-between items-center bg-[#272729]/50">
                    <span>Уведомления {unreadCount > 0 && `(${unreadCount})`}</span>
                    {unreadCount > 0 && (
                      <form action={handleMarkAllAsRead}>
                        <button type="submit" className="text-xs text-blue-400 hover:underline bg-transparent border-none outline-none cursor-pointer">
                          Прочитать все
                        </button>
                      </form>
                    )}
                  </div>
                  
                  {/* Рендеринг реального массива из Базы Данных */}
                  <div className="max-h-[320px] overflow-y-auto divide-y divide-[#343536]">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500 italic">
                        Уведомлений пока нет
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`px-4 py-3 hover:bg-[#272729] transition text-left ${
                            !notif.isRead ? "bg-blue-500/5 border-l-2 border-orange-500" : ""
                          }`}
                        >
                          <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {notif.content}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {new Date(notif.createdAt).toLocaleDateString("ru-RU")} в{" "}
                            {new Date(notif.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="block text-center px-4 py-2 bg-[#272729] text-sm text-gray-400 hover:text-white transition border-t border-[#343536]">
                    Очистить историю
                  </div>
                </div>
              </div>

              {/* Мини-профиль */}
              <div className="flex items-center gap-2 cursor-pointer hover:bg-[#272729] p-1 pr-2 rounded-md transition border border-transparent hover:border-[#343536] group relative ml-1">
                 <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden">
                   {dbUser?.image ? (
                     <img src={dbUser.image} alt={session.user.username || "avatar"} className="w-full h-full object-cover" />
                   ) : (
                     session.user.username?.charAt(0).toUpperCase()
                   )}
                 </div>

                 <div className="hidden sm:block text-sm font-medium text-gray-200">
                    {session.user.username}
                 </div>
                 
                 {/* Меню профиля */}
                 <div className="absolute top-full right-0 mt-2 w-56 bg-[#1A1A1B] border border-[#343536] rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[#343536] bg-[#272729]/30">
                      <p className="text-sm font-bold text-white truncate">@{session.user.username}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                    </div>
                    
                    <div className="py-1">
                      <Link href={`/profile/${session.user.username}`} className="block px-4 py-2 text-sm text-gray-200 hover:bg-[#272729]">Мой профиль</Link>
                      <Link href="/settings" className="block px-4 py-2 text-sm text-gray-200 hover:bg-[#272729]">Настройки</Link>
                      <Link href="/market" className="block px-4 py-2 text-sm text-gray-200 hover:bg-[#272729]">Маркетплейс</Link>
                    </div>

                    {isAdminOrMod && (
                      <div className="border-t border-[#343536] py-1">
                        <Link href="/admin" className="block px-4 py-2 text-sm text-orange-400 font-medium hover:bg-[#272729]">
                          Админ-панель
                        </Link>
                      </div>
                    )}
                    
                    <div className="border-t border-[#343536] py-1">
                      <Link href="/api/auth/signout" className="block px-4 py-2 text-sm text-red-400 font-medium hover:bg-[#272729]">Выйти</Link>
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-bold transition ml-2 shadow-sm">
              Войти
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}