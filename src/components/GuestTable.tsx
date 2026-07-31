"use client";

import { useMemo, useState } from "react";
import type { Guest } from "@/generated/prisma/client";
import { InvitationStatus } from "@/generated/prisma/enums";
import { invitationStatusLabels, invitationStatusTone } from "@/lib/labels";
import { updateGuest, deleteGuest, setInvitationStatus } from "@/lib/actions/guests";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";

type StatusFilter = "TODOS" | InvitationStatus;

export function GuestTable({ eventId, guests }: { eventId: string; guests: Guest[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODOS");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return guests.filter((g) => {
      if (statusFilter !== "TODOS" && g.invitationStatus !== statusFilter) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        (g.group ?? "").toLowerCase().includes(q) ||
        (g.phone ?? "").toLowerCase().includes(q) ||
        (g.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [guests, search, statusFilter]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, grupo, teléfono o email…"
          className="min-w-[220px] flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="TODOS">Todos los estados</option>
          {Object.values(InvitationStatus).map((s) => (
            <option key={s} value={s}>
              {invitationStatusLabels[s]}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-foreground/50">
        Mostrando {filtered.length} de {guests.length} invitados
      </p>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground/50">
              <th className="px-4 py-2.5 font-medium">Nombre</th>
              <th className="px-4 py-2.5 font-medium">Grupo / mesa</th>
              <th className="px-4 py-2.5 text-right font-medium">Acomp.</th>
              <th className="px-4 py-2.5 font-medium">Contacto</th>
              <th className="px-4 py-2.5 font-medium">Estado</th>
              <th className="px-4 py-2.5 font-medium">Notas</th>
              <th className="px-4 py-2.5 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((guest) =>
              editingId === guest.id ? (
                <GuestEditRow
                  key={guest.id}
                  eventId={eventId}
                  guest={guest}
                  onDone={() => setEditingId(null)}
                />
              ) : (
                <tr key={guest.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 font-medium">{guest.name}</td>
                  <td className="px-4 py-2.5 text-foreground/70">{guest.group ?? "—"}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">{guest.companions}</td>
                  <td className="px-4 py-2.5 text-foreground/70">
                    {guest.phone && <div>{guest.phone}</div>}
                    {guest.email && <div>{guest.email}</div>}
                    {!guest.phone && !guest.email && "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <form action={setInvitationStatus.bind(null, eventId, guest.id)}>
                      <select
                        name="invitationStatus"
                        defaultValue={guest.invitationStatus}
                        onChange={(e) => e.currentTarget.form?.requestSubmit()}
                        className={`rounded-full border-0 px-2.5 py-0.5 text-xs font-medium ${
                          invitationStatusTone[guest.invitationStatus] === "good"
                            ? "bg-good-soft text-good"
                            : invitationStatusTone[guest.invitationStatus] === "warn"
                              ? "bg-warn-soft text-warn"
                              : invitationStatusTone[guest.invitationStatus] === "bad"
                                ? "bg-bad-soft text-bad"
                                : "bg-border/60 text-foreground/70"
                        }`}
                      >
                        {Object.values(InvitationStatus).map((s) => (
                          <option key={s} value={s}>
                            {invitationStatusLabels[s]}
                          </option>
                        ))}
                      </select>
                    </form>
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-2.5 text-foreground/60" title={guest.notes ?? ""}>
                    {guest.notes ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <button
                      onClick={() => setEditingId(guest.id)}
                      className="rounded px-2 py-1 text-accent hover:bg-accent-soft"
                    >
                      Editar
                    </button>
                    <form action={deleteGuest.bind(null, eventId, guest.id)} className="inline">
                      <ConfirmSubmit
                        message={`¿Eliminar a ${guest.name} de la lista?`}
                        className="rounded px-2 py-1 text-bad hover:bg-bad-soft"
                      >
                        Eliminar
                      </ConfirmSubmit>
                    </form>
                  </td>
                </tr>
              )
            )}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-foreground/50">
                  Ningún invitado coincide con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GuestEditRow({
  eventId,
  guest,
  onDone,
}: {
  eventId: string;
  guest: Guest;
  onDone: () => void;
}) {
  return (
    <tr className="border-b border-border bg-accent-soft/40 last:border-0">
      <td colSpan={7} className="px-4 py-3">
        <form
          action={async (formData: FormData) => {
            await updateGuest(eventId, guest.id, formData);
            onDone();
          }}
          className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6"
        >
          <input
            name="name"
            required
            defaultValue={guest.name}
            placeholder="Nombre"
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm sm:col-span-1"
          />
          <input
            name="group"
            defaultValue={guest.group ?? ""}
            placeholder="Grupo / mesa"
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
          />
          <input
            type="number"
            min="0"
            name="companions"
            defaultValue={guest.companions}
            placeholder="Acompañantes"
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
          />
          <input
            name="phone"
            defaultValue={guest.phone ?? ""}
            placeholder="Teléfono"
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
          />
          <input
            name="email"
            defaultValue={guest.email ?? ""}
            placeholder="Email"
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
          />
          <select
            name="invitationStatus"
            defaultValue={guest.invitationStatus}
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
          >
            {Object.values(InvitationStatus).map((s) => (
              <option key={s} value={s}>
                {invitationStatusLabels[s]}
              </option>
            ))}
          </select>
          <textarea
            name="notes"
            defaultValue={guest.notes ?? ""}
            placeholder="Notas: alergias, restricciones, niños…"
            rows={1}
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm sm:col-span-3 lg:col-span-4"
          />
          <div className="flex gap-2 sm:col-span-3 lg:col-span-2 lg:justify-end">
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
