// @ts-nocheck
"use client";

// @ts-ignore - игнорируем ошибку дженерика UploadThing, если роутер не прокинут глобально
import { UploadButton } from "@uploadthing/react";
import { updateBackground } from "@/lib/actions/user";

export default function BgUploadButton() {
  return (
    <div className="group relative">
      <UploadButton
        endpoint="backgroundCustomizer"
        appearance={{
          button: "bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white border border-white/20 rounded-md font-medium text-sm px-4 py-2 transition-all cursor-pointer shadow-sm w-fit h-fit flex items-center gap-2",
          allowedContent: "hidden", 
          container: "m-0 p-0 flex items-center justify-center shrink-0"
        }}
        content={{
          // Добавили строгие типы { ready: boolean; isUploading: boolean }
          button({ ready, isUploading }: { ready: boolean; isUploading: boolean }) {
            if (isUploading) return "Загрузка...";
            if (!ready) return "Подготовка...";
            return (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Изменить фон
              </>
            );
          }
        }}
        // Добавили тип res: any[]
        onClientUploadComplete={async (res: any[]) => {
          if (res?.[0]) {
            await updateBackground(res[0].url);
            window.location.reload(); // Перезагружаем страницу, чтобы фон обновился
          }
        }}
        onUploadError={(error: Error) => {
          alert(`Ошибка загрузки: ${error.message}`);
        }}
      />
    </div>
  );
}