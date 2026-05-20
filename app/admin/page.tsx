import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();
  
  // 1. Проверяем авторизацию
  if (!session?.user?.id) redirect("/login");

  // 2. Достаем юзера из базы, чтобы узнать его роль
  const user = await prisma.user.findUnique({ 
    where: { id: session.user.id } 
  });

  // 3. СИСТЕМА ЗАЩИТЫ: Если роли нет или это обычный юзер -> выкидываем на главную
  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    redirect("/");
  }

  // 4. Собираем статистику для дашборда
  const totalUsers = await prisma.user.count();
  const totalPosts = await prisma.post.count();
  const pendingReports = await prisma.report.count({ where: { status: "PENDING" } });

  return (
    <div className="max-w-5xl mx-auto font-mono space-y-6">
      <Link href="/" className="inline-block text-[#4AF626]/60 hover:text-white hover:text-glow transition mb-2 font-bold text-[11px]">
        &lt; RETURN_TO_MAIN
      </Link>

      <div className="border border-red-500/50 bg-[#0A0A0A]/90 p-6 sm:p-8 shadow-[0_0_20px_rgba(239,68,68,0.1)] relative overflow-hidden">
        
        {/* Декорации */}
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-red-500/30"></div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-red-500 text-glow mb-2 uppercase tracking-widest flex items-center gap-3">
          <span className="animate-pulse">⚠</span> COMMAND_CENTER
        </h1>
        <p className="text-red-500/60 text-xs mb-8 uppercase tracking-widest">
          ACCESS_LEVEL: <span className="text-white">{user.role}</span> | NODE: {user.username}
        </p>

        {/* СТАТИСТИКА СЕТИ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="border border-red-500/30 p-4 bg-red-500/5 flex flex-col justify-between">
            <span className="text-[10px] text-red-500/70 uppercase tracking-widest mb-2">Total_Nodes (Users)</span>
            <span className="text-2xl font-bold text-white text-glow">{totalUsers}</span>
          </div>
          <div className="border border-[#4AF626]/30 p-4 bg-[#4AF626]/5 flex flex-col justify-between">
            <span className="text-[10px] text-[#4AF626]/70 uppercase tracking-widest mb-2">Total_Threads (Posts)</span>
            <span className="text-2xl font-bold text-white text-glow">{totalPosts}</span>
          </div>
          <div className={`border p-4 flex flex-col justify-between ${pendingReports > 0 ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-[#4AF626]/30 bg-[#4AF626]/5'}`}>
            <span className={`text-[10px] uppercase tracking-widest mb-2 ${pendingReports > 0 ? 'text-yellow-500' : 'text-[#4AF626]/70'}`}>
              Pending_Reports
            </span>
            <span className={`text-2xl font-bold text-glow ${pendingReports > 0 ? 'text-yellow-500 animate-pulse' : 'text-white'}`}>
              {pendingReports}
            </span>
          </div>
        </div>

        {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
        <h2 className="text-sm font-bold text-red-500 mb-4 border-b border-red-500/30 pb-2 uppercase tracking-widest">
          ~// administrative_modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* ОБНОВЛЕННАЯ ССЫЛКА НА РЕПОРТЫ */}
          <Link href="/admin/reports" className="border border-yellow-500/50 text-yellow-500 p-4 text-left hover:bg-yellow-500 hover:text-[#0A0A0A] transition group block">
            <h3 className="font-bold mb-1 uppercase">[ MODULE: REPORTS ]</h3>
            <p className="text-[10px] opacity-70 group-hover:opacity-100">Review and resolve user violation flags.</p>
          </Link>
          
          {user.role === "ADMIN" && (
            <Link href="/admin/users" className="border border-red-500/50 text-red-500 p-4 text-left hover:bg-red-500 hover:text-[#0A0A0A] transition group block">
              <h3 className="font-bold mb-1 uppercase">[ MODULE: USER_CONTROL ]</h3>
              <p className="text-[10px] opacity-70 group-hover:opacity-100">Manage nodes, assign roles, ban users.</p>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}