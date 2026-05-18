// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. Создаем пул соединений PostgreSQL
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Создаем адаптер для Prisma
const adapter = new PrismaPg(pool);

// 3. Сохраняем PrismaClient в глобальном объекте (защита от утечек памяти в Next.js dev mode)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 4. Передаем адаптер в конструктор
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}