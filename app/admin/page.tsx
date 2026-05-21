import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import RoleBadge from "@/components/user/role-badge";

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ 
    where: { id: session.user.id } 
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    redirect("/");
  }

  const totalUsers = await prisma.user.count();
  const totalPosts = await prisma.post.count();
  const pendingReports = await prisma.report.count({ where: { status: "PENDING" } });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Шапка админки */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Панель управления</h1>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
          <span>Привет, {user.username}</span>
          <RoleBadge role={user.role} />
        </div>
      </div>

      {/* Сетка статистики */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1A1A1B] border border-[#343536] p-5 rounded-md">
          <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Пользователи</div>
          <div className="text-3xl font-bold text-white">{totalUsers}</div>
        </div>
        <div className="bg-[#1A1A1B] border border-[#343536] p-5 rounded-md">
          <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Всего постов</div>
          <div className="text-3xl font-bold text-white">{totalPosts}</div>
        </div>
        <div className={`bg-[#1A1A1B] border p-5 rounded-md ${pendingReports > 0 ? 'border-orange-500/50' : 'border-[#343536]'}`}>
          <div className={`text-xs font-semibold uppercase mb-1 ${pendingReports > 0 ? 'text-orange-400' : 'text-gray-500'}`}>
            Жалобы (Pending)
          </div>
          <div className={`text-3xl font-bold ${pendingReports > 0 ? 'text-orange-400' : 'text-white'}`}>
            {pendingReports}
          </div>
        </div>
      </div>

      {/* Модули управления */}
      <h2 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Администрирование</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <Link href="/admin/reports" className="bg-[#1A1A1B] border border-[#343536] hover:border-orange-500/50 p-6 rounded-md transition-all group">
          <h3 className="font-bold text-gray-200 group-hover:text-orange-400 transition mb-2">Жалобы и репорты</h3>
          <p className="text-sm text-gray-500">Обработка модераторских запросов и жалоб пользователей.</p>
        </Link>
        
        {user.role === "ADMIN" && (
          <Link href="/admin/users" className="bg-[#1A1A1B] border border-[#343536] hover:border-red-500/50 p-6 rounded-md transition-all group">
            <h3 className="font-bold text-gray-200 group-hover:text-red-400 transition mb-2">Управление пользователями</h3>
            <p className="text-sm text-gray-500">Блокировки, смена ролей и управление аккаунтами.</p>
          </Link>
        )}
      </div>

    </div>
  );
}