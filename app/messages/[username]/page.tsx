import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ChatForm from "@/components/messages/chat-form";
import ScrollToBottom from "@/components/messages/scroll-to-bottom";
import RoleBadge from "@/components/user/role-badge";

export default async function ChatPage({ params }: { params: Promise<{ username: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await params;
  
  const otherUser = await prisma.user.findUnique({
    where: { username: resolvedParams.username },
    select: { id: true, username: true, role: true, reputation: true, createdAt: true, bio: true }
  });

  if (!otherUser) notFound();
  if (otherUser.id === session.user.id) redirect("/"); 

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: otherUser.id },
        { senderId: otherUser.id, receiverId: session.user.id },
      ]
    },
    include: { sender: true },
    orderBy: { createdAt: "asc" },
  });

  await prisma.message.updateMany({
    where: { senderId: otherUser.id, receiverId: session.user.id, isRead: false },
    data: { isRead: true }
  });

  return (
    <div className="max-w-6xl mx-auto font-mono space-y-4">
      
      <Link href="/messages" className="inline-block text-[#4AF626]/60 hover:text-white hover:text-glow transition mb-2 font-bold text-[11px]">
        &lt; НАЗАД К ДИАЛОГАМ
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* ЛЕВАЯ ЧАСТЬ: САМ ЧАТ (Занимает 3 колонки) */}
        <div className="md:col-span-3 border border-[#4AF626]/50 bg-[#0A0A0A]/90 p-4 shadow-[0_0_15px_rgba(74,246,38,0.05)] relative flex flex-col h-[70vh]">
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#4AF626]"></div>

          <div className="border-b border-[#4AF626]/30 pb-3 mb-4 flex justify-between items-center shrink-0">
            <div>
              <div className="text-[10px] text-[#4AF626]/50 uppercase tracking-widest mb-1">ЗАШИФРОВАННЫЙ КАНАЛ:</div>
              <h1 className="text-lg font-bold text-white text-glow uppercase">usr: {otherUser.username}</h1>
            </div>
            <div className="text-right">
              <span className="text-[#4AF626] text-[10px] uppercase font-bold animate-pulse border border-[#4AF626]/30 px-2 py-1">
                [ ЗАЩИЩЕНО ]
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-[#4AF626]/20 scrollbar-track-transparent flex flex-col">
            {messages.length === 0 ? (
              <div className="m-auto text-center text-[#4AF626]/40 text-xs tracking-widest border border-dashed border-[#4AF626]/20 p-4">
                _ИСТОРИЯ ПЕРЕПИСКИ ПУСТА_
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === session.user?.id;
                return (
                  <div key={msg.id} className="text-xs sm:text-sm font-mono break-words leading-relaxed group hover:bg-[#4AF626]/5 p-1 transition-colors">
                    <span className="text-[#4AF626]/40 text-[10px] mr-2 shrink-0">
                      [{msg.createdAt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}]
                    </span>
                    <span className={`font-bold mr-2 ${isMe ? "text-[#4AF626]/70" : "text-yellow-500"}`}>
                      usr:{msg.sender.username}
                    </span>
                    <span className="text-white/90 whitespace-pre-wrap">{msg.content}</span>
                  </div>
                );
              })
            )}
            <ScrollToBottom />
          </div>

          <ChatForm receiverUsername={otherUser.username} />
        </div>

        {/* ПРАВАЯ ЧАСТЬ: ДОСЬЕ СОБЕСЕДНИКА (Занимает 1 колонку) */}
        <div className="md:col-span-1 border border-[#4AF626]/30 bg-[#4AF626]/5 p-4 h-fit sticky top-4">
          <h2 className="text-[10px] text-[#4AF626]/50 uppercase tracking-widest border-b border-[#4AF626]/20 pb-2 mb-4">
            ~// досье узла
          </h2>
          
          <div className="space-y-4">
            <div>
              <div className="text-xs text-[#4AF626]/60 mb-1 uppercase">Позывной:</div>
              <div className="text-white font-bold flex items-center flex-wrap gap-2">
                <Link href={`/profile/${otherUser.username}`} className="hover:text-glow transition">
                  {otherUser.username}
                </Link>
                <RoleBadge role={otherUser.role} />
              </div>
            </div>

            <div>
              <div className="text-xs text-[#4AF626]/60 mb-1 uppercase">В сети с:</div>
              <div className="text-[#4AF626] text-sm">{otherUser.createdAt.toLocaleDateString("ru-RU")}</div>
            </div>

            <div>
              <div className="text-xs text-[#4AF626]/60 mb-1 uppercase">Репутация:</div>
              <div className="text-[#4AF626] text-sm font-bold">{otherUser.reputation} EXP</div>
            </div>

            {otherUser.bio && (
              <div>
                <div className="text-xs text-[#4AF626]/60 mb-1 uppercase">О себе:</div>
                <div className="text-xs text-[#4AF626]/80 italic break-words border-l border-[#4AF626]/30 pl-2">
                  "{otherUser.bio}"
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#4AF626]/20">
              <Link href={`/profile/${otherUser.username}`} className="block w-full text-center border border-[#4AF626]/50 text-[#4AF626] py-2 text-[10px] font-bold uppercase hover:bg-[#4AF626] hover:text-[#0A0A0A] transition">
                [ ОТКРЫТЬ ПРОФИЛЬ ]
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}