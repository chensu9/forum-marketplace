// lib/actions/user.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Необходимо войти в аккаунт" };
  }

  const bio = formData.get("bio") as string;
  const newUsername = formData.get("username") as string;

  // Базовая проверка
  if (!newUsername || newUsername.trim() === "") {
    return { error: "Никнейм не может быть пустым" };
  }

  // 1. Проверяем, решил ли пользователь вообще менять никнейм
  if (newUsername !== session.user.username) {
    
    // 2. Ищем в базе, не занят ли этот никнейм кем-то другим
    const existingUser = await prisma.user.findUnique({
      where: { username: newUsername },
    });

    if (existingUser) {
      return { error: "Этот никнейм уже занят кем-то другим 😔" };
    }
  }

  // 3. Если всё ок — обновляем данные пользователя
  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: { 
      bio, 
      username: newUsername 
    },
  });

  // 4. Обновляем кэш
  revalidatePath(`/profile/${session.user.username}`);
  revalidatePath(`/profile/${updatedUser.username}`);

  return { success: true, newUsername: updatedUser.username };
}