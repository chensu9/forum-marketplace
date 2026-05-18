// components/post/like-button.tsx
"use client";

import { useState, useTransition } from "react";
import { toggleLike } from "@/lib/actions/like";

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
  initialHasLiked: boolean;
}

export default function LikeButton({ postId, initialLikes, initialHasLiked }: LikeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);

  // ДОБАВИЛИ e: React.MouseEvent
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();  // Запрещает переходить по ссылке <Link>
    e.stopPropagation(); // Останавливает всплытие клика к родителям

    setHasLiked(!hasLiked);
    setLikes(hasLiked ? likes - 1 : likes + 1);

    startTransition(async () => {
      try {
        await toggleLike(postId);
      } catch (error) {
        setHasLiked(hasLiked);
        setLikes(initialLikes);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center gap-1 text-xs font-medium transition ${
        hasLiked ? "text-[#A855F7]" : "text-gray-400 hover:text-white"
      }`}
    >
      {/* Теперь тут правильное сердечко вместо пальца вверх */}
      <span className="text-base">{hasLiked ? "💜" : "🤍"}</span>
      <span>{likes}</span>
    </button>
  );
}