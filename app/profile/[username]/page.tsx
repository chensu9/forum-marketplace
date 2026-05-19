// app/profile/[username]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import BgUploadButton from "@/components/profile/bg-upload-button";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const session = await auth();
  const resolvedParams = await params;
  
  const user = await prisma.user.findUnique({
    where: { username: resolvedParams.username },
    include: {
      posts: { orderBy: { createdAt: "desc" } },
      _count: { select: { posts: true, comments: true } }
    },
  });

  if (!user) notFound();
  
  const isOwnProfile = session?.user?.id === user.id;

  return (
    <div className="w-full font-mono relative min-h-screen">
      
      {/* ЖИВОЙ КАСТОМНЫЙ ФОН */}
      {user.profileBackground && (
        <div className="absolute inset-0 z-0 opacity-15 overflow-hidden select-none pointer-events-none">
          {user.profileBackground.endsWith(".mp4") || user.profileBackground.endsWith(".webm") ? (
            <video
              src={user.profileBackground}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover grayscale brightness-50"
            />
          ) : (
            <img
              src={user.profileBackground}
              alt="Profile Background"
              className="w-full h-full object-cover grayscale brightness-50"
            />
          )}
        </div>
      )}

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <div className="relative z-10 space-y-6 max-w-[1200px] mx-auto">
        
        {/* КАРТОЧКА ПРОФИЛЯ */}
        <div className="border border-[#4AF626]/50 bg-[#0A0A0A]/80 p-6 sm:p-8 shadow-[0_0_20px_rgba(74,246,38,0.05)] relative overflow-hidden">
          
          {/* ЖЕСТКАЯ СЕТКА GRID (Вместо Flexbox) */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 relative z-10">
            
            {/* =========================================
                ЛЕВАЯ КОЛОНКА (Аватар + Стата)
                ========================================= */}
            <div className="flex flex-col">
              
              {/* Аватар */}
              <div className="w-32 h-32 border-2 border-[#4AF626] flex items-center justify-center bg-[#4AF626]/5 group overflow-hidden crt-overlay mb-6">
                {user.image ? (
                  <img src={user.image} alt={user.username} className="w-full h-full object-cover grayscale group-hover:scale-110 transition-transform" />
                ) : (
                  <span className="text-5xl text-[#4AF626] font-bold text-glow">{user.username[0].toUpperCase()}</span>
                )}
              </div>

              {/* Статистика */}
              <div className="w-full space-y-3 text-xs font-bold text-[#4AF626]/80">
                <div className="flex items-center gap-2 mb-4 text-[#4AF626]/50">
                  <span className="w-2 h-2 bg-[#4AF626] animate-pulse"></span>
                  <span className="text-[10px] uppercase tracking-widest">Sys_Status: Active</span>
                </div>
                
                <div className="flex justify-between items-end border-b border-[#4AF626]/20 pb-1">
                  <span className="text-[#4AF626]/50 uppercase tracking-widest text-[9px]">Threads</span>
                  <span className="text-white text-glow text-sm">{user._count.posts}</span>
                </div>
                <div className="flex justify-between items-end border-b border-[#4AF626]/20 pb-1">
                  <span className="text-[#4AF626]/50 uppercase tracking-widest text-[9px]">Logs</span>
                  <span className="text-white text-glow text-sm">{user._count.comments}</span>
                </div>
                <div className="flex justify-between items-end border-b border-[#4AF626]/20 pb-1">
                  <span className="text-[#4AF626]/50 uppercase tracking-widest text-[9px]">Registered</span>
                  <span className="text-[#4AF626]">{user.createdAt.toLocaleDateString("ru-RU")}</span>
                </div>
              </div>

            </div>

            {/* =========================================
                ПРАВАЯ КОЛОНКА (Имя + Кнопки + Био)
                ========================================= */}
            <div className="flex flex-col min-w-0">
              
              {/* Верхняя строка: Имя (слева) + Кнопки (справа) */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                
                <h1 className="text-3xl sm:text-4xl font-bold text-white text-glow uppercase tracking-wider leading-none mt-1 truncate">
                  {user.username}
                </h1>

                {/* КНОПКИ (Прижаты вправо) */}
                {isOwnProfile && (
                  <div className="flex gap-3 shrink-0 h-fit">
                    <Link href="/settings" className="flex items-center justify-center border border-[#4AF626] text-[#4AF626] px-4 py-2 hover:bg-[#4AF626] hover:text-[#0A0A0A] text-[11px] sm:text-sm font-bold transition uppercase shadow-[0_0_10px_rgba(74,246,38,0.1)]">
                      [ CONFIG ]
                    </Link>
                    {/* НАША НОВАЯ РАБОЧАЯ КНОПКА ЗАГРУЗКИ */}
                    <BgUploadButton />
                  </div>
                )}
                
              </div>

              {/* БИО */}
              <div className="w-full border border-[#4AF626]/20 bg-[#0A0A0A]/80 p-5 text-sm leading-relaxed text-[#4AF626]/80 flex-1 min-h-[120px]">
                <h3 className="text-[10px] font-bold text-[#4AF626]/50 mb-3 border-b border-[#4AF626]/30 pb-2 uppercase tracking-widest">~// Bio_Payload</h3>
                {user.bio ? (
                  <p className="whitespace-pre-wrap break-words">{user.bio}</p>
                ) : (
                  <p className="text-[#4AF626]/40 text-xs tracking-widest py-4">_NO_BIO_RECORD_FOUND_</p>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* =========================================
            ИСТОРИЯ ПОСТОВ
            ========================================= */}
        <div className="border border-[#4AF626]/30 bg-[#0A0A0A]/60 p-6 relative">
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-[#4AF626]/20"></div>
          <h2 className="text-lg font-bold text-white text-glow mb-6 uppercase border-b border-[#4AF626]/30 pb-2 tracking-widest">
            ~// execution_history (Threads)
          </h2>

          <div className="space-y-4">
            {user.posts.length === 0 ? (
              <div className="text-center text-[#4AF626]/40 py-8 border border-[#4AF626]/20 border-dashed text-sm tracking-widest">
                _NO_ACTIVITY_DETECTED_
              </div>
            ) : (
              user.posts.map((post) => (
                <div key={post.id} className="p-4 border border-[#4AF626]/20 hover:border-[#4AF626] bg-[#0A0A0A] transition group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#4AF626] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-center mb-2">
                    <Link href={`/post/${post.id}`} className="text-[#4AF626] font-bold group-hover:text-white group-hover:text-glow transition text-lg tracking-wide break-all">
                      {post.title}
                    </Link>
                    <span className="text-xs text-[#4AF626]/50 ml-4 shrink-0">[{post.createdAt.toLocaleDateString("ru-RU")}]</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#4AF626]/60">
                    <span>V:{post.views}</span>
                    <Link href={`/post/${post.id}`} className="hover:text-white transition font-bold tracking-widest">
                      [ READ_DATA ]
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}