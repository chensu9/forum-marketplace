"use client";

import { useState } from "react";
import { createEscrowOrder } from "@/lib/actions/market";
import CyberModal from "@/components/ui/cyber-modal";

export default function EscrowButton({ listingId }: { listingId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const executePurchase = async () => {
    setIsModalOpen(false);
    setIsLoading(true);
    try {
      await createEscrowOrder(listingId);
    } catch (error: any) {
      alert(error.message); // Ошибки пока оставим в алерте (или можно сделать для них вторую модалку)
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
        className="w-full mt-6 bg-[#4AF626] text-[#0A0A0A] px-6 py-4 font-bold uppercase tracking-widest hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-all disabled:opacity-50"
      >
        {isLoading ? "[ ИНИЦИАЛИЗАЦИЯ СДЕЛКИ... ]" : "[ КУПИТЬ ЧЕРЕЗ ГАРАНТА ]"}
      </button>

      <CyberModal 
        isOpen={isModalOpen}
        title="СИСТЕМНОЕ ПРЕДУПРЕЖДЕНИЕ"
        message="Вы собираетесь начать безопасную сделку (Escrow). Средства будут списаны с вашего баланса и заморожены до момента подтверждения получения товара. Продолжить?"
        type="info"
        onConfirm={executePurchase}
        onCancel={() => setIsModalOpen(false)}
        confirmText="[ НАЧАТЬ СДЕЛКУ ]"
      />
    </>
  );
}