import { prisma } from "@/lib/prisma";
import { getEventOrNotFound } from "@/lib/getEvent";
import { formatDate, formatTime } from "@/lib/format";
import { PrintButton } from "@/components/PrintButton";

export default async function SchedulePrintPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [event, items] = await Promise.all([
    getEventOrNotFound(eventId),
    prisma.scheduleItem.findMany({ where: { eventId }, orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl py-4">
      <div className="mb-4 flex justify-end">
        <PrintButton>Imprimir</PrintButton>
      </div>
      <h1 className="text-xl font-semibold">{event.name}</h1>
      <p className="text-sm text-foreground/60">Cronograma del evento · {formatDate(event.date)}</p>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-foreground/30 text-left">
            <th className="py-1.5 pr-3">Hora</th>
            <th className="py-1.5 pr-3">Actividad</th>
            <th className="py-1.5 pr-3">Responsable</th>
            <th className="py-1.5 pr-3 text-right">Duración</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-foreground/10">
              <td className="py-2 pr-3 font-mono tabular-nums">{formatTime(item.time)}</td>
              <td className="py-2 pr-3">{item.activity}</td>
              <td className="py-2 pr-3">{item.responsible ?? "—"}</td>
              <td className="py-2 pr-3 text-right">{item.durationMinutes ? `${item.durationMinutes} min` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
