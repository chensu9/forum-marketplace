// lib/actions/user.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Необходимо войти в аккаунт");
  }

  // 1. Достаем все поля (и твои старые, и новые)
  const bio = formData.get("bio") as string | null;
  const newUsername = formData.get("username") as string | null;
  const image = formData.get("image") as string | null;

  let finalUsername = session.user.username;

  // 2. ТВОЯ ЛОГИКА: Проверяем никнейм, если он пришел из формы
  if (newUsername !== null) {
    if (newUsername.trim() === "") {
      throw new Error("Никнейм не может быть пустым");
    }
    
    if (newUsername !== session.user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: newUsername },
      });

      if (existingUser) {
        throw new Error("Этот никнейм уже занят кем-то другим 😔");
      }
      finalUsername = newUsername;
    }
  }

  // 3. Собираем данные для обновления (только те, что реально есть)
  const dataToUpdate: any = { username: finalUsername };
  
  if (bio !== null) dataToUpdate.bio = bio;
  if (image !== null) dataToUpdate.image = image || null; // Если строка пустая, вернет null (удалит картинку)

  // 4. Обновляем базу
  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: dataToUpdate,
  });

  // 5. ТВОЯ ЛОГИКА: Обновляем кэш для старого и нового пути
  revalidatePath(`/profile/${session.user.username}`);
  revalidatePath(`/profile/${updatedUser.username}`);

  // 6. Перекидываем пользователя в профиль
  redirect(`/profile/${updatedUser.username}`);
}
export async function updateBackground(url: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { profileBackground: url },
  });

  revalidatePath(`/profile/${session.user.username}`);
}