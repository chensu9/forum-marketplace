// app/market/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import EscrowButton from "@/components/market/escrow-button";
import RoleBadge from "@/components/user/role-badge";

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const resolvedParams = await params;

  const listing = await prisma.listing.findUnique({
    where: { id: resolvedParams.id },
    include: { seller: true }
  });

  if (!listing) notFound();

  // Проверяем, не является ли юзер владельцем товара (чтобы он не купил его сам у себя)
  const isOwner = session?.user?.id === listing.sellerId;

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono">
      <Link href="/market" className="inline-block text-[#4AF626]/60 hover:text-white hover:text-glow transition mb-2 font-bold text-[11px]">
        &lt; RETURN_TO_MARKET
      </Link>

      <div className="border border-[#4AF626]/50 bg-[#0A0A0A]/80 p-6 shadow-[0_0_15px_rgba(74,246,38,0.05)] relative">
        <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-[#4AF626]/30"></div>

        {/* ШАПКА ТОВАРА */}
        <div className="flex justify-between items-start mb-6 border-b border-[#4AF626]/30 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-glow mb-2 uppercase break-all">
              {listing.title}
            </h1>
            <div className="text-[10px] text-[#4AF626]/60 uppercase tracking-widest">
              ITEM_ID: {listing.id}
            </div>
          </div>
          <div className="text-right shrink-0 ml-4">
            <div className="text-[10px] text-[#4AF626]/60 uppercase tracking-widest mb-1">VALUE</div>
            <div className="text-xl font-bold text-[#4AF626] text-glow">{listing.price} RUB</div>
          </div>
        </div>

        {/* ВЫВОД КАРТИНКИ (если есть) */}
        {listing.imageUrl && (
          <div className="mb-6 border border-[#4AF626]/30 max-h-[400px] overflow-hidden group relative flex items-center justify-center bg-[#4AF626]/5">
            <img 
              src={listing.imageUrl} 
              alt={listing.title} 
              className="max-w-full max-h-[400px] object-contain grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* ОПИСАНИЕ ТОВАРА */}
          <div className="md:col-span-2">
            <h3 className="text-[10px] text-[#4AF626]/50 uppercase tracking-widest mb-2 border-b border-[#4AF626]/20 pb-1">
              ~// description_payload
            </h3>
            <p className="text-[#4AF626]/80 text-sm whitespace-pre-wrap leading-relaxed break-words">
              {listing.description}
            </p>
          </div>

          {/* ИНФО О ПРОДАВЦЕ И КНОПКА ПОКУПКИ */}
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] text-[#4AF626]/50 uppercase tracking-widest mb-2 border-b border-[#4AF626]/20 pb-1">
                ~// vendor_info
              </h3>
              <div className="bg-[#4AF626]/5 border border-[#4AF626]/20 p-3">
                <div className="flex items-center mb-2">
                  <Link href={`/profile/${listing.seller.username}`} className="text-white hover:text-glow font-bold uppercase text-sm truncate">
                    usr:{listing.seller.username}
                  </Link>
                  <RoleBadge role={listing.seller.role} />
                </div>
                <div className="text-[10px] text-[#4AF626]/60">
                  Member since: {listing.seller.createdAt.toLocaleDateString("ru-RU")}
                </div>
              </div>
            </div>

            <div>
              {session?.user ? (
                isOwner ? (
                  <div className="border border-[#4AF626]/30 border-dashed text-[#4AF626]/50 p-4 text-center text-[10px] uppercase tracking-widest font-bold">
                    [ THIS_IS_YOUR_LISTING ]
                  </div>
                ) : (
                  // ВЫВОДИМ НАШУ НОВУЮ КНОПКУ ГАРАНТА
                  <EscrowButton listingId={listing.id} />
                )
              ) : (
                <div className="border border-[#4AF626]/30 border-dashed text-[#4AF626]/50 p-4 text-center text-[10px] uppercase tracking-widest font-bold">
                  <Link href="/login" className="text-white hover:underline hover:text-glow transition">RUN login.exe</Link> TO PURCHASE
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}