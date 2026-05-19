"use client";

import { UploadButton } from "@uploadthing/react";
import { updateBackground } from "@/lib/actions/user";

export default function BgUploadButton() {
  return (
    <UploadButton
      endpoint="backgroundCustomizer"
      appearance={{
        button: "bg-transparent text-yellow-500 border border-yellow-500 rounded-none font-mono uppercase font-bold text-[11px] sm:text-sm px-4 py-2 hover:bg-yellow-500 hover:text-[#0A0A0A] transition-all focus-within:ring-0 w-full h-full cursor-pointer",
        allowedContent: "hidden", // Прячем текст "Images, Videos up to 32MB"
        container: "m-0 p-0 flex items-center justify-center shrink-0"
      }}
      content={{
        button({ ready, isUploading }) {
          if (isUploading) return "[ UPLOADING... ]";
          if (!ready) return "[ INIT... ]";
          return "[ CUSTOM_BG ]";
        }
      }}
      onClientUploadComplete={async (res) => {
        if (res?.[0]) {
          await updateBackground(res[0].url); // Сохраняем в БД
        }
      }}
      onUploadError={(error: Error) => {
        alert(`SYS_ERR: ${error.message}`);
      }}
    />
  );
}