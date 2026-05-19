// lib/actions/comment.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createComment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const content = formData.get("content") as string;
  const postId = formData.get("postId") as string;
  const parentId = formData.get("parentId") as string | null;

  if (!content || !postId) throw new Error("INVALID_DATA");

  await prisma.comment.create({
    data: {
      content,
      postId,
      authorId: session.user.id,
      parentId: parentId || null, // Если это ответ - запишется ID родителя
    }
  });

  revalidatePath(`/post/${postId}`);
}