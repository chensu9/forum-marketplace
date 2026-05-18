// app/market/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";

export default async function MarketPage() {
  const session = await auth();

  // Достаем все активные объявления из БД вместе с продавцами
  const listings = await prisma.listing.findMany({
    where: { isActive: true },
    include: {
      seller: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#0F0F14] text-white font-sans">
      
      {/* ХЕДЕР (Копия с главной, но активен таб "Маркет") */}
      <header className="sticky top-0 z-50 bg-[#1E1E28]/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-wide cursor-pointer">
              <span className="text-[#A855F7]">MARKET</span>FORUM
            </Link>
            
            <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
              <Link href="/" className="hover:text-white transition cursor-pointer">Темы</Link>
              <span className="hover:text-white transition cursor-pointer">Пользователи</span>
              <span className="text-white border-b-2 border-[#A855F7] py-5 cursor-pointer">Маркет</span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
  <Link href="/market/orders" className="text-sm font-medium text-gray-400 hover:text-white transition">
    Мои заказы
  </Link>
  <Link href="/market/create" className="bg-[#A855F7] hover:bg-[#9333EA] text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
    + Продать
  </Link>
</div>
        </div>
      </header>

      {/* СЕТКА ТОВАРОВ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Маркетплейс</h1>
            <p className="text-sm text-gray-400">Покупайте и продавайте товары безопасно</p>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="text-center text-gray-500 py-20 nb-card">
            Пока нет ни одного объявления. Станьте первым продавцом!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="nb-card flex flex-col hover:border-[#A855F7] transition overflow-hidden">
                
                {/* Заглушка для картинки */}
                <div key={listing.id} className="nb-card flex flex-col hover:border-[#A855F7] transition overflow-hidden">
  
  <Link href={`/market/${listing.id}`} className="flex flex-col flex-grow">
    {/* Заглушка для картинки */}
    <div className="h-40 bg-[#1A1A22] flex items-center justify-center text-4xl border-b border-gray-800">
      🛒
    </div>
    
    <div className="p-4 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg leading-tight line-clamp-2">
          {listing.title}
        </h3>
      </div>
      
      <p className="text-sm text-[#A855F7] font-bold mb-4">
        {listing.price} ₽
      </p>
    </div>
  </Link>
  
  {/* Футер карточки с продавцом (отдельно от ссылки на товар) */}
  <div className="px-4 pb-4 mt-auto">
    <div className="flex items-center justify-between border-t border-gray-800 pt-3">
      <Link href={`/profile/${listing.seller.username}`} className="text-xs text-gray-400 hover:text-white transition flex items-center gap-2">
        <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center text-[#A855F7] font-bold text-[10px]">
          {listing.seller.username[0].toUpperCase()}
        </div>
        {listing.seller.username}
      </Link>
      
      <Link href={`/market/${listing.id}`} className="text-xs bg-[#1A1A22] hover:bg-[#A855F7] text-white px-3 py-1.5 rounded transition">
        Подробнее
      </Link>
    </div>
  </div>

</div>

              </div>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}