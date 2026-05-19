import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { updateProfile } from "@/lib/actions/user";

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto font-mono space-y-6">
      
      <Link href={`/profile/${user.username}`} className="inline-block text-[#4AF626]/60 hover:text-white hover:text-glow transition mb-2 font-bold text-[11px]">
        &lt; RETURN_TO_PROFILE
      </Link>

      <div className="border border-[#4AF626]/50 bg-[#0A0A0A]/80 p-6 sm:p-8 shadow-[0_0_15px_rgba(74,246,38,0.05)] relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-[#4AF626]/30"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#4AF626]/10"></div>

        <h1 className="text-xl sm:text-2xl font-bold text-white text-glow mb-2 uppercase tracking-widest">
          ~// sys_config.exe
        </h1>
        <p className="text-[#4AF626]/60 text-xs mb-8 uppercase tracking-widest">
          NODE: <span className="text-white text-glow">{user.username}</span> | STATUS: <span className="text-yellow-500 font-bold animate-pulse">AWAITING_INPUT</span>
        </p>

        <form action={updateProfile} className="space-y-6">
          
          {/* Никнейм */}
          <div>
            <label className="block text-[10px] text-[#4AF626]/70 mb-2 uppercase tracking-widest">
              NODE_ALIAS (Username)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-[#4AF626]/50 font-bold">&gt;</span>
              <input 
                type="text" 
                name="username" 
                defaultValue={user.username}
                required
                className="w-full bg-[#4AF626]/5 border border-[#4AF626]/30 p-3 pl-8 text-sm text-[#4AF626] focus:border-[#4AF626] focus:shadow-[0_0_10px_rgba(74,246,38,0.1)] outline-none transition-all" 
              />
            </div>
          </div>

          {/* Аватарка */}
          <div>
            <label className="block text-[10px] text-[#4AF626]/70 mb-2 uppercase tracking-widest">
              AVATAR_URL_PATH (Image Link)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-[#4AF626]/50 font-bold">&gt;</span>
              <input 
                type="url" 
                name="image" 
                defaultValue={user.image || ""}
                placeholder="https://example.com/avatar.png"
                className="w-full bg-[#4AF626]/5 border border-[#4AF626]/30 p-3 pl-8 text-sm text-[#4AF626] focus:border-[#4AF626] focus:shadow-[0_0_10px_rgba(74,246,38,0.1)] outline-none transition-all placeholder:text-[#4AF626]/30" 
              />
            </div>
          </div>

          {/* О себе (Bio) - Заработает, если у тебя есть поле bio в базе */}
          <div>
            <label className="block text-[10px] text-[#4AF626]/70 mb-2 uppercase tracking-widest">
              USER_BIO (Description)
            </label>
            <textarea 
              name="bio" 
              rows={3}
              // @ts-ignore - игнорируем ошибку TS, если поля bio еще нет в схеме Prisma
              defaultValue={user.bio || ""}
              placeholder="System administrator..."
              className="w-full bg-[#4AF626]/5 border border-[#4AF626]/30 p-3 text-sm text-[#4AF626] focus:border-[#4AF626] focus:shadow-[0_0_10px_rgba(74,246,38,0.1)] outline-none transition-all placeholder:text-[#4AF626]/30 resize-y" 
            />
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              className="border border-[#4AF626] bg-[#0A0A0A] text-[#4AF626] hover:bg-[#4AF626] hover:text-[#0A0A0A] hover:shadow-[0_0_15px_rgba(74,246,38,0.5)] px-8 py-3 text-xs font-bold tracking-widest transition-all uppercase"
            >
              [ OVERWRITE_CONFIG ]
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}