import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function getEventOrNotFound(eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) notFound();
  return event;
}
