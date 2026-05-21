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
  if (currentTag) whereClause.tags = { some: { name: currentTag } };
  if (searchQuery) {
    whereClause.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { content: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  // 1. Достаем посты для основной ленты
  const posts = await prisma.post.findMany({
    where: whereClause,
    include: { author: true, tags: true, likedBy: { select: { id: true } }, _count: { select: { comments: true } } },
    orderBy: { createdAt: "desc" },
  });

  // 2. УМНЫЙ АЛГОРИТМ ТРЕНДОВ
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const rawTrendingPosts = await prisma.post.findMany({
    where: { createdAt: { gte: oneDayAgo } },
    include: {
      author: true,
      likedBy: { select: { id: true } },
      _count: { select: { comments: true } },
      comments: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  });

  const trendingPosts = rawTrendingPosts
    .map(post => {
      const score = post.likedBy.length + post._count.comments;
      const lastActivityTime = post.comments.length > 0 
        ? Math.max(post.createdAt.getTime(), post.comments[0].createdAt.getTime()) 
        : post.createdAt.getTime();
      const isHot = (Date.now() - lastActivityTime) < 60 * 60 * 1000;
      return { ...post, score, isHot };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // 3. Статистика
  const totalPosts = await prisma.post.count();
  const totalUsers = await prisma.user.count();
  const topUsers = await prisma.user.findMany({
    take: 5, include: { _count: { select: { posts: true } } }, orderBy: { posts: { _count: 'desc' } }
  });
  const onlineUsers = 0;

  return (
    <div className="max-w-[1200px] mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-[1fr_312px] items-start gap-6 mt-6">
      {/* ========================================================= */}
      {/* ЛЕВАЯ КОЛОНКА (ЛЕНТА ПОСТОВ) */}
      {/* ========================================================= */}
      <div className="flex-1 min-w-0 space-y-4">
        
        {/* Строка поиска (Стиль Reddit) */}
        <form method="GET" action="/" className="bg-[#1A1A1B] border border-[#343536] rounded-md p-2 flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-600 to-gray-500 shrink-0"></div>
           <input
             type="text"
             name="q"
             defaultValue={searchQuery || ""}
             placeholder="Создать пост..."
             className="w-full bg-[#272729] border border-[#343536] hover:bg-[#1A1A1B] hover:border-[#D7DADC] rounded-md p-2 text-sm text-gray-200 placeholder-gray-400 outline-none transition cursor-text"
           />
           {session?.user && (
             <Link href="/submit" className="p-2 hover:bg-[#272729] rounded-md transition text-gray-400 hover:text-white">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             </Link>
           )}
        </form>

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
            <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-10 text-center text-gray-500">
              Здесь пока ничего нет
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-[#1A1A1B] border border-[#343536] hover:border-[#818384] rounded-md transition-colors flex overflow-hidden group">
                
                {/* Левая панель: Голосование */}
                <div className="w-10 bg-[#1A1A1B] flex flex-col items-center pt-2 gap-1 border-r border-transparent group-hover:border-[#343536] transition-colors">
                   {session?.user ? (
                     <LikeButton postId={post.id} initialLikes={post.likedBy.length} initialHasLiked={post.likedBy.some(u => u.id === session?.user?.id)} />
                   ) : (
                     <>
                       <button className="text-gray-500 hover:text-orange-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></button>
                       <span className="text-xs font-bold text-gray-300">{post.likedBy.length}</span>
                       <button className="text-gray-500 hover:text-blue-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                     </>
                   )}
                </div>

                {/* Основной контент карточки */}
                <div className="p-2 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5 flex-wrap">
                    <Link href={`/profile/${post.author.username}`} className="font-bold text-gray-200 hover:underline">
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
                    <h3 className="text-lg font-semibold text-gray-100 mb-1 leading-tight break-words">{post.title}</h3>
                    <p className="text-sm text-gray-300 line-clamp-3 mb-2 break-words">{post.content}</p>
                  </Link>

                  {/* Кнопки действий (Комментарии, Поделиться) */}
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-400">
                    <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 hover:bg-[#272729] px-2 py-1.5 rounded transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      {post._count.comments} Комментариев
                    </Link>
                    <div className="flex items-center gap-1.5 hover:bg-[#272729] px-2 py-1.5 rounded transition cursor-pointer">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      Поделиться
                    </div>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* ПРАВАЯ КОЛОНКА (САЙДБАР С ВИДЖЕТАМИ) */}
      {/* ========================================================= */}
      <div className="w-full md:w-[312px] shrink-0 space-y-4">
        
        {/* О Проекте */}
        <div className="bg-[#1A1A1B] border border-[#343536] rounded-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-10 w-full"></div>
          <div className="p-3">
             <div className="flex items-center gap-2 mb-2 -mt-7">
               <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl border-4 border-[#1A1A1B]">N</div>
               <span className="font-bold text-gray-100 mt-4">NEXUS Forum</span>
             </div>
             <p className="text-sm text-gray-300 mb-4">Главное сообщество. Создавайте темы, обсуждайте, покупайте и продавайте на маркете.</p>
             <Link href="/submit" className="block w-full text-center bg-gray-200 hover:bg-white text-black font-semibold rounded-full py-1.5 transition text-sm">
               Создать пост
             </Link>
          </div>
        </div>

        {/* Тренды (Популярное) */}
        <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-3">
           <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase">Популярное сегодня</h3>
           <div className="space-y-3">
             {trendingPosts.length === 0 ? (
               <div className="text-sm text-gray-500">Пока пусто</div>
             ) : (
               trendingPosts.map((post, idx) => (
                 <Link href={`/post/${post.id}`} key={`trend-${post.id}`} className="flex gap-3 group">
                   <div className="font-bold text-gray-500 w-4">{idx + 1}</div>
                   <div>
                     <h4 className="text-sm font-medium text-gray-200 group-hover:underline line-clamp-2">{post.title}</h4>
                     <div className="text-xs text-gray-500 mt-0.5">{post.score} очков активности</div>
                   </div>
                 </Link>
               ))
             )}
           </div>
        </div>

        {/* Топ авторов */}
        <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-3">
           <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase">Топ авторов</h3>
           <div className="space-y-3">
             {topUsers.map((u) => (
               <div key={u.id} className="flex justify-between items-center text-sm">
                 <Link href={`/profile/${u.username}`} className="flex items-center gap-2 hover:underline text-gray-200">
                    <div className="w-6 h-6 bg-[#272729] rounded-full flex items-center justify-center text-xs font-bold">{u.username.charAt(0).toUpperCase()}</div>
                    <span className="truncate max-w-[120px]">{u.username}</span>
                    <RoleBadge role={u.role} />
                 </Link>
                 <span className="text-gray-400 font-medium">{u._count.posts}</span>
               </div>
             ))}
           </div>
        </div>

        {/* Статистика */}
        <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-3 text-sm text-gray-300">
           <div className="flex justify-between mb-2">
             <span>Пользователей:</span> <span className="font-semibold text-white">{totalUsers}</span>
           </div>
           <div className="flex justify-between mb-2">
             <span>Тем создано:</span> <span className="font-semibold text-white">{totalPosts}</span>
           </div>
           <div className="flex justify-between text-green-500 font-semibold border-t border-[#343536] pt-2 mt-2">
             <span>Онлайн:</span> <span>{onlineUsers}</span>
           </div>
        </div>

      </div>
    </div>
  );
}