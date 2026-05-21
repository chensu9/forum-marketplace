export default function RoleBadge({ role }: { role: string }) {
  if (role === "ADMIN") {
    return (
      <span className="text-red-500 font-bold ml-1.5 text-[10px] uppercase shrink-0" title="System Administrator">
        [ADM]
      </span>
    );
  }
  
  if (role === "MODERATOR") {
    return (
      <span className="text-yellow-500 font-bold ml-1.5 text-[10px] uppercase shrink-0" title="Moderator">
        [MOD]
      </span>
    );
  }

  return null;
}