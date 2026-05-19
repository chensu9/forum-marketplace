"use client";

import { useState } from "react";
import { deletePost } from "@/lib/actions/post";

export default function DeleteButton({ postId }: { postId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    // Терминальный алерт
    if (confirm("WARNING: DROP_RECORD? Это действие нельзя отменить.")) {
      setIsLoading(true);
      try {
        await deletePost(postId);
      } catch (error) {
        alert("ERR: Не удалось удалить запись.");
        setIsLoading(false);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isLoading}
      className="text-red-500 hover:text-white hover:bg-red-500 transition text-[9px] font-bold uppercase tracking-widest border border-red-500/50 px-2 py-0.5 ml-3"
    >
      {isLoading ? "[ PROCESSING... ]" : "[ DROP_THREAD ]"}
    </button>
  );
}