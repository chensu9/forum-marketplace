"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Лайк / Дизлайк комментария
export async function toggleCommentLike(commentId: string, path: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const existingLike = await prisma.commentLike.findUnique({
    where: { userId_commentId: { userId, commentId } }
  });

  if (existingLike) {
    await prisma.commentLike.delete({
      where: { userId_commentId: { userId, commentId } }
    });
  } else {
    await prisma.commentLike.create({
      data: { userId, commentId }
    });
  }

  revalidatePath(path);
  return { success: true };
}

// 2. Жалоба на комментарий
export async function reportComment(commentId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.report.create({
    data: { userId: session.user.id, commentId, reason, status: "PENDING" }
  });

  return { success: true };
}

// 3. Жалоба на профиль
export async function reportProfile(targetUserId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.report.create({
    data: { userId: session.user.id, targetUserId, reason, status: "PENDING" }
  });

  return { success: true };
}