import { createEvent } from "@/lib/actions/events";
import { listEventSummaries } from "@/lib/stats";
import { EventCard } from "@/components/EventCard";
import { SubmitButton } from "@/components/SubmitButton";
import { EventType } from "@/generated/prisma/enums";
import { eventTypeLabels } from "@/lib/labels";

export default async function DashboardPage() {
  const summaries = await listEventSummaries();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="relative flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tus eventos</h1>
          <p className="text-foreground/60 text-sm mt-1">
            Cada evento tiene su propia agenda, invitados, proveedores y presupuesto.
          </p>
        </div>
        <details className="w-full sm:w-auto">
          <summary className="cursor-pointer list-none rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90">
            + Nuevo evento
          </summary>
          <form
            action={createEvent}
            className="mt-3 w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-sm sm:absolute sm:right-4"
          >
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm">
                Nombre
                <input
                  name="name"
                  required
                  placeholder="Boda de Ana & Luis"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Tipo de evento
                <select
                  name="type"
                  required
                  defaultValue={EventType.BODA}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  {Object.values(EventType).map((type) => (
                    <option key={type} value={type}>
                      {eventTypeLabels[type]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Fecha y hora
                <input
                  type="datetime-local"
                  name="date"
                  required
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Lugar
                <input
                  name="location"
                  placeholder="Salón, jardín, hotel…"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Cliente / anfitrión
                <input
                  name="hostName"
                  placeholder="Nombre del cliente"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Presupuesto total
                <input
                  type="number"
                  name="totalBudget"
                  min="0"
                  step="0.01"
                  placeholder="180000"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end">
              <SubmitButton>Crear evento</SubmitButton>
            </div>
          </form>
        </details>
      </div>

      {summaries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-foreground/60">
          Todavía no tienes eventos. Crea el primero con el botón de arriba.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map((summary) => (
            <EventCard key={summary.event.id} summary={summary} />
          ))}
        </div>
      )}
    </div>
  );
}
