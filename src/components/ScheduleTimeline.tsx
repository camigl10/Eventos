"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { ScheduleItem } from "@/generated/prisma/client";
import { formatTime, toDateTimeLocalValue } from "@/lib/format";
import { reorderScheduleItems, updateScheduleItem, deleteScheduleItem } from "@/lib/actions/schedule";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy;
}

export function ScheduleTimeline({ eventId, items }: { eventId: string; items: ScheduleItem[] }) {
  const [optimisticItems, setOptimisticOrder] = useOptimistic(
    items,
    (_state: ScheduleItem[], newOrder: ScheduleItem[]) => newOrder
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleDrop(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      return;
    }
    const next = moveItem(optimisticItems, dragIndex, dropIndex);
    setDragIndex(null);
    startTransition(async () => {
      setOptimisticOrder(next);
      await reorderScheduleItems(eventId, next.map((i) => i.id));
    });
  }

  return (
    <ol className="flex flex-col gap-2">
      {optimisticItems.map((item, index) =>
        editingId === item.id ? (
          <li key={item.id}>
            <ScheduleItemForm eventId={eventId} item={item} onDone={() => setEditingId(null)} />
          </li>
        ) : (
          <li
            key={item.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            className="no-print flex cursor-grab items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 active:cursor-grabbing"
          >
            <span className="select-none text-foreground/30">⠿</span>
            <span className="w-16 shrink-0 font-mono text-sm tabular-nums text-foreground/60">
              {formatTime(item.time)}
            </span>
            <div className="flex-1">
              <div className="font-medium">{item.activity}</div>
              <div className="text-xs text-foreground/50">
                {item.responsible && <span>{item.responsible}</span>}
                {item.durationMinutes && <span> · {item.durationMinutes} min</span>}
              </div>
            </div>
            <button
              onClick={() => setEditingId(item.id)}
              className="rounded px-2 py-1 text-sm text-accent hover:bg-accent-soft"
            >
              Editar
            </button>
            <form action={deleteScheduleItem.bind(null, eventId, item.id)}>
              <ConfirmSubmit
                message={`¿Eliminar "${item.activity}" del cronograma?`}
                className="rounded px-2 py-1 text-sm text-bad hover:bg-bad-soft"
              >
                Eliminar
              </ConfirmSubmit>
            </form>
          </li>
        )
      )}
      {optimisticItems.length === 0 && (
        <li className="rounded-xl border border-dashed border-border p-8 text-center text-foreground/50">
          Todavía no hay actividades. Agrega la primera con el botón de arriba.
        </li>
      )}
    </ol>
  );
}

function ScheduleItemForm({
  eventId,
  item,
  onDone,
}: {
  eventId: string;
  item: ScheduleItem;
  onDone: () => void;
}) {
  return (
    <form
      action={async (formData: FormData) => {
        await updateScheduleItem(eventId, item.id, formData);
        onDone();
      }}
      className="grid gap-2 rounded-xl border border-accent/40 bg-accent-soft/30 p-3 sm:grid-cols-4"
    >
      <input
        type="datetime-local"
        name="time"
        required
        defaultValue={toDateTimeLocalValue(item.time)}
        className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
      />
      <input
        name="activity"
        required
        defaultValue={item.activity}
        placeholder="Actividad"
        className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm sm:col-span-2"
      />
      <input
        name="responsible"
        defaultValue={item.responsible ?? ""}
        placeholder="Responsable (DJ, staff…)"
        className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
      />
      <input
        type="number"
        min="0"
        name="durationMinutes"
        defaultValue={item.durationMinutes ?? ""}
        placeholder="Duración (min)"
        className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
      />
      <div className="flex justify-end gap-2 sm:col-span-3">
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
  );
}
