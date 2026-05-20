// lib/actions/market.ts
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
  if (!session?.user?.id) {
    throw new Error("Необходимо войти в аккаунт");
  }

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
// ГАРАНТ-СДЕЛКИ (ESCROW)
// ==========================================

// 1. Начать сделку (Заморозка средств)
export async function createEscrowOrder(listingId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("SYS_ERR: ITEM_NOT_FOUND");
  
  if (listing.sellerId === session.user.id) {
    throw new Error("SYS_ERR: CANNOT_BUY_OWN_ITEM");
  }

  await prisma.order.create({
    data: {
      listingId: listing.id,
      buyerId: session.user.id,
      sellerId: listing.sellerId,
      price: listing.price,
      status: "IN_PROGRESS", 
    }
  });

  redirect("/market/orders");
}

// 2. Подтвердить получение (Деньги уходят продавцу)
export async function confirmDelivery(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== session.user.id) throw new Error("ACCESS_DENIED");

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "COMPLETED" }
  });

  revalidatePath("/market/orders");
  revalidatePath("/market/sales");
}

// 3. Отмена сделки (Возврат)
export async function cancelEscrow(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("NOT_FOUND");
  
  if (order.buyerId !== session.user.id && order.sellerId !== session.user.id) {
    throw new Error("ACCESS_DENIED");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" }
  });

  revalidatePath("/market/orders");
  revalidatePath("/market/sales");
}