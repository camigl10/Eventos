"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "inventario");
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function revalidateEvent(eventId: string) {
  revalidatePath("/");
  revalidatePath(`/eventos/${eventId}`);
  revalidatePath(`/eventos/${eventId}/inventario`);
}

/** Saves an uploaded photo to public/uploads/inventario and returns its public URL, or null if no file was provided. */
async function savePhoto(file: FormDataEntryValue | null): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("La foto debe ser JPG, PNG, WEBP o GIF");
  if (file.size > MAX_PHOTO_BYTES) throw new Error("La foto no puede pesar más de 5MB");

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return `/uploads/inventario/${filename}`;
}

async function deletePhoto(photoUrl: string | null) {
  if (!photoUrl) return;
  const filename = path.basename(photoUrl);
  await unlink(path.join(UPLOAD_DIR, filename)).catch(() => {});
}

function parseInventoryFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre del artículo es obligatorio");

  const sellerName = String(formData.get("sellerName") ?? "").trim();
  if (!sellerName) throw new Error("El nombre de quién lo vende es obligatorio");

  const price = Number(formData.get("price") ?? 0) || 0;
  const notes = String(formData.get("notes") ?? "").trim();

  return { name, sellerName, price, notes: notes || null };
}

export async function createInventoryItem(eventId: string, formData: FormData) {
  const data = parseInventoryFields(formData);
  const photoUrl = await savePhoto(formData.get("photo"));
  await prisma.inventoryItem.create({ data: { ...data, photoUrl, eventId } });
  revalidateEvent(eventId);
}

export async function updateInventoryItem(eventId: string, itemId: string, formData: FormData) {
  const data = parseInventoryFields(formData);
  const newPhotoUrl = await savePhoto(formData.get("photo"));

  const existing = await prisma.inventoryItem.findUniqueOrThrow({ where: { id: itemId } });
  if (newPhotoUrl) await deletePhoto(existing.photoUrl);

  await prisma.inventoryItem.update({
    where: { id: itemId },
    data: { ...data, ...(newPhotoUrl ? { photoUrl: newPhotoUrl } : {}) },
  });
  revalidateEvent(eventId);
}

export async function toggleInventorySold(eventId: string, itemId: string) {
  const item = await prisma.inventoryItem.findUniqueOrThrow({ where: { id: itemId } });
  await prisma.inventoryItem.update({
    where: { id: itemId },
    data: { sold: !item.sold, soldAt: !item.sold ? new Date() : null },
  });
  revalidateEvent(eventId);
}

export async function deleteInventoryItem(eventId: string, itemId: string) {
  const item = await prisma.inventoryItem.findUniqueOrThrow({ where: { id: itemId } });
  await deletePhoto(item.photoUrl);
  await prisma.inventoryItem.delete({ where: { id: itemId } });
  revalidateEvent(eventId);
}
