import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LikeButton from "@/components/post/like-button";

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
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // Ровно 24 часа назад
  
  const rawTrendingPosts = await prisma.post.findMany({
    where: { createdAt: { gte: oneDayAgo } }, // Только за сегодня
    include: {
      author: true,
      likedBy: { select: { id: true } },
      _count: { select: { comments: true } },
      comments: { orderBy: { createdAt: 'desc' }, take: 1 } // Берем последний коммент для времени активности
    }
  });

  const trendingPosts = rawTrendingPosts
    .map(post => {
      const score = post.likedBy.length + post._count.comments; // Очки = лайки + комменты
      // Время последней активности (создание поста ИЛИ последний коммент)
      const lastActivityTime = post.comments.length > 0 
        ? Math.max(post.createdAt.getTime(), post.comments[0].createdAt.getTime()) 
        : post.createdAt.getTime();
      
      const isHot = (Date.now() - lastActivityTime) < 60 * 60 * 1000; // Меньше часа назад?
      return { ...post, score, isHot };
    })
    .sort((a, b) => b.score - a.score) // Сортируем по убыванию очков
    .slice(0, 5); // Берем только ТОП-5

  // 3. Статистика
  const totalPosts = await prisma.post.count();
  const totalUsers = await prisma.user.count();
  const topUsers = await prisma.user.findMany({
    take: 5, include: { _count: { select: { posts: true } } }, orderBy: { posts: { _count: 'desc' } }
  });

  return (
    <div className="w-full font-mono">
      <style dangerouslySetInnerHTML={{__html: `
        .cli-5-grid { display: flex; flex-direction: column; gap: 1.5rem; }
        @media(min-width: 1280px) { 
          .cli-5-grid { display: grid; grid-template-columns: 180px 220px 1fr 220px 180px; align-items: start; gap: 1.5rem; }
        }
        @media(min-width: 768px) and (max-width: 1279px) {
          .cli-5-grid { display: grid; grid-template-columns: 180px 1fr 200px; }
          .hide-on-laptop { display: none; }
        }
      `}} />

      <div className="cli-5-grid">
        
        {/* === КОЛОНКА 1: НАВИГАЦИЯ === */}
        <aside className="border border-[#4AF626]/30 bg-[#0A0A0A]/80 p-3 h-fit shadow-[0_0_15px_rgba(74,246,38,0.03)]">
          <h2 className="text-[10px] font-bold text-[#4AF626]/60 mb-4 border-b border-[#4AF626]/30 pb-2 uppercase tracking-widest">~// Sys.Nav</h2>
          <ul className="space-y-4 text-[11px] font-bold">
            <li>
              <Link href={session?.user ? `/profile/${session.user.username}` : "/login"} className="flex items-center gap-2 hover:text-white hover:text-glow transition">
                <span className="text-[#4AF626]/50">[0]</span> Профиль
              </Link>
            </li>
            <li>
              <Link href="/market/orders" className="flex items-center gap-2 hover:text-white hover:text-glow transition">
                <span className="text-[#4AF626]/50">[1]</span> Мои покупки
              </Link>
            </li>
            <li>
              <Link href="/market/sales" className="flex items-center gap-2 hover:text-white hover:text-glow transition">
                <span className="text-[#4AF626]/50">[2]</span> Мои продажи
              </Link>
            </li>
            <li>
              <Link href="/messages" className="flex items-center gap-2 hover:text-white hover:text-glow transition">
                <span className="text-[#4AF626]/50">[3]</span> Сообщения
              </Link>
            </li>
            <li className="mt-6 pt-4 border-t border-[#4AF626]/30">
              <Link href="/market/active" className="flex items-center gap-2 hover:text-white hover:text-glow transition">
                <span className="text-yellow-500">[!]</span> Активные заказы
              </Link>
            </li>
          </ul>
        </aside>

        {/* === КОЛОНКА 2: ТРЕНДЫ === */}
        <aside className="border border-[#4AF626]/30 bg-[#0A0A0A]/80 p-3 h-fit shadow-[0_0_15px_rgba(74,246,38,0.03)] hide-on-laptop">
          <h2 className="text-[10px] font-bold text-[#4AF626]/60 mb-4 border-b border-[#4AF626]/30 pb-2 uppercase tracking-widest">~// Trending_24H</h2>
          <div className="space-y-4">
            {trendingPosts.length === 0 ? (
              <div className="text-[10px] text-[#4AF626]/40 text-center py-4 tracking-widest border border-dashed border-[#4AF626]/20">_NO_HOT_DATA_</div>
            ) : (
              trendingPosts.map((post) => (
                <Link href={`/post/${post.id}`} key={`trend-${post.id}`} className="group block cursor-pointer border-l-2 border-transparent hover:border-[#4AF626] pl-2 transition-all">
                  <h3 className="text-[11px] font-bold text-[#4AF626] group-hover:text-white transition line-clamp-2 leading-tight mb-1">
                    {post.title}
                  </h3>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-[#4AF626]/50">usr:{post.author.username}</span>
                    {post.isHot ? (
                      <span className="text-[#4AF626] font-bold animate-pulse text-glow uppercase">HOT &lt;1h</span>
                    ) : (
                      <span className="text-red-500/80 font-bold uppercase">Inactive</span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </aside>

        {/* === КОЛОНКА 3: ЦЕНТРАЛЬНАЯ ЛЕНТА === */}
        <section className="space-y-4 min-w-0">
          <form method="GET" action="/" className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center text-[#4AF626]/50 pointer-events-none font-bold">&gt;</div>
            <input
              type="text"
              name="q"
              defaultValue={searchQuery || ""}
              placeholder="EXEC_SEARCH..."
              className="w-full bg-[#0A0A0A]/80 border border-[#4AF626]/30 p-3 pl-8 text-sm text-[#4AF626] placeholder-[#4AF626]/30 focus:border-[#4AF626] outline-none transition-all"
            />
          </form>

          {(currentTag || searchQuery) && (
            <div className="p-3 bg-[#4AF626]/5 border border-[#4AF626]/30 text-xs flex items-center justify-between font-bold">
              <div>
                <span className="text-[#4AF626]/60">FILTERS: </span>
                {currentTag && <span className="text-white text-glow mr-3">#{currentTag}</span>}
                {searchQuery && <span className="text-white text-glow">"{searchQuery}"</span>}
              </div>
              <Link href="/" className="text-red-500 hover:text-red-400 hover:text-glow transition">[ DROP ]</Link>
            </div>
          )}

          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center text-[#4AF626]/50 py-12 border border-[#4AF626]/30 border-dashed text-sm">NO_DATA_FOUND</div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="p-4 border border-[#4AF626]/30 hover:border-[#4AF626] hover:shadow-[0_0_15px_rgba(74,246,38,0.1)] bg-[#0A0A0A]/60 transition-all group relative">
                  <div className="flex justify-between items-start mb-3 text-[10px] text-[#4AF626]/60 font-bold uppercase tracking-widest">
                    <Link href={`/profile/${post.author.username}`} className="hover:text-white transition">usr: {post.author.username}</Link>
                    <div className="flex gap-2">
                        <span>{post.createdAt.toLocaleDateString("ru-RU")}</span>
                        {post.tags.map(tag => (
                          <Link href={`/?tag=${tag.name}`} key={tag.id} className="text-[#4AF626] hover:text-white transition">[{tag.name}]</Link>
                        ))}
                    </div>
                  </div>
                  
                  <Link href={`/post/${post.id}`} className="block mb-4">
                    <h3 className="text-lg font-bold mb-1 text-[#4AF626] group-hover:text-white group-hover:text-glow transition break-all">
                      {post.title}
                    </h3>
                    <p className="text-[#4AF626]/70 text-xs line-clamp-2 leading-relaxed break-all">{post.content}</p>
                  </Link>
                  
                  <div className="flex items-center gap-5 text-xs text-[#4AF626]/50 font-bold border-t border-[#4AF626]/10 pt-3">
                    {session?.user ? (
                      <LikeButton postId={post.id} initialLikes={post.likedBy.length} initialHasLiked={post.likedBy.some(u => u.id === session?.user?.id)} />
                    ) : (
                      <span>L:{post.likedBy.length}</span>
                    )}
                    <Link href={`/post/${post.id}`} className="hover:text-white transition">C:{post._count.comments}</Link>
                    <span>V:{post.views}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* === КОЛОНКА 4: ТОП АВТОРОВ === */}
        <aside className="border border-[#4AF626]/30 bg-[#0A0A0A]/80 p-3 h-fit shadow-[0_0_15px_rgba(74,246,38,0.03)]">
          <h3 className="text-[10px] font-bold text-[#4AF626]/60 mb-4 border-b border-[#4AF626]/30 pb-2 uppercase tracking-widest">~// Top.Users</h3>
          <div className="space-y-4">
            {topUsers.length === 0 ? (
              <div className="text-xs text-[#4AF626]/50 text-center py-2">NO_DATA</div>
            ) : (
              topUsers.map((u, index) => (
                <div key={u.id} className="flex justify-between items-center text-[11px] group font-bold">
                  <Link href={`/profile/${u.username}`} className="flex items-center gap-2 hover:text-white hover:text-glow transition truncate">
                    <span className="text-[#4AF626]/40 text-[9px]">0{index + 1}</span>
                    <span className="truncate max-w-[100px]">{u.username}</span>
                  </Link>
                  <span className="text-[#4AF626]/60 bg-[#4AF626]/10 px-1 border border-[#4AF626]/20">{u._count.posts}</span>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* === КОЛОНКА 5: СТАТИСТИКА === */}
        <aside className="space-y-4 h-fit hide-on-laptop">
          <div className="border border-[#4AF626]/30 bg-[#0A0A0A]/80 p-3 shadow-[0_0_15px_rgba(74,246,38,0.03)]">
            <h3 className="text-[10px] font-bold text-[#4AF626]/60 mb-3 border-b border-[#4AF626]/30 pb-2 uppercase tracking-widest">~// Stats</h3>
            <div className="space-y-2 text-[11px] font-bold">
              <div className="flex justify-between items-center">
                <span className="text-[#4AF626]/70">USERS:</span>
                <span className="text-white text-glow">{totalUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#4AF626]/70">THREADS:</span>
                <span className="text-white text-glow">{totalPosts}</span>
              </div>
              <div className="flex justify-between items-center text-green-400 mt-2 pt-2 border-t border-[#4AF626]/20">
                <span>ONLINE:</span>
                <span className="animate-pulse">15x</span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}