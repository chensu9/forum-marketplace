"use client";

import { useState } from "react";
import { toggleLike } from "@/lib/actions/like"; 

export default function LikeButton({ postId, initialLikes, initialHasLiked }: { postId: string, initialLikes: number, initialHasLiked: boolean }) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    setIsLoading(true);
    setHasLiked(!hasLiked);
    setLikes(hasLiked ? likes - 1 : likes + 1);
    setIsLoading(false);
    
    
    await toggleLike(postId);
    
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Кнопка Upvote */}
      <button 
        onClick={handleLike} 
        disabled={isLoading}
        className={`hover:text-orange-500 transition-colors ${hasLiked ? 'text-orange-500' : 'text-gray-500'} disabled:opacity-50`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      
      {/* Счетчик */}
      <span className={`text-xs font-bold ${hasLiked ? 'text-orange-500' : 'text-gray-300'}`}>
        {likes}
      </span>
      
      {/* Кнопка Downvote (пока визуальная) */}
      <button className="text-gray-500 hover:text-blue-500 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}