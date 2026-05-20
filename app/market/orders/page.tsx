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
    <div className="max-w-5xl mx-auto font-mono space-y-6">
      
      <div className="flex justify-between items-end mb-2">
        <Link href="/market" className="text-[#4AF626]/60 hover:text-white hover:text-glow transition font-bold text-[11px]">
          &lt; RETURN_TO_MARKET
        </Link>
        <div className="text-[10px] text-[#4AF626]/50 tracking-widest uppercase">
          ESCURE_ESCROW_CONNECTION: ESTABLISHED
        </div>
      </div>

      <div className="border border-[#4AF626]/50 bg-[#0A0A0A]/80 p-6 shadow-[0_0_15px_rgba(74,246,38,0.05)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-[#4AF626]/30"></div>

        <h1 className="text-xl font-bold text-white text-glow uppercase tracking-widest mb-2 flex items-center gap-2">
          ~// financial_logs : purchases
        </h1>
        <p className="text-[#4AF626]/60 text-xs mb-8 uppercase tracking-widest">
          NODE: {session.user.username} | TOTAL_RECORDS: {orders.length}
        </p>

        {orders.length === 0 ? (
          <div className="border border-dashed border-[#4AF626]/30 p-8 text-center text-[#4AF626]/40 text-sm tracking-widest">
            _NO_PURCHASE_HISTORY_FOUND_
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#4AF626]">
              <thead className="text-[10px] uppercase text-[#4AF626]/60 border-b border-[#4AF626]/30">
                <tr>
                  <th className="pb-3 font-bold tracking-widest">TX_ID</th>
                  <th className="pb-3 font-bold tracking-widest">Item_Name</th>
                  <th className="pb-3 font-bold tracking-widest">Seller</th>
                  <th className="pb-3 font-bold tracking-widest">Value</th>
                  <th className="pb-3 font-bold tracking-widest">Status</th>
                  <th className="pb-3 font-bold tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4AF626]/10">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#4AF626]/5 transition-colors group">
                    <td className="py-4 pr-4 font-bold text-[#4AF626]/50">{order.id.slice(0, 8)}</td>
                    <td className="py-4 pr-4 font-bold text-white group-hover:text-glow truncate max-w-[200px]">
                      <Link href={`/market/${order.listingId}`}>{order.listing.title}</Link>
                    </td>
                    <td className="py-4 pr-4">
                      <Link href={`/profile/${order.seller.username}`} className="hover:text-white transition">
                        usr:{order.seller.username}
                      </Link>
                    </td>
                    <td className="py-4 pr-4 font-bold">{order.price} RUB</td>
                    <td className="py-4 pr-4">
                      <span className={`px-2 py-1 text-[9px] font-bold uppercase border ${
                        order.status === 'COMPLETED' ? 'border-green-500 text-green-500 bg-green-500/10' : 
                        order.status === 'IN_PROGRESS' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10 animate-pulse' : 
                        'border-red-500 text-red-500 bg-red-500/10'
                      }`}>
                        [{order.status}]
                      </span>
                    </td>
                    
                    {/* КНОПКИ УПРАВЛЕНИЯ СДЕЛКОЙ */}
                    <td className="py-4 text-right">
                      {order.status === 'IN_PROGRESS' && (
                        <div className="flex justify-end gap-2 flex-wrap">
                          <form action={async () => { "use server"; await confirmDelivery(order.id); }}>
                            <button className="text-[9px] border border-[#4AF626] text-[#4AF626] px-2 py-1 hover:bg-[#4AF626] hover:text-[#0A0A0A] font-bold uppercase transition tracking-widest">
                              [ CONFIRM_RCV ]
                            </button>
                          </form>
                          <form action={async () => { "use server"; await cancelEscrow(order.id); }}>
                            <button className="text-[9px] border border-red-500/50 text-red-500 px-2 py-1 hover:bg-red-500 hover:text-[#0A0A0A] font-bold uppercase transition tracking-widest">
                              [ ABORT ]
                            </button>
                          </form>
                        </div>
                      )}
                      {order.status !== 'IN_PROGRESS' && (
                        <span className="text-[9px] text-[#4AF626]/40 uppercase tracking-widest">_LOCKED_</span>
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