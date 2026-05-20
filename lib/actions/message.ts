"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function sendMessage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const content = formData.get("content") as string;
  const receiverUsername = formData.get("receiverUsername") as string;

  if (!content || !receiverUsername || content.trim() === "") return;

  const receiver = await prisma.user.findUnique({ 
    where: { username: receiverUsername } 
  });
  if (!receiver) throw new Error("USER_NOT_FOUND");

  // Создаем сообщение
  await prisma.message.create({
    data: {
      content,
      senderId: session.user.id,
      receiverId: receiver.id,
    }
  });

  // Обновляем кэш страницы диалога
  revalidatePath(`/messages/${receiverUsername}`);
}
// Получить количество непрочитанных сообщений
export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const count = await prisma.message.count({
    where: {
      receiverId: session.user.id,
      isRead: false,
    }
  });

  return count;
}