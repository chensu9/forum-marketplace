"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Необходимо войти в систему");

  const username = formData.get("username") as string;
  const bio = formData.get("bio") as string;
  const avatarFile = formData.get("avatarFile") as File | null;

  let imageUrl = undefined;

  // 1. ЕСЛИ ПОЛЬЗОВАТЕЛЬ ЗАГРУЗИЛ НОВЫЙ АВАТАР
  if (avatarFile && avatarFile.size > 0) {
    const bytes = await avatarFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Игнорируем ошибку
    }

    const fileName = `${session.user.id}-${Date.now()}-${avatarFile.name.replace(/\s/g, "_")}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);
    imageUrl = `/uploads/${fileName}`;
  }

  // 2. ОБНОВЛЯЕМ БАЗУ ДАННЫХ
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      username: username || undefined,
      bio: bio || undefined,
      ...(imageUrl && { image: imageUrl }),
    }
  });

  // 3. СБРАСЫВАЕМ КЭШ СТРАНИЦ
  revalidatePath("/");
  revalidatePath("/settings");
  revalidatePath(`/profile/${username}`);
  
  redirect(`/profile/${username}`);
}

// ==========================================
// ОБНОВЛЕНИЕ ФОНА ПРОФИЛЯ
// ==========================================
export async function updateBackground(imageUrl: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Необходимо войти в систему");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { profileBackground: imageUrl }
  });

  revalidatePath("/");
  revalidatePath("/profile/[username]", "page");
  
  return { success: true };
}

// ==========================================
// ЖАЛОБА НА ПОЛЬЗОВАТЕЛЯ (REPORT USER)
// ==========================================
export async function reportUser(targetUserId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Необходимо войти в аккаунт");

  if (!reason || reason.trim().length < 5) {
    throw new Error("Пожалуйста, укажите развернутую причину жалобы");
  }

  // Используем connect по аналогии с маркетом, связывая с targetUser
  await prisma.report.create({
    data: {
      reason: `[Жалоба на профиль пользователя] ${reason}`,
      user: {
        connect: { id: session.user.id } // Кто пожаловался
      },
      targetUser: {
        connect: { id: targetUserId } // На кого пожаловался
      }
    }
  });

  return { success: true };
}

// ==========================================
// ОТМЕТИТЬ ВСЕ УВЕДОМЛЕНИЯ КАК ПРОЧИТАННЫЕ
// ==========================================
export async function markAllNotificationsAsRead() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  // Обновляем статус всех непрочитанных уведомлений юзера
  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true }
  });

  revalidatePath("/");
}

// ==========================================
// ПОЛУЧИТЬ РОЛЬ ПОЛЬЗОВАТЕЛЯ (ДЛЯ АДМИНКИ)
// ==========================================
export async function getUserRole() {
  const session = await auth();
  if (!session?.user?.id) return null;
  
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });
  
  return currentUser?.role || null;
}