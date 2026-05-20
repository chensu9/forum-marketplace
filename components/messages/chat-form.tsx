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
      className="mt-4 flex gap-2 items-end border-t border-[#4AF626]/20 pt-4"
    >
      <input type="hidden" name="receiverUsername" value={receiverUsername} />
      <span className="text-[#4AF626]/50 font-bold mb-2 text-sm">&gt;</span>
      
      <input
        type="text"
        name="content"
        autoComplete="off"
        required
        disabled={isSending}
        placeholder="Enter encrypted payload..."
        className="w-full bg-transparent border-b border-[#4AF626]/30 focus:border-[#4AF626] text-[#4AF626] outline-none py-2 px-1 text-sm font-mono placeholder:text-[#4AF626]/30 transition-colors disabled:opacity-50"
      />
      
      <button 
        type="submit" 
        disabled={isSending}
        className="border border-[#4AF626] text-[#4AF626] hover:bg-[#4AF626] hover:text-[#0A0A0A] px-6 py-2 text-xs font-bold uppercase transition shrink-0 disabled:opacity-50"
      >
        {isSending ? "[ ... ]" : "[ SEND ]"}
      </button>
    </form>
  );
}