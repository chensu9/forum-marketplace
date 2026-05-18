// lib/actions/comment.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createComment(formData: FormData) {
  // 1. Проверяем авторизацию
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Необходимо войти в аккаунт");
  }

  // 2. Достаем данные из формы (текст комментария и ID поста)
  const content = formData.get("content") as string;
  const postId = formData.get("postId") as string;

  if (!content || !postId) return;

  // 3. Создаем комментарий в базе
  await prisma.comment.create({
    data: {
      content,
      postId,
      authorId: session.user.id,
    },
  });

  // 4. Обновляем кэш страницы этого поста, чтобы коммент появился мгновенно
  revalidatePath(`/post/${postId}`);
}