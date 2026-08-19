import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function getFeriaOrNotFound(feriaId: string) {
  const feria = await prisma.feria.findUnique({ where: { id: feriaId } });
  if (!feria) notFound();
  return feria;
}
