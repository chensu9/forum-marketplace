"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Вспомогательная функция для сохранения картинок на диск сервера
async function saveUploadedFile(file: File, subDir: string = "products"): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Путь к папке public/uploads/products
  const uploadDir = path.join(process.cwd(), "public", "uploads", subDir);
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) {
    // Игнорируем, если папка уже существует
  }

  // Уникальное имя файла
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${file.name.replace(/\s/g, "_")}`;
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);
  return `/uploads/${subDir}/${fileName}`;
}

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
  const imageFile = formData.get("imageFile") as File | null; // Считываем файл с формы

  if (!title || !description || isNaN(price) || price < 0) {
    throw new Error("Пожалуйста, заполните все поля корректно");
  }

  // Сохраняем картинку на диск, если она прикреплена
  let imageUrl = null;
  if (imageFile) {
    imageUrl = await saveUploadedFile(imageFile, "listings");
  }

  await prisma.listing.create({
    data: {
      title,
      description,
      price,
      sellerId: session.user.id,
      imageUrl: imageUrl, // Записываем реальный путь к сохранённому файлу
    },
  });

  revalidatePath("/market");
  redirect("/market");
}

// ==========================================
// РЕДАКТИРОВАНИЕ ОБЪЯВЛЕНИЯ
// ==========================================
export async function updateListing(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const listingId = formData.get("listingId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priceString = formData.get("price") as string;
  const price = parseFloat(priceString);

  if (!title || !description || isNaN(price) || price < 0) {
    throw new Error("Пожалуйста, заполните все поля корректно");
  }

  // Защита: проверяем, существует ли товар и принадлежит ли он текущему юзеру
  const existingListing = await prisma.listing.findUnique({
    where: { id: listingId }
  });

  if (!existingListing || existingListing.sellerId !== session.user.id) {
    throw new Error("ACCESS_DENIED: Вы не являетесь владельцем этого товара");
  }

  const updateData: any = {
    title,
    description,
    price,
  };

  // Если загружена новая картинка с компьютера
  const imageFile = formData.get("imageFile") as File | null;
  if (imageFile && imageFile.size > 0) {
    const newImageUrl = await saveUploadedFile(imageFile, "listings");
    if (newImageUrl) {
      updateData.imageUrl = newImageUrl;
    }
  }

  // Обновляем запись в БД
  await prisma.listing.update({
    where: { id: listingId },
    data: updateData
  });

  // Очищаем кэш и редиректим обратно на страницу товара
  revalidatePath(`/market/${listingId}`);
  revalidatePath("/market");
  redirect(`/market/${listingId}`);
}

// ==========================================
// УДАЛЕНИЕ ОБЪЯВЛЕНИЯ
// ==========================================
export async function deleteListing(listingId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const listing = await prisma.listing.findUnique({
    where: { id: listingId }
  });

  if (!listing) throw new Error("Товар не найден");

  const isAdminOrMod = session.user.role === "ADMIN" || session.user.role === "MODERATOR";
  
  // Удалить может только владелец или администрация сайта
  if (listing.sellerId !== session.user.id && !isAdminOrMod) {
    throw new Error("У вас нет прав для удаления этого товара");
  }

  // Удаляем товар из базы данных
  await prisma.listing.delete({
    where: { id: listingId }
  });

  revalidatePath("/market");
  redirect("/market");
}

// ==========================================
// ЖАЛОБА НА ТОВАР (REPORT)
// ==========================================
// ==========================================
// ЖАЛОБА НА ТОВАР (REPORT)
// ==========================================
export async function reportListing(listingId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Необходимо войти в аккаунт");

  if (!reason || reason.trim().length < 5) {
    throw new Error("Пожалуйста, укажите развернутую причину жалобы");
  }

  // ИСПРАВЛЕНО: Убрали некорректное поле postId. 
  // Теперь передаются только текст жалобы и связь с её автором.
  await prisma.report.create({
    data: {
      reason: `[Жалоба на товар Маркета | ID товара: ${listingId}] ${reason}`,
      user: {
        connect: { id: session.user.id }
      }
    }
  });

  return { success: true };
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