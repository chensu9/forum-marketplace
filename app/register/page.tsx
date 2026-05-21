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
        // Меняем системную ошибку на человекочитаемую
        setError(data.message || "Ошибка при регистрации. Проверьте данные.");
      } else {
        router.push("/login"); // Перекидываем на вход после успеха
      }

    } catch (err) {
      setError("Ошибка сервера. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <div className="w-full max-w-md bg-[#1A1A1B] border border-[#343536] rounded-xl p-8 shadow-lg">
        
        {/* Шапка формы */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center font-bold text-2xl text-white mx-auto mb-4 shadow-sm">
            N
          </div>
          <h1 className="text-2xl font-bold text-gray-100">
            Создать аккаунт
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Присоединяйтесь к сообществу Nexus
          </p>
        </div>

        {/* Вывод ошибки */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Поле Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Никнейм</label>
            <input 
              type="text" 
              name="username" 
              required 
              autoComplete="username" 
              className="w-full bg-[#272729] border border-[#343536] hover:border-gray-500 focus:border-gray-300 focus:bg-[#1A1A1B] rounded-md p-3 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors" 
              placeholder="Ваш никнейм" 
            />
          </div>

          {/* Поле Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input 
              type="email" 
              name="email" 
              required 
              autoComplete="email" 
              className="w-full bg-[#272729] border border-[#343536] hover:border-gray-500 focus:border-gray-300 focus:bg-[#1A1A1B] rounded-md p-3 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors" 
              placeholder="you@example.com" 
            />
          </div>

          {/* Поле Пароля */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Пароль</label>
            <input 
              type="password" 
              name="password" 
              required 
              autoComplete="new-password" 
              className="w-full bg-[#272729] border border-[#343536] hover:border-gray-500 focus:border-gray-300 focus:bg-[#1A1A1B] rounded-md p-3 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors" 
              placeholder="••••••••" 
            />
          </div>

          {/* Кнопка регистрации */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-md text-sm font-bold transition-colors mt-2 flex justify-center items-center h-12 shadow-sm"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Зарегистрироваться"
            )}
          </button>
        </form>

        {/* Ссылка на авторизацию */}
        <div className="mt-6 pt-6 border-t border-[#343536] text-center text-sm text-gray-400">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-blue-500 hover:text-blue-400 font-semibold transition-colors">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}