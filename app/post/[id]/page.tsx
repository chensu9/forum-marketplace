// app/post/[id]/page.tsx
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

// === РЕКУРСИВНЫЙ КОМПОНЕНТ ДЛЯ ОТРИСОВКИ ВЕТОК (СЕТКИ) ===
function CommentNode({ comment, allComments, postId, postAuthorId, depth = 0, session }: any) {
  // Ищем все дочерние комментарии (ответы на текущий)
  const children = allComments.filter((c: any) => c.parentId === comment.id);

  return (
    <div className={`relative ${depth > 0 ? 'ml-4 sm:ml-8 border-l border-[#4AF626]/20 pl-4 mt-3' : 'border-l-2 border-[#4AF626]/50 pl-3 py-1 hover:border-[#4AF626] transition mt-4'}`}>
      
      {/* Шапка коммента */}
      <div className="flex items-center gap-2 mb-1 text-[10px]">
        <Link href={`/profile/${comment.author.username}`} className="font-bold text-white hover:text-glow transition">
          usr: {comment.author.username}
        </Link>
        {comment.author.id === postAuthorId && (
          <span className="bg-[#4AF626]/20 text-[#4AF626] px-1 text-[8px] uppercase font-bold border border-[#4AF626]/30">OP</span>
        )}
        <span className="text-[#4AF626]/40">[{comment.createdAt.toLocaleString("ru-RU")}]</span>
      </div>
      
      {/* Текст */}
      <p className="text-[#4AF626]/80 text-xs whitespace-pre-wrap leading-relaxed break-all">
        {comment.content}
      </p>

      {/* Кнопка ответить (Только для авторизованных) */}
      {session?.user && (
        <ReplyForm postId={postId} parentId={comment.id} />
      )}

      {/* РЕКУРСИЯ: Если есть ответы, рисуем их внутри этого же блока */}
      {children.length > 0 && (
        <div className="mt-2">
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

  // Выбираем только корневые комментарии (у которых нет родителя)
  const topLevelComments = post.comments.filter(c => !c.parentId);

  return (
    <div className="max-w-3xl mx-auto space-y-4 font-mono">
      <ViewTracker postId={post.id} />

      <Link href="/" className="inline-block text-[#4AF626]/60 hover:text-white hover:text-glow transition mb-2 font-bold text-[11px]">
        &lt; RETURN_TO_MAIN
      </Link>

      {/* ТЕЛО ПОСТА */}
      <article className="border border-[#4AF626]/50 bg-[#0A0A0A]/80 p-4 shadow-[0_0_15px_rgba(74,246,38,0.05)] relative">
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#4AF626]"></div>
        
        <div className="flex justify-between items-start mb-3 border-b border-[#4AF626]/30 pb-2">
          <div>
            <div className="text-[9px] text-[#4AF626]/60 uppercase tracking-widest mb-0.5">AUTHOR_ID</div>
            <div className="flex items-center">
              <Link href={`/profile/${post.author.username}`} className="text-sm font-bold text-white text-glow hover:text-[#4AF626] transition">
                {post.author.username}
              </Link>
              {session?.user?.id === post.authorId ? (
                <DeleteButton postId={post.id} />
              ) : (
                session?.user && <ReportButton postId={post.id} isOwnPost={false} />
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[9px] text-[#4AF626]/60 uppercase tracking-widest mb-0.5">TIMESTAMP</div>
            <div className="text-[10px] text-[#4AF626] font-bold">{post.createdAt.toLocaleString("ru-RU")}</div>
          </div>
        </div>

        <h1 className="text-lg font-bold text-[#4AF626] mb-3 tracking-wide break-all">
          {post.title}
        </h1>
        
        <p className="text-[#4AF626]/80 whitespace-pre-wrap break-all leading-relaxed text-sm mb-4">
          {post.content}
        </p>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map(tag => (
              <Link href={`/?tag=${tag.name}`} key={tag.id} className="text-[10px] border border-[#4AF626]/30 px-1.5 py-0.5 text-[#4AF626] hover:bg-[#4AF626] hover:text-[#0A0A0A] transition font-bold">
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 border-t border-[#4AF626]/30 pt-2 text-xs font-bold text-[#4AF626]/60">
          {session?.user ? (
             <LikeButton postId={post.id} initialLikes={post.likedBy.length} initialHasLiked={hasLiked} />
          ) : (
            <span>L:{post.likedBy.length}</span>
          )}
          <span>V:{post.views}</span>
        </div>
      </article>

      {/* СЕКЦИЯ КОММЕНТАРИЕВ */}
      <div className="border border-[#4AF626]/30 bg-[#0A0A0A]/60 p-4">
        <h2 className="text-sm font-bold text-white text-glow mb-4 flex items-center gap-2">
          ~/comments_log <span className="text-[#4AF626]/50 text-xs">[{post.comments.length}]</span>
        </h2>

        {/* Форма для ГЛАВНОГО (корневого) комментария */}
        {session?.user ? (
          <form action={createComment} className="mb-8 border border-[#4AF626]/50 bg-[#0A0A0A] focus-within:border-[#4AF626] transition-all relative">
            <div className="absolute top-3 left-3 text-[#4AF626]/50 font-bold text-xs">&gt;</div>
            <input type="hidden" name="postId" value={post.id} />
            <textarea
              name="content" required rows={2} placeholder="INPUT_TEXT_HERE..."
              className="w-full bg-transparent p-3 pl-7 text-xs text-[#4AF626] placeholder-[#4AF626]/30 outline-none resize-y"
            />
            <div className="flex justify-end border-t border-[#4AF626]/30 p-1.5 bg-[#4AF626]/5">
              <button type="submit" className="border border-[#4AF626] text-[#4AF626] hover:bg-[#4AF626] hover:text-[#0A0A0A] px-4 py-1 text-[10px] font-bold transition uppercase">
                [ EXECUTE ]
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6 p-3 border border-[#4AF626]/30 border-dashed text-center text-[#4AF626]/50 text-[10px] font-bold tracking-widest">
            AUTH_REQUIRED. <Link href="/login" className="text-white text-glow hover:underline">RUN login.exe</Link>
          </div>
        )}

        {/* ВЫВОД ДРЕВОВИДНЫХ КОММЕНТАРИЕВ */}
        <div className="space-y-1">
          {topLevelComments.length === 0 ? (
            <div className="text-center text-[#4AF626]/40 py-4 border border-[#4AF626]/10 border-dashed text-[10px] tracking-widest">
              _NO_LOGS_FOUND_
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