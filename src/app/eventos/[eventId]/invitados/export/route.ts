import { prisma } from "@/lib/prisma";
import { invitationStatusLabels } from "@/lib/labels";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const guests = await prisma.guest.findMany({
    where: { eventId },
    orderBy: { name: "asc" },
  });

  const header = ["nombre", "grupo", "acompañantes", "telefono", "email", "estado", "notas", "llego", "hora_llegada"];
  const rows = guests.map((g) => [
    g.name,
    g.group ?? "",
    String(g.companions),
    g.phone ?? "",
    g.email ?? "",
    invitationStatusLabels[g.invitationStatus],
    g.notes ?? "",
    g.checkedIn ? "sí" : "no",
    g.checkInTime ? g.checkInTime.toISOString() : "",
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invitados.csv"`,
    },
  });
}
