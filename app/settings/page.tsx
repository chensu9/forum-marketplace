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
        <p className="text-sm text-gray-400 mb-8">Измените информацию о себе и настройки безопасности.</p>

        {/* Важно: Добавляем encType="multipart/form-data" 
          чтобы форма могла отправлять файлы на сервер! 
        */}
        <form action={updateProfile} encType="multipart/form-data" className="space-y-6">
          
          {/* Аватарка (Загрузка с ПК) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Аватарка
            </label>
            <div className="flex items-center gap-4">
              {/* Кружок с текущей аватаркой (или буквой) */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gray-600 to-gray-500 border-2 border-[#343536] flex items-center justify-center overflow-hidden shrink-0 shadow-inner text-white font-bold text-2xl">
                {user.image ? (
                  <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>
              {/* Поле выбора файла */}
              <input 
                type="file" 
                name="avatarFile" 
                accept="image/*"
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2.5 file:px-5
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#272729] file:text-gray-200
                  hover:file:bg-[#343536] file:transition-colors file:cursor-pointer cursor-pointer"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Рекомендуемый размер 256x256, формат JPG, PNG или GIF.</p>
          </div>

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

          {/* --- РАЗДЕЛИТЕЛЬ --- */}
          <hr className="border-[#343536] my-8" />
          
          <h2 className="text-lg font-bold text-gray-100 mb-4">Смена пароля</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Старый пароль */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Текущий пароль
              </label>
              <input 
                type="password" 
                name="oldPassword" 
                placeholder="••••••••"
                className="w-full bg-[#272729] border border-[#343536] focus:border-gray-400 focus:bg-[#1A1A1B] rounded-md p-3 text-sm text-gray-100 outline-none transition-colors" 
              />
            </div>
            
            {/* Новый пароль */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Новый пароль
              </label>
              <input 
                type="password" 
                name="newPassword" 
                placeholder="••••••••"
                className="w-full bg-[#272729] border border-[#343536] focus:border-gray-400 focus:bg-[#1A1A1B] rounded-md p-3 text-sm text-gray-100 outline-none transition-colors" 
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 mb-6">Оставьте поля пустыми, если не хотите менять пароль.</p>

          {/* Кнопка сохранения */}
          <div className="flex justify-end pt-4 border-t border-[#343536]">
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