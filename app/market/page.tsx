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
    <div className="max-w-[1200px] mx-auto space-y-8 font-mono">
      
      {/* CLI Шапка Маркета (Теперь выровнена жестко влево) */}
      <div className="border border-[#4AF626]/30 bg-[#0A0A0A]/80 p-6 shadow-[0_0_15px_rgba(74,246,38,0.03)] flex flex-col md:flex-row justify-between items-start gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-8 h-8 border-r-4 border-t-4 border-[#4AF626]/20"></div>
        
        <div className="text-left flex-1">
          <h2 className="text-2xl font-bold text-white text-glow mb-2 uppercase tracking-wider">~/market</h2>
          <p className="text-xs text-[#4AF626]/60 font-bold">
            Статус: <span className="text-[#4AF626] animate-pulse">ONLINE</span> | Защита активипрована | Всегда проверяйте репутацию продавца перед покупкой
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm font-bold relative z-10 w-full md:w-auto">
          <Link href="/market/orders" className="border border-[#4AF626]/50 text-[#4AF626] px-6 py-2 hover:bg-[#4AF626]/10 transition text-center flex-1 md:flex-none uppercase">
            [ Мои заказы ]
          </Link>
          <Link href="/market/create" className="bg-[#4AF626] text-[#0A0A0A] px-6 py-2 hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] transition text-center flex-1 md:flex-none uppercase">
            &gt; Создать листинг
          </Link>
        </div>
      </div>

      {/* Сетка товаров */}
      {listings.length === 0 ? (
        <div className="text-center text-[#4AF626]/50 py-16 border border-[#4AF626]/30 border-dashed text-lg">
          В МАРКЕТЕ ЕЩЁ НЕТ АКТИВНЫХ ЛИСТИНГОВ
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="border border-[#4AF626]/30 bg-[#0A0A0A]/60 hover:border-[#4AF626] hover:shadow-[0_0_15px_rgba(74,246,38,0.1)] transition-all group flex flex-col relative overflow-hidden">
              
              <div className="absolute top-2 right-2 text-[10px] text-[#4AF626]/80 bg-[#0A0A0A]/90 px-1 border border-[#4AF626]/30 z-10">
                ID:{listing.id.slice(0, 5)}
              </div>

              <Link href={`/market/${listing.id}`} className="flex flex-col flex-grow">
                
                {/* ВЫВОД КАРТИНКИ ИЛИ ЗАГЛУШКИ */}
                <div className="h-40 border-b border-[#4AF626]/30 flex items-center justify-center text-3xl group-hover:bg-[#4AF626]/5 transition overflow-hidden relative">
                  {/* @ts-ignore - игнорируем ошибку TS, пока схема не сгенерируется заново */}
                  {listing.imageUrl ? (
                    <img 
                      src={listing.imageUrl as string} 
                      alt={listing.title} 
                      className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
                    />
                  ) : (
                    <span className="grayscale opacity-50 text-[#4AF626] tracking-widest text-sm font-bold">[ NO_IMG ]</span>
                  )}
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-[#4AF626] group-hover:text-white group-hover:text-glow transition mb-4 leading-snug line-clamp-2">
                    {listing.title}
                  </h3>
                  <p className="text-white font-bold mt-auto text-lg text-glow">
                    VAL: {listing.price} RUB
                  </p>
                </div>
              </Link>

              {/* Футер карточки */}
              <div className="p-3 border-t border-[#4AF626]/20 flex justify-between items-center text-[10px] bg-[#4AF626]/5">
                <Link href={`/profile/${listing.seller.username}`} className="text-[#4AF626]/70 hover:text-white transition uppercase truncate max-w-[100px]">
                  usr: {listing.seller.username}
                </Link>
                <RoleBadge role={listing.seller.role} />
                <Link href={`/market/${listing.id}`} className="text-[#4AF626] hover:text-white transition font-bold tracking-widest shrink-0">
                  [ VIEW ]
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}