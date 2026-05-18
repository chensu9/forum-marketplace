// app/create/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createPost } from "@/lib/actions/post";
import Link from "next/link";

export default async function CreatePostPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0F0F14] text-white py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← Назад
          </Link>
          <h1 className="text-2xl font-bold">Создать новую тему</h1>
        </div>

        {/* Форма использует наш серверный экшен */}
        <form action={createPost} className="nb-card p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Заголовок темы
            </label>
            <input
              type="text"
              name="title"
              required
              className="w-full bg-[#1A1A22] border border-gray-800 rounded-lg p-3 text-white focus:border-[#A855F7] outline-none transition"
              placeholder="О чем хотите поговорить?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Контент
            </label>
            <textarea
              name="content"
              required
              rows={8}
              className="w-full bg-[#1A1A22] border border-gray-800 rounded-lg p-3 text-white focus:border-[#A855F7] outline-none transition resize-y"
              placeholder="Подробно опишите вашу мысль..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Теги (через запятую)
            </label>
            <input
              type="text"
              name="tags"
              className="w-full bg-[#1A1A22] border border-gray-800 rounded-lg p-3 text-white focus:border-[#A855F7] outline-none transition"
              placeholder="новости, технологии, разработка"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="nb-button-primary px-8">
              Опубликовать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}