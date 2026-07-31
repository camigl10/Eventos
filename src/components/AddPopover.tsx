"use client";

import { useState } from "react";

const buttonVariants = {
  primary: "bg-accent text-accent-foreground hover:opacity-90",
  secondary: "border border-border bg-surface hover:bg-border/30",
} as const;

export function AddPopover({
  label,
  action,
  variant = "primary",
  panelClassName = "w-80",
  children,
}: {
  label: string;
  action: (formData: FormData) => Promise<void>;
  variant?: keyof typeof buttonVariants;
  panelClassName?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`rounded-md px-3.5 py-2 text-sm font-medium ${buttonVariants[variant]}`}
      >
        {label}
      </button>
      {open && (
        <form
          action={async (formData: FormData) => {
            await action(formData);
            setOpen(false);
          }}
          className={`absolute right-0 z-10 mt-2 rounded-xl border border-border bg-surface p-4 shadow-lg ${panelClassName}`}
        >
          {children}
        </form>
      )}
    </div>
  );
}
