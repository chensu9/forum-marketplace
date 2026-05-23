import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ChatForm from "@/components/messages/chat-form";
import ScrollToBottom from "@/components/messages/scroll-to-bottom";
import RoleBadge from "@/components/user/role-badge";
import { reportUser } from "@/lib/actions/user";

// Вспомогательная функция для определения онлайна (3 минуты = 180 000 мс)
function isUserOnline(lastSeen: Date) {
  const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
  return lastSeen > threeMinutesAgo;
}

// Форматирование "Был(а) в сети..."
function formatLastSeen(lastSeen: Date) {
  const rtf = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' });
  const diffInMinutes = Math.round((lastSeen.getTime() - Date.now()) / (1000 * 60));
  
  if (diffInMinutes > -60) return `Был(а) ${rtf.format(diffInMinutes, 'minute')}`;
  if (diffInMinutes > -1440) return `Был(а) ${rtf.format(Math.round(diffInMinutes / 60), 'hour')}`;
  return `Был(а) ${rtf.format(Math.round(diffInMinutes / 1440), 'day')}`;
}

export default async function ChatPage({ params }: { params: Promise<{ username: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await params;
  
  // ИСПРАВЛЕНО: Добавили выборку поля lastSeen
  const otherUser = await prisma.user.findUnique({
    where: { username: resolvedParams.username },
    select: { id: true, username: true, role: true, reputation: true, createdAt: true, bio: true, image: true, lastSeen: true }
  });

  if (!otherUser) notFound();
  if (otherUser.id === session.user.id) redirect("/"); 

  // Рассчитываем статус онлайна
  const onlineStatus = isUserOnline(otherUser.lastSeen);

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

  async function handleUserReport(formData: FormData) {
    "use server";
    const reason = formData.get("reason") as string;
    const targetId = formData.get("targetUserId") as string;
    await reportUser(targetId, reason);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 w-full space-y-4">
      
      <Link href="/messages" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm font-medium mb-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Назад к диалогам
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* САМ ЧАТ */}
        <div className="lg:col-span-3 bg-[#1A1A1B] border border-[#343536] rounded-md flex flex-col h-[75vh] shadow-sm overflow-hidden">
          
          <div className="bg-[#272729] border-b border-[#343536] px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              
              {/* Аватар с индикатором онлайна */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-tr from-gray-600 to-gray-500 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm overflow-hidden border-2 border-[#272729]">
                  {otherUser.image ? (
                    <img src={otherUser.image} alt={otherUser.username} className="w-full h-full object-cover" />
                  ) : (
                    otherUser.username.charAt(0).toUpperCase()
                  )}
                </div>
                {/* ЗЕЛЕНЫЙ КРУЖОК 🟢 */}
                {onlineStatus && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#272729] rounded-full"></div>
                )}
              </div>

              <div>
                <div className="font-bold text-gray-100 flex items-center gap-2">
                  {otherUser.username}
                  <RoleBadge role={otherUser.role} />
                </div>
                
                {/* Текстовый статус онлайна */}
                {onlineStatus ? (
                  <div className="text-xs text-green-500 font-medium tracking-wide">В сети</div>
                ) : (
                  <div className="text-xs text-gray-500 font-medium">{formatLastSeen(otherUser.lastSeen)}</div>
                )}
              </div>

            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-[#343536] scrollbar-track-transparent">
            {/* Твои сообщения без изменений */}
            {messages.length === 0 ? (
               // ...
               <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-2">Нет сообщений</div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === session.user?.id;
                return (
                  <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] sm:max-w-[70%] px-3 py-1.5 text-sm relative group w-fit ${isMe ? "bg-blue-600 text-white rounded-2xl rounded-br-sm" : "bg-[#272729] border border-[#343536] text-gray-100 rounded-2xl rounded-bl-sm"}`}>
                      <div className="flex items-end gap-2">
                        <div className="whitespace-pre-wrap break-words leading-relaxed text-left">{msg.content}</div>
                        <div className={`text-[10px] shrink-0 flex items-center gap-0.5 mb-0.5 ${isMe ? "text-blue-200" : "text-gray-500"}`}>
                          {msg.createdAt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <ScrollToBottom />
          </div>

          <div className="border-t border-[#343536] bg-[#1A1A1B] p-3 shrink-0">
            <ChatForm receiverUsername={otherUser.username} />
          </div>
        </div>

        {/* ПРОФИЛЬ СОБЕСЕДНИКА СБОКУ */}
        <div className="lg:col-span-1 bg-[#1A1A1B] border border-[#343536] rounded-md p-6 h-fit lg:sticky lg:top-20 shadow-sm flex flex-col items-center text-center">
          
          <div className="relative mb-4">
            <div className="w-20 h-20 bg-gradient-to-tr from-gray-600 to-gray-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-inner overflow-hidden border-4 border-[#1A1A1B]">
              {otherUser.image ? (
                <img src={otherUser.image} alt={otherUser.username} className="w-full h-full object-cover" />
              ) : (
                otherUser.username.charAt(0).toUpperCase()
              )}
            </div>
            {/* БОЛЬШОЙ ЗЕЛЕНЫЙ КРУЖОК НА АВАТАРКЕ В ПРОФИЛЕ 🟢 */}
            {onlineStatus && (
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-[3px] border-[#1A1A1B] rounded-full"></div>
            )}
          </div>
          
          <h2 className="text-lg font-bold text-gray-100 flex items-center justify-center gap-2 w-full mb-1">
            <span className="truncate">{otherUser.username}</span>
          </h2>
          <div className="mb-4"><RoleBadge role={otherUser.role} /></div>

          <p className="text-xs text-gray-500 mb-6">На сайте с {otherUser.createdAt.toLocaleDateString("ru-RU")}</p>

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

          <form action={handleUserReport} className="w-full bg-[#0A0A0B] border border-[#343536] rounded-xl p-3 flex flex-col gap-2">
            <input type="hidden" name="targetUserId" value={otherUser.id} />
            <input type="text" name="reason" placeholder="Причина жалобы (от 5 символов)..." required className="w-full bg-[#272729] border border-[#343536] focus:border-gray-500 rounded-lg p-2 text-xs text-gray-200 placeholder-gray-500 outline-none transition-colors" />
            <button type="submit" className="w-full bg-[#272729] hover:bg-red-600/20 hover:text-red-400 text-gray-400 font-semibold py-1.5 rounded-lg text-xs transition border border-[#343536]">
              Пожаловаться на юзера
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}