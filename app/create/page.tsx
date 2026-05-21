import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createPost } from "@/lib/actions/post";
import Link from "next/link";

export default async function CreatePostPage() {
  const session = await auth();
  
  // Если не авторизован - выкидываем на логин
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full">
      
      {/* Заголовок страницы */}
      <div className="flex items-center justify-between mb-6 border-b border-[#343536] pb-4">
        <h1 className="text-xl font-bold text-gray-100">
          Создать пост
        </h1>
        <div className="text-xs text-gray-500 font-medium bg-[#272729] px-3 py-1 rounded-full">
          Автор: {session.user.username}
        </div>
      </div>

      <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-4 sm:p-6 shadow-sm">
        
        <form action={createPost} className="space-y-4">
          
          {/* Поле: Заголовок */}
          <div>
            <input 
              type="text" 
              name="title" 
              required 
              maxLength={300}
              placeholder="Заголовок"
              className="w-full bg-transparent border border-[#343536] hover:border-gray-500 focus:border-gray-300 focus:bg-[#1A1A1B] rounded-md p-3 text-gray-100 font-semibold placeholder-gray-500 outline-none transition-colors" 
            />
          </div>

          {/* Поле: Текст поста */}
          <div>
            <textarea 
              name="content" 
              required 
              rows={10} 
              placeholder="Текст поста..."
              className="w-full bg-[#272729]/50 border border-[#343536] hover:border-gray-500 focus:border-gray-300 focus:bg-[#272729] rounded-md p-3 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors resize-y leading-relaxed" 
            />
          </div>

          {/* Поле: Теги */}
          <div>
            <input 
              type="text" 
              name="tags" 
              placeholder="Теги (через запятую, например: tech, news, games)"
              className="w-full bg-transparent border border-[#343536] hover:border-gray-500 focus:border-gray-300 rounded-md p-3 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors" 
            />
          </div>

          {/* Панель кнопок (Отмена / Опубликовать) */}
          <div className="flex items-center justify-end pt-4 gap-3">
            <Link 
              href="/" 
              className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-gray-200 transition"
            >
              Отмена
            </Link>
            <button 
              type="submit" 
              className="bg-gray-200 hover:bg-white text-black px-6 py-2 text-sm font-bold rounded-full transition shadow-sm"
            >
              Опубликовать
            </button>
          </div>

        </form>
      </div>

      {/* Небольшая подсказка по правилам под формой */}
      <div className="mt-6 bg-[#272729]/50 border border-[#343536] rounded-md p-4 text-xs text-gray-400 space-y-2">
        <p className="font-semibold text-gray-300 mb-1">Правила публикации:</p>
        <p>1. Убедитесь, что заголовок отражает суть поста.</p>
        <p>2. Будьте вежливы и уважайте других пользователей.</p>
        <p>3. Используйте подходящие теги для лучшего поиска.</p>
      </div>

    </div>
  );
}