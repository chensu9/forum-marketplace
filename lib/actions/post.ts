// lib/actions/post.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ==========================================
// СОЗДАНИЕ ПОСТА
// ==========================================
export async function createPost(formData: FormData) {
  // 1. Проверяем, авторизован ли пользователь
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Необходимо войти в аккаунт");
  }

  // 2. Достаем данные из формы
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const tagsString = formData.get("tags") as string;

  if (!title || !content) {
    throw new Error("Заголовок и текст обязательны");
  }

  // 3. Обрабатываем теги (например, "игры, новости" -> ["игры", "новости"])
  const tagNames = tagsString
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);

  // 4. Сохраняем пост в базу
  await prisma.post.create({
    data: {
      title,
      content,
      authorId: session.user.id,
      // Магия Prisma: connectOrCreate создаст тег, если его нет, или привяжет существующий
      tags: {
        connectOrCreate: tagNames.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
  });

  // 5. Обновляем кэш главной страницы и перекидываем пользователя туда
  revalidatePath("/");
  redirect("/");
}


// ==========================================
// УДАЛЕНИЕ ПОСТА
// ==========================================
export async function deletePost(postId: string) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) throw new Error("POST_NOT_FOUND");

  // Проверяем, что удаляет именно автор поста (в будущем добавим права админа/модератора)
  if (post.authorId !== session.user.id) {
    throw new Error("ACCESS_DENIED");
  }

  // Безопасно удаляем все комментарии к посту, а затем сам пост
  await prisma.$transaction([
    prisma.comment.deleteMany({ where: { postId } }),
    prisma.post.delete({ where: { id: postId } }),
  ]);

  // Обновляем главную страницу и перекидываем туда пользователя
  revalidatePath("/");
  redirect("/");
}

// ==========================================
// УНИВЕРСАЛЬНАЯ СИСТЕМА ГОЛОСОВАНИЯ (ЛАЙКИ / ДИЗЛАЙКИ)
// ==========================================
export async function handlePostVote(postId: string, voteType: "UPVOTE" | "DOWNVOTE") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Необходимо войти в аккаунт");

  const userId = session.user.id;

  // Ищем пост и проверяем, лайкнул ли его или дизлайкнул пользователь уже
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      likedBy: { where: { id: userId }, select: { id: true } },
      dislikedBy: { where: { id: userId }, select: { id: true } }
    }
  });

  if (!post) throw new Error("Пост не найден");

  const hasLiked = post.likedBy.length > 0;
  const hasDisliked = post.dislikedBy.length > 0;

  if (voteType === "UPVOTE") {
    if (hasLiked) {
      // Если лайк уже стоит — убираем его
      await prisma.post.update({
        where: { id: postId },
        data: { likedBy: { disconnect: { id: userId } } }
      });
    } else {
      // Иначе ставим лайк и принудительно убираем дизлайк (если он был)
      await prisma.post.update({
        where: { id: postId },
        data: {
          likedBy: { connect: { id: userId } },
          dislikedBy: { disconnect: { id: userId } }
        }
      });
    }
  } 
  
  if (voteType === "DOWNVOTE") {
    if (hasDisliked) {
      // Если дизлайк уже стоит — убираем его
      await prisma.post.update({
        where: { id: postId },
        data: { dislikedBy: { disconnect: { id: userId } } }
      });
    } else {
      // Иначе ставим дизлайк и принудительно убираем лайк (если он был)
      await prisma.post.update({
        where: { id: postId },
        data: {
          dislikedBy: { connect: { id: userId } },
          likedBy: { disconnect: { id: userId } }
        }
      });
    }
  }

  // Обновляем кэш страниц, чтобы изменения отобразились у всех
  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
}