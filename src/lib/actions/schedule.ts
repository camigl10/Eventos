"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function revalidateEvent(eventId: string) {
  revalidatePath(`/eventos/${eventId}`);
  revalidatePath(`/eventos/${eventId}/cronograma`);
}

function parseScheduleFields(formData: FormData) {
  const activity = String(formData.get("activity") ?? "").trim();
  if (!activity) throw new Error("La actividad es obligatoria");

  const timeRaw = String(formData.get("time") ?? "");
  if (!timeRaw) throw new Error("La hora es obligatoria");

  const responsible = String(formData.get("responsible") ?? "").trim();
  const durationRaw = String(formData.get("durationMinutes") ?? "").trim();

  return {
    activity,
    time: new Date(timeRaw),
    responsible: responsible || null,
    durationMinutes: durationRaw ? Number(durationRaw) : null,
  };
}

export async function createScheduleItem(eventId: string, formData: FormData) {
  const data = parseScheduleFields(formData);
  const count = await prisma.scheduleItem.count({ where: { eventId } });
  await prisma.scheduleItem.create({ data: { ...data, eventId, order: count } });
  revalidateEvent(eventId);
}

export async function updateScheduleItem(eventId: string, itemId: string, formData: FormData) {
  const data = parseScheduleFields(formData);
  await prisma.scheduleItem.update({ where: { id: itemId }, data });
  revalidateEvent(eventId);
}

export async function deleteScheduleItem(eventId: string, itemId: string) {
  await prisma.scheduleItem.delete({ where: { id: itemId } });
  revalidateEvent(eventId);
}

export async function reorderScheduleItems(eventId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.scheduleItem.update({ where: { id }, data: { order: index } })
    )
  );
  revalidateEvent(eventId);
}
