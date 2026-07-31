import { prisma } from "@/lib/prisma";
import { getEventOrNotFound } from "@/lib/getEvent";
import { createMusicItem } from "@/lib/actions/music";
import { updateDjNotes } from "@/lib/actions/events";
import { MusicList } from "@/components/MusicList";
import { AddPopover } from "@/components/AddPopover";
import { SubmitButton } from "@/components/SubmitButton";
import { MusicStatus } from "@/generated/prisma/enums";
import { musicStatusLabels } from "@/lib/labels";

export default async function MusicPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [event, items] = await Promise.all([
    getEventOrNotFound(eventId),
    prisma.musicItem.findMany({ where: { eventId }, orderBy: { order: "asc" } }),
  ]);

  const createMusicItemWithEvent = createMusicItem.bind(null, eventId);
  const updateDjNotesWithEvent = updateDjNotes.bind(null, eventId);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">DJ / Música</h2>
          <p className="text-sm text-foreground/60">
            Momentos musicales, canciones asignadas y notas especiales para el DJ.
          </p>
        </div>
        <AddPopover label="+ Agregar canción" action={createMusicItemWithEvent}>
          <div className="flex flex-col gap-2.5">
            <input
              name="moment"
              required
              placeholder="Momento (ej. Entrada, Baile de novios, Hora loca)"
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            />
            <input
              name="songName"
              required
              placeholder="Canción"
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            />
            <input
              name="artist"
              placeholder="Artista"
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            />
            <input
              type="datetime-local"
              name="time"
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            />
            <select
              name="status"
              defaultValue={MusicStatus.PENDIENTE}
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
              rows={2}
              placeholder="Notas / pedidos especiales"
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            />
          </div>
          <div className="mt-3 flex justify-end">
            <SubmitButton>Agregar</SubmitButton>
          </div>
        </AddPopover>
      </div>

      <MusicList eventId={eventId} items={items} />

      <details className="rounded-xl border border-border bg-surface">
        <summary className="cursor-pointer list-none px-5 py-3 text-sm font-medium">
          Notas generales para el DJ
        </summary>
        <form action={updateDjNotesWithEvent} className="flex flex-col gap-2 border-t border-border px-5 py-4">
          <textarea
            name="djNotes"
            rows={3}
            defaultValue={event.djNotes ?? ""}
            placeholder="Canciones prohibidas, pedidos del cliente…"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <div className="flex justify-end">
            <SubmitButton>Guardar notas</SubmitButton>
          </div>
        </form>
      </details>
    </div>
  );
}
