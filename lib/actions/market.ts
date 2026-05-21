"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ==========================================
// СОЗДАНИЕ ОБЪЯВЛЕНИЯ
// ==========================================
export async function createListing(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Необходимо войти в аккаунт");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priceString = formData.get("price") as string;
  const price = parseFloat(priceString);

  if (!title || !description || isNaN(price) || price < 0) {
    throw new Error("Пожалуйста, заполните все поля корректно");
  }

  await prisma.listing.create({
    data: {
      title,
      description,
      price,
      sellerId: session.user.id,
      imageUrl: formData.get("imageUrl") as string | null,
    },
  });

  revalidatePath("/market");
  redirect("/market");
}

// ==========================================
// ГАРАНТ-СДЕЛКИ С ЭКОНОМИКОЙ (ESCROW)
// ==========================================

// 1. Начать сделку (Списываем деньги у покупателя)
export async function createEscrowOrder(listingId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("SYS_ERR: ITEM_NOT_FOUND");
  
  if (listing.sellerId === session.user.id) {
    throw new Error("SYS_ERR: CANNOT_BUY_OWN_ITEM");
  }

  // ПРОВЕРКА БАЛАНСА
  const buyer = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!buyer || buyer.balance < listing.price) {
    throw new Error("SYS_ERR: INSUFFICIENT_FUNDS. Пополните баланс.");
  }

  // ТРАНЗАКЦИЯ: Строго одновременно списываем деньги и создаем заказ
  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { balance: { decrement: listing.price } } // Замораживаем средства
    }),
    prisma.order.create({
      data: {
        listingId: listing.id,
        buyerId: session.user.id,
        sellerId: listing.sellerId,
        price: listing.price,
        status: "IN_PROGRESS", 
      }
    })
  ]);

  redirect("/market/orders");
}

// 2. Подтвердить получение (Зачисляем деньги продавцу с комиссией 2%)
export async function confirmDelivery(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== session.user.id || order.status !== "IN_PROGRESS") {
    throw new Error("ACCESS_DENIED or INVALID_STATE");
  }

  // РАСЧЕТ КОМИССИИ СИНДИКАТА (98% идет продавцу, 2% сгорает/уходит платформе)
  const payout = order.price * 0.98;

  // ТРАНЗАКЦИЯ: Завершаем заказ и переводим деньги продавцу
  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" }
    }),
    prisma.user.update({
      where: { id: order.sellerId },
      data: { balance: { increment: payout } } // Отдаем деньги продавцу
    })
  ]);

  revalidatePath("/market/orders");
  revalidatePath("/");
}

// 3. Отмена сделки (Возвращаем деньги покупателю)
export async function cancelEscrow(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "IN_PROGRESS") throw new Error("NOT_FOUND or INVALID_STATE");
  
  if (order.buyerId !== session.user.id && order.sellerId !== session.user.id) {
    throw new Error("ACCESS_DENIED");
  }

  // ТРАНЗАКЦИЯ: Отменяем заказ и возвращаем деньги обратно покупателю
  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" }
    }),
    prisma.user.update({
      where: { id: order.buyerId },
      data: { balance: { increment: order.price } } // Возврат средств (Full Refund)
    })
  ]);

  revalidatePath("/market/orders");
  revalidatePath("/");
}