// prisma.config.ts
import "dotenv/config"; // <-- Заставляет Prisma прочитать файл .env
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // Явно указываем, где лежит наша схема
  schema: "./prisma/schema.prisma",
  datasource: {
    // Используем встроенную функцию env() для получения URL
    url: env("DATABASE_URL"), 
  },
});