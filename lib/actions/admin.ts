"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Функция изменения роли пользователя
export async function updateUserRole(userId: string, newRole: "USER" | "MODERATOR" | "ADMIN") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (currentUser?.role !== "ADMIN") {
    throw new Error("ACCESS_DENIED: Admin privileges required.");
  }

  if (userId === session.user.id && newRole !== "ADMIN") {
    throw new Error("OPERATION_FAILED: You cannot demote yourself.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  });

  revalidatePath("/admin/users");
  revalidatePath(`/profile`);
}

// ==========================================
// УПРАВЛЕНИЕ ЖАЛОБАМИ И ОЖИВЛЕНИЕ УВЕДОМЛЕНИЙ
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

// 2. Удалить пост-нарушитель + Уведомление автору
export async function deleteReportedPost(postId: string, reportId?: string) {
  const session = await auth();
  const currentUser = await prisma.user.findUnique({ where: { id: session?.user?.id } });
  
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MODERATOR")) {
    throw new Error("ACCESS_DENIED");
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Пост не найден");

  await prisma.$transaction([
    // Удаляем связанные данные
    prisma.comment.deleteMany({ where: { postId } }),
    prisma.post.delete({ where: { id: postId } }),
    // Создаем уведомление автору поста
    // @ts-ignore
    prisma.notification.create({
      data: {
        userId: post.authorId,
        content: `Ваш тред "${post.title}" был удален модератором за нарушение правил сообщества.`
      }
    }),
    // Закрываем жалобу, если она передана
    ...(reportId ? [
      prisma.report.update({
        where: { id: reportId },
        data: { status: "RESOLVED" }
      })
    ] : [])
  ]);

  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  revalidatePath("/");
}

// 3. НОВОЕ: Отправить предупреждение пользователю (Варн профиля)
export async function warnReportedUser(targetUserId: string, reportId: string, reason: string) {
  const session = await auth();
  const currentUser = await prisma.user.findUnique({ where: { id: session?.user?.id } });
  
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MODERATOR")) {
    throw new Error("ACCESS_DENIED");
  }

  await prisma.$transaction([
    // Генерируем официальный алерт в таблицу уведомлений
    // @ts-ignore
    prisma.notification.create({
      data: {
        userId: targetUserId,
        content: `⚠️ Ворнинг администрации: На ваш профиль поступила жалоба ("${reason}"). Пожалуйста, соблюдайте правила форума, иначе ваш аккаунт будет заблокирован.`
      }
    }),
    // Меняем статус жалобы на Рассмотрено
    prisma.report.update({
      where: { id: reportId },
      data: { status: "RESOLVED" }
    })
  ]);

  revalidatePath("/admin/reports");
}

// 4. НОВОЕ: Удалить комментарий через админку + Уведомление
export async function deleteReportedComment(commentId: string, reportId: string) {
  const session = await auth();
  const currentUser = await prisma.user.findUnique({ where: { id: session?.user?.id } });
  
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MODERATOR")) {
    throw new Error("ACCESS_DENIED");
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error("Комментарий не найден");

  await prisma.$transaction([
    // Удаляем сам коммент (каскадом удалятся ответы)
    prisma.comment.delete({ where: { id: commentId } }),
    // Уведомляем автора
    // @ts-ignore
    prisma.notification.create({
      data: {
        userId: comment.authorId,
        content: `Ваш комментарий в теме был удален модерацией за нарушение правил.`
      }
    }),
    // Закрываем кейс
    prisma.report.update({
      where: { id: reportId },
      data: { status: "RESOLVED" }
    })
  ]);

  revalidatePath("/admin/reports");
}

// 5. НОВОЕ: Удалить запрещенный товар из Маркета + Уведомление продавцу
export async function deleteReportedListing(listingId: string, reportId: string) {
  const session = await auth();
  const currentUser = await prisma.user.findUnique({ where: { id: session?.user?.id } });
  
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MODERATOR")) {
    throw new Error("ACCESS_DENIED");
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("Товар не найден");

  await prisma.$transaction([
    // Вычищаем товар из БД
    prisma.listing.delete({ where: { id: listingId } }),
    // Уведомляем продавца
    // @ts-ignore
    prisma.notification.create({
      data: {
        userId: listing.sellerId,
        content: `Ваше объявление "${listing.title}" на маркетплейсе было удалено администратором.`
      }
    }),
    // Закрываем жалобу
    prisma.report.update({
      where: { id: reportId },
      data: { status: "RESOLVED" }
    })
  ]);

  revalidatePath("/admin/reports");
  revalidatePath("/market");
}

// 6. Бан / Разбан пользователя
export async function toggleBanUser(userId: string) {
  const session = await auth();
  const currentUser = await prisma.user.findUnique({ where: { id: session?.user?.id } });
  
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("ACCESS_DENIED: Admin privileges required.");
  }

  if (userId === currentUser.id) {
    throw new Error("OPERATION_FAILED: You cannot ban yourself.");
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw new Error("USER_NOT_FOUND");

  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: !targetUser.isBanned }
  });

  revalidatePath("/admin/users");
  revalidatePath("/");
}