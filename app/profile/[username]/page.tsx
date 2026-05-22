import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import BgUploadButton from "@/components/profile/bg-upload-button";
import RoleBadge from "@/components/user/role-badge";
import UniversalReportButton from "@/components/post/universal-report-button";

export default async function ProfilePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ username: string }>,
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const currentTab = resolvedSearchParams.tab || "posts";
  
  // 1. Получаем пользователя и статистику
  const user = await prisma.user.findUnique({
    where: { username: resolvedParams.username },
    include: {
      _count: { select: { posts: true, comments: true } }
    },
  });

  if (!user) notFound();
  
  const isOwnProfile = session?.user?.id === user.id;

  // 2. В зависимости от вкладки получаем посты ИЛИ комментарии
  let userPosts: any[] = [];
  let userComments: any[] = [];

  if (currentTab === "comments") {
    userComments = await prisma.comment.findMany({
      where: { authorId: user.id },
      include: { post: true }, // Подтягиваем инфу о посте, чтобы дать на него ссылку
      orderBy: { createdAt: "desc" },
    });
  } else {
    userPosts = await prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <div className="max-w-[1000px] mx-auto pb-12 w-full">
      
      {/* =========================================
          ШАПКА / БАННЕР ПРОФИЛЯ
          ========================================= */}
      <div className="relative w-full h-48 sm:h-64 bg-[#1A1A1B] sm:rounded-b-xl overflow-hidden border border-[#343536] border-t-0 shadow-sm">
        {user.profileBackground ? (
          user.profileBackground.endsWith(".mp4") || user.profileBackground.endsWith(".webm") ? (
            <video
              src={user.profileBackground}
              autoPlay loop muted playsInline
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <img
              src={user.profileBackground}
              alt="Profile Background"
              className="w-full h-full object-cover opacity-90"
            />
          )
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-800 opacity-80"></div>
        )}

        {isOwnProfile && (
          <div className="absolute top-4 right-4 z-10">
            <BgUploadButton />
          </div>
        )}
      </div>

      {/* =========================================
          БЛОК ИНФОРМАЦИИ (ПОД БАННЕРОМ)
          ========================================= */}
      <div className="px-4 sm:px-8 relative z-10 -mt-16 mb-8">
        
        {/* Аватарка слева, Кнопки справа */}
        <div className="flex justify-between items-end">
          <div className="relative w-32 h-32 rounded-full border-4 border-[#0A0A0B] bg-[#1A1A1B] shrink-0 shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-tr from-gray-600 to-gray-500 flex items-center justify-center text-4xl text-white font-bold">
              {user.image ? (
                <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                user.username[0].toUpperCase()
              )}
            </div>
            {isOwnProfile && (
              <Link href="/settings" className="absolute bottom-0 right-0 bg-[#272729] hover:bg-[#343536] border-2 border-[#0A0A0B] p-2 rounded-full text-white transition cursor-pointer" title="Обновить фото">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 pb-2">
            {isOwnProfile ? (
              <Link href="/settings" className="bg-gray-200 hover:bg-white text-black font-semibold px-5 py-2 rounded-full transition text-sm shadow-sm">
                Редактировать профиль
              </Link>
            ) : (
              session?.user && (
                <>
                  <Link href={`/messages/${user.username}`} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-full transition text-sm shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Написать
                  </Link>
                  <button className="bg-[#272729] hover:bg-red-500/20 hover:text-red-400 border border-[#343536] hover:border-red-500/50 text-gray-300 font-semibold p-2 rounded-full transition shadow-sm" title="Пожаловаться">
                    <UniversalReportButton id={user.id} type="profile" />
                  </button>
                </>
              )
            )}
          </div>
        </div>

        {/* Имя и Никнейм */}
        <div className="mt-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 flex items-center gap-2">
            {user.username}
            <RoleBadge role={user.role} />
          </h1>
          <p className="text-sm text-gray-400 mt-1">u/{user.username} • На проекте с {user.createdAt.toLocaleDateString("ru-RU")}</p>
        </div>
      </div>

      {/* =========================================
          ОСНОВНАЯ 2-КОЛОНОЧНАЯ СЕТКА
          ========================================= */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 px-4 sm:px-8 items-start">
        
        {/* ЛЕВАЯ КОЛОНКА (Контент пользователя) */}
        <div className="flex-1 space-y-4 min-w-0">
          
          {/* Навигация по вкладкам (С рабочими ссылками) */}
          <div className="flex gap-2 mb-2 border-b border-[#343536]">
            <Link 
              href={`/profile/${user.username}?tab=posts`}
              className={`px-4 py-2.5 text-sm font-bold rounded-t-md transition-colors border-b-2 ${
                currentTab === "posts" 
                ? "bg-[#272729] text-gray-100 border-blue-500" 
                : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-[#272729]/50"
              }`}
            >
              Посты
            </Link>
            <Link 
              href={`/profile/${user.username}?tab=comments`}
              className={`px-4 py-2.5 text-sm font-bold rounded-t-md transition-colors border-b-2 ${
                currentTab === "comments" 
                ? "bg-[#272729] text-gray-100 border-blue-500" 
                : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-[#272729]/50"
              }`}
            >
              Комментарии
            </Link>
          </div>

          {/* ВЫВОД ПОСТОВ */}
          {currentTab === "posts" && (
            <div className="space-y-3">
              {userPosts.length === 0 ? (
                <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-10 text-center text-gray-500 text-sm shadow-sm">
                  Пользователь пока ничего не публиковал
                </div>
              ) : (
                userPosts.map((post) => (
                  <div key={post.id} className="bg-[#1A1A1B] border border-[#343536] hover:border-gray-500 rounded-md transition-colors p-5 block shadow-sm group">
                    <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                      <span className="font-medium">Опубликовано</span>
                      <span>• {post.createdAt.toLocaleDateString("ru-RU")}</span>
                    </div>
                    <Link href={`/post/${post.id}`} className="block">
                      <h3 className="text-lg font-bold text-gray-100 group-hover:text-blue-400 transition-colors mb-3 leading-tight break-words">
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
          )}

          {/* ВЫВОД КОММЕНТАРИЕВ */}
          {currentTab === "comments" && (
            <div className="space-y-3">
              {userComments.length === 0 ? (
                <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-10 text-center text-gray-500 text-sm shadow-sm">
                  Пользователь пока не оставлял комментариев
                </div>
              ) : (
                userComments.map((comment) => (
                  <div key={comment.id} className="bg-[#1A1A1B] border border-[#343536] hover:border-gray-500 rounded-md transition-colors p-5 block shadow-sm group">
                    <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                      <span className="font-medium">Комментарий к посту</span>
                      <span>• {comment.createdAt.toLocaleDateString("ru-RU")}</span>
                    </div>
                    <Link href={`/post/${comment.postId}`} className="block mb-3">
                      <h3 className="text-sm font-bold text-blue-400 hover:underline transition-colors leading-tight break-words">
                        {comment.post.title}
                      </h3>
                    </Link>
                    <div className="bg-[#272729] p-3 rounded-md border border-[#343536] text-sm text-gray-300 whitespace-pre-wrap">
                      {comment.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* ПРАВАЯ КОЛОНКА (Инфо о себе и статистика) */}
        <div className="space-y-4">
          <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-5 shadow-sm">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">О себе</h2>
            {user.bio ? (
              <p className="text-sm text-gray-300 whitespace-pre-wrap break-words leading-relaxed">{user.bio}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">Описание профиля отсутствует.</p>
            )}
          </div>

          <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-5 shadow-sm">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Статистика активности</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#272729] p-3 rounded-md border border-[#343536]">
                <div className="text-xl font-black text-gray-100">{user._count.posts}</div>
                <div className="text-xs text-gray-500 font-medium">Постов</div>
              </div>
              <div className="bg-[#272729] p-3 rounded-md border border-[#343536]">
                <div className="text-xl font-black text-gray-100">{user._count.comments}</div>
                <div className="text-xs text-gray-500 font-medium">Комментариев</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}