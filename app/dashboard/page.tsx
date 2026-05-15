// app/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Welcome back, {user.name ?? user.username ?? user.email}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
            Session info
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-4">
              <dt className="w-24 text-zinc-500 dark:text-zinc-400 shrink-0">Name</dt>
              <dd>{user.name ?? "—"}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 text-zinc-500 dark:text-zinc-400 shrink-0">Username</dt>
              <dd>{user.username ?? "—"}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 text-zinc-500 dark:text-zinc-400 shrink-0">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 text-zinc-500 dark:text-zinc-400 shrink-0">Role</dt>
              <dd>{user.role}</dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}