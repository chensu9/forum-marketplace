// lib/actions/order.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOrder(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Необходимо войти в аккаунт");
  }

  const listingId = formData.get("listingId") as string;
  const sellerId = formData.get("sellerId") as string;
  const price = parseFloat(formData.get("price") as string);

  // Защита от "самовыкупа"
  if (sellerId === session.user.id) {
    throw new Error("Вы не можете купить свой собственный товар!");
  }

  // Создаем заказ со статусом PENDING (Ожидает)
  await prisma.order.create({
    data: {
      listingId,
      sellerId,
      buyerId: session.user.id,
      price, // Фиксируем цену на момент покупки
    },
  });

  // Пока перенаправляем обратно в маркет (позже сделаем страницу "Мои покупки")
  revalidatePath("/market");
  redirect("/market");
}
// В конец файла lib/actions/order.ts добавь:

export async function updateOrderStatus(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Не авторизован");

  const orderId = formData.get("orderId") as string;
  const newStatus = formData.get("status") as any; // PENDING, IN_PROGRESS, COMPLETED, CANCELLED

  // Проверяем, существует ли заказ и имеет ли юзер к нему доступ
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new Error("Заказ не найден");
  
  if (order.buyerId !== session.user.id && order.sellerId !== session.user.id) {
    throw new Error("Нет прав на изменение этого заказа");
  }

  // Обновляем статус
  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  revalidatePath("/market/orders");
}