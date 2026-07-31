"use server";

import { prisma } from "@/lib/prisma";
import { MenuCourse } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";

function revalidateEvent(eventId: string) {
  revalidatePath(`/eventos/${eventId}/menu`);
}

function parseMenuFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre del platillo es obligatorio");

  const course = String(formData.get("course") ?? "");
  if (!Object.values(MenuCourse).includes(course as MenuCourse)) {
    throw new Error("Tiempo de menú inválido");
  }

  const description = String(formData.get("description") ?? "").trim();
  const vendorId = String(formData.get("vendorId") ?? "").trim();

  return {
    name,
    course: course as MenuCourse,
    description: description || null,
    isVegetarian: formData.get("isVegetarian") === "on",
    isKidsOption: formData.get("isKidsOption") === "on",
    vendorId: vendorId || null,
  };
}

export async function createMenuItem(eventId: string, formData: FormData) {
  const data = parseMenuFields(formData);
  const count = await prisma.menuItem.count({ where: { eventId, course: data.course } });
  await prisma.menuItem.create({ data: { ...data, eventId, order: count } });
  revalidateEvent(eventId);
}

export async function updateMenuItem(eventId: string, itemId: string, formData: FormData) {
  const data = parseMenuFields(formData);
  await prisma.menuItem.update({ where: { id: itemId }, data });
  revalidateEvent(eventId);
}

export async function deleteMenuItem(eventId: string, itemId: string) {
  await prisma.menuItem.delete({ where: { id: itemId } });
  revalidateEvent(eventId);
}
