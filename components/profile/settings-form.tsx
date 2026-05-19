// components/profile/settings-form.tsx
"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/user";
import { useRouter } from "next/navigation";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Описываем, какие данные компонент ждет на вход
interface SettingsFormProps {
  initialUsername: string;
  initialBio: string | null;
}

export default function SettingsForm({ initialUsername, initialBio }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Собираем данные из формы
    const formData = new FormData(e.currentTarget);

    // Запускаем серверный экшен в фоне
    startTransition(async () => {
      const result = await updateProfile(formData);

      if (result?.error) {
        // Если сервер вернул ошибку - показываем её
        setError(result.error);
      } else if (result?.success) {
        // Если всё успешно - перекидываем на новый профиль
        router.push(`/profile/${result.newUsername}`);
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Блок для вывода ошибки */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

{/* Блок загрузки аватарки */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Аватар профиля
        </label>
        <div className="bg-[#1A1A22] border border-gray-800 rounded-lg p-6 flex flex-col items-center justify-center border-dashed">
          <UploadButton<OurFileRouter, "imageUploader">
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              alert("Аватарка успешно загружена! Обновите страницу.");
              router.refresh(); // Обновляет данные на странице
            }}
            onUploadError={(error: Error) => {
              alert(`Ошибка загрузки: ${error.message}`);
            }}
            appearance={{
              button: "bg-[#A855F7] hover:bg-[#9333EA] text-white px-4 py-2 rounded-lg text-sm font-medium transition",
              allowedContent: "text-gray-500 text-xs mt-2"
            }}

          />
        </div>
      </div>

      {/* Поле Никнейм */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Никнейм
        </label>
        <input
          type="text"
          name="username"
          defaultValue={initialUsername}
          required
          disabled={isPending}
          className="w-full bg-[#1A1A22] border border-gray-800 rounded-lg p-3 text-white focus:border-[#A855F7] outline-none transition"
        />
        <p className="text-xs text-gray-500 mt-2">
          Убедитесь, что новый никнейм не занят.
        </p>
      </div>

      {/* Поле О себе */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          О себе
        </label>
        <textarea
          name="bio"
          defaultValue={initialBio || ""}
          rows={4}
          disabled={isPending}
          placeholder="Расскажите немного о себе, своих интересах..."
          className="w-full bg-[#1A1A22] border border-gray-800 rounded-lg p-3 text-white focus:border-[#A855F7] outline-none transition resize-y"
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-800">
        <button 
          type="submit" 
          disabled={isPending}
          className="nb-button-primary px-8 disabled:opacity-50"
        >
          {isPending ? "Сохранение..." : "Сохранить изменения"}
        </button>
      </div>
    </form>
  );
}