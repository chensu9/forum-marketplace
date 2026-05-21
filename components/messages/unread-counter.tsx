"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUnreadCount } from "@/lib/actions/message";

export default function UnreadCounter() {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    getUnreadCount().then(setUnreadCount).catch(console.error);
    const interval = setInterval(() => {
      getUnreadCount().then(setUnreadCount).catch(console.error);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link 
      href="/messages" 
      className="relative flex items-center justify-center w-9 h-9 hover:bg-[#272729] rounded-full transition text-gray-300 hover:text-white"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full border border-[#1A1A1B]">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}