"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function revalidateEvent(eventId: string) {
  revalidatePath("/");
  revalidatePath(`/eventos/${eventId}`);
  revalidatePath(`/eventos/${eventId}/inventario`);
}

/** Reads an uploaded photo into bytes ready to store in the DB, or null if no file was provided. */
async function readPhoto(file: FormDataEntryValue | null): Promise<{ data: Uint8Array<ArrayBuffer>; mime: string } | null> {
  if (!(file instanceof File) || file.size === 0) return null;

  if (!ALLOWED_TYPES.has(file.type)) throw new Error("La foto debe ser JPG, PNG, WEBP o GIF");
  if (file.size > MAX_PHOTO_BYTES) throw new Error("La foto no puede pesar más de 5MB");

  const bytes = await file.arrayBuffer();
  const data = new Uint8Array(bytes.byteLength);
  data.set(new Uint8Array(bytes));
  return { data, mime: file.type };
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
  const photo = await readPhoto(formData.get("photo"));
  await prisma.inventoryItem.create({
    data: { ...data, photoData: photo?.data, photoMime: photo?.mime, eventId },
  });
  revalidateEvent(eventId);
}

export async function updateInventoryItem(eventId: string, itemId: string, formData: FormData) {
  const data = parseInventoryFields(formData);
  const photo = await readPhoto(formData.get("photo"));

  await prisma.inventoryItem.update({
    where: { id: itemId },
    data: { ...data, ...(photo ? { photoData: photo.data, photoMime: photo.mime } : {}) },
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
  await prisma.inventoryItem.delete({ where: { id: itemId } });
  revalidateEvent(eventId);
}
