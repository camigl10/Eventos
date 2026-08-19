"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { EventType } from "@/generated/prisma/enums";

const fullTabs = [
  { href: "", label: "Resumen" },
  { href: "/invitados", label: "Invitados" },
  { href: "/checkin", label: "Check-in" },
  { href: "/proveedores", label: "Proveedores" },
  { href: "/menu", label: "Menú" },
  { href: "/cronograma", label: "Cronograma" },
  { href: "/musica", label: "DJ / Música" },
];

const feriaTabs = [
  { href: "", label: "Resumen" },
  { href: "/inventario", label: "Inventario" },
];

export function EventNav({ eventId, eventType }: { eventId: string; eventType: EventType }) {
  const pathname = usePathname();
  const base = `/eventos/${eventId}`;
  const tabs = eventType === "FERIA" ? feriaTabs : fullTabs;

  return (
    <nav className="no-print -mb-px flex gap-1 overflow-x-auto px-4">
      {tabs.map((tab) => {
        const href = `${base}${tab.href}`;
        const active = tab.href === "" ? pathname === base : pathname.startsWith(href);
        return (
          <Link
            key={tab.href}
            href={href}
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "border-accent text-accent"
                : "border-transparent text-foreground/60 hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
