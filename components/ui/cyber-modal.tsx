"use client";

import { useEffect } from "react";

interface CyberModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "warning" | "danger" | "info";
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function CyberModal({
  isOpen,
  title,
  message,
  type = "warning",
  onConfirm,
  onCancel,
  confirmText = "Подтвердить",
  cancelText = "Отмена"
}: CyberModalProps) {
  
  // Блокируем скролл страницы, когда модалка открыта
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!isOpen) return null;

  // Цветовые схемы под новый дизайн
  const badgeColors = {
    warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    danger: "bg-red-500/10 text-red-500 border-red-500/30",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/30"
  };

  const buttonColors = {
    warning: "bg-yellow-600 hover:bg-yellow-500 text-white",
    danger: "bg-red-600 hover:bg-red-500 text-white",
    info: "bg-blue-600 hover:bg-blue-500 text-white"
  };

  const activeBadge = badgeColors[type];
  const activeButton = buttonColors[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0B]/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm bg-[#1A1A1B] border border-[#343536] rounded-xl p-6 shadow-2xl">
        
        <h2 className="text-lg font-bold text-gray-100 mb-2 flex items-center gap-2">
          {title}
        </h2>
        
        <div className={`text-sm mb-6 p-3 rounded-md border ${activeBadge}`}>
          {message}
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white hover:bg-[#272729] rounded-full transition"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`px-6 py-2 text-sm font-bold rounded-full transition shadow-sm ${activeButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}