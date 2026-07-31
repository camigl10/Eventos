import { prisma } from "@/lib/prisma";
import { getEventOrNotFound } from "@/lib/getEvent";
import { getEventBudgetSummary } from "@/lib/stats";
import { formatCurrency, formatDate } from "@/lib/format";
import { vendorCategoryLabels, vendorStatusLabels } from "@/lib/labels";
import { PrintButton } from "@/components/PrintButton";

export default async function VendorsPrintPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [event, vendors, budget] = await Promise.all([
    getEventOrNotFound(eventId),
    prisma.vendor.findMany({ where: { eventId }, orderBy: [{ category: "asc" }, { name: "asc" }] }),
    getEventBudgetSummary(eventId),
  ]);

  return (
    <div className="mx-auto max-w-3xl py-4">
      <div className="mb-4 flex justify-end">
        <PrintButton>Imprimir / guardar como PDF</PrintButton>
      </div>
      <h1 className="text-xl font-semibold">{event.name}</h1>
      <p className="text-sm text-foreground/60">Presupuesto de proveedores · {formatDate(event.date)}</p>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-foreground/30 text-left">
            <th className="py-1.5 pr-2">Categoría</th>
            <th className="py-1.5 pr-2">Proveedor</th>
            <th className="py-1.5 pr-2 text-right">Costo</th>
            <th className="py-1.5 pr-2 text-right">Anticipo</th>
            <th className="py-1.5 pr-2 text-right">Saldo</th>
            <th className="py-1.5 pr-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => {
            const cost = Number(v.cost);
            return (
              <tr key={v.id} className="border-b border-foreground/10">
                <td className="py-1.5 pr-2">{vendorCategoryLabels[v.category]}</td>
                <td className="py-1.5 pr-2">{v.name}</td>
                <td className="py-1.5 pr-2 text-right font-mono tabular-nums">{formatCurrency(cost)}</td>
                <td className="py-1.5 pr-2 text-right font-mono tabular-nums">{formatCurrency(v.depositPaid)}</td>
                <td className="py-1.5 pr-2 text-right font-mono tabular-nums">
                  {formatCurrency(cost - Number(v.depositPaid))}
                </td>
                <td className="py-1.5 pr-2">{vendorStatusLabels[v.status]}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-foreground/30 font-semibold">
            <td className="py-2" colSpan={2}>
              Total
            </td>
            <td className="py-2 text-right font-mono tabular-nums">{formatCurrency(budget.totalCost)}</td>
            <td className="py-2 text-right font-mono tabular-nums">{formatCurrency(budget.totalDeposit)}</td>
            <td className="py-2 text-right font-mono tabular-nums">{formatCurrency(budget.totalBalance)}</td>
            <td />
          </tr>
        </tfoot>
      </table>

      {budget.totalBudget !== null && (
        <p className="mt-3 text-sm">
          Presupuesto total del evento: <strong>{formatCurrency(budget.totalBudget)}</strong>
          {budget.overBudget && (
            <span className="text-bad"> — excede por {formatCurrency(budget.overBudgetBy)}</span>
          )}
        </p>
      )}
    </div>
  );
}
