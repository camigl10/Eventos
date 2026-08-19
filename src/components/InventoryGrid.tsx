"use client";

import { useState } from "react";
import type { SerializedInventoryItem } from "@/lib/serialize";
import { formatCurrency } from "@/lib/format";
import {
  updateInventoryItem,
  toggleInventorySold,
  deleteInventoryItem,
} from "@/lib/actions/inventory";
import { Pill } from "@/components/Pill";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";

export function InventoryGrid({
  eventId,
  items,
}: {
  eventId: string;
  items: SerializedInventoryItem[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-foreground/60">
        Todavía no hay artículos en el inventario.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) =>
        editingId === item.id ? (
          <InventoryEditCard
            key={item.id}
            eventId={eventId}
            item={item}
            onDone={() => setEditingId(null)}
          />
        ) : (
          <div
            key={item.id}
            className={`flex flex-col overflow-hidden rounded-xl border border-border bg-surface ${
              item.sold ? "opacity-70" : ""
            }`}
          >
            <div className="aspect-square w-full bg-background/60">
              {item.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.photoUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-foreground/40">
                  Sin foto
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium leading-snug">{item.name}</div>
                <Pill tone={item.sold ? "good" : "neutral"}>
                  {item.sold ? "Vendido" : "Disponible"}
                </Pill>
              </div>
              <div className="font-mono text-lg font-semibold tabular-nums">
                {formatCurrency(item.price)}
              </div>
              <div className="text-xs text-foreground/50">Vende: {item.sellerName}</div>
              {item.notes && <div className="text-xs text-foreground/50">{item.notes}</div>}

              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                <form action={toggleInventorySold.bind(null, eventId, item.id)}>
                  <button
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${
                      item.sold
                        ? "border border-border hover:bg-border/30"
                        : "bg-accent text-accent-foreground hover:opacity-90"
                    }`}
                  >
                    {item.sold ? "Marcar disponible" : "Marcar vendido"}
                  </button>
                </form>
                <button
                  onClick={() => setEditingId(item.id)}
                  className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-border/30"
                >
                  Editar
                </button>
                <form action={deleteInventoryItem.bind(null, eventId, item.id)}>
                  <ConfirmSubmit
                    message={`¿Eliminar "${item.name}"?`}
                    className="rounded-md px-2.5 py-1.5 text-xs font-medium text-bad hover:bg-bad-soft"
                  >
                    Eliminar
                  </ConfirmSubmit>
                </form>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function InventoryEditCard({
  eventId,
  item,
  onDone,
}: {
  eventId: string;
  item: SerializedInventoryItem;
  onDone: () => void;
}) {
  return (
    <div className="rounded-xl border border-accent/40 bg-accent-soft/30 p-3.5">
      <form
        action={async (formData: FormData) => {
          await updateInventoryItem(eventId, item.id, formData);
          onDone();
        }}
        className="flex flex-col gap-2"
      >
        {item.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.photoUrl}
            alt={item.name}
            className="aspect-square w-full rounded-md object-cover"
          />
        )}
        <label className="flex flex-col gap-1 text-xs text-foreground/60">
          Foto {item.photoUrl && "(deja vacío para conservar la actual)"}
          <input
            type="file"
            name="photo"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs"
          />
        </label>
        <input
          name="name"
          required
          defaultValue={item.name}
          placeholder="Nombre del artículo"
          className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          name="price"
          defaultValue={item.price}
          placeholder="Precio"
          className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
        />
        <input
          name="sellerName"
          required
          defaultValue={item.sellerName}
          placeholder="Quién lo vende"
          className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
        />
        <textarea
          name="notes"
          defaultValue={item.notes ?? ""}
          placeholder="Notas"
          rows={1}
          className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
        />
        <div className="flex justify-end gap-2 pt-1">
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
    </div>
  );
}
