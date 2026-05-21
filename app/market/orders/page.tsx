import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { confirmDelivery, cancelEscrow } from "@/lib/actions/market";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: { listing: true, seller: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 w-full">
      
      {/* Навигация */}
      <Link href="/market" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm font-medium mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Вернуться в маркет
      </Link>

      <div className="bg-[#1A1A1B] border border-[#343536] rounded-md overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#343536]">
          <h1 className="text-xl font-bold text-gray-100">Ваши покупки</h1>
          <p className="text-sm text-gray-400 mt-1">История ваших сделок</p>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            У вас пока нет активных покупок.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#272729] text-gray-400 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Товар</th>
                  <th className="px-6 py-4 font-semibold">Продавец</th>
                  <th className="px-6 py-4 font-semibold">Сумма</th>
                  <th className="px-6 py-4 font-semibold">Статус</th>
                  <th className="px-6 py-4 font-semibold text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#343536]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#272729]/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-100">
                      <Link href={`/market/${order.listingId}`} className="hover:underline">
                        {order.listing.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/profile/${order.seller.username}`} className="text-gray-400 hover:text-white transition">
                        {order.seller.username}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-semibold">{order.price} ₽</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' : 
                        order.status === 'IN_PROGRESS' ? 'bg-yellow-500/10 text-yellow-400' : 
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {order.status === 'COMPLETED' ? 'Завершено' : 
                         order.status === 'IN_PROGRESS' ? 'В процессе' : 'Отменено'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      {order.status === 'IN_PROGRESS' ? (
                        <div className="flex justify-end gap-2">
                          <form action={async () => { "use server"; await confirmDelivery(order.id); }}>
                            <button className="text-xs font-semibold bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded transition">
                              Подтвердить
                            </button>
                          </form>
                          <form action={async () => { "use server"; await cancelEscrow(order.id); }}>
                            <button className="text-xs font-semibold bg-[#272729] hover:bg-[#343536] border border-[#343536] text-gray-300 px-3 py-1.5 rounded transition">
                              Отмена
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Нет действий</span>
                      )}
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