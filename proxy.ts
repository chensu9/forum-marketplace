// proxy.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Защищаем всё, кроме статики, картинок и API-роутов
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};