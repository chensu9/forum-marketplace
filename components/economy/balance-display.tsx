"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserBalance } from "@/lib/actions/economy";

export default function BalanceDisplay() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    getUserBalance().then(setBalance).catch(console.error);
  }, []);

  if (balance === null) return null;

  return (
    <Link 
      href="/deposit" 
      className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#272729] rounded-full transition text-sm font-medium text-gray-200"
      title="Пополнить баланс"
    >
      <span className="text-blue-500 font-bold">₽</span>
      {balance.toFixed(2)}
    </Link>
  );
}