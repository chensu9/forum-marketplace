import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";
import RoleBadge from "@/components/user/role-badge";

export default async function MarketPage() {
  const session = await auth();

  const listings = await prisma.listing.findMany({
    where: { isActive: true },
    include: { seller: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 w-full">
      
      {/* Шапка Маркета */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Маркетплейс</h1>
          <p className="text-sm text-gray-400 mt-1">
            Покупайте и продавайте товары безопасно.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/market/orders" className="bg-[#272729] hover:bg-[#343536] text-gray-200 text-sm font-semibold px-4 py-2 rounded-full transition border border-[#343536]">
            Мои заказы
          </Link>
          <Link href="/market/create" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-full transition flex items-center gap-2 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Создать объявление
          </Link>
        </div>
      </div>

      {/* Сетка товаров */}
      {listings.length === 0 ? (
        <div className="bg-[#1A1A1B] border border-[#343536] rounded-md py-16 text-center text-gray-500 text-sm">
          В маркете пока нет active объявлений.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-[#1A1A1B] border border-[#343536] hover:border-gray-500 rounded-md transition-colors group flex flex-col overflow-hidden shadow-sm hover:shadow-md">
              
              <Link href={`/market/${listing.id}`} className="flex flex-col flex-grow">
                
                {/* Зона картинки */}
                <div className="h-44 sm:h-48 bg-[#272729] border-b border-[#343536] flex items-center justify-center relative overflow-hidden">
                  {/* @ts-ignore */}
                  {listing.imageUrl ? (
                    <img 
                      src={listing.imageUrl as string} 
                      alt={listing.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    // Иконка-заглушка, если нет картинки
                    <svg className="w-12 h-12 text-[#343536]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  {/* Бейдж ID */}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-gray-300 text-[10px] px-2 py-1 rounded font-mono border border-white/10">
                    #{listing.id.slice(0, 5)}
                  </div>
                </div>
                
                {/* Текст и цена */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-semibold text-gray-200 group-hover:text-blue-400 transition-colors mb-3 line-clamp-2 text-sm leading-snug">
                    {listing.title}
                  </h3>
                  <div className="mt-auto">
                    <span className="text-lg font-bold text-gray-100">
                      {listing.price} ₽
                    </span>
                  </div>
                </div>
              </Link>

              {/* Подвал карточки: Информация о продавце (ОБНОВЛЕНО) */}
              <div className="px-4 py-3 border-t border-[#343536] flex items-center justify-between bg-[#272729]/30">
                <Link href={`/profile/${listing.seller.username}`} className="flex items-center gap-2 hover:opacity-80 transition max-w-[70%]\">
                  
                  {/* === ВЫВОД РЕАЛЬНОЙ АВАТАРКИ ПРОДАВЦА === */}
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-gray-600 to-gray-500 shrink-0 flex items-center justify-center text-[9px] font-bold text-white uppercase overflow-hidden border border-[#343536]">
                    {listing.seller.image ? (
                      <img src={listing.seller.image} alt={listing.seller.username} className="w-full h-full object-cover" />
                    ) : (
                      listing.seller.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  <span className="text-xs text-gray-400 truncate font-medium hover:underline">
                    {listing.seller.username}
                  </span>
                </Link>
                <RoleBadge role={listing.seller.role} />
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}