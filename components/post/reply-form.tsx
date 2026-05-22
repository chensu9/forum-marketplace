"use client";

import { useState } from "react";
import { createComment } from "@/lib/actions/comment";

export default function ReplyForm({ postId, parentId }: { postId: string, parentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("postId", postId);
    formData.append("parentId", parentId);
    
    await createComment(formData);
    
    setIsOpen(false);
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-300 transition"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        Ответить
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 bg-[#272729]/40 border border-[#343536] p-4 rounded-md w-full block">
      <textarea 
        name="content" 
        required 
        rows={3} 
        placeholder="Ваш ответ..." 
        className="w-full bg-[#1A1A1B] border border-[#343536] focus:border-gray-400 rounded-md p-3 text-sm text-gray-200 placeholder-gray-500 outline-none resize-y transition-colors mb-3" 
      />
      <div className="flex justify-end gap-3 w-full">
        <button 
          type="button" 
          onClick={() => setIsOpen(false)} 
          className="text-xs font-semibold text-gray-400 hover:text-white px-3 py-1.5 transition"
        >
          Отмена
        </button>
        <button 
          type="submit" 
          disabled={isLoading} 
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2 rounded-full transition shadow-sm"
        >
          {isLoading ? "Отправка..." : "Ответить"}
        </button>
      </div>
    </form>
  );
}