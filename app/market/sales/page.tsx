// app/market/sales/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SalesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Достаем продажи текущего юзера
  const sales = await prisma.order.findMany({
    where: { sellerId: session.user.id },
    include: { listing: true, buyer: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-5xl mx-auto font-mono space-y-6">
      
      <div className="flex justify-between items-end mb-2">
        <Link href="/market" className="text-[#4AF626]/60 hover:text-white hover:text-glow transition font-bold text-[11px]">
          &lt; ВЕРНУТСЯ В МАРКЕТ
        </Link>
        <div className="text-[10px] text-yellow-500/80 tracking-widest uppercase">
          АКТИВНЫЕ ПРОДАЖИ
        </div>
      </div>

      <div className="border border-[#4AF626]/50 bg-[#0A0A0A]/80 p-6 shadow-[0_0_15px_rgba(74,246,38,0.05)] relative">
        <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-yellow-500/30"></div>

        <h1 className="text-xl font-bold text-white text-glow uppercase tracking-widest mb-2">
          ~// financial_logs : ПРОДАЖИ
        </h1>
        <p className="text-[#4AF626]/60 text-xs mb-8 uppercase tracking-widest">
          NODE: {session.user.username} | ВСЕГО ПРОДАЖ: {sales.length}
        </p>

        {sales.length === 0 ? (
          <div className="border border-dashed border-[#4AF626]/30 p-8 text-center text-[#4AF626]/40 text-sm tracking-widest">
            У ВАС ЕЩЁ НЕТ ПРОДАЖ
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#4AF626]">
              <thead className="text-[10px] uppercase text-[#4AF626]/60 border-b border-[#4AF626]/30">
                <tr>
                  <th className="pb-3 font-bold tracking-widest">ID</th>
                  <th className="pb-3 font-bold tracking-widest">Название товара</th>
                  <th className="pb-3 font-bold tracking-widest">Покупатель</th>
                  <th className="pb-3 font-bold tracking-widest">Доход (₽)</th>
                  <th className="pb-3 font-bold tracking-widest">Статус</th>
                  <th className="pb-3 font-bold tracking-widest text-right">Временная метка</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4AF626]/10">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-[#4AF626]/5 transition-colors group">
                    <td className="py-4 pr-4 font-bold text-[#4AF626]/50">{sale.id.slice(0, 8)}...</td>
                    <td className="py-4 pr-4 font-bold text-white group-hover:text-glow truncate max-w-[200px]">
                      <Link href={`/market/${sale.listingId}`}>{sale.listing.title}</Link>
                    </td>
                    <td className="py-4 pr-4">
                      <Link href={`/profile/${sale.buyer.username}`} className="hover:text-white transition">
                        usr:{sale.buyer.username}
                      </Link>
                    </td>
                    <td className="py-4 pr-4 font-bold text-yellow-500">+{sale.listing.price}</td>
                    <td className="py-4 pr-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase border ${
                        sale.status === 'COMPLETED' ? 'border-green-500 text-green-500' : 
                        sale.status === 'PENDING' ? 'border-yellow-500 text-yellow-500' : 
                        'border-red-500 text-red-500'
                      }`}>
                        [{sale.status}]
                      </span>
                    </td>
                    <td className="py-4 text-right text-xs text-[#4AF626]/50">
                      {sale.createdAt.toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}