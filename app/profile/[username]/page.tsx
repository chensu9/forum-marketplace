import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import BgUploadButton from "@/components/profile/bg-upload-button";
import RoleBadge from "@/components/user/role-badge";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const session = await auth();
  const resolvedParams = await params;
  
  const user = await prisma.user.findUnique({
    where: { username: resolvedParams.username },
    include: {
      posts: { orderBy: { createdAt: "desc" } },
      _count: { select: { posts: true, comments: true } }
    },
  });

  if (!user) notFound();
  
  const isOwnProfile = session?.user?.id === user.id;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 w-full">
      
      {/* =========================================
          ШАПКА / БАННЕР ПРОФИЛЯ
          ========================================= */}
      <div className="relative w-full h-48 sm:h-64 bg-[#272729] rounded-t-xl overflow-hidden border border-[#343536]">
        {user.profileBackground ? (
          user.profileBackground.endsWith(".mp4") || user.profileBackground.endsWith(".webm") ? (
            <video
              src={user.profileBackground}
              autoPlay loop muted playsInline
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <img
              src={user.profileBackground}
              alt="Profile Background"
              className="w-full h-full object-cover opacity-80"
            />
          )
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-800 opacity-80"></div>
        )}

        {/* Кнопка смены фона для владельца */}
        {isOwnProfile && (
          <div className="absolute top-4 right-4 z-10">
            <BgUploadButton />
          </div>
        )}
      </div>

      {/* =========================================
          ОСНОВНАЯ 2-КОЛОНОЧНАЯ СЕТКА
          ========================================= */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_312px] gap-6 mt-6 items-start">
        
        {/* ЛЕВАЯ КОЛОНКА (Лента постов) */}
        <div className="flex-1 space-y-4 order-2 md:order-1">
          
          {/* Фейковые вкладки для красоты (как на Reddit) */}
          <div className="flex gap-2 mb-2">
            <div className="px-4 py-2 bg-[#272729] text-gray-100 text-sm font-bold rounded-full cursor-default">
              Посты
            </div>
            <div className="px-4 py-2 text-gray-500 hover:bg-[#272729] hover:text-gray-300 transition rounded-full text-sm font-semibold cursor-pointer">
              Комментарии
            </div>
          </div>

          <div className="space-y-3">
            {user.posts.length === 0 ? (
              <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-10 text-center text-gray-500 text-sm">
                Пользователь пока ничего не публиковал
              </div>
            ) : (
              user.posts.map((post) => (
                <div key={post.id} className="bg-[#1A1A1B] border border-[#343536] hover:border-[#818384] rounded-md transition-colors p-4 block">
                  <div className="text-xs text-gray-400 mb-1.5 flex items-center gap-2">
                    <span className="font-medium">Опубликовано</span>
                    <span>• {post.createdAt.toLocaleDateString("ru-RU")}</span>
                  </div>
                  <Link href={`/post/${post.id}`} className="block">
                    <h3 className="text-lg font-semibold text-gray-100 hover:underline mb-3 leading-tight break-words">
                      {post.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      {post.views} Просмотров
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (Сайдбар с инфой о юзере) */}
        <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-4 relative z-10 md:-mt-20 order-1 md:order-2 shadow-lg">
          
          {/* Аватар (Наполовину заходит на баннер) */}
          <div className="w-24 h-24 bg-[#1A1A1B] rounded-full p-1 mb-3 mx-auto md:mx-0 -mt-16 md:-mt-0">
            <div className="w-full h-full bg-gradient-to-tr from-gray-600 to-gray-500 rounded-full flex items-center justify-center text-4xl text-white font-bold overflow-hidden border border-[#343536]">
              {user.image ? (
                <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                user.username[0].toUpperCase()
              )}
            </div>
          </div>

          <h1 className="text-xl font-bold text-gray-100 flex items-center justify-center md:justify-start gap-2 truncate">
            {user.username}
            <RoleBadge role={user.role} />
          </h1>
          <div className="text-sm text-gray-500 text-center md:text-left mb-4">u/{user.username}</div>

          {/* Био */}
          <div className="mb-6">
            {user.bio ? (
              <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">{user.bio}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">Описание профиля отсутствует.</p>
            )}
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-xl font-bold text-gray-100">{user._count.posts}</div>
              <div className="text-xs text-gray-500">Постов</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-100">{user._count.comments}</div>
              <div className="text-xs text-gray-500">Комментариев</div>
            </div>
          </div>

          {/* Дата регистрации */}
          <div className="text-xs text-gray-500 border-t border-[#343536] pt-4 mb-6 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Регистрация: {user.createdAt.toLocaleDateString("ru-RU")}
          </div>

          {/* Кнопки действий */}
          <div className="space-y-3">
            {isOwnProfile ? (
              <Link href="/settings" className="flex items-center justify-center bg-gray-200 hover:bg-white text-black font-semibold px-4 py-2 rounded-full transition text-sm">
                Настройки профиля
              </Link>
            ) : (
              session?.user && (
                <Link href={`/messages/${user.username}`} className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-full transition text-sm gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Отправить сообщение
                </Link>
              )
            )}
          </div>

        </div>
      </div>
    </div>
  );
}