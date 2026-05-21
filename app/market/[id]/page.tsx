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

  // Проверяем, не является ли юзер владельцем товара
  const isOwner = session?.user?.id === listing.sellerId;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 w-full">
      
      {/* Кнопка назад */}
      <Link href="/market" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm font-medium mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Вернуться в маркет
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 items-start">
        
        {/* ======================================= */}
        {/* ЛЕВАЯ КОЛОНКА: ФОТО И ОПИСАНИЕ */}
        {/* ======================================= */}
        <div className="space-y-6">
          <div className="bg-[#1A1A1B] border border-[#343536] rounded-md overflow-hidden">
            
            {/* Блок картинки */}
            {listing.imageUrl ? (
              <div className="w-full bg-[#0A0A0B] flex items-center justify-center border-b border-[#343536]">
                <img 
                  src={listing.imageUrl} 
                  alt={listing.title} 
                  className="max-h-[500px] w-auto object-contain"
                />
              </div>
            ) : (
               <div className="w-full h-64 bg-[#272729] flex items-center justify-center border-b border-[#343536] text-gray-500">
                 <svg className="w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               </div>
            )}
            
            {/* Текст описания */}
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-100 mb-4 border-b border-[#343536] pb-2">
                Описание товара
              </h2>
              <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed break-words">
                {listing.description}
              </p>
            </div>
          </div>
        </div>

        {/* ======================================= */}
        {/* ПРАВАЯ КОЛОНКА: ЦЕНА, ПОКУПКА, ПРОДАВЕЦ */}
        {/* ======================================= */}
        <div className="space-y-6 md:sticky md:top-20">
          
          {/* Карточка покупки */}
          <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-100 mb-2 break-words leading-tight">
              {listing.title}
            </h1>
            <div className="text-xs text-gray-500 font-mono mb-6 bg-[#272729] w-fit px-2 py-1 rounded">
              ID: {listing.id.split('-')[0]}
            </div>

            <div className="text-3xl font-black text-white mb-6">
              {listing.price} <span className="text-blue-500 text-2xl">₽</span>
            </div>

            {/* Логика отображения кнопок */}
            <div className="w-full">
              {session?.user ? (
                isOwner ? (
                  <div className="w-full bg-[#272729]/50 text-gray-400 py-3 rounded-md text-center text-sm font-bold border border-[#343536] border-dashed">
                    Это ваше объявление
                  </div>
                ) : (
                  // Оборачиваем старую кнопку, чтобы она растянулась на 100%
                  <div className="[&>button]:w-full [&>button]:py-3 [&>button]:text-sm [&>button]:rounded-md [&>button]:font-bold shadow-sm">
                    <EscrowButton listingId={listing.id} />
                  </div>
                )
              ) : (
                <Link href="/login" className="block w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-md text-center text-sm font-bold transition shadow-sm">
                  Войти для покупки
                </Link>
              )}
            </div>
          </div>

          {/* Карточка продавца */}
          <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-[#343536] pb-2">
              Информация о продавце
            </h3>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-tr from-gray-600 to-gray-500 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0">
                {listing.seller.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <Link href={`/profile/${listing.seller.username}`} className="font-bold text-gray-200 hover:underline text-base truncate flex items-center gap-1.5 mb-0.5">
                  {listing.seller.username}
                  <RoleBadge role={listing.seller.role} />
                </Link>
                <div className="text-xs text-gray-500">
                  На сайте с {listing.seller.createdAt.toLocaleDateString("ru-RU")}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}