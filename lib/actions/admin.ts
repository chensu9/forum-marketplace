"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Функция изменения роли пользователя
export async function updateUserRole(userId: string, newRole: "USER" | "MODERATOR" | "ADMIN") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  // Проверяем, что тот, кто меняет роль, сам является Админом
  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (currentUser?.role !== "ADMIN") {
    throw new Error("ACCESS_DENIED: Admin privileges required.");
  }

  // Защита от случайного снятия админки с самого себя
  if (userId === session.user.id && newRole !== "ADMIN") {
    throw new Error("OPERATION_FAILED: You cannot demote yourself.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  });

  revalidatePath("/admin/users");
  revalidatePath(`/profile`); // Сбрасываем кэш профилей
}
// ==========================================
// УПРАВЛЕНИЕ ЖАЛОБАМИ (REPORTS)
// ==========================================

// 1. Отклонить ложную жалобу
export async function dismissReport(reportId: string) {
  const session = await auth();
  const currentUser = await prisma.user.findUnique({ where: { id: session?.user?.id } });
  
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MODERATOR")) {
    throw new Error("ACCESS_DENIED");
  }

  await prisma.report.update({
    where: { id: reportId },
    data: { status: "DISMISSED" }
  });

  revalidatePath("/admin/reports");
  revalidatePath("/admin");
}

// 2. Удалить пост-нарушитель (жалобы удалятся автоматически каскадом)
export async function deleteReportedPost(postId: string) {
  const session = await auth();
  const currentUser = await prisma.user.findUnique({ where: { id: session?.user?.id } });
  
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MODERATOR")) {
    throw new Error("ACCESS_DENIED");
  }

  await prisma.$transaction([
    prisma.comment.deleteMany({ where: { postId } }),
    prisma.post.delete({ where: { id: postId } }),
  ]);

  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  revalidatePath("/");
}
// 3. Бан / Разбан пользователя
export async function toggleBanUser(userId: string) {
  const session = await auth();
  const currentUser = await prisma.user.findUnique({ where: { id: session?.user?.id } });
  
  // Только АДМИН может банить (Модераторам не даем такой власти)
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("ACCESS_DENIED: Admin privileges required.");
  }

  // Защита от случайного самоубийства
  if (userId === currentUser.id) {
    throw new Error("OPERATION_FAILED: You cannot ban yourself.");
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw new Error("USER_NOT_FOUND");

  // Переключаем статус
  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: !targetUser.isBanned }
  });

  revalidatePath("/admin/users");
  revalidatePath("/");
}