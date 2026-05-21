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
    <div className="max-w-xl mx-auto px-4 py-8">
      
      {/* Кнопка назад */}
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm font-medium mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Вернуться на главную
      </Link>

      <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-6 sm:p-8 shadow-sm">
        <h1 className="text-xl font-bold text-gray-100 mb-6">Пополнение баланса</h1>
        
        {/* Инфо-блок с балансом */}
        <div className="bg-[#272729] rounded-md p-4 mb-6 border border-[#343536] flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Пользователь</p>
            <p className="text-gray-200 font-medium">{user?.username}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Текущий баланс</p>
            <p className="text-green-500 font-bold text-lg">{user?.balance.toFixed(2)} ₽</p>
          </div>
        </div>

        <form action={addFunds} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Сумма пополнения (RUB)
            </label>
            <input
              type="number"
              name="amount"
              min="1"
              step="1"
              required
              placeholder="0"
              className="w-full bg-[#272729] border border-[#343536] focus:border-gray-400 focus:bg-[#1A1A1B] rounded-md p-3 text-gray-100 outline-none transition-colors"
            />
          </div>

          {/* Предупреждение */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-md text-sm text-yellow-500/80">
            <p className="font-bold mb-1">Тестовый режим</p>
            <p>Эта функция носит демонстрационный характер и добавляет средства без проведения реальных платежей.</p>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-full transition shadow-sm text-sm"
          >
            Пополнить баланс
          </button>
        </form>
      </div>
    </div>
  );
}