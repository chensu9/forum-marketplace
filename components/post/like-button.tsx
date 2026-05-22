"use client";

import { useState } from "react";
import { handlePostVote } from "@/lib/actions/post"; 

interface LikeButtonProps {
  postId: string;
  initialLikes: number;       // Сюда теперь будем передавать likedBy.length
  initialDislikes: number;    // Сюда передаем dislikedBy.length
  initialHasLiked: boolean;
  initialHasDisliked: boolean;
}

export default function LikeButton({ 
  postId, 
  initialLikes, 
  initialDislikes, 
  initialHasLiked, 
  initialHasDisliked 
}: LikeButtonProps) {
  
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [hasDisliked, setHasDisliked] = useState(initialHasDisliked);

  // Общий баланс рейтинга (Upvotes - Downvotes)
  const score = likes - dislikes;

  const handleVote = async (type: "UPVOTE" | "DOWNVOTE") => {
    if (type === "UPVOTE") {
      if (hasLiked) {
        // Убираем лайк
        setHasLiked(false);
        setLikes(prev => prev - 1);
      } else {
        // Ставим лайк
        setHasLiked(true);
        setLikes(prev => prev + 1);
        if (hasDisliked) {
          // Если стоял дизлайк — гасим его
          setHasDisliked(false);
          setDislikes(prev => prev - 1);
        }
      }
    } else {
      if (hasDisliked) {
        // Убираем дизлайк
        setHasDisliked(false);
        setDislikes(prev => prev - 1);
      } else {
        // Ставим дизлайк
        setHasDisliked(true);
        setDislikes(prev => prev + 1);
        if (hasLiked) {
          // Если стоял лайк — гасим его
          setHasLiked(false);
          setLikes(prev => prev - 1);
        }
      }
    }

    // Отправляем запрос на серверный экшен
    await handlePostVote(postId, type);
  };

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      
      {/* Кнопка Upvote (Лайк) */}
      <button 
        onClick={() => handleVote("UPVOTE")} 
        className={`hover:text-orange-500 transition-colors rounded p-0.5 ${
          hasLiked ? 'text-orange-500 bg-orange-500/10' : 'text-gray-500'
        }`}
        title="Мне нравится"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      
      {/* Счетчик баланса рейтинга постов */}
      <span className={`text-xs font-bold transition-colors ${
        hasLiked ? 'text-orange-500' : hasDisliked ? 'text-blue-500' : 'text-gray-300'
      }`}>
        {score > 0 ? `+${score}` : score}
      </span>
      
      {/* Кнопка Downvote (Дизлайк) */}
      <button 
        onClick={() => handleVote("DOWNVOTE")} 
        className={`hover:text-blue-500 transition-colors rounded p-0.5 ${
          hasDisliked ? 'text-blue-500 bg-blue-500/10' : 'text-gray-500'
        }`}
        title="Не нравится"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

    </div>
  );
}