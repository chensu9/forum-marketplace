// app/market/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { createOrder } from "@/lib/actions/order";

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();

  // Ищем товар в базе
  const listing = await prisma.listing.findUnique({
    where: { id: resolvedParams.id },
    include: { seller: true },
  });

  if (!listing) notFound();

  const isOwner = session?.user?.id === listing.sellerId;

  return (
    <div className="min-h-screen bg-[#0F0F14] text-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <Link href="/market" className="inline-block text-gray-400 hover:text-white transition mb-4">
          ← Вернуться в маркет
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ЛЕВАЯ ЧАСТЬ: Описание товара */}
          <div className="md:col-span-2 space-y-6">
            <div className="nb-card p-6 md:p-8">
              <div className="h-64 bg-[#1A1A22] rounded-lg mb-6 flex items-center justify-center border border-gray-800 text-6xl">
                🛒
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{listing.title}</h1>
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </div>
            </div>
          </div>

          {/* ПРАВАЯ ЧАСТЬ: Панель покупки и инфо о продавце */}
          <div className="space-y-6">
            <div className="nb-card p-6 border-[#A855F7]/30 border">
              <div className="text-3xl font-bold text-[#A855F7] mb-6">
                {listing.price} ₽
              </div>

              {isOwner ? (
                <div className="bg-[#1A1A22] text-center p-3 rounded-lg text-gray-400 text-sm border border-gray-800">
                  Это ваше объявление
                </div>
              ) : (
                <form action={createOrder}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <input type="hidden" name="sellerId" value={listing.sellerId} />
                  <input type="hidden" name="price" value={listing.price.toString()} />
                  
                  {session?.user ? (
                    <button type="submit" className="w-full bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold py-3 rounded-lg transition shadow-lg shadow-purple-500/20">
                      Купить сейчас
                    </button>
                  ) : (
                    <Link href="/login" className="block text-center w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition">
                      Войти для покупки
                    </Link>
                  )}
                </form>
              )}
            </div>

            <div className="nb-card p-6">
              <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4 font-semibold">Продавец</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#A855F7] to-purple-900 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                  {listing.seller.username[0].toUpperCase()}
                </div>
                <div>
                  <Link href={`/profile/${listing.seller.username}`} className="font-bold text-lg hover:text-[#A855F7] transition">
                    {listing.seller.username}
                  </Link>
                  <div className="text-xs text-gray-400">
                    Репутация: {listing.seller.reputation}
                  </div>
                </div>
              </div>
              <Link href={`/profile/${listing.seller.username}`} className="block text-center w-full bg-[#1A1A22] hover:bg-gray-800 border border-gray-700 text-white py-2 rounded-lg text-sm transition">
                Профиль продавца
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}