"use client";

import { useState } from "react";
import type { MusicItem } from "@/generated/prisma/client";
import { MusicStatus } from "@/generated/prisma/enums";
import { musicStatusLabels, musicStatusTone } from "@/lib/labels";
import { formatTime, toDateTimeLocalValue } from "@/lib/format";
import { updateMusicItem, deleteMusicItem } from "@/lib/actions/music";
import { Pill } from "@/components/Pill";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";

export function MusicList({ eventId, items }: { eventId: string; items: MusicItem[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-foreground/60">
        Todavía no hay momentos musicales. Agrega el primero con el botón de arriba.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) =>
        editingId === item.id ? (
          <li key={item.id}>
            <MusicItemForm eventId={eventId} item={item} onDone={() => setEditingId(null)} />
          </li>
        ) : (
          <li
            key={item.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
          >
            <span className="w-14 shrink-0 font-mono text-sm tabular-nums text-foreground/60">
              {item.time ? formatTime(item.time) : "—"}
            </span>
            <div className="min-w-[200px] flex-1">
              <div className="text-xs font-medium uppercase tracking-wide text-accent">{item.moment}</div>
              <div className="font-medium">
                {item.songName}
                {item.artist && <span className="text-foreground/60"> — {item.artist}</span>}
              </div>
              {item.notes && <div className="text-xs text-foreground/50">{item.notes}</div>}
            </div>
            <Pill tone={musicStatusTone[item.status]}>{musicStatusLabels[item.status]}</Pill>
            <button
              onClick={() => setEditingId(item.id)}
              className="rounded px-2 py-1 text-sm text-accent hover:bg-accent-soft"
            >
              Editar
            </button>
            <form action={deleteMusicItem.bind(null, eventId, item.id)}>
              <ConfirmSubmit
                message={`¿Eliminar "${item.songName}"?`}
                className="rounded px-2 py-1 text-sm text-bad hover:bg-bad-soft"
              >
                Eliminar
              </ConfirmSubmit>
            </form>
          </li>
        )
      )}
    </ul>
  );
}

function MusicItemForm({
  eventId,
  item,
  onDone,
}: {
  eventId: string;
  item: MusicItem;
  onDone: () => void;
}) {
  return (
    <form
      action={async (formData: FormData) => {
        await updateMusicItem(eventId, item.id, formData);
        onDone();
      }}
      className="grid gap-2 rounded-xl border border-accent/40 bg-accent-soft/30 p-3 sm:grid-cols-3"
    >
      <input
        name="moment"
        required
        defaultValue={item.moment}
        placeholder="Momento (ej. Hora loca)"
        className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
      />
      <input
        name="songName"
        required
        defaultValue={item.songName}
        placeholder="Canción"
        className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
      />
      <input
        name="artist"
        defaultValue={item.artist ?? ""}
        placeholder="Artista"
        className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
      />
      <input
        type="datetime-local"
        name="time"
        defaultValue={item.time ? toDateTimeLocalValue(item.time) : ""}
        className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
      />
      <select
        name="status"
        defaultValue={item.status}
        className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
      >
        {Object.values(MusicStatus).map((s) => (
          <option key={s} value={s}>
            {musicStatusLabels[s]}
          </option>
        ))}
      </select>
      <textarea
        name="notes"
        defaultValue={item.notes ?? ""}
        placeholder="Notas / pedidos especiales"
        rows={1}
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
