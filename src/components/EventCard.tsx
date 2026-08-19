import Link from "next/link";
import { Pill } from "@/components/Pill";
import { eventTypeLabels } from "@/lib/labels";
import { formatDate, formatCurrency } from "@/lib/format";
import type { listEventSummaries } from "@/lib/stats";

type Summary = Awaited<ReturnType<typeof listEventSummaries>>[number];

export function EventCard({ summary }: { summary: Summary }) {
  const { event, totalGuests, confirmedGuests, confirmedHeadcount, overBudget, totalBudget, inventory } = summary;

  return (
    <Link
      href={`/eventos/${event.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 transition hover:border-accent/50 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-foreground/50">
            {eventTypeLabels[event.type]} · {formatDate(event.date)}
          </div>
          <h3 className="mt-1 font-semibold text-lg leading-snug group-hover:text-accent">
            {event.name}
          </h3>
          {event.location && (
            <p className="text-sm text-foreground/60">{event.location}</p>
          )}
        </div>
      </div>

      {inventory ? (
        <>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="font-mono font-semibold tabular-nums">{inventory.soldItems}</span>
              <span className="text-foreground/50"> / {inventory.totalItems} vendidos</span>
            </div>
            <div>
              <span className="font-mono font-semibold tabular-nums">{formatCurrency(inventory.totalRevenue)}</span>
              <span className="text-foreground/50"> vendido</span>
            </div>
          </div>
          <div>
            {inventory.totalItems === 0 ? (
              <Pill tone="neutral">Sin artículos aún</Pill>
            ) : inventory.availableItems === 0 ? (
              <Pill tone="good">Todo vendido</Pill>
            ) : (
              <Pill tone="neutral">{inventory.availableItems} disponibles</Pill>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="font-mono font-semibold tabular-nums">{confirmedGuests}</span>
              <span className="text-foreground/50"> / {totalGuests} confirmados</span>
            </div>
            <div>
              <span className="font-mono font-semibold tabular-nums">{confirmedHeadcount}</span>
              <span className="text-foreground/50"> personas esperadas</span>
            </div>
          </div>

          <div>
            {totalBudget === null ? (
              <Pill tone="neutral">Sin presupuesto definido</Pill>
            ) : overBudget ? (
              <Pill tone="bad">Presupuesto excedido</Pill>
            ) : (
              <Pill tone="good">Dentro de presupuesto</Pill>
            )}
          </div>
        </>
      )}
    </Link>
  );
}
