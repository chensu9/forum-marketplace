import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function BanGuard({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    
    if (user?.isBanned) {
      // КРАСНЫЙ ЭКРАН СМЕРТИ (Блокирует весь контент)
      return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center font-mono p-4 text-red-500">
          <div className="border border-red-500/50 bg-red-500/5 p-8 max-w-lg text-center shadow-[0_0_40px_rgba(239,68,68,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            
            <div className="text-6xl mb-4 font-bold text-glow">⚠</div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 animate-pulse uppercase text-glow">Access Denied</h1>
            <p className="text-[10px] tracking-widest mb-6 border-b border-red-500/30 pb-4 uppercase">
              ERR_CODE: NODE_BANNED_BY_SYS_ADMIN
            </p>
            
            <p className="text-red-500/80 text-sm leading-relaxed mb-8">
              Ваш узел был принудительно отключен от сети синдиката за нарушение протоколов безопасности. Свяжитесь с администрацией для выяснения причины.
            </p>
            
            <Link href="/api/auth/signout" className="border border-red-500 text-red-500 px-8 py-3 hover:bg-red-500 hover:text-[#0A0A0A] text-xs font-bold uppercase transition tracking-widest">
              [ DISCONNECT_SESSION ]
            </Link>
          </div>
        </div>
      );
    }
  }

  // Если не забанен — рендерим сайт как обычно
  return <>{children}</>;
}