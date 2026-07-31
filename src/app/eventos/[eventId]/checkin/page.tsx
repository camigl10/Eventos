import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CheckInBoard } from "@/components/CheckInBoard";

export default async function CheckInPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const guests = await prisma.guest.findMany({
    where: { eventId, invitationStatus: "CONFIRMADA" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto flex max-w-md flex-col gap-3">
      {guests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-foreground/60">
          Todavía no hay invitados confirmados.{" "}
          <Link href={`/eventos/${eventId}/invitados`} className="text-accent hover:underline">
            Ir a invitados
          </Link>
        </div>
      ) : (
        <CheckInBoard eventId={eventId} guests={guests} />
      )}
    </div>
  );
}
