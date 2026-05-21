import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { updateProfile } from "@/lib/actions/user";

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full">
      
      {/* Навигация */}
      <Link href={`/profile/${user.username}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm font-medium mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Назад к профилю
      </Link>

      {/* Основная карточка настроек */}
      <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-6 sm:p-8 shadow-sm">
        <h1 className="text-xl font-bold text-gray-100 mb-2">Настройки профиля</h1>
        <p className="text-sm text-gray-400 mb-8">Измените информацию о себе и настройки аккаунта.</p>

        <form action={updateProfile} className="space-y-6">
          
          {/* Никнейм */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Никнейм
            </label>
            <input 
              type="text" 
              name="username" 
              defaultValue={user.username}
              required
              className="w-full bg-[#272729] border border-[#343536] focus:border-gray-400 focus:bg-[#1A1A1B] rounded-md p-3 text-sm text-gray-100 outline-none transition-colors" 
            />
          </div>

          {/* Аватарка */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ссылка на аватар (URL)
            </label>
            <input 
              type="url" 
              name="image" 
              defaultValue={user.image || ""}
              placeholder="https://example.com/avatar.png"
              className="w-full bg-[#272729] border border-[#343536] focus:border-gray-400 focus:bg-[#1A1A1B] rounded-md p-3 text-sm text-gray-100 outline-none transition-colors" 
            />
          </div>

          {/* О себе (Bio) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              О себе
            </label>
            <textarea 
              name="bio" 
              rows={4}
              // @ts-ignore
              defaultValue={user.bio || ""}
              placeholder="Расскажите немного о себе..."
              className="w-full bg-[#272729] border border-[#343536] focus:border-gray-400 focus:bg-[#1A1A1B] rounded-md p-3 text-sm text-gray-100 outline-none transition-colors resize-y" 
            />
          </div>

          {/* Кнопка сохранения */}
          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full transition shadow-sm text-sm"
            >
              Сохранить изменения
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}