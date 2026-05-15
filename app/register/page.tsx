import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">NexusBoard</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Create a new account
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}