import { prisma } from "@/lib/prisma";
import { createGuest, importGuestsCsv } from "@/lib/actions/guests";
import { GuestTable } from "@/components/GuestTable";
import { AddPopover } from "@/components/AddPopover";
import { SubmitButton } from "@/components/SubmitButton";

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const guests = await prisma.guest.findMany({
    where: { eventId },
    orderBy: { name: "asc" },
  });

  const createGuestWithEvent = createGuest.bind(null, eventId);
  const importCsvWithEvent = importGuestsCsv.bind(null, eventId);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Invitados</h2>
          <p className="text-sm text-foreground/60">
            Gestiona la lista, el estado de invitación y las notas de cada invitado.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/eventos/${eventId}/invitados/export`}
            className="rounded-md border border-border bg-surface px-3.5 py-2 text-sm font-medium hover:bg-border/30"
          >
            Exportar CSV
          </a>
          <AddPopover label="Importar CSV" action={importCsvWithEvent} variant="secondary" panelClassName="w-72">
            <p className="mb-2 text-xs text-foreground/60">
              Columnas: nombre, grupo, acompañantes, telefono, email, notas.
            </p>
            <input type="file" name="file" accept=".csv,text/csv" required className="mb-3 w-full text-sm" />
            <SubmitButton className="w-full">Importar</SubmitButton>
          </AddPopover>
          <AddPopover label="+ Agregar invitado" action={createGuestWithEvent}>
            <div className="flex flex-col gap-2.5">
              <input
                name="name"
                required
                placeholder="Nombre"
                className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
              />
              <input
                name="group"
                placeholder="Grupo / mesa"
                className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
              />
              <input
                type="number"
                min="0"
                name="companions"
                defaultValue={0}
                placeholder="Acompañantes"
                className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
              />
              <input
                name="phone"
                placeholder="Teléfono"
                className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
              />
              <input
                name="email"
                placeholder="Email"
                className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
              />
              <textarea
                name="notes"
                rows={2}
                placeholder="Notas: alergias, restricciones, niños…"
                className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <SubmitButton>Agregar</SubmitButton>
            </div>
          </AddPopover>
        </div>
      </div>

      <GuestTable eventId={eventId} guests={guests} />
    </div>
  );
}
