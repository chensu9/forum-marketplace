// app/market/orders/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { updateOrderStatus } from "@/lib/actions/order";

// Вспомогательная функция для перевода статусов
const translateStatus = (status: string) => {
  const statuses: Record<string, { text: string, color: string }> = {
    PENDING: { text: "Ожидает", color: "text-yellow-500 bg-yellow-500/10" },
    IN_PROGRESS: { text: "В работе", color: "text-blue-500 bg-blue-500/10" },
    COMPLETED: { text: "Завершён", color: "text-green-500 bg-green-500/10" },
    CANCELLED: { text: "Отменён", color: "text-red-500 bg-red-500/10" },
  };
  return statuses[status] || { text: status, color: "text-gray-500 bg-gray-500/10" };
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Получаем покупки (где юзер = покупатель)
  const purchases = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: { listing: true, seller: true },
    orderBy: { createdAt: "desc" },
  });

  // Получаем продажи (где юзер = продавец)
  const sales = await prisma.order.findMany({
    where: { sellerId: session.user.id },
    include: { listing: true, buyer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#0F0F14] text-white py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/market" className="text-gray-400 hover:text-white transition">
            ← Вернуться в маркет
          </Link>
          <h1 className="text-2xl font-bold">Мои заказы</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* КОЛОНКА 1: МОИ ПОКУПКИ */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b border-gray-800 pb-2">Мои покупки</h2>
            {purchases.length === 0 ? (
              <p className="text-gray-500 text-sm">Вы еще ничего не купили.</p>
            ) : (
              purchases.map(order => {
                const status = translateStatus(order.status);
                return (
                  <div key={order.id} className="nb-card p-5">
                    <div className="flex justify-between items-start mb-3">
                      <Link href={`/market/${order.listingId}`} className="font-semibold hover:text-[#A855F7] transition">
                        {order.listing.title}
                      </Link>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mb-4">
                      Продавец: <Link href={`/profile/${order.seller.username}`} className="text-[#A855F7] hover:underline">{order.seller.username}</Link>
                      <span className="mx-2">•</span>
                      Цена: {order.price} ₽
                    </div>
                    
                    {/* Кнопка для покупателя: Завершить заказ */}
                    {order.status === "IN_PROGRESS" && (
                      <form action={updateOrderStatus}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="status" value="COMPLETED" />
                        <button type="submit" className="w-full text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 py-2 rounded transition">
                          Подтвердить выполнение
                        </button>
                      </form>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* КОЛОНКА 2: МОИ ПРОДАЖИ */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b border-gray-800 pb-2">Мои продажи</h2>
            {sales.length === 0 ? (
              <p className="text-gray-500 text-sm">У вас еще ничего не купили.</p>
            ) : (
              sales.map(order => {
                const status = translateStatus(order.status);
                return (
                  <div key={order.id} className="nb-card p-5 border-[#A855F7]/20 border">
                    <div className="flex justify-between items-start mb-3">
                      <Link href={`/market/${order.listingId}`} className="font-semibold hover:text-[#A855F7] transition">
                        {order.listing.title}
                      </Link>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mb-4">
                      Покупатель: <Link href={`/profile/${order.buyer.username}`} className="text-white hover:underline">{order.buyer.username}</Link>
                      <span className="mx-2">•</span>
                      Заработок: <span className="text-[#A855F7] font-bold">{order.price} ₽</span>
                    </div>

                    {/* Кнопки для продавца: Взять в работу или Отменить */}
                    {order.status === "PENDING" && (
                      <div className="flex gap-2">
                        <form action={updateOrderStatus} className="flex-1">
                          <input type="hidden" name="orderId" value={order.id} />
                          <input type="hidden" name="status" value="IN_PROGRESS" />
                          <button type="submit" className="w-full text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 py-2 rounded transition">
                            Взять в работу
                          </button>
                        </form>
                        <form action={updateOrderStatus} className="flex-1">
                          <input type="hidden" name="orderId" value={order.id} />
                          <input type="hidden" name="status" value="CANCELLED" />
                          <button type="submit" className="w-full text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 py-2 rounded transition">
                            Отменить
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
}