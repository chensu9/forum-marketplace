"use client";

import { useState, useTransition } from "react";
import { toggleCommentLike } from "@/lib/actions/interactions";
import { usePathname } from "next/navigation";

export default function CommentLikeButton({ 
  commentId, initialLikes, initialHasLiked 
}: { 
  commentId: string; initialLikes: number; initialHasLiked: boolean; 
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const handleLike = () => {
    if (isPending) return;
    setLikes(prev => hasLiked ? prev - 1 : prev + 1);
    setHasLiked(prev => !prev);

    startTransition(async () => {
      try {
        await toggleCommentLike(commentId, pathname);
      } catch (err) {
        setLikes(prev => hasLiked ? prev + 1 : prev - 1);
        setHasLiked(prev => prev);
      }
    });
  };

  return (
    <button onClick={handleLike} className={`flex items-center gap-1.5 text-xs transition group ${hasLiked ? "text-red-500" : "text-gray-500 hover:text-red-400"}`}>
      <svg className={`w-4 h-4 transition-transform group-hover:scale-110 ${hasLiked ? "fill-current" : ""}`} fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span className="font-medium">{likes}</span>
    </button>
  );
}