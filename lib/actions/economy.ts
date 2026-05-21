"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Функция пополнения баланса
export async function addFunds(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const amountString = formData.get("amount") as string;
  const amount = parseFloat(amountString);

  if (isNaN(amount) || amount <= 0) {
    throw new Error("SYS_ERR: INVALID_AMOUNT");
  }

  // Начисляем деньги пользователю
  await prisma.user.update({
    where: { id: session.user.id },
    data: { balance: { increment: amount } }
  });

  // Обновляем кэш, чтобы баланс сразу изменился везде
  revalidatePath("/", "layout");
  redirect("/");
}
// Получить текущий баланс пользователя
export async function getUserRole() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  return user?.role || null;
}
// Получить текущий баланс пользователя
export async function getUserBalance() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { balance: true }
  });

  return user?.balance || 0;
}