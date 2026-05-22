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

import CommentLikeButton from "@/components/post/comment-like-button";
import UniversalReportButton from "@/components/post/universal-report-button";

// === РЕКУРСИВНЫЙ КОМПОНЕНТ ДЛЯ ОТРИСОВКИ ВЕТОК КОММЕНТАРИЕВ ===
function CommentNode({ comment, allComments, postId, postAuthorId, depth = 0, session }: any) {
  const children = allComments.filter((c: any) => c.parentId === comment.id);
  
  // ИСПРАВЛЕНО: Теперь проверяем like.userId, так как у CommentLike нет id
  const currentUserId = session?.user?.id;
  const hasLiked = comment.likedBy?.some((like: any) => like.userId === currentUserId);

  return (
    <div className={`relative ${depth > 0 ? 'ml-3 sm:ml-6 border-l-2 border-[#343536] pl-4 mt-4' : 'mt-6'}`}>
      <div className="flex items-center gap-2 mb-2">
        
        {/* === АВАТАРКА В КОММЕНТАРИИ === */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gray-600 to-gray-500 shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden">
          {comment.author.image ? (
            <img src={comment.author.image} alt={comment.author.username} className="w-full h-full object-cover" />
          ) : (
            comment.author.username.charAt(0).toUpperCase()
          )}
        </div>

        <Link href={`/profile/${comment.author.username}`} className="font-semibold text-gray-200 text-sm hover:underline">
          {comment.author.username}
        </Link>
        <RoleBadge role={comment.author.role} />
        {comment.author.id === postAuthorId && (
          <span className="bg-blue-600/20 text-blue-400 font-bold text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider ml-1">OP</span>
        )}
        <span className="text-gray-500 text-xs">• {comment.createdAt.toLocaleString("ru-RU")}</span>
      </div>
      
      <p className="text-gray-300 text-sm whitespace-pre-wrap break-all pl-9 leading-relaxed">
        {comment.content}
      </p>

      <div className="mt-2 pl-9 flex items-center gap-4">
        {session?.user && (
          <>
            <CommentLikeButton 
              commentId={comment.id} 
              initialLikes={comment.likedBy?.length || 0} 
              initialHasLiked={hasLiked || false} 
            />
            <ReplyForm postId={postId} parentId={comment.id} />
            <UniversalReportButton id={comment.id} type="comment" />
          </>
        )}
      </div>

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
      author: true, 
      tags: true, 
      likedBy: { select: { id: true } },
      comments: { 
        include: { 
          author: true,
          likedBy: { select: { userId: true } } 
        }, 
        orderBy: { createdAt: "asc" } 
      },
    },
  });

  if (!post) notFound();
  
  const hasLiked = post.likedBy.some((user: any) => user.id === session?.user?.id);
  const topLevelComments = post.comments.filter((c: any) => !c.parentId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 w-full space-y-6">
      <ViewTracker postId={post.id} />

      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm font-medium mb-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Вернуться на главную
      </Link>

      <article className="bg-[#1A1A1B] border border-[#343536] rounded-md overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 pb-2">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            
            {/* === АВАТАРКА АВТОРА ПОСТА === */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-600 to-gray-500 shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm overflow-hidden">
              {post.author.image ? (
                <img src={post.author.image} alt={post.author.username} className="w-full h-full object-cover" />
              ) : (
                post.author.username.charAt(0).toUpperCase()
              )}
            </div>

            <Link href={`/profile/${post.author.username}`} className="font-bold text-gray-200 hover:underline text-sm">
              u/{post.author.username}
            </Link>
            <RoleBadge role={post.author.role} />
            <span>• {post.createdAt.toLocaleString("ru-RU")}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-100 mb-4 break-words leading-tight">{post.title}</h1>
          <p className="text-gray-300 whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed mb-6">{post.content}</p>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag: any) => (
                <Link href={`/?tag=${tag.name}`} key={tag.id} className="bg-[#272729] border border-[#343536] hover:bg-[#343536] text-gray-300 px-3 py-1 rounded-full text-xs font-medium transition shadow-sm">
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#272729]/30 border-t border-[#343536] px-4 py-2 flex items-center gap-4 text-xs font-semibold text-gray-400">
          <div className="flex items-center gap-1">
            {session?.user ? (
               <LikeButton postId={post.id} initialLikes={post.likedBy.length} initialHasLiked={hasLiked} initialDislikes={0} initialHasDisliked={false} />
            ) : (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-[#272729] rounded-full border border-[#343536]">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                <span className="text-gray-300 font-bold">{post.likedBy.length}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 hover:bg-[#272729] px-3 py-1.5 rounded-full transition cursor-default">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {post.views}
          </div>
          <div className="flex-1"></div>
          {session?.user?.id === post.authorId ? (
            <DeleteButton postId={post.id} />
          ) : (
            session?.user && <ReportButton postId={post.id} isOwnPost={false} />
          )}
        </div>
      </article>

      <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-100 mb-6">
          Комментарии ({post.comments.length})
        </h2>

        {session?.user ? (
          <form action={createComment} className="mb-8">
            <input type="hidden" name="postId" value={post.id} />
            <textarea
              name="content" required rows={3} placeholder="Написать комментарий..."
              className="w-full bg-[#272729] border border-[#343536] hover:border-gray-500 focus:border-gray-400 focus:bg-[#1A1A1B] rounded-md p-4 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors resize-y mb-3 shadow-sm"
            />
            <div className="flex justify-end">
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-full text-sm transition shadow-sm">
                Опубликовать
              </button>
            </div>
          </form>
        ) : (
           <div className="mb-8 p-6 bg-[#272729]/50 border border-[#343536] rounded-md text-center flex flex-col sm:flex-row items-center justify-between gap-4">
             <span className="text-gray-300 font-medium text-sm">Войдите, чтобы присоединиться к обсуждению</span>
             <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-full transition text-sm shadow-sm">
               Войти в аккаунт
             </Link>
           </div>
        )}

        <div className="space-y-2">
          {topLevelComments.length === 0 ? (
            <div className="text-center text-gray-500 py-12 text-sm flex flex-col items-center justify-center gap-2">
              <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Пока нет комментариев. Будьте первым!
            </div>
          ) : (
            topLevelComments.map((comment: any) => (
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