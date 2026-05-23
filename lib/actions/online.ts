"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Функция обновляет время lastSeen текущего пользователя
export async function pingOnlineStatus() {
  const session = await auth();
  if (!session?.user?.id) return;

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastSeen: new Date() }
    });
  } catch (error) {
    console.error("Ошибка обновления статуса онлайн:", error);
  }
}