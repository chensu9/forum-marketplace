// app/profile/[username]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const session = await auth();

  // Ищем пользователя по никнейму
  const user = await prisma.user.findUnique({
    where: { username: resolvedParams.username },
    include: {
      // Подтягиваем его посты, чтобы посчитать лайки и показать их в профиле
      posts: {
        include: {
          tags: true,
          likedBy: { select: { id: true } },
          _count: { select: { comments: true } }
        },
        orderBy: { createdAt: "desc" },
      },
      // Подтягиваем комменты чисто для статистики
      _count: {
        select: { comments: true }
      }
    },
  });

  if (!user) {
    notFound();
  }

  // --- СЧИТАЕМ РЕПУТАЦИЮ ПО ТВОЕЙ ФОРМУЛЕ ---
  // 1. Считаем все лайки на всех постах пользователя
  const totalLikes = user.posts.reduce((sum, post) => sum + post.likedBy.length, 0);
  
  // 2. Формула: лайки + (кол-во тредов / 3). Округляем вниз.
  const reputation = Math.floor(totalLikes + (user.posts.length / 3));

  // Проверяем, смотрит ли юзер свой собственный профиль
  const isOwner = session?.user?.id === user.id;

  return (
    <div className="min-h-screen bg-[#0F0F14] text-white py-10 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ЛЕВАЯ КОЛОНКА: ИНФО О ПРОФИЛЕ */}
        <aside className="col-span-1 space-y-4">
          <div className="nb-card p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[#A855F7] to-purple-900 rounded-full mx-auto flex items-center justify-center text-4xl font-bold shadow-lg mb-4">
              {user.username[0].toUpperCase()}
            </div>
            
            <h1 className="text-2xl font-bold mb-1">{user.username}</h1>
            <div className="text-sm text-[#A855F7] font-medium mb-4">{user.role}</div>
            
            {user.bio ? (
              <p className="text-gray-400 text-sm mb-6 px-2">{user.bio}</p>
            ) : (
              <p className="text-gray-600 text-sm italic mb-6">Пользователь пока не добавил описание...</p>
            )}

            {isOwner && (
  <Link 
    href="/settings" 
    className="block text-center w-full bg-[#1A1A22] border border-gray-700 hover:border-[#A855F7] text-white py-2 rounded-lg text-sm font-medium transition mb-6"
  >
    Редактировать профиль
  </Link>
)}

            <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-6">
              <div>
                <div className="text-2xl font-bold">{reputation}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Репутация</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{user.posts.length}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Тем создано</div>
              </div>
            </div>
            
            <div className="mt-6 text-xs text-gray-500">
              На форуме с {user.createdAt.toLocaleDateString("ru-RU")}
            </div>
          </div>
        </aside>

        {/* ПРАВАЯ КОЛОНКА: АКТИВНОСТЬ (ПОСТЫ) */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">Темы пользователя</h2>
          
          {user.posts.length === 0 ? (
            <div className="nb-card p-8 text-center text-gray-500">
              Пользователь ещё не создал ни одной темы.
            </div>
          ) : (
            user.posts.map((post) => (
              <Link href={`/post/${post.id}`} key={post.id} className="block group">
                <div className="nb-card p-5 group-hover:border-[#A855F7] transition cursor-pointer">
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                    <span>{post.createdAt.toLocaleDateString("ru-RU")}</span>
                    {post.tags.map(tag => (
                      <span key={tag.id} className="bg-purple-500/10 text-[#A855F7] px-2 py-0.5 rounded">
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-[#A855F7] transition">{post.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1"><span className="text-base">💜</span> {post.likedBy.length}</span>
                    <span className="flex items-center gap-1"><span className="text-base">💬</span> {post._count.comments}</span>
                    <span className="flex items-center gap-1"><span className="text-base">👁️</span> {post.views}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

      </div>
    </div>
  );
}