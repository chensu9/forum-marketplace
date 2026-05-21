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
  confirmText = "[ ПОДТВЕРДИТЬ ]",
  cancelText = "[ ОТМЕНА ]"
}: CyberModalProps) {
  
  // Блокируем скролл страницы, когда модалка открыта
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const colors = {
    warning: "border-yellow-500 text-yellow-500 bg-yellow-500/10",
    danger: "border-red-500 text-red-500 bg-red-500/10",
    info: "border-[#4AF626] text-[#4AF626] bg-[#4AF626]/10"
  };

  const activeColor = colors[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/80 backdrop-blur-sm p-4 font-mono">
      <div className={`relative w-full max-w-md border ${activeColor} bg-[#0A0A0A] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]`}>
        {/* Декоративные углы */}
        <div className={`absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 ${activeColor.split(' ')[0]}`}></div>
        <div className={`absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 ${activeColor.split(' ')[0]}`}></div>

        <h2 className="text-xl font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
          <span className="animate-pulse">_</span> {title}
        </h2>
        
        <p className="text-sm opacity-80 mb-8 whitespace-pre-wrap">
          {message}
        </p>

        <div className="flex gap-4 justify-end">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold uppercase border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-[#0A0A0A] transition"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold uppercase border transition ${activeColor.split(' ')[0]} ${activeColor.split(' ')[1]} hover:bg-current hover:text-[#0A0A0A]`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}