// app/login/page.tsx
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0F0F14] px-4">
      <LoginForm />
    </main>
  );
}