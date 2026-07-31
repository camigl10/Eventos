const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number | string | { toString(): string }) {
  return currencyFormatter.format(Number(value));
}

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function formatDate(value: Date | string) {
  return dateFormatter.format(new Date(value));
}

const timeFormatter = new Intl.DateTimeFormat("es-MX", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatTime(value: Date | string) {
  return timeFormatter.format(new Date(value));
}

const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(value: Date | string) {
  return dateTimeFormatter.format(new Date(value));
}

/** Converts a <input type="datetime-local"> value into a Date, preserving the local wall-clock time. */
export function parseLocalDateTime(value: string) {
  return new Date(value);
}

/** Formats a Date for use as the value of an <input type="datetime-local">. */
export function toDateTimeLocalValue(value: Date | string) {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
