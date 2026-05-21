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
    <div className="max-w-2xl mx-auto px-4 py-8 w-full">
      
      {/* Заголовок */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/market" className="text-gray-400 hover:text-white transition">
          ← Назад в маркет
        </Link>
        <h1 className="text-xl font-bold text-gray-100">Разместить объявление</h1>
      </div>

      <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-6 shadow-sm">
        <form action={createListing} className="space-y-6">
          
          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Название товара или услуги
            </label>
            <input
              type="text"
              name="title"
              required
              className="w-full bg-[#272729] border border-[#343536] hover:border-gray-500 focus:border-gray-300 rounded-md p-3 text-sm text-gray-100 outline-none transition-colors"
              placeholder="Например: Дизайн логотипа / Ключ Steam"
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Описание
            </label>
            <textarea
              name="description"
              required
              rows={6}
              className="w-full bg-[#272729] border border-[#343536] hover:border-gray-500 focus:border-gray-300 rounded-md p-3 text-sm text-gray-100 outline-none transition-colors resize-y"
              placeholder="Подробно опишите, что вы продаете..."
            />
          </div>

          {/* Картинка */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ссылка на изображение
            </label>
            <input 
              type="url" 
              name="imageUrl" 
              placeholder="https://example.com/image.png"
              className="w-full bg-[#272729] border border-[#343536] hover:border-gray-500 focus:border-gray-300 rounded-md p-3 text-sm text-gray-100 outline-none transition-colors" 
            />
            <p className="text-xs text-gray-500 mt-2">
              * Рекомендуемый размер: 600x400px. Поддерживаются JPG, PNG, GIF.
            </p>
          </div>

          {/* Цена */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Цена (₽)
            </label>
            <input
              type="number"
              name="price"
              min="0"
              step="1"
              required
              className="w-full bg-[#272729] border border-[#343536] hover:border-gray-500 focus:border-gray-300 rounded-md p-3 text-sm text-gray-100 outline-none transition-colors"
              placeholder="0"
            />
          </div>

          {/* Кнопка */}
          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-md transition shadow-sm text-sm"
            >
              Опубликовать товар
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}