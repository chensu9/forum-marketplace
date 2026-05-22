import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { updateListing } from "@/lib/actions/market"; // Подключим экшен на следующем шаге

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const resolvedParams = await params;
  
  const listing = await prisma.listing.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!listing) notFound();
  
  // Защита: только владелец может редактировать
  if (listing.sellerId !== session.user.id) {
    redirect(`/market/${listing.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full">
      <Link href={`/market/${listing.id}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm font-medium mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Назад к товару
      </Link>

      <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-6 sm:p-8 shadow-sm">
        <h1 className="text-xl font-bold text-gray-100 mb-6">Редактирование товара</h1>

        {/* Важно: encType нужен для отправки файлов */}
        <form action={updateListing} encType="multipart/form-data" className="space-y-6">
          <input type="hidden" name="listingId" value={listing.id} />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Название</label>
            <input type="text" name="title" defaultValue={listing.title} required className="w-full bg-[#272729] border border-[#343536] focus:border-gray-400 focus:bg-[#1A1A1B] rounded-md p-3 text-sm text-gray-100 outline-none transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Цена (₽)</label>
            <input type="number" name="price" defaultValue={listing.price} required className="w-full bg-[#272729] border border-[#343536] focus:border-gray-400 focus:bg-[#1A1A1B] rounded-md p-3 text-sm text-gray-100 outline-none transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Описание</label>
            {/* @ts-ignore */}
            <textarea name="description" rows={6} required defaultValue={listing.description || ""} className="w-full bg-[#272729] border border-[#343536] focus:border-gray-400 focus:bg-[#1A1A1B] rounded-md p-3 text-sm text-gray-100 outline-none transition-colors resize-y" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Фотография товара</label>
            <div className="flex items-center gap-4">
              {/* @ts-ignore */}
              {listing.imageUrl && (
                <div className="w-16 h-16 rounded-md bg-[#272729] border border-[#343536] overflow-hidden shrink-0">
                  {/* @ts-ignore */}
                  <img src={listing.imageUrl as string} alt="Current" className="w-full h-full object-cover" />
                </div>
              )}
              <input 
                type="file" 
                name="imageFile" 
                accept="image/*"
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#272729] file:text-gray-200 hover:file:bg-[#343536] file:transition-colors file:cursor-pointer cursor-pointer"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Оставьте пустым, если не хотите менять текущую картинку.</p>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#343536]">
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full transition shadow-sm text-sm">
              Сохранить изменения
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}