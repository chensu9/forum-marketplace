import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createComment } from "@/lib/actions/comment";
import { auth } from "@/auth";
import LikeButton from "@/components/post/like-button";
import ViewTracker from "@/components/post/view-tracker";
import DeleteButton from "@/components/post/delete-button";
import ReportButton from "@/components/post/report-button";
import ReplyForm from "@/components/post/reply-form";
import RoleBadge from "@/components/user/role-badge";

// === РЕКУРСИВНЫЙ КОМПОНЕНТ ДЛЯ ОТРИСОВКИ ВЕТОК КОММЕНТАРИЕВ ===
function CommentNode({ comment, allComments, postId, postAuthorId, depth = 0, session }: any) {
  const children = allComments.filter((c: any) => c.parentId === comment.id);

  return (
    <div className={`relative ${depth > 0 ? 'ml-3 sm:ml-6 border-l-2 border-[#343536] pl-4 mt-3' : 'mt-6'}`}>
      
      {/* Шапка коммента: Аватар, Никнейм, Роль, Дата */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-600 to-gray-500 shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
          {comment.author.username.charAt(0).toUpperCase()}
        </div>
        <Link href={`/profile/${comment.author.username}`} className="font-semibold text-gray-200 text-sm hover:underline">
          {comment.author.username}
        </Link>
        <RoleBadge role={comment.author.role} />
        {comment.author.id === postAuthorId && (
          <span className="text-blue-500 font-bold text-xs ml-1">OP</span>
        )}
        <span className="text-gray-500 text-xs">• {comment.createdAt.toLocaleString("ru-RU")}</span>
      </div>
      
      {/* Текст комментария */}
      <p className="text-gray-300 text-sm whitespace-pre-wrap break-all pl-8">
        {comment.content}
      </p>

      {/* Кнопка ответить */}
      <div className="mt-1.5 pl-8">
        {session?.user && (
          <ReplyForm postId={postId} parentId={comment.id} />
        )}
      </div>

      {/* РЕКУРСИЯ: Ответы на этот комментарий */}
      {children.length > 0 && (
        <div className="pl-2">
          {children.map((child: any) => (
            <CommentNode 
              key={child.id} 
              comment={child} 
              allComments={allComments} 
              postId={postId} 
              postAuthorId={postAuthorId} 
              depth={depth + 1}
              session={session}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function SinglePostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const resolvedParams = await params;
  
  const post = await prisma.post.findUnique({
    where: { id: resolvedParams.id },
    include: {
      author: true, tags: true, likedBy: { select: { id: true } },
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!post) notFound();
  const hasLiked = post.likedBy.some((user) => user.id === session?.user?.id);
  const topLevelComments = post.comments.filter(c => !c.parentId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <ViewTracker postId={post.id} />

      {/* Кнопка назад */}
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm font-medium mb-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Вернуться на главную
      </Link>

      {/* ======================================= */}
      {/* ТЕЛО ПОСТА */}
      {/* ======================================= */}
      <article className="bg-[#1A1A1B] border border-[#343536] rounded-md overflow-hidden">
        
        {/* Шапка поста */}
        <div className="p-4 sm:p-6 pb-2">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-600 to-gray-500 shrink-0 flex items-center justify-center text-white font-bold text-sm">
              {post.author.username.charAt(0).toUpperCase()}
            </div>
            <Link href={`/profile/${post.author.username}`} className="font-bold text-gray-200 hover:underline text-sm">
              u/{post.author.username}
            </Link>
            <RoleBadge role={post.author.role} />
            <span>• {post.createdAt.toLocaleString("ru-RU")}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-100 mb-4 break-words">
            {post.title}
          </h1>
          
          <p className="text-gray-300 whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed mb-6">
            {post.content}
          </p>

          {/* Теги */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map(tag => (
                <Link href={`/?tag=${tag.name}`} key={tag.id} className="bg-[#272729] hover:bg-[#343536] text-gray-300 px-2.5 py-1 rounded-full text-xs font-medium transition">
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Подвал поста (кнопки действий) */}
        <div className="bg-[#1A1A1B] border-t border-[#343536] px-4 py-2 flex items-center gap-4 text-xs font-semibold text-gray-400">
          
          <div className="flex items-center gap-1">
            {session?.user ? (
               <LikeButton postId={post.id} initialLikes={post.likedBy.length} initialHasLiked={hasLiked} />
            ) : (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-[#272729] rounded-full">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                <span className="text-gray-300 font-bold">{post.likedBy.length}</span>
              </div>
            )}
          </div>

          {/* Просмотры */}
          <div className="flex items-center gap-1.5 hover:bg-[#272729] px-3 py-1.5 rounded transition cursor-default">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {post.views}
          </div>

          {/* Отступ, чтобы прижать удаление/репорт вправо */}
          <div className="flex-1"></div>

          {session?.user?.id === post.authorId ? (
            <DeleteButton postId={post.id} />
          ) : (
            session?.user && <ReportButton postId={post.id} isOwnPost={false} />
          )}
        </div>
      </article>

      {/* ======================================= */}
      {/* СЕКЦИЯ КОММЕНТАРИЕВ */}
      {/* ======================================= */}
      <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-100 mb-6">
          Комментарии ({post.comments.length})
        </h2>

        {/* Форма нового комментария */}
        {session?.user ? (
          <form action={createComment} className="mb-8">
            <input type="hidden" name="postId" value={post.id} />
            <textarea
              name="content" required rows={3} placeholder="Что вы думаете?"
              className="w-full bg-[#272729] border border-[#343536] hover:border-[#818384] focus:border-gray-300 rounded-md p-3 text-sm text-gray-200 placeholder-gray-400 outline-none transition-colors resize-y mb-2"
            />
            <div className="flex justify-end">
              <button type="submit" className="bg-gray-200 hover:bg-white text-black font-semibold px-4 py-1.5 rounded-full text-sm transition">
                Комментировать
              </button>
            </div>
          </form>
        ) : (
           <div className="mb-8 p-4 bg-[#272729] border border-[#343536] rounded-md text-center text-gray-400 text-sm flex items-center justify-between">
             <span>Войдите, чтобы оставить комментарий</span>
             <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-1.5 rounded-full transition">
               Войти
             </Link>
           </div>
        )}

        {/* ВЫВОД ДРЕВОВИДНЫХ КОММЕНТАРИЕВ */}
        <div className="space-y-2">
          {topLevelComments.length === 0 ? (
            <div className="text-center text-gray-500 py-8 text-sm">
              Пока нет комментариев. Будьте первым!
            </div>
          ) : (
            topLevelComments.map((comment) => (
              <CommentNode 
                key={comment.id} 
                comment={comment} 
                allComments={post.comments} 
                postId={post.id} 
                postAuthorId={post.author.id} 
                session={session} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}