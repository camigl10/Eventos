import Link from "next/link";
import { getEventOrNotFound } from "@/lib/getEvent";
import { getEventBudgetSummary, getGuestHeadcounts, getInventoryStats } from "@/lib/stats";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatTime, toDateTimeLocalValue } from "@/lib/format";
import { eventTypeLabels } from "@/lib/labels";
import { updateEvent, deleteEvent } from "@/lib/actions/events";
import { EventType } from "@/generated/prisma/enums";
import type { Event } from "@/generated/prisma/client";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { Pill } from "@/components/Pill";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEventOrNotFound(eventId);
  const isFeria = event.type === EventType.FERIA;

  const updateEventWithId = updateEvent.bind(null, eventId);
  const deleteEventWithId = deleteEvent.bind(null, eventId);

  if (isFeria) {
    const stats = await getInventoryStats(eventId);
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-foreground/50">Artículos</div>
            <div className="mt-1 font-mono text-2xl font-semibold tabular-nums">{stats.totalItems}</div>
            <p className="text-sm text-foreground/60">
              {stats.soldItems} vendidos · {stats.availableItems} disponibles
            </p>
            <Link href={`/eventos/${eventId}/inventario`} className="mt-2 inline-block text-sm text-accent hover:underline">
              Ver inventario →
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 sm:col-span-2">
            <div className="text-xs font-medium uppercase tracking-wide text-foreground/50">Total vendido</div>
            <div className="mt-1 font-mono text-2xl font-semibold tabular-nums">
              {formatCurrency(stats.totalRevenue)}
            </div>
            {stats.bySeller.length === 0 ? (
              <p className="mt-2 text-sm text-foreground/60">Todavía no hay artículos registrados.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-1.5">
                {stats.bySeller.map((seller) => (
                  <div
                    key={seller.sellerName}
                    className="flex items-center justify-between border-b border-border/60 pb-1.5 text-sm last:border-0 last:pb-0"
                  >
                    <span>
                      {seller.sellerName}
                      <span className="ml-2 text-xs text-foreground/50">
                        {seller.itemsSold}/{seller.itemsListed} vendidos
                      </span>
                    </span>
                    <span className="font-mono font-medium tabular-nums">{formatCurrency(seller.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <EventEditDetails event={event} updateEventWithId={updateEventWithId} showDjNotes={false} />

        <form action={deleteEventWithId} className="flex items-center justify-between rounded-xl border border-bad/30 bg-bad-soft/30 px-5 py-3">
          <p className="text-sm text-foreground/70">Eliminar este evento borra también todo su inventario.</p>
          <ConfirmSubmit
            message={`¿Eliminar "${event.name}" y todos sus datos? Esta acción no se puede deshacer.`}
            className="whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium text-bad hover:bg-bad-soft"
          >
            Eliminar evento
          </ConfirmSubmit>
        </form>
      </div>
    );
  }

  const [budget, guests, nextSchedule] = await Promise.all([
    getEventBudgetSummary(eventId),
    getGuestHeadcounts(eventId),
    prisma.scheduleItem.findMany({
      where: { eventId },
      orderBy: { order: "asc" },
      take: 4,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-foreground/50">
            Invitados
          </div>
          <div className="mt-1 font-mono text-2xl font-semibold tabular-nums">
            {guests.confirmedGuests}
            <span className="text-base font-normal text-foreground/50"> / {guests.totalGuests}</span>
          </div>
          <p className="text-sm text-foreground/60">confirmados · {guests.expectedHeadcount} personas esperadas</p>
          <Link href={`/eventos/${eventId}/invitados`} className="mt-2 inline-block text-sm text-accent hover:underline">
            Ver invitados →
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-foreground/50">
            Presupuesto
          </div>
          <div className="mt-1 font-mono text-2xl font-semibold tabular-nums">
            {formatCurrency(budget.totalCost)}
          </div>
          <p className="text-sm text-foreground/60">
            {budget.totalBudget === null
              ? "sin presupuesto total definido"
              : `de ${formatCurrency(budget.totalBudget)}`}
          </p>
          <div className="mt-2">
            {budget.totalBudget === null ? (
              <Pill tone="neutral">Sin definir</Pill>
            ) : budget.overBudget ? (
              <Pill tone="bad">Excede por {formatCurrency(budget.overBudgetBy)}</Pill>
            ) : (
              <Pill tone="good">Dentro de presupuesto</Pill>
            )}
          </div>
          <Link href={`/eventos/${eventId}/proveedores`} className="mt-2 inline-block text-sm text-accent hover:underline">
            Ver proveedores →
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-foreground/50">
            Próximo en el cronograma
          </div>
          {nextSchedule.length === 0 ? (
            <p className="mt-2 text-sm text-foreground/60">Todavía no hay actividades programadas.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1.5 text-sm">
              {nextSchedule.map((item) => (
                <li key={item.id} className="flex gap-2">
                  <span className="font-mono tabular-nums text-foreground/50">{formatTime(item.time)}</span>
                  <span>{item.activity}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href={`/eventos/${eventId}/cronograma`} className="mt-2 inline-block text-sm text-accent hover:underline">
            Ver cronograma →
          </Link>
        </div>
      </div>

      <EventEditDetails event={event} updateEventWithId={updateEventWithId} showDjNotes />

      <form action={deleteEventWithId} className="flex items-center justify-between rounded-xl border border-bad/30 bg-bad-soft/30 px-5 py-3">
        <p className="text-sm text-foreground/70">Eliminar este evento borra también sus invitados, proveedores, menú, cronograma y música.</p>
        <ConfirmSubmit
          message={`¿Eliminar "${event.name}" y todos sus datos? Esta acción no se puede deshacer.`}
          className="whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium text-bad hover:bg-bad-soft"
        >
          Eliminar evento
        </ConfirmSubmit>
      </form>
    </div>
  );
}

function EventEditDetails({
  event,
  updateEventWithId,
  showDjNotes,
}: {
  event: Event;
  updateEventWithId: (formData: FormData) => Promise<void>;
  showDjNotes: boolean;
}) {
  return (
    <details className="rounded-xl border border-border bg-surface">
      <summary className="cursor-pointer list-none px-5 py-3 text-sm font-medium">
        Editar datos del evento
      </summary>
      <form action={updateEventWithId} className="flex flex-col gap-3 border-t border-border px-5 py-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Nombre
            <input
              name="name"
              required
              defaultValue={event.name}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Tipo de evento
            <select
              name="type"
              required
              defaultValue={event.type}
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
              defaultValue={toDateTimeLocalValue(event.date)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Lugar
            <input
              name="location"
              defaultValue={event.location ?? ""}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Cliente / anfitrión
            <input
              name="hostName"
              defaultValue={event.hostName ?? ""}
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
              defaultValue={event.totalBudget ? Number(event.totalBudget) : ""}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>
        {showDjNotes && (
          <label className="flex flex-col gap-1 text-sm">
            Notas para el DJ (canciones prohibidas, pedidos del cliente)
            <textarea
              name="djNotes"
              rows={2}
              defaultValue={event.djNotes ?? ""}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        )}
        <div className="flex justify-end">
          <SubmitButton>Guardar cambios</SubmitButton>
        </div>
      </form>
    </details>
  );
}
