// components/auth/register-form.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || "Произошла ошибка при регистрации");
      }
    } catch (err) {
      setError("Не удалось связаться с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-[#1E1E28] border border-purple-500/10 rounded-xl shadow-2xl transition-all hover:border-purple-500/30">
      <h1 className="text-2xl font-bold mb-6 text-center text-white tracking-wide">
        <span className="text-[#A855F7]">MARKET</span>FORUM
      </h1>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1 font-medium">Никнейм</label>
          <input
            type="text"
            className="w-full bg-[#1A1A22] text-white border border-gray-800 rounded-lg p-3 focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] outline-none transition-all placeholder-gray-600"
            placeholder="nexus_warrior"
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1 font-medium">Email адрес</label>
          <input
            type="email"
            className="w-full bg-[#1A1A22] text-white border border-gray-800 rounded-lg p-3 focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] outline-none transition-all placeholder-gray-600"
            placeholder="example@nexus.com"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1 font-medium">Пароль</label>
          <input
            type="password"
            autoComplete="new-password"
            className="w-full bg-[#1A1A22] text-white border border-gray-800 rounded-lg p-3 focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] outline-none transition-all placeholder-gray-600"
            placeholder="••••••••"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold p-3 rounded-lg transition-colors mt-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Создание аккаунта..." : "Зарегистрироваться"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-6">
        Уже есть профиль?{" "}
        <Link href="/login" className="text-[#A855F7] hover:text-[#9333EA] font-medium transition-colors hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}