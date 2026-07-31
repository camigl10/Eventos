"use client";

export function PrintButton({ children = "Imprimir" }: { children?: React.ReactNode }) {
  return (
    <button
      onClick={() => window.print()}
      className="no-print rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
    >
      {children}
    </button>
  );
}
