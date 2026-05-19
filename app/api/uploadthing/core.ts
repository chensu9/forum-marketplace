// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  // Твои старые правила для постов/товаров: imageUploader, marketUploader...

  // ==========================================
  // НОВОЕ ПРАВИЛО: ФОН ПРОФИЛЯ (Image & Video)
  // ==========================================
  backgroundCustomizer: f({ 
    image: { maxFileSize: "4MB", maxFileCount: 1 }, // Картинки до 4MB
    video: { maxFileSize: "32MB", maxFileCount: 1 } // Видео до 32MB
  })
    .middleware(async ({ req }) => {
      // Защита: загружать могут только залогиненные
      const session = await auth();
      if (!session?.user?.id) throw new Error("UNAUTHORIZED");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Это сработает, когда файл зальется на сервер (просто лог)
      console.log(`Background uploaded by USR_${metadata.userId}: ${file.url}`);
    }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;