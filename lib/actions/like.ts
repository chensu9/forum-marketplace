// lib/actions/like.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleLike(postId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Необходимо войти в аккаунт");
  }

  const userId = session.user.id;

  // Ищем пост и проверяем, лайкнул ли его уже этот пользователь
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      likedBy: {
        where: { id: userId },
      },
    },
  });

  if (!post) throw new Error("Пост не найден");

  const hasLiked = post.likedBy.length > 0;

  if (hasLiked) {
    // Если уже лайкал — убираем лайк (отвязываем пользователя)
    await prisma.post.update({
      where: { id: postId },
      data: {
        likedBy: { disconnect: { id: userId } },
      },
    });
  } else {
    // Если не лайкал — ставим лайк (привязываем пользователя)
    await prisma.post.update({
      where: { id: postId },
      data: {
        likedBy: { connect: { id: userId } },
      },
    });
  }

  // Обновляем кэш, чтобы новые данные подтянулись
  revalidatePath(`/post/${postId}`);
  revalidatePath("/");
}