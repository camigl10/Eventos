import { prisma } from "@/lib/prisma";
import { getInventoryStats } from "@/lib/stats";
import { serializeInventoryItem } from "@/lib/serialize";
import { createInventoryItem } from "@/lib/actions/inventory";
import { InventoryGrid } from "@/components/InventoryGrid";
import { AddPopover } from "@/components/AddPopover";
import { SubmitButton } from "@/components/SubmitButton";
import { formatCurrency } from "@/lib/format";

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [items, stats] = await Promise.all([
    prisma.inventoryItem.findMany({ where: { eventId }, orderBy: { createdAt: "desc" } }),
    getInventoryStats(eventId),
  ]);

  const createInventoryItemWithEvent = createInventoryItem.bind(null, eventId);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Inventario</h2>
          <p className="text-sm text-foreground/60">Artículos del puesto, quién los vende y si ya se vendieron.</p>
        </div>
        <AddPopover label="+ Agregar artículo" action={createInventoryItemWithEvent}>
          <div className="flex flex-col gap-2.5">
            <label className="flex flex-col gap-1 text-xs text-foreground/60">
              Foto
              <input
                type="file"
                name="photo"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
              />
            </label>
            <input
              name="name"
              required
              placeholder="Nombre del artículo"
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              name="price"
              placeholder="Precio"
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            />
            <input
              name="sellerName"
              required
              placeholder="Quién lo vende"
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            />
            <textarea
              name="notes"
              placeholder="Notas (opcional)"
              rows={1}
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            />
          </div>
          <div className="mt-3 flex justify-end">
            <SubmitButton>Agregar</SubmitButton>
          </div>
        </AddPopover>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-foreground/50">Artículos</div>
          <div className="mt-1 font-mono text-2xl font-semibold tabular-nums">
            {stats.totalItems}
          </div>
          <p className="text-sm text-foreground/60">
            {stats.soldItems} vendidos · {stats.availableItems} disponibles
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 sm:col-span-2">
          <div className="text-xs font-medium uppercase tracking-wide text-foreground/50">
            Total vendido
          </div>
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
                  <span className="font-mono font-medium tabular-nums">
                    {formatCurrency(seller.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <InventoryGrid eventId={eventId} items={items.map(serializeInventoryItem)} />
    </div>
  );
}
