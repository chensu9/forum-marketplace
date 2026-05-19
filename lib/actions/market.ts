// lib/actions/market.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createListing(formData: FormData) {
  // 1. Проверяем авторизацию
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Необходимо войти в аккаунт");
  }

  // 2. Достаем данные из формы
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priceString = formData.get("price") as string;

  // Преобразуем цену в число
  const price = parseFloat(priceString);

  if (!title || !description || isNaN(price) || price < 0) {
    throw new Error("Пожалуйста, заполните все поля корректно");
  }

  // 3. Создаем объявление в БД
  await prisma.listing.create({
    data: {
      title,
      description,
      price,
      sellerId: session.user.id,
      // Временно оставляем массив картинок пустым, загрузку фото прикрутим позже
      imageUrl: formData.get("imageUrl") 
    },
  });

  // 4. Обновляем кэш маркета и перекидываем туда пользователя
  revalidatePath("/market");
  redirect("/market");
}