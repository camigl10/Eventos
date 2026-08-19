import { createFeria } from "@/lib/actions/ferias";
import { listFeriaSummaries } from "@/lib/stats";
import { FeriaCard } from "@/components/FeriaCard";
import { SubmitButton } from "@/components/SubmitButton";

export default async function DashboardPage() {
  const summaries = await listFeriaSummaries();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="relative flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tus ferias</h1>
          <p className="text-foreground/60 text-sm mt-1">
            Cada feria tiene su propio inventario, sin mezclarse con las demás.
          </p>
        </div>
        <details className="w-full sm:w-auto">
          <summary className="cursor-pointer list-none rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90">
            + Nueva feria
          </summary>
          <form
            action={createFeria}
            className="mt-3 w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-sm sm:absolute sm:right-4"
          >
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm">
                Nombre
                <input
                  name="name"
                  required
                  placeholder="Feria de Artesanías Otoño"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Fecha y hora
                <input
                  type="datetime-local"
                  name="date"
                  required
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Lugar
                <input
                  name="location"
                  placeholder="Plaza central, club, salón…"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end">
              <SubmitButton>Crear feria</SubmitButton>
            </div>
          </form>
        </details>
      </div>

      {summaries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-foreground/60">
          Todavía no tienes ferias. Crea la primera con el botón de arriba.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map((summary) => (
            <FeriaCard key={summary.feria.id} summary={summary} />
          ))}
        </div>
      )}
    </div>
  );
}
