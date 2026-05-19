"use client";

import { useState } from "react";
import { createReport } from "@/lib/actions/report";

export default function ReportButton({ postId, isOwnPost }: { postId: string, isOwnPost: boolean }) {
  const [isReported, setIsReported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Свои посты репортить нельзя
  if (isOwnPost) return null;

  const handleReport = async () => {
    const reason = prompt("SYSTEM_PROMPT: Enter violation reason (spam, nsfw, illegal, etc.):");
    
    if (!reason || reason.trim() === "") return;

    setIsLoading(true);
    try {
      await createReport(postId, reason);
      setIsReported(true);
      alert("SYS_MSG: Violation report submitted to moderators.");
    } catch (error: any) {
      alert(`ERR: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isReported) {
    return <span className="text-yellow-500 text-[9px] uppercase font-bold tracking-widest ml-3 border border-yellow-500/30 px-2 py-0.5 bg-yellow-500/10">[ REPORTED ]</span>;
  }

  return (
    <button 
      onClick={handleReport}
      disabled={isLoading}
      className="text-yellow-500 hover:text-[#0A0A0A] hover:bg-yellow-500 transition text-[9px] font-bold uppercase tracking-widest border border-yellow-500/50 px-2 py-0.5 ml-3 disabled:opacity-50"
    >
      {isLoading ? "[ PROCESSING... ]" : "[ FLAG_RECORD ]"}
    </button>
  );
}