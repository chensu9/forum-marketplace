import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import RoleBadge from "@/components/user/role-badge";

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Вытаскиваем ВСЕ сообщения, где юзер либо отправитель, либо получатель
  const allMessages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id },
      ]
    },
    include: {
      sender: true,
      receiver: true,
    },
    orderBy: { createdAt: "desc" }, // Сначала новые
  });

  // Группируем сообщения по диалогам (собеседникам)
  const dialogsMap = new Map();

  for (const msg of allMessages) {
    // Определяем, кто наш собеседник в этом сообщении
    const partner = msg.senderId === session.user.id ? msg.receiver : msg.sender;
    
    if (!dialogsMap.has(partner.id)) {
      dialogsMap.set(partner.id, {
        partner,
        lastMessage: msg,
        unreadCount: 0,
      });
    }

    // Если мы получатель и сообщение не прочитано — плюсуем счетчик
    if (msg.receiverId === session.user.id && !msg.isRead) {
      dialogsMap.get(partner.id).unreadCount++;
    }
  }

  // Превращаем Map в массив для рендера
  const dialogs = Array.from(dialogsMap.values());

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full">
      
      {/* Шапка страницы */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm font-medium mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Вернуться на главную
        </Link>
        <h1 className="text-2xl font-bold text-gray-100">Сообщения</h1>
        <p className="text-sm text-gray-400 mt-1">
          Активные диалоги: {dialogs.length}
        </p>
      </div>

      {/* Контейнер со списком */}
      <div className="bg-[#1A1A1B] border border-[#343536] rounded-md overflow-hidden shadow-sm">
        {dialogs.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            У вас пока нет активных диалогов. Напишите кому-нибудь!
          </div>
        ) : (
          <div className="divide-y divide-[#343536]">
            {dialogs.map((dialog) => {
              const { partner, lastMessage, unreadCount } = dialog;
              const isMeSender = lastMessage.senderId === session.user.id;

              return (
                <Link 
                  key={partner.id} 
                  href={`/messages/${partner.username}`}
                  className={`flex items-center gap-4 p-4 transition-colors hover:bg-[#272729] ${
                    unreadCount > 0 ? "bg-[#272729]/30" : "bg-transparent"
                  }`}
                >
                  {/* Аватарка собеседника */}
                  <div className="w-12 h-12 bg-gradient-to-tr from-gray-600 to-gray-500 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0 relative">
                    {partner.username.charAt(0).toUpperCase()}
                    {/* Точка, если есть новые сообщения */}
                    {unreadCount > 0 && (
                      <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-orange-500 border-2 border-[#1A1A1B] rounded-full"></div>
                    )}
                  </div>

                  {/* Основная информация диалога */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm truncate ${unreadCount > 0 ? "text-gray-100" : "text-gray-300"}`}>
                          {partner.username}
                        </span>
                        <RoleBadge role={partner.role} />
                      </div>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">
                        {lastMessage.createdAt.toLocaleDateString("ru-RU")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className={`truncate ${unreadCount > 0 && !isMeSender ? "text-gray-200 font-semibold" : "text-gray-400"}`}>
                        {isMeSender && <span className="text-gray-500 mr-1">Вы:</span>}
                        {lastMessage.content}
                      </span>
                    </div>
                  </div>

                  {/* Бейджик с цифрой справа (если > 0) */}
                  {unreadCount > 0 && (
                    <div className="shrink-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}