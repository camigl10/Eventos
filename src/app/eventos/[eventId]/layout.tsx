import { getEventOrNotFound } from "@/lib/getEvent";
import { EventNav } from "@/components/EventNav";
import { eventTypeLabels } from "@/lib/labels";
import { formatDateTime } from "@/lib/format";
import Link from "next/link";

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEventOrNotFound(eventId);

  return (
    <div className="flex flex-col flex-1">
      <div className="no-print border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <Link href="/" className="text-sm text-foreground/50 hover:text-accent">
            ← Todos los eventos
          </Link>
          <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2 pb-1">
            <h1 className="text-xl font-semibold tracking-tight">{event.name}</h1>
            <span className="text-sm text-foreground/50">
              {eventTypeLabels[event.type]} · {formatDateTime(event.date)}
            </span>
          </div>
        </div>
        <div className="mx-auto max-w-6xl">
          <EventNav eventId={event.id} />
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</div>
    </div>
  );
}
