"use client";

import { useRef, useState } from "react";
import { sendMessage } from "@/lib/actions/message";

export default function ChatForm({ receiverUsername }: { receiverUsername: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const [isSending, setIsSending] = useState(false);

  return (
    <form 
      ref={ref} 
      action={async (formData) => {
        setIsSending(true);
        await sendMessage(formData);
        ref.current?.reset();
        setIsSending(false);
      }} 
      className="flex items-center gap-2"
    >
      <input type="hidden" name="receiverUsername" value={receiverUsername} />
      
      {/* Поле ввода сообщения */}
      <input
        type="text"
        name="content"
        autoComplete="off"
        required
        disabled={isSending}
        placeholder="Написать сообщение..."
        className="w-full bg-[#272729] border border-[#343536] focus:border-gray-400 focus:bg-[#1A1A1B] text-gray-200 outline-none py-2.5 px-5 rounded-full text-sm placeholder:text-gray-500 transition-colors disabled:opacity-50"
      />
      
      {/* Кнопка отправки */}
      <button 
        type="submit" 
        disabled={isSending}
        className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-full transition shrink-0 disabled:opacity-50 flex items-center justify-center h-10 w-10 shadow-sm"
        title="Отправить"
      >
        {isSending ? (
          /* Спиннер загрузки */
          <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          /* Иконка бумажного самолетика */
          <svg className="w-5 h-5 translate-x-[1px] translate-y-[1px]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        )}
      </button>
    </form>
  );
}