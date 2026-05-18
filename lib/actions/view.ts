// lib/actions/view.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function incrementView(postId: string) {
  try {
    await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });
  } catch (error) {
    console.error("Ошибка при обновлении просмотров:", error);
  }
}