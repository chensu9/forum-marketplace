import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ChatForm from "@/components/messages/chat-form";
import ScrollToBottom from "@/components/messages/scroll-to-bottom";
import RoleBadge from "@/components/user/role-badge";
// Импортируем наш новый экшен репорта на юзера
import { reportUser } from "@/lib/actions/user";

export default async function ChatPage({ params }: { params: Promise<{ username: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await params;
  
  const otherUser = await prisma.user.findUnique({
    where: { username: resolvedParams.username },
    select: { id: true, username: true, role: true, reputation: true, createdAt: true, bio: true, image: true }
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

  // Отмечаем сообщения как прочитанные
  await prisma.message.updateMany({
    where: { senderId: otherUser.id, receiverId: session.user.id, isRead: false },
    data: { isRead: true }
  });

  // Функция-обработчик для отправки репорта (Server Action)
  async function handleUserReport(formData: FormData) {
    "use server";
    const reason = formData.get("reason") as string;
    const targetId = formData.get("targetUserId") as string;
    await reportUser(targetId, reason);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 w-full space-y-4">
      
      {/* Кнопка назад */}
      <Link href="/messages" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm font-medium mb-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Назад к диалогам
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* САМ ЧАТ */}
        <div className="lg:col-span-3 bg-[#1A1A1B] border border-[#343536] rounded-md flex flex-col h-[75vh] shadow-sm overflow-hidden">
          
          {/* Шапка чата */}
          <div className="bg-[#272729] border-b border-[#343536] px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-gray-600 to-gray-500 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm overflow-hidden">
                {otherUser.image ? (
                  <img src={otherUser.image} alt={otherUser.username} className="w-full h-full object-cover" />
                ) : (
                  otherUser.username.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="font-bold text-gray-100 flex items-center gap-2">
                  {otherUser.username}
                  <RoleBadge role={otherUser.role} />
                </div>
                <div className="text-xs text-green-500 font-medium">В сети</div>
              </div>
            </div>
          </div>

          {/* Область сообщений */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-[#343536] scrollbar-track-transparent">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-2">
                <svg className="w-12 h-12 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <p className="text-sm font-medium text-gray-300">Нет сообщений</p>
                <p className="text-xs">Напишите {otherUser.username} прямо сейчас!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === session.user?.id;
                return (
                  <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] sm:max-w-[70%] px-3 py-1.5 text-sm relative group w-fit ${isMe ? "bg-blue-600 text-white rounded-2xl rounded-br-sm" : "bg-[#272729] border border-[#343536] text-gray-100 rounded-2xl rounded-bl-sm"}`}>
                      <div className="flex items-end gap-2">
                        <div className="whitespace-pre-wrap break-words leading-relaxed text-left">
                          {msg.content}
                        </div>
                        <div className={`text-[10px] shrink-0 flex items-center gap-0.5 mb-0.5 ${isMe ? "text-blue-200" : "text-gray-500"}`}>
                          {msg.createdAt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                          {isMe && <svg className="w-3.5 h-3.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <ScrollToBottom />
          </div>

          {/* Форма ввода */}
          <div className="border-t border-[#343536] bg-[#1A1A1B] p-3 shrink-0">
            <ChatForm receiverUsername={otherUser.username} />
          </div>
        </div>

        {/* ПРОФИЛЬ СОБЕСЕДНИКА СБОКУ */}
        <div className="lg:col-span-1 bg-[#1A1A1B] border border-[#343536] rounded-md p-6 h-fit lg:sticky lg:top-20 shadow-sm flex flex-col items-center text-center">
          
          <div className="w-20 h-20 bg-gradient-to-tr from-gray-600 to-gray-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-inner overflow-hidden">
            {otherUser.image ? (
              <img src={otherUser.image} alt={otherUser.username} className="w-full h-full object-cover" />
            ) : (
              otherUser.username.charAt(0).toUpperCase()
            )}
          </div>
          
          <h2 className="text-lg font-bold text-gray-100 flex items-center justify-center gap-2 w-full mb-1">
            <span className="truncate">{otherUser.username}</span>
          </h2>
          <div className="mb-4">
             <RoleBadge role={otherUser.role} />
          </div>

          <p className="text-xs text-gray-500 mb-6">
            На сайте с {otherUser.createdAt.toLocaleDateString("ru-RU")}
          </p>

          <div className="w-full bg-[#272729] rounded-md p-3 mb-6">
            <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Репутация</div>
            <div className="text-lg font-bold text-gray-100">{otherUser.reputation}</div>
          </div>

          {otherUser.bio && (
            <div className="w-full text-sm text-gray-300 italic bg-[#272729]/50 rounded-md p-3 mb-6 break-words border-l-2 border-gray-500">
              "{otherUser.bio}"
            </div>
          )}

          <Link href={`/profile/${otherUser.username}`} className="w-full bg-gray-200 hover:bg-white text-black font-semibold py-2.5 rounded-full transition text-sm mb-4 block">
            Открыть профиль
          </Link>

          {/* === ДОБАВЛЕНО: ФОРМА ОТПРАВКИ ЖАЛОБЫ НА ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ === */}
          <form action={handleUserReport} className="w-full bg-[#0A0A0B] border border-[#343536] rounded-xl p-3 flex flex-col gap-2">
            <input type="hidden" name="targetUserId" value={otherUser.id} />
            <input 
              type="text" 
              name="reason" 
              placeholder="Причина жалобы (от 5 символов)..." 
              required
              className="w-full bg-[#272729] border border-[#343536] focus:border-gray-500 rounded-lg p-2 text-xs text-gray-200 placeholder-gray-500 outline-none transition-colors"
            />
            <button type="submit" className="w-full bg-[#272729] hover:bg-red-600/20 hover:text-red-400 text-gray-400 font-semibold py-1.5 rounded-lg text-xs transition border border-[#343536]">
              Пожаловаться на юзера
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}