import Link from "next/link";
import { Pill } from "@/components/Pill";
import { formatDate, formatCurrency } from "@/lib/format";
import type { listFeriaSummaries } from "@/lib/stats";

type Summary = Awaited<ReturnType<typeof listFeriaSummaries>>[number];

export function FeriaCard({ summary }: { summary: Summary }) {
  const { feria, inventory } = summary;

  return (
    <Link
      href={`/ferias/${feria.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 transition hover:border-accent/50 hover:shadow-sm"
    >
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-foreground/50">
          {formatDate(feria.date)}
        </div>
        <h3 className="mt-1 font-semibold text-lg leading-snug group-hover:text-accent">
          {feria.name}
        </h3>
        {feria.location && <p className="text-sm text-foreground/60">{feria.location}</p>}
      </div>

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
    </Link>
  );
}
