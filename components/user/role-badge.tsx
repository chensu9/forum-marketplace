export default function RoleBadge({ role }: { role: string }) {
  if (role === "ADMIN") {
    return (
      <span className="text-red-500 font-bold ml-2 text-[8px] sm:text-[9px] uppercase tracking-widest border border-red-500/50 px-1 py-0.5 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)] shrink-0 inline-flex items-center h-fit">
        [ SYS_ADMIN ]
      </span>
    );
  }
  
  if (role === "MODERATOR") {
    return (
      <span className="text-yellow-500 font-bold ml-2 text-[8px] sm:text-[9px] uppercase tracking-widest border border-yellow-500/50 px-1 py-0.5 bg-yellow-500/10 shadow-[0_0_10px_rgba(234,179,8,0.2)] shrink-0 inline-flex items-center h-fit">
        [ MODERATOR ]
      </span>
    );
  }

  return null;
}