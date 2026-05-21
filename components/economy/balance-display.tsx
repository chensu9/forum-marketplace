"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserBalance } from "@/lib/actions/economy";

export default function BalanceDisplay() {
  const [balance, setBalance] = useState<number | null>(null);

  // Стучимся на сервер за балансом
  useEffect(() => {
    getUserBalance().then((bal) => {
      setBalance(bal);
    }).catch(console.error);
  }, []);

  // Пока грузится, ничего не показываем
  if (balance === null) return null;

  return (
    <Link 
      href="/deposit" 
      className="text-[#4AF626] font-bold tracking-widest text-[11px] sm:text-xs uppercase transition border border-[#4AF626]/30 px-2 py-1 hover:bg-[#4AF626] hover:text-[#0A0A0A] shrink-0"
    >
      [ {balance.toFixed(2)} RUB ]
    </Link>
  );
}