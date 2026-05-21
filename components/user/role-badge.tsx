export default function RoleBadge({ role }: { role: string | null | undefined }) {
  if (!role || role === "USER") return null;

  if (role === "ADMIN") {
    return (
      <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ml-1 border border-red-500/30">
        Admin
      </span>
    );
  }

  if (role === "MODERATOR") {
    return (
      <span className="bg-orange-500/20 text-orange-400 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ml-1 border border-orange-500/30">
        Mod
      </span>
    );
  }

  return null;
}