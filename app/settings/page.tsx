// app/settings/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import SettingsForm from "@/components/profile/settings-form";

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#0F0F14] text-white py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/profile/${user.username}`} className="text-gray-400 hover:text-white transition">
            ← Назад в профиль
          </Link>
          <h1 className="text-2xl font-bold">Настройки профиля</h1>
        </div>

        <div className="nb-card p-6 md:p-8">
          {/* Подключаем нашу новую форму */}
          <SettingsForm 
            initialUsername={user.username} 
            initialBio={user.bio} 
          />
        </div>

      </div>
    </div>
  );
}