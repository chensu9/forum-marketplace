import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { dismissReport, deleteReportedPost } from "@/lib/actions/admin";

export default async function AdminReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MODERATOR")) redirect("/");

  // Достаем все активные жалобы
  const pendingReports = await prisma.report.findMany({
    where: { status: "PENDING" },
    include: {
      post: { include: { author: true } },
      user: true, // Тот, кто отправил жалобу
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-5xl mx-auto font-mono space-y-6">
      
      <div className="flex justify-between items-end mb-2">
        <Link href="/admin" className="text-yellow-500/60 hover:text-yellow-500 hover:text-glow transition font-bold text-[11px]">
          &lt; ABORT_TO_COMMAND_CENTER
        </Link>
        <div className="text-[10px] text-yellow-500/50 tracking-widest uppercase">
          MODERATION_PROTOCOL: ACTIVE
        </div>
      </div>

      <div className="border border-yellow-500/50 bg-[#0A0A0A]/90 p-6 shadow-[0_0_20px_rgba(234,179,8,0.1)] relative">
        <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-yellow-500/30"></div>

        <h1 className="text-xl font-bold text-yellow-500 text-glow uppercase tracking-widest mb-2 flex items-center gap-3">
          [ MODULE: REPORTS ]
        </h1>
        <p className="text-yellow-500/60 text-xs mb-8 uppercase tracking-widest">
          PENDING_FLAGS: <span className={pendingReports.length > 0 ? "text-white animate-pulse" : "text-white"}>{pendingReports.length}</span>
        </p>

        <div className="space-y-4">
          {pendingReports.length === 0 ? (
            <div className="border border-dashed border-yellow-500/30 p-8 text-center text-yellow-500/40 text-sm tracking-widest uppercase">
              _NO_VIOLATIONS_DETECTED_
            </div>
          ) : (
            pendingReports.map((report) => (
              <div key={report.id} className="border border-yellow-500/30 bg-yellow-500/5 p-4 flex flex-col md:flex-row gap-4 justify-between items-start">
                
                {/* Инфо о жалобе */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-yellow-500/60">
                    <span>FLAG_ID: {report.id.slice(0, 8)}</span>
                    <span>|</span>
                    <span>Reported_By: {report.user.username}</span>
                    <span>|</span>
                    <span>{report.createdAt.toLocaleDateString("ru-RU")}</span>
                  </div>
                  
                  <div className="text-sm font-bold text-white">
                    Reason: <span className="text-yellow-500 text-glow">{report.reason}</span>
                  </div>

                  {report.post ? (
                    <div className="mt-4 border-l-2 border-yellow-500/30 pl-3">
                      <div className="text-[10px] uppercase text-[#4AF626]/60 mb-1">Target_Record:</div>
                      <Link href={`/post/${report.post.id}`} target="_blank" className="text-lg font-bold text-[#4AF626] hover:text-white transition">
                        {report.post.title}
                      </Link>
                      <p className="text-xs text-[#4AF626]/70 line-clamp-2 mt-1">{report.post.content}</p>
                      <div className="text-[10px] text-[#4AF626]/50 mt-2">Author: {report.post.author.username}</div>
                    </div>
                  ) : (
                    <div className="mt-4 text-red-500 text-xs font-bold">[ TARGET_RECORD_DELETED ]</div>
                  )}
                </div>

                {/* Действия (Кнопки) */}
                <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                  {report.post && (
                    <form action={async () => { "use server"; await deleteReportedPost(report.postId); }} className="flex-1 md:flex-none">
                      <button className="w-full text-[11px] border border-red-500 text-red-500 px-4 py-2 hover:bg-red-500 hover:text-[#0A0A0A] font-bold uppercase transition tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                        [ DROP_POST ]
                      </button>
                    </form>
                  )}
                  
                  <form action={async () => { "use server"; await dismissReport(report.id); }} className="flex-1 md:flex-none">
                    <button className="w-full text-[11px] border border-yellow-500/50 text-yellow-500 px-4 py-2 hover:bg-yellow-500 hover:text-[#0A0A0A] font-bold uppercase transition tracking-widest">
                      [ DISMISS_FLAG ]
                    </button>
                  </form>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}