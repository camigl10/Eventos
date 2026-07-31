"use client";

import { useState } from "react";
import type { MenuItem } from "@/generated/prisma/client";
import type { SerializedVendor } from "@/lib/serialize";
import { MenuCourse } from "@/generated/prisma/enums";
import { menuCourseLabels } from "@/lib/labels";
import { formatCurrency } from "@/lib/format";
import { updateMenuItem, deleteMenuItem } from "@/lib/actions/menu";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";

export function MenuBoard({
  eventId,
  items,
  cateringVendors,
}: {
  eventId: string;
  items: MenuItem[];
  cateringVendors: SerializedVendor[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const vendorById = new Map(cateringVendors.map((v) => [v.id, v]));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Object.values(MenuCourse).map((course) => {
        const courseItems = items.filter((i) => i.course === course);
        return (
          <div key={course} className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">
              {menuCourseLabels[course]}
            </div>
            <ul className="flex flex-col gap-2">
              {courseItems.map((item) =>
                editingId === item.id ? (
                  <li key={item.id}>
                    <MenuItemForm
                      eventId={eventId}
                      item={item}
                      cateringVendors={cateringVendors}
                      onDone={() => setEditingId(null)}
                    />
                  </li>
                ) : (
                  <li key={item.id} className="rounded-md border border-border/70 p-2.5 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-foreground/60">{item.description}</div>
                        )}
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.isVegetarian && (
                            <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-foreground/60">
                              Vegetariano
                            </span>
                          )}
                          {item.isKidsOption && (
                            <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-foreground/60">
                              Infantil
                            </span>
                          )}
                          {item.vendorId && vendorById.has(item.vendorId) && (
                            <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-foreground/60">
                              {vendorById.get(item.vendorId)!.name}
                              {vendorById.get(item.vendorId)!.costPerPerson &&
                                ` · ${formatCurrency(vendorById.get(item.vendorId)!.costPerPerson!)}/persona`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-1.5 flex gap-2 text-xs">
                      <button
                        onClick={() => setEditingId(item.id)}
                        className="text-accent hover:underline"
                      >
                        Editar
                      </button>
                      <form action={deleteMenuItem.bind(null, eventId, item.id)} className="inline">
                        <ConfirmSubmit message={`¿Eliminar "${item.name}" del menú?`} className="text-bad hover:underline">
                          Eliminar
                        </ConfirmSubmit>
                      </form>
                    </div>
                  </li>
                )
              )}
              {courseItems.length === 0 && (
                <li className="rounded-md border border-dashed border-border p-2.5 text-center text-xs text-foreground/50">
                  Sin platillos
                </li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function MenuItemForm({
  eventId,
  item,
  cateringVendors,
  onDone,
}: {
  eventId: string;
  item: MenuItem;
  cateringVendors: SerializedVendor[];
  onDone: () => void;
}) {
  return (
    <form
      action={async (formData: FormData) => {
        await updateMenuItem(eventId, item.id, formData);
        onDone();
      }}
      className="flex flex-col gap-1.5 rounded-md border border-accent/40 bg-accent-soft/30 p-2.5 text-sm"
    >
      <input type="hidden" name="course" value={item.course} />
      <input
        name="name"
        required
        defaultValue={item.name}
        placeholder="Nombre del platillo"
        className="rounded border border-border bg-background px-2 py-1 text-sm"
      />
      <textarea
        name="description"
        defaultValue={item.description ?? ""}
        placeholder="Descripción"
        rows={1}
        className="rounded border border-border bg-background px-2 py-1 text-sm"
      />
      <select
        name="vendorId"
        defaultValue={item.vendorId ?? ""}
        className="rounded border border-border bg-background px-2 py-1 text-sm"
      >
        <option value="">Sin proveedor vinculado</option>
        {cateringVendors.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>
      <div className="flex gap-3 text-xs">
        <label className="flex items-center gap-1">
          <input type="checkbox" name="isVegetarian" defaultChecked={item.isVegetarian} /> Vegetariano
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" name="isKidsOption" defaultChecked={item.isKidsOption} /> Infantil
        </label>
      </div>
      <div className="mt-1 flex justify-end gap-2">
        <button type="button" onClick={onDone} className="rounded border border-border px-2 py-1 text-xs">
          Cancelar
        </button>
        <SubmitButton className="!px-2 !py-1 text-xs">Guardar</SubmitButton>
      </div>
    </form>
  );
}
