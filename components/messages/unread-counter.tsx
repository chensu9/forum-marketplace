"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUnreadCount } from "@/lib/actions/message";

export default function UnreadCounter() {
  const [unreadCount, setUnreadCount] = useState(0);

  // Запрашиваем количество сообщений при загрузке компонента
  useEffect(() => {
    getUnreadCount().then((count) => {
      setUnreadCount(count);
    }).catch(console.error);
  }, []);

  if (unreadCount > 0) {
    return (
      <Link href="/messages" className="text-yellow-500 hover:text-[#0A0A0A] hover:bg-yellow-500 font-bold tracking-widest text-[11px] sm:text-xs uppercase transition border border-yellow-500/50 px-2 py-1 flex items-center gap-2 shrink-0">
        <span className="w-1.5 h-1.5 bg-yellow-500 animate-pulse"></span>
        [ ВХОДЯЩИЕ: {unreadCount} ]
      </Link>
    );
  }

  return (
    <Link href="/messages" className="text-[#4AF626]/70 hover:text-[#4AF626] font-bold tracking-widest text-[11px] sm:text-xs uppercase transition px-2 py-1 shrink-0">
      [ ВХОДЯЩИЕ ]
    </Link>
  );
}