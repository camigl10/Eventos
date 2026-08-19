"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseFeriaFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const location = String(formData.get("location") ?? "").trim();

  if (!name) throw new Error("El nombre de la feria es obligatorio");
  if (!date) throw new Error("La fecha de la feria es obligatoria");

  return {
    name,
    date: new Date(date),
    location: location || null,
  };
}

export async function createFeria(formData: FormData) {
  const data = parseFeriaFields(formData);
  const feria = await prisma.feria.create({ data });
  revalidatePath("/");
  redirect(`/ferias/${feria.id}`);
}

export async function updateFeria(feriaId: string, formData: FormData) {
  const data = parseFeriaFields(formData);
  await prisma.feria.update({ where: { id: feriaId }, data });
  revalidatePath("/");
  revalidatePath(`/ferias/${feriaId}`);
}

export async function deleteFeria(feriaId: string) {
  await prisma.feria.delete({ where: { id: feriaId } });
  revalidatePath("/");
  redirect("/");
}
