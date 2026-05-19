"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
    
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "CREATION_FAILED: Invalid data");
      } else {
        router.push("/login"); // Перекидываем на вход после успеха
      }

    } catch (err) {
      setError("CRITICAL_ERR: Сервер не отвечает");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] font-mono">
      <div className="w-full max-w-md border border-[#4AF626]/50 bg-[#0A0A0A]/80 p-8 shadow-[0_0_20px_rgba(74,246,38,0.05)] relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-[#4AF626]/30"></div>
        <div className="absolute top-4 right-4 text-[#4AF626]/30 text-xs">NEW_NODE</div>

        <h1 className="text-2xl font-bold text-white text-glow mb-2 uppercase tracking-widest">
          ~// register.exe
        </h1>
        <p className="text-[#4AF626]/60 text-xs mb-6 uppercase tracking-widest">
          Create new system record
        </p>

        {/* Вывод ошибки */}
        {error && (
          <div className="mb-6 p-3 border border-red-500/50 bg-red-500/10 text-red-500 text-xs font-bold tracking-widest animate-pulse">
            &gt; ERR: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] text-[#4AF626]/70 mb-1 uppercase tracking-widest">USERNAME</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4AF626]/50">&gt;</span>
              <input type="text" name="username" required autoComplete="username" className="w-full bg-[#4AF626]/5 border border-[#4AF626]/30 p-2.5 pl-8 text-[#4AF626] focus:border-[#4AF626] outline-none" placeholder="alias" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-[#4AF626]/70 mb-1 uppercase tracking-widest">EMAIL_ADDRESS</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4AF626]/50">&gt;</span>
              <input type="email" name="email" required autoComplete="email" className="w-full bg-[#4AF626]/5 border border-[#4AF626]/30 p-2.5 pl-8 text-[#4AF626] focus:border-[#4AF626] outline-none" placeholder="signal_route@mail.com" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-[#4AF626]/70 mb-1 uppercase tracking-widest">PASSWORD_KEY</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4AF626]/50">&gt;</span>
              <input type="password" name="password" required autoComplete="new-password" className="w-full bg-[#4AF626]/5 border border-[#4AF626]/30 p-2.5 pl-8 text-[#4AF626] focus:border-[#4AF626] outline-none" placeholder="**********" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-4 border border-[#4AF626] bg-[#0A0A0A] text-[#4AF626] hover:bg-[#4AF626] hover:text-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed py-3 text-sm font-bold tracking-widest transition-all uppercase"
          >
            {isLoading ? "[ PROCESSING... ]" : "[ WRITE_TO_DB ]"}
          </button>
        </form>

        <div className="mt-6 border-t border-[#4AF626]/20 pt-4 text-center text-xs text-[#4AF626]/50">
          RECORD_EXISTS? <Link href="/login" className="text-white text-glow hover:text-[#4AF626] transition tracking-widest ml-1">RUN auth.exe</Link>
        </div>
      </div>
    </div>
  );
}