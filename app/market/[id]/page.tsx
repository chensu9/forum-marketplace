import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";

export default async function SingleListingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const resolvedParams = await params;
  
  const listing = await prisma.listing.findUnique({
    where: { id: resolvedParams.id },
    include: { seller: true },
  });

  if (!listing) notFound();

  return (
    <div className="max-w-4xl mx-auto font-mono space-y-6">
      
      <Link href="/market" className="inline-block text-[#4AF626]/60 hover:text-white hover:text-glow transition mb-2 font-bold text-sm">
        &lt; RETURN_TO_MARKET
      </Link>

      <div className="border border-[#4AF626]/50 bg-[#0A0A0A]/80 p-6 shadow-[0_0_15px_rgba(74,246,38,0.05)]">
        
        {/* Заголовок товара */}
        <div className="border-b border-[#4AF626]/30 pb-4 mb-6">
          <div className="text-[10px] text-[#4AF626]/50 uppercase tracking-widest mb-2">ITEM_ID: {listing.id}</div>
          {/* === ДОБАВИТЬ ЭТОТ БЛОК === */}
        {/* @ts-ignore */}
        {listing.imageUrl && (
          <div className="mb-6 border border-[#4AF626]/30 max-h-[400px] overflow-hidden group">
            <img 
               // @ts-ignore
              src={listing.imageUrl} 
              alt={listing.title} 
              className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
            />
          </div>
        )}
        {/* ========================== */}
          <h1 className="text-3xl font-bold text-white text-glow tracking-wide uppercase mb-2">
            {listing.title}
          </h1>
          <div className="inline-block bg-[#4AF626]/10 border border-[#4AF626]/50 px-3 py-1 text-[#4AF626] font-bold text-sm">
            STATUS: {listing.isActive ? "AVAILABLE" : "SOLD_OUT"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Главная колонка с описанием */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="text-xs text-[#4AF626]/60 uppercase tracking-widest mb-2 border-b border-[#4AF626]/20 pb-1 w-fit">~// item_description</div>
              <p className="text-[#4AF626]/80 whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>
            </div>
          </div>

          {/* Боковая панель транзакции */}
          <div className="border border-[#4AF626]/30 bg-[#4AF626]/5 p-5 h-fit space-y-6">
            <div>
              <div className="text-xs text-[#4AF626]/60 uppercase tracking-widest mb-1">VALUE</div>
              <div className="text-2xl font-bold text-white text-glow">{listing.price} RUB</div>
            </div>

            <div className="border-t border-[#4AF626]/20 pt-4">
              <div className="text-xs text-[#4AF626]/60 uppercase tracking-widest mb-2">SELLER_NODE</div>
              <Link href={`/profile/${listing.seller.username}`} className="flex items-center gap-3 group">
                <div className="w-8 h-8 border border-[#4AF626]/50 bg-[#0A0A0A] flex items-center justify-center text-[#4AF626] font-bold group-hover:bg-[#4AF626] group-hover:text-[#0A0A0A] transition">
                  {listing.seller.username[0].toUpperCase()}
                </div>
                <span className="text-white text-glow font-bold group-hover:underline">usr: {listing.seller.username}</span>
              </Link>
            </div>

            <div className="pt-2">
              {session?.user?.id === listing.sellerId ? (
                <button className="w-full border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-[#0A0A0A] py-2 text-sm font-bold tracking-widest transition">
                  [ EDIT_ITEM ]
                </button>
              ) : (
                <button className="w-full border border-[#4AF626] bg-[#4AF626] text-[#0A0A0A] hover:bg-white hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] py-2 text-sm font-bold tracking-widest transition uppercase">
                  &gt; INITIATE_TRADE
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}