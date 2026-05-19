"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createReport(postId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED: Session not found");
  }

  // Защита от спама: проверяем, не жаловался ли этот юзер на этот пост ранее
  const existingReport = await prisma.report.findFirst({
    where: { 
      postId: postId,
      userId: session.user.id 
    }
  });

  if (existingReport) {
    throw new Error("ALREADY_REPORTED: You have already flagged this record.");
  }

  // Создаем запись
  await prisma.report.create({
    data: {
      reason,
      postId,
      userId: session.user.id
    }
  });

  return { success: true };
}