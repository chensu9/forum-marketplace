import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  dismissReport, 
  deleteReportedPost, 
  warnReportedUser, 
  deleteReportedComment, 
  deleteReportedListing 
} from "@/lib/actions/admin";

export default async function AdminReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MODERATOR")) redirect("/");

  const pendingReports = await prisma.report.findMany({
    where: { status: "PENDING" },
    include: {
      post: { include: { author: true } },
      comment: { include: { author: true } }, 
      targetUser: true, 
      user: true, 
    },
    orderBy: { createdAt: "desc" }
  });

  // =========================================================
  // НАДЕЖНЫЕ ВЕРХНЕУРОВНЕВЫЕ СЕРВЕРНЫЕ ЭКШЕНЫ БЕЗ ИНЛАЙНА
  // =========================================================
  
  async function actionDismiss(formData: FormData) {
    "use server";
    const reportId = formData.get("reportId") as string;
    await dismissReport(reportId);
  }

  async function actionDeletePost(formData: FormData) {
    "use server";
    const postId = formData.get("postId") as string;
    const reportId = formData.get("reportId") as string;
    await deleteReportedPost(postId, reportId);
  }

  async function actionWarnUser(formData: FormData) {
    "use server";
    const targetUserId = formData.get("targetUserId") as string;
    const reportId = formData.get("reportId") as string;
    const reason = formData.get("reason") as string;
    await warnReportedUser(targetUserId, reportId, reason);
  }

  async function actionDeleteComment(formData: FormData) {
    "use server";
    const commentId = formData.get("commentId") as string;
    const reportId = formData.get("reportId") as string;
    await deleteReportedComment(commentId, reportId);
  }

  async function actionDeleteListing(formData: FormData) {
    "use server";
    const listingId = formData.get("listingId") as string;
    const reportId = formData.get("reportId") as string;
    await deleteReportedListing(listingId, reportId);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-300 transition mb-2 inline-block">
          ← Назад в админ-панель
        </Link>
        <h1 className="text-2xl font-bold text-gray-100">Жалобы (Reports)</h1>
        <p className="text-gray-400 text-sm mt-1">Всего active кейсов: <span className="text-white font-bold">{pendingReports.length}</span></p>
      </div>

      <div className="bg-[#1A1A1B] border border-[#343536] rounded-md overflow-hidden">
        {pendingReports.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">Жалоб нет. Всё чисто!</div>
        ) : (
          <div className="divide-y divide-[#343536]">
            {pendingReports.map((report) => {
              
              const isMarketReport = report.reason.includes("ID товара:");
              const marketIdMatch = report.reason.match(/ID товара:\s*([a-zA-Z0-9_\-]+)/);
              const extractedListingId = marketIdMatch ? marketIdMatch[1] : null;

              return (
                <div key={report.id} className="p-6 flex flex-col md:flex-row gap-6 items-start hover:bg-[#272729]/30 transition-colors">
                  
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="bg-[#272729] px-2 py-0.5 rounded text-gray-300">ID: {report.id.slice(0, 8)}</span>
                      <span>От: <span className="font-semibold text-gray-200">{report.user.username}</span></span>
                      <span>•</span>
                      <span>{report.createdAt.toLocaleDateString("ru-RU")}</span>
                    </div>
                    
                    <div className="text-sm text-gray-200">
                      Причина: <span className="font-bold text-orange-400">{report.reason}</span>
                    </div>

                    {/* ОБЪЕКТ: ПОСТ */}
                    {report.post && (
                      <div className="bg-[#272729] p-4 rounded border border-[#343536]">
                        <span className="text-[10px] uppercase font-bold text-blue-400 block mb-1">Объект: Пост</span>
                        <Link href={`/post/${report.post.id}`} target="_blank" className="font-bold text-gray-100 hover:underline block mb-1">
                          {report.post.title}
                        </Link>
                        <p className="text-xs text-gray-400 line-clamp-2 italic">"{report.post.content}"</p>
                        <div className="text-[10px] text-gray-500 mt-2">Автор: {report.post.author.username}</div>
                      </div>
                    )}

                    {/* ОБЪЕКТ: КОММЕНТАРИЙ */}
                    {report.comment && (
                      <div className="bg-[#272729] p-4 rounded border border-[#343536]">
                        <span className="text-[10px] uppercase font-bold text-purple-400 block mb-1">Объект: Комментарий</span>
                        <p className="text-xs text-gray-300 italic">"{report.comment.content}"</p>
                        <div className="text-[10px] text-gray-500 mt-2">Автор: {report.comment.author.username}</div>
                      </div>
                    )}

                    {/* ОБЪЕКТ: ПРОФИЛЬ */}
                    {report.targetUser && (
                      <div className="bg-[#272729] p-4 rounded border border-[#343536]">
                        <span className="text-[10px] uppercase font-bold text-red-400 block mb-1">Объект: Профиль</span>
                        <Link href={`/profile/${report.targetUser.username}`} target="_blank" className="font-bold text-gray-100 hover:underline">
                          Пользователь: @{report.targetUser.username}
                        </Link>
                      </div>
                    )}

                    {/* ОБЪЕКТ: ТОВАР МАРКЕТА */}
                    {isMarketReport && extractedListingId && (
                      <div className="bg-[#272729] p-4 rounded border border-[#343536]">
                        <span className="text-[10px] uppercase font-bold text-yellow-500 block mb-1">Объект: Товар маркета</span>
                        <Link href={`/market/${extractedListingId}`} target="_blank" className="font-bold text-gray-100 hover:underline text-xs">
                          Посмотреть карточку подозрительного товара →
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* КНОПКИ ДЕЙСТВИЯ */}
                  <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                    
                    {/* Пост */}
                    {report.post && (
                      <form action={actionDeletePost}>
                        <input type="hidden" name="postId" value={report.postId!} />
                        <input type="hidden" name="reportId" value={report.id} />
                        <button type="submit" className="w-full text-xs font-bold bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded transition">
                          Удалить пост
                        </button>
                      </form>
                    )}

                    {/* Комментарий */}
                    {report.comment && (
                      <form action={actionDeleteComment}>
                        <input type="hidden" name="commentId" value={report.commentId!} />
                        <input type="hidden" name="reportId" value={report.id} />
                        <button type="submit" className="w-full text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded transition">
                          Удалить коммент
                        </button>
                      </form>
                    )}

                    {/* Профиль (Варн) */}
                    {report.targetUser && (
                      <form action={actionWarnUser}>
                        <input type="hidden" name="targetUserId" value={report.targetUserId!} />
                        <input type="hidden" name="reportId" value={report.id} />
                        <input type="hidden" name="reason" value={report.reason} />
                        <button type="submit" className="w-full text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded transition">
                          Предупредить (Варн)
                        </button>
                      </form>
                    )}

                    {/* Товар */}
                    {isMarketReport && extractedListingId && (
                      <form action={actionDeleteListing}>
                        <input type="hidden" name="listingId" value={extractedListingId} />
                        <input type="hidden" name="reportId" value={report.id} />
                        <button type="submit" className="w-full text-xs font-bold bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded transition">
                          Удалить товар
                        </button>
                      </form>
                    )}

                    {/* Отклонить ложный репорт */}
                    <form action={actionDismiss}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <button type="submit" className="w-full text-xs font-bold bg-[#272729] hover:bg-[#343536] border border-[#343536] text-gray-300 px-4 py-2 rounded transition">
                        Отклонить жалобу
                      </button>
                    </form>
                    
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}