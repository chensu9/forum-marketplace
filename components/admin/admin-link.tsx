"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserRole } from "@/lib/actions/user";

export default function AdminLink() {
  const [role, setRole] = useState<string | null>(null);

  // Стучимся на сервер за ролью
  useEffect(() => {
    getUserRole().then((r) => {
      setRole(r);
    }).catch(console.error);
  }, []);

  // Показываем кнопку только высшим чинам
  if (role === "ADMIN" || role === "MODERATOR") {
    return (
      <Link 
        href="/admin" 
        className="text-red-500 hover:text-[#0A0A0A] hover:bg-red-500 font-bold tracking-widest text-[11px] sm:text-xs uppercase transition border border-red-500/30 px-2 py-1 shrink-0"
      >
        [ АДМИН_ПАНЕЛЬ ]
      </Link>
    );
  }

  return null;
}