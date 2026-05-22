import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LikeButton from "@/components/post/like-button";
import RoleBadge from "@/components/user/role-badge";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ tag?: string, q?: string }> }) {
  const session = await auth();
  const resolvedParams = await searchParams;
  const currentTag = resolvedParams.tag;
  const searchQuery = resolvedParams.q;

  const whereClause: any = {};
  
  // === ИСПРАВЛЕННАЯ ЛОГИКА ПОИСКА ===
  if (currentTag && searchQuery) {
    const cleanQuery = searchQuery.replace(/^#/, '');
    whereClause.AND = [
      { tags: { some: { name: currentTag } } },
      {
        OR: [
          { title: { contains: cleanQuery, mode: "insensitive" } },
          { content: { contains: cleanQuery, mode: "insensitive" } }
        ]
      }
    ];
  } else if (currentTag) {
    whereClause.tags = { some: { name: currentTag } };
  } else if (searchQuery) {
    // Убираем решетку, если пользователь ввел запрос как "#тег"
    const cleanQuery = searchQuery.replace(/^#/, '');
    
    whereClause.OR = [
      { title: { contains: cleanQuery, mode: "insensitive" } },
      { content: { contains: cleanQuery, mode: "insensitive" } },
      // ТЕПЕРЬ ПОИСК ИЩЕТ И ПО ТЕГАМ!
      { tags: { some: { name: { contains: cleanQuery, mode: "insensitive" } } } }
    ];
  }

  // 1. Достаем посты для основной ленты (ИСПРАВЛЕНО: Добавлен инклуд дизлайков)
  const posts = await prisma.post.findMany({
    where: whereClause,
    include: { 
      author: true, 
      tags: true, 
      likedBy: { select: { id: true } }, 
      dislikedBy: { select: { id: true } }, // <--- Добавлено для синхронизации типов
      _count: { select: { comments: true } } 
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. АЛГОРИТМ ТРЕНДОВ (ИСПРАВЛЕНО: Сюда тоже докинули инклуд дизлайков)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  let rawTrendingPosts = await prisma.post.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    include: {
      author: true,
      likedBy: { select: { id: true } },
      dislikedBy: { select: { id: true } }, // <--- Добавлено
      _count: { select: { comments: true } },
      comments: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  });

  if (rawTrendingPosts.length === 0) {
    rawTrendingPosts = await prisma.post.findMany({
      take: 15,
      include: {
        author: true,
        likedBy: { select: { id: true } },
        dislikedBy: { select: { id: true } }, // <--- Добавлено
        _count: { select: { comments: true } },
        comments: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Перерасчет формулы популярности с учетом дизлайков
  const trendingPosts = rawTrendingPosts
    .map(post => {
      const score = post.likedBy.length - post.dislikedBy.length + post._count.comments;
      return { ...post, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // 3. Статистика
  const totalPosts = await prisma.post.count();
  const totalUsers = await prisma.user.count();
  const topUsers = await prisma.user.findMany({
    take: 5, include: { _count: { select: { posts: true } } }, orderBy: { posts: { _count: 'desc' } }
  });
  const onlineUsers = 0; // Заглушка

  const isAdminOrMod = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";

  return (
    <div className="max-w-[1200px] mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-[1fr_312px] items-start gap-6 mt-6">
      
      {/* ========================================================= */}
      {/* ЛЕВАЯ КОЛОНКА (ЛЕНТА ПОСТОВ) */}
      {/* ========================================================= */}
      <div className="flex-1 min-w-0 space-y-4">
        
        {/* === БЛОК ПОИСКА И СОЗДАНИЯ ТРЕДА === */}
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* СТРОКА ПОИСКА */}
          <form method="GET" action="/" className="flex-1 bg-[#1A1A1B] border border-[#343536] rounded-md p-1.5 flex items-center focus-within:border-gray-400 transition-colors shadow-sm">
             <div className="pl-3 pr-2 text-gray-500">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             </div>
             <input
               type="text"
               name="q"
               defaultValue={searchQuery || ""}
               placeholder="Поиск по темам, постам и тегам..."
               className="w-full bg-transparent border-none p-2 text-sm text-gray-100 placeholder-gray-500 outline-none transition cursor-text"
             />
             <button type="submit" className="px-4 py-2 hover:bg-[#272729] rounded-md transition text-gray-400 hover:text-white font-medium text-sm mr-1">
               Найти
             </button>
          </form>

          {/* КНОПКА СОЗДАНИЯ ТРЕДА */}
          {session?.user && (
            <Link 
              href="/create" 
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-md transition shadow-sm flex items-center justify-center gap-2 shrink-0 h-[52px]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Создать тред
            </Link>
          )}
        </div>

        {/* Фильтры */}
        {(currentTag || searchQuery) && (
          <div className="bg-[#272729] border border-[#343536] rounded-md p-3 text-sm flex items-center justify-between text-gray-300">
            <div>
              <span className="font-semibold text-white mr-2">Результаты для:</span>
              {currentTag && <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full mr-2">#{currentTag}</span>}
              {searchQuery && <span className="italic">"{searchQuery}"</span>}
            </div>
            <Link href="/" className="text-red-400 hover:text-red-300 transition text-xs font-semibold uppercase tracking-wider">Сбросить</Link>
          </div>
        )}

        {/* Лента Постов */}
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-10 text-center text-gray-500 shadow-sm">
              По вашему запросу ничего не найдено.
            </div>
          ) : (
            posts.map((post) => {
              // Вычисляем статический баланс рейтинга для неавторизованных гостей
              const guestScore = post.likedBy.length - post.dislikedBy.length;
              
              return (
                <div key={post.id} className="bg-[#1A1A1B] border border-[#343536] hover:border-gray-500 rounded-md transition-colors flex overflow-hidden group shadow-sm">
                  
                  {/* Левая панель: Голосование */}
                  <div className="w-10 bg-[#1A1A1B] flex flex-col items-center pt-2 gap-1 border-r border-transparent group-hover:border-[#343536] transition-colors">
                     {session?.user ? (
                       <LikeButton 
                         postId={post.id} 
                         initialLikes={post.likedBy.length} 
                         initialDislikes={post.dislikedBy?.length || 0} 
                         initialHasLiked={post.likedBy.some(u => u.id === session?.user?.id)} 
                         initialHasDisliked={post.dislikedBy?.some(u => u.id === session?.user?.id) || false} 
                       />
                     ) : (
                       <>
                         <Link href="/login" className="text-gray-500 hover:text-orange-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></Link>
                         <span className={`text-xs font-bold ${guestScore > 0 ? 'text-orange-500' : guestScore < 0 ? 'text-blue-500' : 'text-gray-300'}`}>
                           {guestScore > 0 ? `+${guestScore}` : guestScore}
                         </span>
                         <Link href="/login" className="text-gray-500 hover:text-blue-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></Link>
                       </>
                     )}
                  </div>

                  {/* Основной контент карточки */}
                  <div className="p-3 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5 flex-wrap">
                      
                      <Link href={`/profile/${post.author.username}`} className="flex items-center gap-1.5 font-bold text-gray-200 hover:underline">
                        <div className="w-4 h-4 rounded-full overflow-hidden bg-gradient-to-tr from-gray-600 to-gray-500 flex items-center justify-center text-[8px] text-white">
                          {post.author.image ? (
                            <img src={post.author.image} alt={post.author.username} className="w-full h-full object-cover" />
                          ) : (
                            post.author.username.charAt(0).toUpperCase()
                          )}
                        </div>
                        u/{post.author.username}
                      </Link>

                      <RoleBadge role={post.author.role} />
                      <span>• {post.createdAt.toLocaleDateString("ru-RU")}</span>
                      {post.tags.map(tag => (
                        <Link href={`/?tag=${tag.name}`} key={tag.id} className="bg-[#272729] hover:bg-[#343536] text-gray-300 px-1.5 py-0.5 rounded transition">
                          {tag.name}
                        </Link>
                      ))}
                    </div>

                    <Link href={`/post/${post.id}`} className="block">
                      <h3 className="text-lg font-semibold text-gray-100 mb-1.5 leading-tight break-words">{post.title}</h3>
                      <p className="text-sm text-gray-300 line-clamp-3 mb-2 break-words leading-relaxed">{post.content}</p>
                    </Link>

                    {/* Кнопки действий */}
                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 mt-2">
                      <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 hover:bg-[#272729] px-2 py-1.5 rounded transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        {post._count.comments} Комментариев
                      </Link>
                      <div className="flex items-center gap-1.5 hover:bg-[#272729] px-2 py-1.5 rounded transition cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        Поделиться
                      </div>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* ПРАВАЯ КОЛОНКА (САЙДБАР С ВИДЖЕТАМИ) */}
      {/* ========================================================= */}
      <div className="w-full md:w-[312px] shrink-0 space-y-4">
        
        {/* НАВИГАЦИЯ */}
        <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-2 flex flex-col gap-1 shadow-sm">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#272729] text-gray-100 font-medium transition">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
             Главная
          </Link>
          <Link href="/market" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#272729] text-gray-300 hover:text-gray-100 font-medium transition">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z" /></svg>
             Маркетплейс
          </Link>
          {session?.user && (
            <>
              <Link href="/messages" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#272729] text-gray-300 hover:text-gray-100 font-medium transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                Сообщения
              </Link>
              <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#272729] text-gray-300 hover:text-gray-100 font-medium transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Настройки
              </Link>
            </>
          )}
          {isAdminOrMod && (
             <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#272729] text-orange-400 hover:text-orange-300 font-bold transition border-t border-[#343536] mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                Админ-панель
             </Link>
          )}
        </div>

        {/* ПЛАШКА TELEGRAM */}
        <div className="bg-[#1A1A1B] border border-[#343536] rounded-md overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-10 w-full relative">
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          </div>
          <div className="p-4 pt-0">
             <div className="flex items-center gap-2 mb-3 -mt-5 relative z-10">
               <div className="w-12 h-12 bg-[#1A1A1B] rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-[#1A1A1B] shadow-[0_0_15px_rgba(59,130,246,0.5)]">H</div>
               <span className="font-bold text-gray-100 mt-5 text-lg tracking-tight">hatehatehateforum</span>
             </div>
             <p className="text-sm text-gray-300 mb-4 leading-relaxed">
               Подписывайтесь на наш official Telegram-канал! Там мы публикуем важные новости, обновления и инсайды.
             </p>
             <a href="https://t.me/your_channel_link" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full py-2.5 transition text-sm shadow-sm flex items-center justify-center gap-2">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.905-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.666 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.117.095.152.227.166.331.002.046.014.22-.036.467z"/></svg>
               Перейти в Telegram
             </a>
          </div>
        </div>

        {/* Тренды (Популярное) */}
        <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-4 shadow-sm">
           <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Популярное сейчас</h3>
           <div className="space-y-4">
             {trendingPosts.length === 0 ? (
               <div className="text-sm text-gray-500 italic">Пока пусто. Создайте первый тред!</div>
             ) : (
               trendingPosts.map((post, idx) => (
                 <Link href={`/post/${post.id}`} key={`trend-${post.id}`} className="flex gap-3 group">
                   <div className="font-black text-gray-600 text-lg group-hover:text-blue-500 transition-colors w-4">{idx + 1}</div>
                   <div>
                     <h4 className="text-sm font-semibold text-gray-200 group-hover:underline line-clamp-2 leading-snug">{post.title}</h4>
                     <div className="text-xs text-gray-500 mt-1">{post.score} очков активности</div>
                   </div>
                 </Link>
               ))
             )}
           </div>
        </div>

        {/* ТОП АВТОРОВ */}
        <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-4 shadow-sm">
           <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Топ авторов</h3>
           <div className="space-y-3">
             {topUsers.map((u) => (
               <div key={u.id} className="flex justify-between items-center text-sm">
                 <Link href={`/profile/${u.username}`} className="flex items-center gap-2 hover:underline text-gray-200 font-medium">
                    <div className="w-7 h-7 bg-gradient-to-tr from-gray-600 to-gray-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner overflow-hidden">
                      {u.image ? (
                        <img src={u.image} alt={u.username} className="w-full h-full object-cover" />
                      ) : (
                        u.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="truncate max-w-[120px]">{u.username}</span>
                    <RoleBadge role={u.role} />
                 </Link>
                 <span className="text-gray-400 font-bold bg-[#272729] px-2 py-0.5 rounded text-xs">{u._count.posts}</span>
               </div>
             ))}
           </div>
        </div>

        {/* Статистика */}
        <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-4 text-sm text-gray-300 shadow-sm">
           <div className="flex justify-between mb-2">
             <span>Пользователей:</span> <span className="font-bold text-white">{totalUsers}</span>
           </div>
           <div className="flex justify-between mb-2">
             <span>Тем создано:</span> <span className="font-bold text-white">{totalPosts}</span>
           </div>
           <div className="flex justify-between text-green-500 font-bold border-t border-[#343536] pt-3 mt-3">
             <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Онлайн:</span> 
             <span>{onlineUsers}</span>
           </div>
        </div>

      </div>
    </div>
  );
}