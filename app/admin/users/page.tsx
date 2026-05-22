import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { updateUserRole, toggleBanUser } from "@/lib/actions/admin";
import RoleBadge from "@/components/user/role-badge";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (currentUser?.role !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-6xl mx-auto font-mono space-y-6">
      
      <div className="flex justify-between items-end mb-2">
        <Link href="/admin" className="text-red-500/60 hover:text-red-500 hover:text-glow transition font-bold text-[11px]">
          &lt; ВЕРНУТСЯ В АДМИНКУ
        </Link>
        <div className="text-[10px] text-red-500/50 tracking-widest uppercase">
          Защещённый_Узел: {currentUser.username}
        </div>
      </div>

      <div className="border border-red-500/50 bg-[#0A0A0A]/90 p-6 shadow-[0_0_20px_rgba(239,68,68,0.1)] relative">
        <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-red-500/30"></div>

        <h1 className="text-xl font-bold text-red-500 text-glow uppercase tracking-widest mb-2">
          [ УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ]
        </h1>
        <p className="text-red-500/60 text-xs mb-8 uppercase tracking-widest">
          ВСЕГО ПОЛЬЗОВАТЕЛЕЙ: {users.length}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#4AF626]">
            <thead className="text-[10px] uppercase text-red-500/60 border-b border-red-500/30">
              <tr>
                <th className="pb-3 font-bold tracking-widest">ID</th>
                <th className="pb-3 font-bold tracking-widest">Никнейм</th>
                <th className="pb-3 font-bold tracking-widest">Роль</th>
                <th className="pb-3 font-bold tracking-widest text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-500/10">
              {users.map((user) => (
                <tr key={user.id} className={`transition-colors group ${user.isBanned ? 'opacity-50 bg-red-500/5' : 'hover:bg-red-500/5'}`}>
                  <td className="py-4 pr-4 font-bold text-red-500/50 text-xs">{user.id.slice(0, 8)}...</td>
                  <td className="py-4 pr-4 font-bold text-white flex items-center">
                    <Link href={`/profile/${user.username}`} className="hover:text-glow transition">
                      {user.username}
                    </Link>
                    <RoleBadge role={user.role} />
                    {user.isBanned && <span className="ml-2 text-[9px] text-red-500 border border-red-500 px-1 uppercase animate-pulse">[ ЗАБАНЕН ]</span>}
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`text-[10px] font-bold uppercase ${user.role === 'ADMIN' ? 'text-red-500' : user.role === 'MODERATOR' ? 'text-yellow-500' : 'text-[#4AF626]'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2 flex-wrap">
                      
                      {/* Управление ролями */}
                      {user.role !== "USER" && (
                        <form action={async () => { "use server"; await updateUserRole(user.id, "USER"); }}>
                          <button className="text-[9px] border border-[#4AF626]/30 text-[#4AF626] px-2 py-1 hover:bg-[#4AF626] hover:text-[#0A0A0A] font-bold uppercase transition">
                            [ УБРАТЬ_ПРАВА ]
                          </button>
                        </form>
                      )}
                      {user.role !== "MODERATOR" && (
                        <form action={async () => { "use server"; await updateUserRole(user.id, "MODERATOR"); }}>
                          <button className="text-[9px] border border-yellow-500/30 text-yellow-500 px-2 py-1 hover:bg-yellow-500 hover:text-[#0A0A0A] font-bold uppercase transition">
                            [ НАЗНАЧИТЬ_МОДЕРАТОРОМ ]
                          </button>
                        </form>
                      )}
                      
                      {/* КНОПКА БАНА (Нельзя забанить самого себя) */}
                      {user.id !== currentUser.id && (
                        <form action={async () => { "use server"; await toggleBanUser(user.id); }}>
                          <button className={`text-[9px] border px-2 py-1 font-bold uppercase transition ${user.isBanned ? 'border-green-500 text-green-500 hover:bg-green-500 hover:text-[#0A0A0A]' : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-[#0A0A0A]'}`}>
                            {user.isBanned ? '[ UNBAN_NODE ]' : '[ BAN_NODE ]'}
                          </button>
                        </form>
                      )}

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}