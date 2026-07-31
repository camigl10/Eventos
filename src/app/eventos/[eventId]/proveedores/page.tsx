import { prisma } from "@/lib/prisma";
import { getEventBudgetSummary } from "@/lib/stats";
import { serializeVendor } from "@/lib/serialize";
import { createVendor } from "@/lib/actions/vendors";
import { VendorTable } from "@/components/VendorTable";
import { SubmitButton } from "@/components/SubmitButton";
import { Pill } from "@/components/Pill";
import { formatCurrency } from "@/lib/format";
import { VendorCategory, VendorStatus } from "@/generated/prisma/enums";
import { vendorCategoryLabels, vendorStatusLabels } from "@/lib/labels";

export default async function VendorsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [vendors, budget] = await Promise.all([
    prisma.vendor.findMany({ where: { eventId }, orderBy: [{ category: "asc" }, { name: "asc" }] }),
    getEventBudgetSummary(eventId),
  ]);

  const createVendorWithEvent = createVendor.bind(null, eventId);
  const pct = budget.totalBudget ? Math.min(100, (budget.totalCost / budget.totalBudget) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Proveedores y presupuesto</h2>
          <p className="text-sm text-foreground/60">
            El presupuesto se recalcula automáticamente sumando todos los proveedores.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/eventos/${eventId}/proveedores/export`}
            className="rounded-md border border-border bg-surface px-3.5 py-2 text-sm font-medium hover:bg-border/30"
          >
            Exportar Excel
          </a>
          <a
            href={`/eventos/${eventId}/proveedores/imprimir`}
            target="_blank"
            className="rounded-md border border-border bg-surface px-3.5 py-2 text-sm font-medium hover:bg-border/30"
          >
            Exportar PDF
          </a>
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-accent-foreground hover:opacity-90">
              + Agregar proveedor
            </summary>
            <form
              action={createVendorWithEvent}
              className="absolute right-0 z-10 mt-2 w-80 rounded-xl border border-border bg-surface p-4 shadow-lg"
            >
              <div className="flex flex-col gap-2.5">
                <input
                  name="name"
                  required
                  placeholder="Nombre del proveedor"
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
                />
                <select
                  name="category"
                  defaultValue={VendorCategory.CATERING}
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
                >
                  {Object.values(VendorCategory).map((c) => (
                    <option key={c} value={c}>
                      {vendorCategoryLabels[c]}
                    </option>
                  ))}
                </select>
                <input
                  name="serviceDescription"
                  placeholder="Servicio contratado"
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
                />
                <input
                  name="contactName"
                  placeholder="Contacto"
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
                />
                <input
                  name="contactPhone"
                  placeholder="Teléfono"
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="cost"
                    placeholder="Costo total"
                    className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="depositPaid"
                    placeholder="Anticipo"
                    className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
                  />
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="costPerPerson"
                  placeholder="Costo por persona (solo catering)"
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
                />
                <select
                  name="status"
                  defaultValue={VendorStatus.COTIZADO}
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
                >
                  {Object.values(VendorStatus).map((s) => (
                    <option key={s} value={s}>
                      {vendorStatusLabels[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3 flex justify-end">
                <SubmitButton>Agregar</SubmitButton>
              </div>
            </form>
          </details>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="h-2 overflow-hidden rounded-full bg-border/60">
          <div
            className={`h-full rounded-full ${budget.overBudget ? "bg-bad" : "bg-good"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-8">
          <div>
            <div className="font-mono text-xl font-semibold tabular-nums">{formatCurrency(budget.totalCost)}</div>
            <div className="text-xs text-foreground/50">contratado</div>
          </div>
          <div>
            <div className="font-mono text-xl font-semibold tabular-nums">{formatCurrency(budget.totalDeposit)}</div>
            <div className="text-xs text-foreground/50">anticipos pagados</div>
          </div>
          <div>
            <div className="font-mono text-xl font-semibold tabular-nums">{formatCurrency(budget.totalBalance)}</div>
            <div className="text-xs text-foreground/50">saldo pendiente</div>
          </div>
        </div>
        <div className="mt-3">
          {budget.totalBudget === null ? (
            <Pill tone="neutral">Sin presupuesto total definido para este evento</Pill>
          ) : budget.overBudget ? (
            <Pill tone="bad">⚠ {formatCurrency(budget.overBudgetBy)} sobre el presupuesto de {formatCurrency(budget.totalBudget)}</Pill>
          ) : (
            <Pill tone="good">Dentro del presupuesto de {formatCurrency(budget.totalBudget)}</Pill>
          )}
        </div>
      </div>

      <VendorTable eventId={eventId} vendors={vendors.map(serializeVendor)} />
    </div>
  );
}
