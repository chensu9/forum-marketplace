import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createComment } from "@/lib/actions/comment";
import { auth } from "@/auth";
import LikeButton from "@/components/post/like-button";
import ViewTracker from "@/components/post/view-tracker";

// 1. ИЗМЕНЕНИЕ ЗДЕСЬ: params теперь Promise
export default async function SinglePostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  // 2. ИЗМЕНЕНИЕ ЗДЕСЬ: мы "распаковываем" params через await
  const resolvedParams = await params;
  
  // Ищем пост в базе данных
  const post = await prisma.post.findUnique({
    // 3. Используем уже распакованный ID
    where: { id: resolvedParams.id },
    include: {
      author: true,
      tags: true,
      likedBy: { select: { id: true } },
      comments: {
        include: { author: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  // Если пост удален или ID неверный - показываем 404
  if (!post) {
    notFound();
  }

  const hasLiked = post.likedBy.some((user) => user.id === session?.user?.id);

  return (
    <div className="min-h-screen bg-[#0F0F14] text-white py-10 px-4">
        <ViewTracker postId={post.id} />

    <div className="max-w-4xl mx-auto space-y-6"></div>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Кнопка назад */}
        <Link href="/" className="inline-block text-gray-400 hover:text-white transition mb-4">
          ← Назад в ленту
        </Link>

        {/* САМ ПОСТ */}
        <article className="nb-card p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-[#A855F7] font-bold">
              {post.author.username[0].toUpperCase()}
            </div>
            <div>
              <div className="font-semibold">{post.author.username}</div>
              <div className="text-xs text-gray-400">
                {post.createdAt.toLocaleDateString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 mb-6">
  {session?.user ? (
    <LikeButton 
      postId={post.id} 
      initialLikes={post.likedBy.length} 
      initialHasLiked={hasLiked} 
    />
  ) : (
    <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
      <span className="text-base">🤍</span>
      <span>{post.likedBy.length}</span>
    </div>
  )}
  <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
    <span className="text-base">👁️</span>
    <span>{post.views}</span>
  </div>
</div>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap mb-6">
            {post.content}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map(tag => (
              <span key={tag.id} className="bg-purple-500/10 text-[#A855F7] px-3 py-1 rounded-full text-sm">
                #{tag.name}
              </span>
            ))}
          </div>
        </article>

        {/* СЕКЦИЯ КОММЕНТАРИЕВ */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Комментарии ({post.comments.length})</h2>

          {/* Форма для нового комментария */}
          {session?.user ? (
            <form action={createComment} className="nb-card p-4 flex flex-col gap-3">
              {/* Скрытое поле для передачи ID поста в серверный экшен */}
              <input type="hidden" name="postId" value={post.id} />
              
              <textarea
                name="content"
                required
                rows={3}
                placeholder="Написать комментарий..."
                className="w-full bg-[#1A1A22] border border-gray-800 rounded-lg p-3 text-white focus:border-[#A855F7] outline-none transition resize-y"
              />
              <div className="flex justify-end">
                <button type="submit" className="nb-button-primary px-6 py-2 text-sm">
                  Отправить
                </button>
              </div>
            </form>
          ) : (
            <div className="nb-card p-4 text-center text-gray-400 text-sm">
              <Link href="/login" className="text-[#A855F7] hover:underline">Войдите</Link>, чтобы оставить комментарий.
            </div>
          )}

          {/* Список комментариев */}
          <div className="space-y-4 mt-6">
            {post.comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">Пока нет комментариев. Будьте первым!</p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="nb-card p-4 bg-[#1E1E28]/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Link href={`/profile/${comment.author.username}`} className="font-medium text-white hover:text-[#A855F7]">
  {post.author.username}
</Link>
                    <span className="text-xs text-gray-500">
                      {comment.createdAt.toLocaleDateString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}