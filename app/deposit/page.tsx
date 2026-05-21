import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { addFunds } from "@/lib/actions/economy";

export default async function DepositPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { balance: true, username: true }
  });

  return (
    <div className="max-w-2xl mx-auto font-mono space-y-6">
      <Link href="/" className="inline-block text-[#4AF626]/60 hover:text-white hover:text-glow transition mb-2 font-bold text-[11px]">
        &lt; Вернуться в меню
      </Link>

      <div className="border border-[#4AF626]/50 bg-[#0A0A0A]/90 p-8 shadow-[0_0_20px_rgba(74,246,38,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-[#4AF626]/30"></div>

        <h1 className="text-2xl font-bold text-white text-glow uppercase tracking-widest mb-2 flex items-center gap-3">
          ~// Пополнить баланс
        </h1>
        <p className="text-[#4AF626]/60 text-xs mb-8 uppercase tracking-widest border-b border-[#4AF626]/20 pb-4">
          Юзер: <span className="text-white">{user?.username}</span> | БАЛАНС: <span className="text-[#4AF626] font-bold">{user?.balance.toFixed(2)} RUB</span>
        </p>

        <form action={addFunds} className="space-y-6">
          <div>
            <label className="block text-[10px] text-[#4AF626]/70 uppercase tracking-widest mb-2">
              Сумма пополнения (RUB)
            </label>
            <input
              type="number"
              name="amount"
              min="1"
              step="1"
              required
              placeholder="0.00"
              className="w-full bg-[#0A0A0A] border border-[#4AF626]/30 focus:border-[#4AF626] text-2xl text-[#4AF626] font-bold p-4 outline-none transition-colors placeholder:text-[#4AF626]/20"
            />
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 text-xs text-yellow-500/80 uppercase tracking-widest leading-relaxed">
            <span className="font-bold text-yellow-500 block mb-1">ПРЕДУПРЕЖДЕНИЕ:</span>
            Это тестовая функция, которая просто добавляет деньги к вашему балансу без реальных транзакций. Используйте с осторожностью и не злоупотребляйте.
          </div>

          <button 
            type="submit"
            className="w-full border border-[#4AF626] text-[#4AF626] hover:bg-[#4AF626] hover:text-[#0A0A0A] px-6 py-4 font-bold uppercase tracking-widest transition-all text-sm shadow-[0_0_15px_rgba(74,246,38,0.1)]"
          >
            [ ПОПОЛНИТЬ БАЛАНС ]
          </button>
        </form>
      </div>
    </div>
  );
}