import { prisma } from "@/lib/prisma";
import { createScheduleItem } from "@/lib/actions/schedule";
import { ScheduleTimeline } from "@/components/ScheduleTimeline";
import { SubmitButton } from "@/components/SubmitButton";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const items = await prisma.scheduleItem.findMany({ where: { eventId }, orderBy: { order: "asc" } });

  const createScheduleItemWithEvent = createScheduleItem.bind(null, eventId);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Cronograma</h2>
          <p className="text-sm text-foreground/60">Arrastra ⠿ para reordenar las actividades.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/eventos/${eventId}/cronograma/imprimir`}
            target="_blank"
            className="rounded-md border border-border bg-surface px-3.5 py-2 text-sm font-medium hover:bg-border/30"
          >
            Vista imprimible
          </a>
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-accent-foreground hover:opacity-90">
              + Agregar actividad
            </summary>
            <form
              action={createScheduleItemWithEvent}
              className="absolute right-0 z-10 mt-2 w-80 rounded-xl border border-border bg-surface p-4 shadow-lg"
            >
              <div className="flex flex-col gap-2.5">
                <input
                  type="datetime-local"
                  name="time"
                  required
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
                />
                <input
                  name="activity"
                  required
                  placeholder="Actividad (ej. Ceremonia)"
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
                />
                <input
                  name="responsible"
                  placeholder="Responsable (DJ, maestro de ceremonias, staff…)"
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
                />
                <input
                  type="number"
                  min="0"
                  name="durationMinutes"
                  placeholder="Duración (minutos)"
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
                />
              </div>
              <div className="mt-3 flex justify-end">
                <SubmitButton>Agregar</SubmitButton>
              </div>
            </form>
          </details>
        </div>
      </div>

      <ScheduleTimeline eventId={eventId} items={items} />
    </div>
  );
}
