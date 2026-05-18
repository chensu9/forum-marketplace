// app/page.tsx
import { auth } from "@/auth"; // Наш конфиг NextAuth
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LikeButton from "@/components/post/like-button";

export default async function HomePage() {
  // Получаем сессию на стороне сервера
  const session = await auth();

  // ДОБАВИТЬ ЭТОТ БЛОК: Получаем все посты из базы с авторами и тегами
  const posts = await prisma.post.findMany({
  include: {
    author: true,
    tags: true,
    likedBy: { select: { id: true } }, // <-- Добавили лайки
    _count: { select: { comments: true } } // <-- Добавили счетчик комментариев
  },
  orderBy: {
    createdAt: "desc",
  },
});

  // Защита роута: если не авторизован - выкидываем на логин
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0F0F14] text-white font-sans">
      
      {/* ВЕРХНЯЯ НАВИГАЦИЯ */}
      <header className="sticky top-0 z-50 bg-[#1E1E28]/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-wide cursor-pointer">
              <span className="text-[#A855F7]">MARKET</span>FORUM
            </h1>
            
            {/* Табы (пока визуальные) */}
            <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
              <span className="text-white border-b-2 border-[#A855F7] py-5 cursor-pointer">Темы</span>
              <span className="hover:text-white transition cursor-pointer">Пользователи</span>
              <Link href="/market" className="hover:text-white transition cursor-pointer">Маркет</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Имя пользователя из сессии */}
            <div className="text-sm">
              <span className="text-gray-400">Привет, </span>
              <span className="font-semibold text-[#A855F7]">{session.user.username}</span>
            </div>
            {/* Кнопка создания поста */}
            <button className="bg-[#A855F7] hover:bg-[#9333EA] text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
             <Link href="/create" className="bg-[#A855F7] hover:bg-[#9333EA] text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
               + Новый тред 
              </Link>
            </button>
          </div>
        </div>
      </header>

      {/* ГЛАВНЫЙ ЛЕЙАУТ (3 КОЛОНКИ) */}
      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* ЛЕВАЯ ПАНЕЛЬ (1 колонка) */}
        <aside className="hidden lg:block col-span-1 space-y-4">
          <div className="nb-card p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Навигация</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 hover:text-[#A855F7] cursor-pointer transition">
                <span>🔥</span> Популярное
              </li>
              <li className="flex items-center gap-3 hover:text-[#A855F7] cursor-pointer transition">
                <span>🛒</span> Мои объявления
              </li>
              <li className="flex items-center gap-3 hover:text-[#A855F7] cursor-pointer transition">
                <span>📦</span> Активные заказы
              </li>
              <li className="flex items-center gap-3 hover:text-[#A855F7] cursor-pointer transition">
                <span>💬</span> Сообщения
              </li>
            </ul>
          </div>
        </aside>

        {/* ЦЕНТР: ЛЕНТА (2 колонки) */}
        <section className="col-span-1 lg:col-span-2 space-y-4">
  {posts.length === 0 ? (
    <div className="text-center text-gray-500 py-10">
      Пока нет ни одной темы. Будьте первым!
    </div>
  ) : 
    // Внутри app/page.tsx
posts.map((post) => (
  // 1. Убрали <Link> отсюда, теперь карточка это просто <div>
  <div key={post.id} className="nb-card p-5 hover:border-[#A855F7] transition">
    
    {/* ШАПКА КАРТОЧКИ: Ссылка на профиль автора */}
    <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
      <Link href={`/profile/${post.author.username}`} className="font-medium text-white hover:text-[#A855F7]">
        {post.author.username}
      </Link>
      <span>•</span>
      <span>{post.createdAt.toLocaleDateString("ru-RU")}</span>
      
      {post.tags.map(tag => (
        <span key={tag.id} className="bg-purple-500/10 text-[#A855F7] px-2 py-0.5 rounded">
          #{tag.name}
        </span>
      ))}
    </div>
    
    {/* ТЕЛО КАРТОЧКИ: Ссылка на сам пост */}
    <Link href={`/post/${post.id}`} className="block group">
      <h3 className="text-lg font-semibold mb-2 group-hover:text-[#A855F7] transition">
        {post.title}
      </h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
        {post.content}
      </p>
    </Link>
    
    {/* ФУТЕР: Кнопки действий */}
    <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
      {session?.user ? (
        <LikeButton 
          postId={post.id} 
          initialLikes={post.likedBy.length} 
          initialHasLiked={post.likedBy.some(u => u.id === session.user.id)} 
        />
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-base">🤍</span>
          <span>{post.likedBy.length}</span>
        </div>
      )}

      {/* Клик на иконку комментов тоже может вести внутрь поста */}
      <Link href={`/post/${post.id}`} className="flex items-center gap-1 hover:text-white transition">
        <span className="text-base">💬</span>
        <span>{post._count.comments}</span>
      </Link>

      <div className="flex items-center gap-1">
        <span className="text-base">👁️</span>
        <span>{post.views}</span>
      </div>
    </div>
  </div>
))}
</section>
        {/* ПРАВАЯ ПАНЕЛЬ (1 колонка) */}
        <aside className="hidden lg:block col-span-1 space-y-4">
          <div className="nb-card p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Статистика</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Пользователей</span>
                <span className="font-semibold text-white">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Тем</span>
                <span className="font-semibold text-white">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Онлайн</span>
                <span className="font-semibold text-green-400">1</span>
              </div>
            </div>
          </div>
          
          <div className="nb-card p-5 border-dashed border-gray-700 bg-transparent flex items-center justify-center h-32">
            <span className="text-gray-600 text-sm font-medium">Место для рекламы</span>
          </div>
        </aside>

      </main>
    </div>
  );
}