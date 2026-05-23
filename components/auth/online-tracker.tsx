"use client";

import { useEffect } from "react";
import { pingOnlineStatus } from "@/lib/actions/online";

export default function OnlineTracker() {
  useEffect(() => {
    // 1. Пингуем сразу при загрузке страницы
    pingOnlineStatus();

    // 2. Устанавливаем интервал (2 минуты = 120 000 мс)
    const interval = setInterval(() => {
      pingOnlineStatus();
    }, 2 * 60 * 1000);

    // Очищаем интервал при уходе со страницы
    return () => clearInterval(interval);
  }, []);

  return null; // Компонент невидимый, он просто работает в фоне
}