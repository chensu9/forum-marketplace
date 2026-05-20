"use client";

import { useState } from "react";
import { createEscrowOrder } from "@/lib/actions/market";

export default function EscrowButton({ listingId }: { listingId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBuy = async () => {
    if (!confirm("SYS_WARN: Initiate secure ESCROW transaction? Funds will be frozen until delivery is confirmed.")) return;
    
    setIsLoading(true);
    try {
      await createEscrowOrder(listingId);
    } catch (error: any) {
      alert(error.message);
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleBuy}
      disabled={isLoading}
      className="w-full mt-6 bg-[#4AF626] text-[#0A0A0A] px-6 py-4 font-bold uppercase tracking-widest hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-all disabled:opacity-50"
    >
      {isLoading ? "[ INIT_ESCROW_PROTOCOL... ]" : "[ BUY_VIA_ESCROW ]"}
    </button>
  );
}