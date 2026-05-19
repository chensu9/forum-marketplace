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
        className="text-[9px] text-[#4AF626]/40 hover:text-white transition uppercase font-bold tracking-widest mt-2 border border-transparent hover:border-[#4AF626]/30 px-1"
      >
        [ REPLY ]
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 border border-[#4AF626]/30 bg-[#0A0A0A]/90 p-3 relative shadow-[0_0_10px_rgba(74,246,38,0.05)]">
      <div className="absolute top-3 left-3 text-[#4AF626]/50 font-bold text-[10px]">&gt;</div>
      <textarea 
        name="content" 
        required 
        rows={2} 
        placeholder="Enter response payload..." 
        className="w-full bg-transparent pl-6 text-xs text-[#4AF626] outline-none resize-y placeholder:text-[#4AF626]/30" 
      />
      <div className="flex justify-end gap-4 border-t border-[#4AF626]/20 pt-2 mt-2">
        <button type="button" onClick={() => setIsOpen(false)} className="text-[9px] text-red-500 hover:text-red-400 font-bold uppercase tracking-widest">
          [ CANCEL ]
        </button>
        <button type="submit" disabled={isLoading} className="text-[9px] text-[#4AF626] hover:text-white font-bold uppercase tracking-widest">
          {isLoading ? "[ PROCESSING... ]" : "[ EXECUTE ]"}
        </button>
      </div>
    </form>
  );
}