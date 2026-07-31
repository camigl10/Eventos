"use server";

import { prisma } from "@/lib/prisma";
import { MusicStatus } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";

function revalidateEvent(eventId: string) {
  revalidatePath(`/eventos/${eventId}/musica`);
}

function parseMusicFields(formData: FormData) {
  const moment = String(formData.get("moment") ?? "").trim();
  const songName = String(formData.get("songName") ?? "").trim();
  if (!moment) throw new Error("El momento musical es obligatorio");
  if (!songName) throw new Error("El nombre de la canción es obligatorio");

  const artist = String(formData.get("artist") ?? "").trim();
  const timeRaw = String(formData.get("time") ?? "").trim();
  const status = String(formData.get("status") ?? MusicStatus.PENDIENTE);
  const notes = String(formData.get("notes") ?? "").trim();

  if (!Object.values(MusicStatus).includes(status as MusicStatus)) {
    throw new Error("Estado inválido");
  }

  return {
    moment,
    songName,
    artist: artist || null,
    time: timeRaw ? new Date(timeRaw) : null,
    status: status as MusicStatus,
    notes: notes || null,
  };
}

export async function createMusicItem(eventId: string, formData: FormData) {
  const data = parseMusicFields(formData);
  const count = await prisma.musicItem.count({ where: { eventId } });
  await prisma.musicItem.create({ data: { ...data, eventId, order: count } });
  revalidateEvent(eventId);
}

export async function updateMusicItem(eventId: string, itemId: string, formData: FormData) {
  const data = parseMusicFields(formData);
  await prisma.musicItem.update({ where: { id: itemId }, data });
  revalidateEvent(eventId);
}

export async function deleteMusicItem(eventId: string, itemId: string) {
  await prisma.musicItem.delete({ where: { id: itemId } });
  revalidateEvent(eventId);
}
