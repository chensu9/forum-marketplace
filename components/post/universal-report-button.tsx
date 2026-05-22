"use client";

import { useTransition } from "react";
import { reportComment, reportProfile } from "@/lib/actions/interactions";

export default function UniversalReportButton({ id, type }: { id: string; type: "comment" | "profile" }) {
  const [isPending, startTransition] = useTransition();

  const handleReport = () => {
    const reason = prompt("Укажите причину жалобы:");
    if (!reason || reason.trim() === "") return;

    startTransition(async () => {
      if (type === "comment") await reportComment(id, reason);
      else await reportProfile(id, reason);
      alert("Жалоба успешно отправлена!");
    });
  };

  return (
    <button onClick={handleReport} disabled={isPending} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-400 transition ml-auto disabled:opacity-50" title="Пожаловаться">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
      </svg>
    </button>
  );
}