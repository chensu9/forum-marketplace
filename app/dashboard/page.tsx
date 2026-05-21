import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Панель управления</h1>
        <p className="mt-1 text-sm text-gray-400">
          Добро пожаловать, {user.name ?? user.username ?? user.email}
        </p>
      </div>

      <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 border-b border-[#343536] pb-3">
          Ваши данные
        </h2>
        
        <dl className="space-y-4 text-sm">
          <div className="flex flex-col sm:flex-row sm:gap-4 border-b border-[#343536] pb-3">
            <dt className="w-32 text-gray-500 shrink-0 mb-1 sm:mb-0">Имя</dt>
            <dd className="text-gray-200 font-medium">{user.name ?? "—"}</dd>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:gap-4 border-b border-[#343536] pb-3">
            <dt className="w-32 text-gray-500 shrink-0 mb-1 sm:mb-0">Username</dt>
            <dd className="text-gray-200 font-medium">@{user.username ?? "—"}</dd>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:gap-4 border-b border-[#343536] pb-3">
            <dt className="w-32 text-gray-500 shrink-0 mb-1 sm:mb-0">Email</dt>
            <dd className="text-gray-200 font-medium break-all">{user.email}</dd>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:gap-4">
            <dt className="w-32 text-gray-500 shrink-0 mb-1 sm:mb-0">Роль</dt>
            <dd className="text-blue-400 font-bold uppercase text-xs tracking-wide bg-blue-900/20 px-2 py-0.5 rounded w-fit">
              {user.role}
            </dd>
          </div>
        </dl>
      </div>
    </main>
  );
}