"use server";

import { prisma } from "@/lib/prisma";
import { InvitationStatus } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";

function revalidateEvent(eventId: string) {
  revalidatePath("/");
  revalidatePath(`/eventos/${eventId}`);
  revalidatePath(`/eventos/${eventId}/invitados`);
  revalidatePath(`/eventos/${eventId}/checkin`);
}

function parseGuestFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre del invitado es obligatorio");

  const group = String(formData.get("group") ?? "").trim();
  const companions = Number(formData.get("companions") ?? 0) || 0;
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const invitationStatus = String(formData.get("invitationStatus") ?? InvitationStatus.NO_ENVIADA);
  const notes = String(formData.get("notes") ?? "").trim();

  if (!Object.values(InvitationStatus).includes(invitationStatus as InvitationStatus)) {
    throw new Error("Estado de invitación inválido");
  }

  return {
    name,
    group: group || null,
    companions: Math.max(0, companions),
    phone: phone || null,
    email: email || null,
    invitationStatus: invitationStatus as InvitationStatus,
    notes: notes || null,
  };
}

export async function createGuest(eventId: string, formData: FormData) {
  const data = parseGuestFields(formData);
  await prisma.guest.create({ data: { ...data, eventId } });
  revalidateEvent(eventId);
}

export async function updateGuest(eventId: string, guestId: string, formData: FormData) {
  const data = parseGuestFields(formData);
  await prisma.guest.update({ where: { id: guestId }, data });
  revalidateEvent(eventId);
}

export async function deleteGuest(eventId: string, guestId: string) {
  await prisma.guest.delete({ where: { id: guestId } });
  revalidateEvent(eventId);
}

export async function setCheckedIn(eventId: string, guestId: string, checkedIn: boolean) {
  await prisma.guest.update({
    where: { id: guestId },
    data: { checkedIn, checkInTime: checkedIn ? new Date() : null },
  });
  revalidateEvent(eventId);
}

export async function setInvitationStatus(eventId: string, guestId: string, formData: FormData) {
  const status = String(formData.get("invitationStatus") ?? "");
  if (!Object.values(InvitationStatus).includes(status as InvitationStatus)) {
    throw new Error("Estado de invitación inválido");
  }
  await prisma.guest.update({
    where: { id: guestId },
    data: { invitationStatus: status as InvitationStatus },
  });
  revalidateEvent(eventId);
}

function parseCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(",").map((cell) => cell.trim()));
}

export async function importGuestsCsv(eventId: string, formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecciona un archivo CSV");
  }

  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length === 0) return;

  const header = rows[0].map((h) => h.toLowerCase());
  const dataRows = header.includes("nombre") || header.includes("name") ? rows.slice(1) : rows;

  const col = (row: string[], names: string[], fallbackIndex: number) => {
    for (const name of names) {
      const idx = header.indexOf(name);
      if (idx !== -1) return row[idx] ?? "";
    }
    return row[fallbackIndex] ?? "";
  };

  const guests = dataRows
    .map((row) => ({
      name: col(row, ["nombre", "name"], 0).trim(),
      group: col(row, ["grupo", "mesa", "group"], 1).trim() || null,
      companions: Number(col(row, ["acompañantes", "companions"], 2)) || 0,
      phone: col(row, ["telefono", "teléfono", "phone"], 3).trim() || null,
      email: col(row, ["email", "correo"], 4).trim() || null,
      notes: col(row, ["notas", "notes"], 5).trim() || null,
    }))
    .filter((g) => g.name.length > 0);

  if (guests.length === 0) return;

  await prisma.guest.createMany({
    data: guests.map((g) => ({ ...g, eventId })),
  });
  revalidateEvent(eventId);
}
