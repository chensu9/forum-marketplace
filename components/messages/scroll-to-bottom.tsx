"use client";

import { useEffect, useRef } from "react";

export default function ScrollToBottom() {
  const ref = useRef<HTMLDivElement>(null);

  // useEffect без массива зависимостей срабатывает при каждом обновлении компонента
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  });

  return <div ref={ref} className="h-1 shrink-0" />;
}