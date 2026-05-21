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
    <div className="max-w-4xl mx-auto font-mono space-y-6">
      
      <div className="flex justify-between items-end mb-2">
        <Link href="/" className="text-[#4AF626]/60 hover:text-white hover:text-glow transition font-bold text-[11px]">
          &lt; НАЗАД НА ГЛАВНУЮ
        </Link>
        <div className="text-[10px] text-yellow-500/80 tracking-widest uppercase">
          ВАШИ ДИАЛОГИ
        </div>
      </div>

      <div className="border border-[#4AF626]/50 bg-[#0A0A0A]/90 p-6 shadow-[0_0_15px_rgba(74,246,38,0.05)] relative">
        <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-[#4AF626]/30"></div>

        <h1 className="text-xl font-bold text-white text-glow uppercase tracking-widest mb-2">
          ~// ВХОДЯЩИЕ
        </h1>
        <p className="text-[#4AF626]/60 text-xs mb-8 uppercase tracking-widest">
          АКТИВНЫЕ КАНАЛЫ: {dialogs.length}
        </p>

        <div className="space-y-3">
          {dialogs.length === 0 ? (
            <div className="border border-dashed border-[#4AF626]/30 p-8 text-center text-[#4AF626]/40 text-sm tracking-widest">
              У ВАС ЕЩЁ НЕТ АКТИВНЫХ КОММУНИКАЦИЙ
            </div>
          ) : (
            dialogs.map((dialog) => {
              const { partner, lastMessage, unreadCount } = dialog;
              const isMeSender = lastMessage.senderId === session.user.id;

              return (
                <Link 
                  key={partner.id} 
                  href={`/messages/${partner.username}`}
                  className={`block border p-4 transition group relative ${
                    unreadCount > 0 
                      ? "border-yellow-500/50 bg-yellow-500/5 hover:border-yellow-500" 
                      : "border-[#4AF626]/20 bg-[#0A0A0A] hover:border-[#4AF626]"
                  }`}
                >
                  {unreadCount > 0 && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 animate-pulse"></div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <span className={`font-bold text-sm uppercase tracking-wider ${unreadCount > 0 ? "text-yellow-500" : "text-[#4AF626] group-hover:text-white"}`}>
                        usr:{partner.username}
                      </span>
                      <RoleBadge role={partner.role} />
                    </div>
                    <span className="text-[10px] text-[#4AF626]/50 shrink-0 ml-4">
                      [{lastMessage.createdAt.toLocaleDateString("ru-RU")} {lastMessage.createdAt.toLocaleTimeString("ru-RU", {hour: "2-digit", minute:"2-digit"})}]
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#4AF626]/40 font-bold shrink-0">
                      {isMeSender ? "YOU:" : "RCV:"}
                    </span>
                    <span className={`truncate ${unreadCount > 0 && !isMeSender ? "text-white font-bold" : "text-[#4AF626]/70"}`}>
                      {lastMessage.content}
                    </span>
                  </div>

                  {unreadCount > 0 && (
                    <div className="mt-3 inline-block bg-yellow-500 text-[#0A0A0A] text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">
                      {unreadCount} НОВЫХ
                    </div>
                  )}
                </Link>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}