import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { dismissReport, deleteReportedPost } from "@/lib/actions/admin";
import RoleBadge from "@/components/user/role-badge";

export default async function AdminReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MODERATOR")) redirect("/");

  const pendingReports = await prisma.report.findMany({
    where: { status: "PENDING" },
    include: {
      post: { include: { author: true } },
      user: true, 
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Шапка */}
      <div className="mb-8">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-300 transition mb-2 inline-block">
          ← Назад в админ-панель
        </Link>
        <h1 className="text-2xl font-bold text-gray-100">Жалобы (Reports)</h1>
        <p className="text-gray-400 text-sm mt-1">
          Всего активных жалоб: <span className="text-white font-bold">{pendingReports.length}</span>
        </p>
      </div>

      {/* Список жалоб */}
      <div className="bg-[#1A1A1B] border border-[#343536] rounded-md overflow-hidden">
        {pendingReports.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            Жалоб нет. Всё чисто!
          </div>
        ) : (
          <div className="divide-y divide-[#343536]">
            {pendingReports.map((report) => (
              <div key={report.id} className="p-6 flex flex-col md:flex-row gap-6 items-start hover:bg-[#272729]/30 transition-colors">
                
                {/* Инфо о жалобе */}
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="bg-[#272729] px-2 py-0.5 rounded text-gray-300">ID: {report.id.slice(0, 8)}</span>
                    <span>•</span>
                    <span>От: <span className="font-semibold text-gray-200">{report.user.username}</span></span>
                    <span>•</span>
                    <span>{report.createdAt.toLocaleDateString("ru-RU")}</span>
                  </div>
                  
                  <div className="text-sm text-gray-200">
                    Причина: <span className="font-bold text-gray-100">{report.reason}</span>
                  </div>

                  {report.post ? (
                    <div className="bg-[#272729] p-4 rounded border border-[#343536] mt-2">
                      <Link href={`/post/${report.post.id}`} target="_blank" className="font-bold text-blue-400 hover:underline block mb-1">
                        {report.post.title}
                      </Link>
                      <p className="text-xs text-gray-400 line-clamp-2 italic">"{report.post.content}"</p>
                      <div className="text-[10px] text-gray-500 mt-2">Автор: {report.post.author.username}</div>
                    </div>
                  ) : (
                    <div className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded border border-red-500/20">
                      [ Пост был удален ]
                    </div>
                  )}
                </div>

                {/* Действия */}
                <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                  {report.post && (
                    <form action={async () => { "use server"; await deleteReportedPost(report.postId); }}>
                      <button className="w-full text-xs font-bold uppercase tracking-wide bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded transition shadow-sm">
                        Удалить пост
                      </button>
                    </form>
                  )}
                  
                  <form action={async () => { "use server"; await dismissReport(report.id); }}>
                    <button className="w-full text-xs font-bold uppercase tracking-wide bg-[#272729] hover:bg-[#343536] border border-[#343536] text-gray-300 px-4 py-2 rounded transition">
                      Отклонить
                    </button>
                  </form>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}