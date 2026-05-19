// app/market/create/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createListing } from "@/lib/actions/market";

export default async function CreateListingPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0F0F14] text-white py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/market" className="text-gray-400 hover:text-white transition">
            ← Назад в маркет
          </Link>
          <h1 className="text-2xl font-bold">Разместить объявление</h1>
        </div>

        <form action={createListing} className="nb-card p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Название товара или услуги
            </label>
            <input
              type="text"
              name="title"
              required
              className="w-full bg-[#1A1A22] border border-gray-800 rounded-lg p-3 text-white focus:border-[#A855F7] outline-none transition"
              placeholder="Например: Дизайн логотипа / Ключ Steam"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Описание
            </label>
            <textarea
              name="description"
              required
              rows={6}
              className="w-full bg-[#1A1A22] border border-gray-800 rounded-lg p-3 text-white focus:border-[#A855F7] outline-none transition resize-y"
              placeholder="Подробно опишите, что вы продаете..."
            />
          </div>
{/* Поле для Картинки Товара */}
          <div>
            <label className="block text-[10px] text-[#4AF626]/70 mb-2 uppercase tracking-widest">
              ITEM_IMAGE_URL (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-[#4AF626]/50 font-bold">&gt;</span>
              <input 
                type="url" 
                name="imageUrl" 
                placeholder="https://example.com/image.png"
                className="w-full bg-[#4AF626]/5 border border-[#4AF626]/30 p-3 pl-8 text-sm text-[#4AF626] focus:border-[#4AF626] focus:shadow-[0_0_10px_rgba(74,246,38,0.1)] outline-none transition-all placeholder:text-[#4AF626]/30" 
              />
            </div>
            <p className="text-[9px] text-[#4AF626]/40 mt-2 uppercase tracking-widest">
              * Paste direct image link.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Цена (₽)
            </label>
            <input
              type="number"
              name="price"
              min="0"
              step="1"
              required
              className="w-full bg-[#1A1A22] border border-gray-800 rounded-lg p-3 text-white focus:border-[#A855F7] outline-none transition"
              placeholder="999"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="nb-button-primary px-8">
              Опубликовать товар
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}