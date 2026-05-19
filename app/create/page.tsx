import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createPost } from "@/lib/actions/post";
import Link from "next/link";

export default async function CreatePostPage() {
  const session = await auth();
  
  // Если не авторизован - выкидываем на логин
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-3xl mx-auto font-mono space-y-6">
      
      <Link href="/" className="inline-block text-[#4AF626]/60 hover:text-white hover:text-glow transition mb-2 font-bold text-[11px]">
        &lt; ABORT_OPERATION
      </Link>

      <div className="border border-[#4AF626]/50 bg-[#0A0A0A]/80 p-6 sm:p-8 shadow-[0_0_15px_rgba(74,246,38,0.05)] relative overflow-hidden">
        
        {/* Декоративные элементы */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#4AF626]/30"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-[#4AF626]/20"></div>

        <h1 className="text-xl sm:text-2xl font-bold text-white text-glow mb-2 uppercase tracking-widest">
          ~// thread_injector.exe
        </h1>
        <p className="text-[#4AF626]/60 text-xs mb-8 uppercase tracking-widest">
          STATUS: <span className="text-[#4AF626] font-bold animate-pulse text-glow">READY</span> | NODE_USR: {session.user.username}
        </p>

        {/* Форма вызывает твой серверный экшен createPost */}
        <form action={createPost} className="space-y-6">
          
          {/* Заголовок */}
          <div>
            <label className="block text-[10px] text-[#4AF626]/70 mb-2 uppercase tracking-widest">RECORD_TITLE</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-[#4AF626]/50 font-bold">&gt;</span>
              <input 
                type="text" 
                name="title" 
                required 
                placeholder="Enter title..."
                className="w-full bg-[#4AF626]/5 border border-[#4AF626]/30 p-3 pl-8 text-sm text-[#4AF626] focus:border-[#4AF626] focus:shadow-[0_0_10px_rgba(74,246,38,0.1)] outline-none transition-all placeholder:text-[#4AF626]/30" 
              />
            </div>
          </div>

          {/* Текст поста (Стилизован под консольный редактор nano) */}
          <div>
            <label className="block text-[10px] text-[#4AF626]/70 mb-2 uppercase tracking-widest">DATA_PAYLOAD</label>
            <div className="relative border border-[#4AF626]/30 focus-within:border-[#4AF626] focus-within:shadow-[0_0_10px_rgba(74,246,38,0.1)] transition-all bg-[#4AF626]/5">
              
              {/* Шапка "редактора" */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#4AF626]/20 bg-[#4AF626]/10 text-[9px] text-[#4AF626]/70 font-bold uppercase tracking-widest select-none">
                 <span>[ nano editor v2.0 ]</span>
                 <span>UTF-8</span>
              </div>
              
              <textarea 
                name="content" 
                required 
                rows={12} 
                placeholder="Type your message here..."
                className="w-full bg-transparent p-4 text-sm text-[#4AF626] outline-none resize-y placeholder:text-[#4AF626]/30 leading-relaxed" 
              />
            </div>
          </div>

          {/* Теги */}
          <div>
            <label className="block text-[10px] text-[#4AF626]/70 mb-2 uppercase tracking-widest">TAGS (comma separated)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-[#4AF626]/50 font-bold">#</span>
              <input 
                type="text" 
                name="tags" 
                placeholder="tech, news, code..."
                className="w-full bg-[#4AF626]/5 border border-[#4AF626]/30 p-3 pl-8 text-sm text-[#4AF626] focus:border-[#4AF626] focus:shadow-[0_0_10px_rgba(74,246,38,0.1)] outline-none transition-all placeholder:text-[#4AF626]/30" 
              />
            </div>
          </div>

          {/* Кнопка отправки */}
          <div className="flex justify-end pt-6 border-t border-[#4AF626]/20">
            <button 
              type="submit" 
              className="border border-[#4AF626] bg-[#0A0A0A] text-[#4AF626] hover:bg-[#4AF626] hover:text-[#0A0A0A] hover:shadow-[0_0_15px_rgba(74,246,38,0.5)] px-8 py-3 text-xs font-bold tracking-widest transition-all uppercase"
            >
              [ INJECT_DATA ]
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}