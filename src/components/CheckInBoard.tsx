"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import type { Guest } from "@/generated/prisma/client";
import { setCheckedIn } from "@/lib/actions/guests";
import { formatTime } from "@/lib/format";

type Filter = "TODOS" | "PENDIENTES" | "LLEGARON";

export function CheckInBoard({ eventId, guests }: { eventId: string; guests: Guest[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("TODOS");
  const [isPending, startTransition] = useTransition();
  const [optimisticGuests, applyOptimistic] = useOptimistic(
    guests,
    (state, update: { id: string; checkedIn: boolean; checkInTime: Date | null }) =>
      state.map((g) => (g.id === update.id ? { ...g, ...update } : g))
  );

  const expectedHeadcount = optimisticGuests.reduce((sum, g) => sum + 1 + g.companions, 0);
  const arrived = optimisticGuests.filter((g) => g.checkedIn);
  const arrivedHeadcount = arrived.reduce((sum, g) => sum + 1 + g.companions, 0);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return optimisticGuests
      .filter((g) => {
        if (filter === "PENDIENTES" && g.checkedIn) return false;
        if (filter === "LLEGARON" && !g.checkedIn) return false;
        if (!q) return true;
        return g.name.toLowerCase().includes(q) || (g.group ?? "").toLowerCase().includes(q);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [optimisticGuests, search, filter]);

  function toggle(guest: Guest) {
    const nextChecked = !guest.checkedIn;
    startTransition(async () => {
      applyOptimistic({ id: guest.id, checkedIn: nextChecked, checkInTime: nextChecked ? new Date() : null });
      await setCheckedIn(eventId, guest.id, nextChecked);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-surface p-3 text-center">
        <div>
          <div className="font-mono text-2xl font-semibold tabular-nums">{expectedHeadcount}</div>
          <div className="text-xs text-foreground/50">esperados</div>
        </div>
        <div>
          <div className="font-mono text-2xl font-semibold tabular-nums text-good">{arrivedHeadcount}</div>
          <div className="text-xs text-foreground/50">llegaron</div>
        </div>
        <div>
          <div className="font-mono text-2xl font-semibold tabular-nums text-warn">
            {expectedHeadcount - arrivedHeadcount}
          </div>
          <div className="text-xs text-foreground/50">faltan</div>
        </div>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar invitado…"
        autoFocus
        className="rounded-lg border border-border bg-surface px-4 py-3 text-base"
      />

      <div className="flex gap-2 text-sm">
        {(["TODOS", "PENDIENTES", "LLEGARON"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 font-medium ${
              filter === f ? "bg-accent text-accent-foreground" : "bg-border/50 text-foreground/70"
            }`}
          >
            {f === "TODOS" ? "Todos" : f === "PENDIENTES" ? "Pendientes" : "Llegaron"} (
            {f === "TODOS"
              ? optimisticGuests.length
              : f === "PENDIENTES"
                ? optimisticGuests.length - arrived.length
                : arrived.length}
            )
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {visible.map((guest) => (
          <li key={guest.id}>
            <button
              onClick={() => toggle(guest)}
              disabled={isPending}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition ${
                guest.checkedIn
                  ? "border-good/30 bg-good-soft"
                  : "border-border bg-surface active:bg-border/30"
              }`}
            >
              <div>
                <div className="font-medium">{guest.name}</div>
                <div className="text-sm text-foreground/50">
                  {guest.group ?? "Sin grupo"}
                  {guest.companions > 0 ? ` · +${guest.companions}` : ""}
                </div>
              </div>
              {guest.checkedIn ? (
                <div className="text-right text-sm text-good">
                  <div className="font-medium">Llegó</div>
                  {guest.checkInTime && <div className="font-mono tabular-nums">{formatTime(guest.checkInTime)}</div>}
                </div>
              ) : (
                <span className="whitespace-nowrap rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
                  Marcar llegada
                </span>
              )}
            </button>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="rounded-xl border border-dashed border-border p-6 text-center text-foreground/50">
            Nadie coincide con la búsqueda.
          </li>
        )}
      </ul>
    </div>
  );
}
