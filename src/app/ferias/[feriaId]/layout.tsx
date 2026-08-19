import { getFeriaOrNotFound } from "@/lib/getFeria";
import { formatDateTime } from "@/lib/format";
import Link from "next/link";

export default async function FeriaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ feriaId: string }>;
}) {
  const { feriaId } = await params;
  const feria = await getFeriaOrNotFound(feriaId);

  return (
    <div className="flex flex-col flex-1">
      <div className="no-print border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Link href="/" className="text-sm text-foreground/50 hover:text-accent">
            ← Todas las ferias
          </Link>
          <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{feria.name}</h1>
            <span className="text-sm text-foreground/50">{formatDateTime(feria.date)}</span>
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</div>
    </div>
  );
}
