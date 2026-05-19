"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
// Раскомментируй эту строку, если используешь NextAuth для входа:
 import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Останавливаем перезагрузку страницы и попадание пароля в URL
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
    
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false, // чтобы мы сами могли обработать ошибку
      });

      if (res?.error) {
        setError("ACCESS_DENIED: Invalid credentials");
      } else {
        router.push("/"); // Перекидываем на главную
        router.refresh(); // Обновляем данные (чтобы появился ник в хедере)
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
        <div className="absolute top-4 right-4 text-[#4AF626]/30 text-xs">SYS_AUTH</div>

        <h1 className="text-2xl font-bold text-white text-glow mb-2 uppercase tracking-widest">
          ~// auth.exe
        </h1>
        <p className="text-[#4AF626]/60 text-xs mb-6 uppercase tracking-widest">
          STATUS: <span className="text-red-500 font-bold text-glow">LOCKED</span> | Identify yourself
        </p>

        {/* Вывод ошибки в терминальном стиле */}
        {error && (
          <div className="mb-6 p-3 border border-red-500/50 bg-red-500/10 text-red-500 text-xs font-bold tracking-widest animate-pulse">
            &gt; ERR: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] text-[#4AF626]/70 mb-1 uppercase tracking-widest">USER_ID / EMAIL</label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4AF626]/50">&gt;</span>
              <input 
                type="email" 
                name="email"
                required
                autoComplete="email"
                className="w-full bg-[#4AF626]/5 border border-[#4AF626]/30 p-3 pl-8 text-[#4AF626] focus:border-[#4AF626] focus:shadow-[0_0_10px_rgba(74,246,38,0.1)] outline-none transition-all" 
                placeholder="enter_credentials..." 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-[#4AF626]/70 mb-1 uppercase tracking-widest">PASSWORD_KEY</label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4AF626]/50">&gt;</span>
              <input 
                type="password" 
                name="password"
                required
                autoComplete="current-password"
                className="w-full bg-[#4AF626]/5 border border-[#4AF626]/30 p-3 pl-8 text-[#4AF626] focus:border-[#4AF626] focus:shadow-[0_0_10px_rgba(74,246,38,0.1)] outline-none transition-all" 
                placeholder="**********" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full border border-[#4AF626] bg-[#0A0A0A] text-[#4AF626] hover:bg-[#4AF626] hover:text-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed py-3 text-sm font-bold tracking-widest transition-all uppercase"
          >
            {isLoading ? "[ PROCESSING... ]" : "[ INITIATE_SESSION ]"}
          </button>
        </form>

        <div className="mt-6 border-t border-[#4AF626]/20 pt-4 text-center text-xs text-[#4AF626]/50">
          GUEST_ENTITY? <Link href="/register" className="text-white text-glow hover:text-[#4AF626] transition tracking-widest ml-1">RUN register.exe</Link>
        </div>
      </div>
    </div>
  );
}