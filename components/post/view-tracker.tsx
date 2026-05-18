// components/post/view-tracker.tsx
"use client";

import { useEffect } from "react";
import { incrementView } from "@/lib/actions/view";

export default function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    // 1. Проверяем в памяти браузера, есть ли запись об этом посте
    const hasViewed = localStorage.getItem(`viewed_post_${postId}`);

    if (!hasViewed) {
      // 2. Если не смотрел — отправляем запрос на сервер (+1 просмотр)
      incrementView(postId);
      
      // 3. Записываем в память браузера, что теперь он его посмотрел
      localStorage.setItem(`viewed_post_${postId}`, "true");
    }
  }, [postId]);

  // Этот компонент ничего не рисует на экране, он работает только "под капотом"
  return null;
}