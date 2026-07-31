import { prisma } from "@/lib/prisma";
import { vendorCategoryLabels, vendorStatusLabels } from "@/lib/labels";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const vendors = await prisma.vendor.findMany({
    where: { eventId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const header = ["categoria", "proveedor", "contacto", "servicio", "costo", "anticipo", "saldo", "estado", "notas"];
  const rows = vendors.map((v) => {
    const cost = Number(v.cost);
    return [
      vendorCategoryLabels[v.category],
      v.name,
      [v.contactName, v.contactPhone, v.contactEmail].filter(Boolean).join(" / "),
      v.serviceDescription ?? "",
      String(cost),
      String(Number(v.depositPaid)),
      String(cost - Number(v.depositPaid)),
      vendorStatusLabels[v.status],
      v.notes ?? "",
    ];
  });

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="presupuesto.csv"`,
    },
  });
}
