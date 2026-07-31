"use server";

import { prisma } from "@/lib/prisma";
import { EventType } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseEventFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const date = String(formData.get("date") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const hostName = String(formData.get("hostName") ?? "").trim();
  const totalBudgetRaw = String(formData.get("totalBudget") ?? "").trim();

  if (!name) throw new Error("El nombre del evento es obligatorio");
  if (!Object.values(EventType).includes(type as EventType)) {
    throw new Error("Tipo de evento inválido");
  }
  if (!date) throw new Error("La fecha del evento es obligatoria");

  return {
    name,
    type: type as EventType,
    date: new Date(date),
    location: location || null,
    hostName: hostName || null,
    totalBudget: totalBudgetRaw ? Number(totalBudgetRaw) : null,
  };
}

export async function createEvent(formData: FormData) {
  const data = parseEventFields(formData);
  const event = await prisma.event.create({ data });
  revalidatePath("/");
  redirect(`/eventos/${event.id}`);
}

export async function updateEvent(eventId: string, formData: FormData) {
  const data = parseEventFields(formData);
  const djNotes = String(formData.get("djNotes") ?? "").trim();
  await prisma.event.update({
    where: { id: eventId },
    data: { ...data, djNotes: djNotes || null },
  });
  revalidatePath("/");
  revalidatePath(`/eventos/${eventId}`);
}

export async function updateDjNotes(eventId: string, formData: FormData) {
  const djNotes = String(formData.get("djNotes") ?? "").trim();
  await prisma.event.update({ where: { id: eventId }, data: { djNotes: djNotes || null } });
  revalidatePath(`/eventos/${eventId}`);
  revalidatePath(`/eventos/${eventId}/musica`);
}

export async function deleteEvent(eventId: string) {
  await prisma.event.delete({ where: { id: eventId } });
  revalidatePath("/");
  redirect("/");
}
