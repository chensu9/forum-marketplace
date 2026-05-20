import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ChatForm from "@/components/messages/chat-form";

export default async function ChatPage({ params }: { params: Promise<{ username: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await params;
  
  const otherUser = await prisma.user.findUnique({
    where: { username: resolvedParams.username },
    select: { id: true, username: true, role: true }
  });

  if (!otherUser) notFound();
  if (otherUser.id === session.user.id) redirect("/"); // Нельзя писать самому себе

  // Достаем переписку (сообщения где мы отправитель или получатель)
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

  // Отмечаем чужие сообщения как прочитанные (раз мы открыли диалог)
  await prisma.message.updateMany({
    where: { senderId: otherUser.id, receiverId: session.user.id, isRead: false },
    data: { isRead: true }
  });

  return (
    <div className="max-w-4xl mx-auto font-mono space-y-4">
      
      <Link href="/" className="inline-block text-[#4AF626]/60 hover:text-white hover:text-glow transition mb-2 font-bold text-[11px]">
        &lt; RETURN_TO_MAIN
      </Link>

      <div className="border border-[#4AF626]/50 bg-[#0A0A0A]/90 p-4 shadow-[0_0_15px_rgba(74,246,38,0.05)] relative flex flex-col h-[70vh]">
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#4AF626]"></div>

        {/* ШАПКА ДИАЛОГА */}
        <div className="border-b border-[#4AF626]/30 pb-3 mb-4 flex justify-between items-center shrink-0">
          <div>
            <div className="text-[10px] text-[#4AF626]/50 uppercase tracking-widest mb-1">SECURE_COMMS_LINK:</div>
            <h1 className="text-lg font-bold text-white text-glow uppercase">usr: {otherUser.username}</h1>
          </div>
          <div className="text-right">
            <span className="text-[#4AF626] text-[10px] uppercase font-bold animate-pulse border border-[#4AF626]/30 px-2 py-1">
              [ ENCRYPTED ]
            </span>
          </div>
        </div>

        {/* ЛОГ СООБЩЕНИЙ (Консоль) */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-[#4AF626]/20 scrollbar-track-transparent flex flex-col">
          {messages.length === 0 ? (
            <div className="m-auto text-center text-[#4AF626]/40 text-xs tracking-widest border border-dashed border-[#4AF626]/20 p-4">
              _NO_COMMUNICATION_LOGS_FOUND_
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
        </div>

        {/* ФОРМА ВВОДА */}
        <ChatForm receiverUsername={otherUser.username} />

      </div>
    </div>
  );
}