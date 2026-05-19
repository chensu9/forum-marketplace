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
    <button 
      onClick={handleLike} 
      disabled={isLoading}
      className={`hover:text-white transition font-bold ${hasLiked ? 'text-white text-glow' : 'text-[#4AF626]/60'}`}
    >
      {hasLiked ? `[ L:${likes} ]` : `L:${likes}`}
    </button>
  );
}