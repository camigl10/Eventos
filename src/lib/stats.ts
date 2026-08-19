import { prisma } from "@/lib/prisma";

export async function listFeriaSummaries() {
  const ferias = await prisma.feria.findMany({ orderBy: { date: "desc" } });

  return Promise.all(
    ferias.map(async (feria) => ({
      feria,
      inventory: await getInventoryStats(feria.id),
    }))
  );
}

/** Inventory + per-seller sales totals for a feria/market-stall day. */
export async function getInventoryStats(feriaId: string) {
  const items = await prisma.inventoryItem.findMany({
    where: { feriaId },
    select: { sellerName: true, price: true, sold: true },
  });

  const sold = items.filter((i) => i.sold);
  const totalRevenue = sold.reduce((sum, i) => sum + Number(i.price), 0);

  const sellerNames = Array.from(new Set(items.map((i) => i.sellerName))).sort((a, b) =>
    a.localeCompare(b, "es")
  );

  const bySeller = sellerNames.map((sellerName) => {
    const sellerItems = items.filter((i) => i.sellerName === sellerName);
    const sellerSold = sellerItems.filter((i) => i.sold);
    return {
      sellerName,
      itemsListed: sellerItems.length,
      itemsSold: sellerSold.length,
      revenue: sellerSold.reduce((sum, i) => sum + Number(i.price), 0),
    };
  });

  return {
    totalItems: items.length,
    soldItems: sold.length,
    availableItems: items.length - sold.length,
    totalRevenue,
    bySeller,
  };
}
