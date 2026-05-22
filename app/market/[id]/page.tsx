import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import RoleBadge from "@/components/user/role-badge";
// Импортируем экшен покупки (создания escrow-ордера) вместе с удалением и репортами
import { deleteListing, reportListing, createEscrowOrder } from "@/lib/actions/market";

export default async function SingleListingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const resolvedParams = await params;

  const listing = await prisma.listing.findUnique({
    where: { id: resolvedParams.id },
    include: { seller: true }
  });

  if (!listing) notFound();

  const currentUserId = session?.user?.id;
  const isOwner = currentUserId === listing.sellerId;
  const isAdminOrMod = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";

  // Функция-обработчик для формы жалобы (Server Action)
  async function handleReport(formData: FormData) {
    "use server";
    const reason = formData.get("reason") as string;
    const id = formData.get("listingId") as string;
    await reportListing(id, reason);
  }

  // Функция-обработчик для формы удаления (Server Action)
  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("listingId") as string;
    await deleteListing(id);
  }

  // ВНИМАНИЕ: Функция-обработчик для кнопки покупки (Server Action)
  async function handleBuy(formData: FormData) {
    "use server";
    const id = formData.get("listingId") as string;
    await createEscrowOrder(id);
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8 w-full">
      
      {/* Кнопка "Назад" */}
      <Link href="/market" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm font-medium mb-8 bg-[#1A1A1B] border border-[#343536] hover:border-gray-500 px-4 py-2 rounded-full shadow-sm w-fit">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Назад в маркет
      </Link>

      {/* Основная карточка товара */}
      <div className="bg-[#1A1A1B] border border-[#343536] rounded-2xl overflow-hidden shadow-xl p-2 sm:p-4">
        
        <div className="grid grid-cols-1 md:grid-cols-[45%_55%] gap-6 md:gap-8">
          
          {/* ЛЕВАЯ КОЛОНКА (ФОТО) */}
          <div className="bg-[#0A0A0B] rounded-xl border border-[#343536] flex items-center justify-center overflow-hidden relative aspect-square md:aspect-auto md:min-h-[450px]">
            {/* @ts-ignore */}
            {listing.imageUrl ? (
              <img 
                src={listing.imageUrl as string} 
                alt={listing.title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-[#343536]">
                <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium tracking-widest uppercase">Нет фото</span>
              </div>
            )}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-gray-300 text-[10px] px-2.5 py-1.5 rounded-md font-mono border border-white/10 uppercase tracking-widest">
              ID: {listing.id.slice(0, 8)}
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА (ИНФО) */}
          <div className="flex flex-col py-2 md:py-4 pr-2 md:pr-4 min-w-0">
            
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-100 break-words leading-tight mb-4">
                {listing.title}
              </h1>
              <div className="inline-block bg-blue-600/10 border border-blue-500/30 text-blue-400 px-5 py-2.5 rounded-xl shadow-sm">
                <span className="text-3xl font-black">{listing.price} ₽</span>
              </div>
            </div>

            {/* Описание */}
            <div className="mb-8 flex-1 min-w-0">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Описание товара</h3>
              <div className="bg-[#0A0A0B] border border-[#343536] rounded-xl p-4 md:p-5 shadow-inner">
                {/* @ts-ignore */}
                <p className="text-sm text-gray-300 break-words whitespace-pre-wrap leading-relaxed">
                  {listing.description || "Продавец не оставил описания для этого товара."}
                </p>
              </div>
            </div>

            {/* Панель действий */}
            <div className="mt-auto space-y-4">
              
              {/* Продавец */}
              <Link href={`/profile/${listing.seller.username}`} className="flex items-center justify-between p-4 bg-[#272729]/40 rounded-xl border border-[#343536] hover:bg-[#272729] hover:border-gray-500 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-sm overflow-hidden border border-[#343536]">
                    {listing.seller.image ? (
                      <img src={listing.seller.image} alt={listing.seller.username} className="w-full h-full object-cover" />
                    ) : (
                      listing.seller.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Продавец</p>
                    <div className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition flex items-center gap-2">
                      {listing.seller.username} <RoleBadge role={listing.seller.role} />
                    </div>
                  </div>
                </div>
                <div className="text-[#343536] group-hover:text-blue-400 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </Link>

              {/* Кнопки действий в зависимости от прав */}
              <div className="space-y-2">
                {isOwner ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Link href={`/market/${listing.id}/edit`} className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-white text-black font-bold py-3.5 rounded-xl transition shadow-sm text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Редактировать
                    </Link>
                    
                    {/* Кнопка удаления для владельца */}
                    <form action={handleDelete}>
                      <input type="hidden" name="listingId" value={listing.id} />
                      <button type="submit" className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white font-bold py-3.5 rounded-xl transition shadow-sm text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Удалить товар
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-3">
                    
                    {/* === ИСПРАВЛЕНО: ТЕПЕРЬ КНОПКА КУПИТЬ ОБЕРНУТА В ФОРМУ И ВЫЗЫВАЕТ ЭКШЕН ГАРАНТА === */}
                    <form action={handleBuy}>
                      <input type="hidden" name="listingId" value={listing.id} />
                      <button type="submit" className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition shadow-sm text-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z" /></svg>
                        Купить товар через Гарант
                      </button>
                    </form>

                    {/* Панель модератора */}
                    {isAdminOrMod && (
                      <form action={handleDelete} className="pt-2 border-t border-[#343536]">
                        <input type="hidden" name="listingId" value={listing.id} />
                        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-xl transition shadow-sm text-sm">
                          Удалить как Модератор
                        </button>
                      </form>
                    )}

                    {/* Форма отправки репорта */}
                    {session?.user && (
                      <form action={handleReport} className="bg-[#0A0A0B] border border-[#343536] rounded-xl p-3 flex flex-col gap-2 mt-4">
                        <input type="hidden" name="listingId" value={listing.id} />
                        <input 
                          type="text" 
                          name="reason" 
                          placeholder="Причина жалобы (минимум 5 символов)..." 
                          required
                          className="w-full bg-[#272729] border border-[#343536] focus:border-gray-500 rounded-lg p-2 text-xs text-gray-200 placeholder-gray-500 outline-none transition-colors"
                        />
                        <button type="submit" className="w-full bg-[#272729] hover:bg-red-600/20 hover:text-red-400 text-gray-400 font-semibold py-1.5 rounded-lg text-xs transition border border-[#343536]">
                          Отправить жалобу на товар
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>

            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}