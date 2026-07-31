"use client";

import { Fragment, useState } from "react";
import type { SerializedVendor } from "@/lib/serialize";
import { VendorCategory, VendorStatus } from "@/generated/prisma/enums";
import { vendorCategoryLabels, vendorStatusLabels, vendorStatusTone } from "@/lib/labels";
import { formatCurrency } from "@/lib/format";
import { updateVendor, deleteVendor, recalculateVendorCost } from "@/lib/actions/vendors";
import { Pill } from "@/components/Pill";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";

export function VendorTable({ eventId, vendors }: { eventId: string; vendors: SerializedVendor[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const groups = Object.values(VendorCategory)
    .map((category) => ({ category, vendors: vendors.filter((v) => v.category === category) }))
    .filter((g) => g.vendors.length > 0);

  if (vendors.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-foreground/60">
        Todavía no hay proveedores registrados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground/50">
            <th className="px-4 py-2.5 font-medium">Proveedor</th>
            <th className="px-4 py-2.5 text-right font-medium">Costo</th>
            <th className="px-4 py-2.5 text-right font-medium">Anticipo</th>
            <th className="px-4 py-2.5 text-right font-medium">Saldo</th>
            <th className="px-4 py-2.5 font-medium">Estado</th>
            <th className="px-4 py-2.5 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.category}>
              <tr className="border-b border-border bg-background/60">
                <td colSpan={6} className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/50">
                  {vendorCategoryLabels[group.category]}
                </td>
              </tr>
              {group.vendors.map((vendor) =>
                editingId === vendor.id ? (
                  <VendorEditRow
                    key={vendor.id}
                    eventId={eventId}
                    vendor={vendor}
                    onDone={() => setEditingId(null)}
                  />
                ) : (
                  <tr key={vendor.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{vendor.name}</div>
                      {(vendor.contactName || vendor.contactPhone || vendor.contactEmail) && (
                        <div className="text-xs text-foreground/50">
                          {[vendor.contactName, vendor.contactPhone, vendor.contactEmail]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      )}
                      {vendor.serviceDescription && (
                        <div className="text-xs text-foreground/50">{vendor.serviceDescription}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {formatCurrency(vendor.cost)}
                      {vendor.costPerPerson && (
                        <div className="text-xs font-normal text-foreground/50">
                          {formatCurrency(vendor.costPerPerson)}/persona (auto)
                          <form action={recalculateVendorCost.bind(null, eventId, vendor.id)} className="inline">
                            <button className="ml-1 text-accent hover:underline">↻ actualizar</button>
                          </form>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {formatCurrency(vendor.depositPaid)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {formatCurrency(Number(vendor.cost) - Number(vendor.depositPaid))}
                    </td>
                    <td className="px-4 py-2.5">
                      <Pill tone={vendorStatusTone[vendor.status]}>{vendorStatusLabels[vendor.status]}</Pill>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <button
                        onClick={() => setEditingId(vendor.id)}
                        className="rounded px-2 py-1 text-accent hover:bg-accent-soft"
                      >
                        Editar
                      </button>
                      <form action={deleteVendor.bind(null, eventId, vendor.id)} className="inline">
                        <ConfirmSubmit
                          message={`¿Eliminar al proveedor ${vendor.name}?`}
                          className="rounded px-2 py-1 text-bad hover:bg-bad-soft"
                        >
                          Eliminar
                        </ConfirmSubmit>
                      </form>
                    </td>
                  </tr>
                )
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VendorEditRow({
  eventId,
  vendor,
  onDone,
}: {
  eventId: string;
  vendor: SerializedVendor;
  onDone: () => void;
}) {
  return (
    <tr className="border-b border-border bg-accent-soft/40 last:border-0">
      <td colSpan={6} className="px-4 py-3">
        <form
          action={async (formData: FormData) => {
            await updateVendor(eventId, vendor.id, formData);
            onDone();
          }}
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
        >
          <input
            name="name"
            required
            defaultValue={vendor.name}
            placeholder="Nombre"
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
          />
          <select
            name="category"
            defaultValue={vendor.category}
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
            defaultValue={vendor.serviceDescription ?? ""}
            placeholder="Servicio contratado"
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm sm:col-span-2 lg:col-span-2"
          />
          <input
            name="contactName"
            defaultValue={vendor.contactName ?? ""}
            placeholder="Contacto"
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
          />
          <input
            name="contactPhone"
            defaultValue={vendor.contactPhone ?? ""}
            placeholder="Teléfono"
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
          />
          <input
            name="contactEmail"
            defaultValue={vendor.contactEmail ?? ""}
            placeholder="Email"
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
          />
          <select
            name="status"
            defaultValue={vendor.status}
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
          >
            {Object.values(VendorStatus).map((s) => (
              <option key={s} value={s}>
                {vendorStatusLabels[s]}
              </option>
            ))}
          </select>
          <label className="flex flex-col gap-1 text-xs text-foreground/60">
            Costo total
            <input
              type="number"
              min="0"
              step="0.01"
              name="cost"
              defaultValue={Number(vendor.cost)}
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-foreground/60">
            Anticipo pagado
            <input
              type="number"
              min="0"
              step="0.01"
              name="depositPaid"
              defaultValue={Number(vendor.depositPaid)}
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-foreground/60">
            Costo por persona (solo catering)
            <input
              type="number"
              min="0"
              step="0.01"
              name="costPerPerson"
              defaultValue={vendor.costPerPerson ? Number(vendor.costPerPerson) : ""}
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            />
          </label>
          <textarea
            name="notes"
            defaultValue={vendor.notes ?? ""}
            placeholder="Notas"
            rows={1}
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm sm:col-span-2 lg:col-span-4"
          />
          <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-4">
            <button
              type="button"
              onClick={onDone}
              className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-border/30"
            >
              Cancelar
            </button>
            <SubmitButton>Guardar</SubmitButton>
          </div>
        </form>
      </td>
    </tr>
  );
}
