import { prisma } from "@/lib/prisma";

export async function listEventSummaries() {
  const events = await prisma.event.findMany({ orderBy: { date: "asc" } });

  return Promise.all(
    events.map(async (event) => {
      if (event.type === "FERIA") {
        const inventory = await getInventoryStats(event.id);
        return {
          event,
          totalGuests: 0,
          confirmedGuests: 0,
          confirmedHeadcount: 0,
          vendorTotal: 0,
          totalBudget: null as number | null,
          overBudget: false,
          inventory,
        };
      }

      const [guests, vendorAgg] = await Promise.all([
        prisma.guest.findMany({
          where: { eventId: event.id },
          select: { invitationStatus: true, companions: true },
        }),
        prisma.vendor.aggregate({
          where: { eventId: event.id },
          _sum: { cost: true },
        }),
      ]);

      const confirmed = guests.filter((g) => g.invitationStatus === "CONFIRMADA");
      const confirmedHeadcount = confirmed.reduce((sum, g) => sum + 1 + g.companions, 0);
      const vendorTotal = Number(vendorAgg._sum.cost ?? 0);
      const totalBudget = event.totalBudget ? Number(event.totalBudget) : null;

      return {
        event,
        totalGuests: guests.length,
        confirmedGuests: confirmed.length,
        confirmedHeadcount,
        vendorTotal,
        totalBudget,
        overBudget: totalBudget !== null && vendorTotal > totalBudget,
        inventory: null as Awaited<ReturnType<typeof getInventoryStats>> | null,
      };
    })
  );
}

export async function getEventBudgetSummary(eventId: string) {
  const [event, vendorAgg, headcounts] = await Promise.all([
    prisma.event.findUniqueOrThrow({ where: { id: eventId } }),
    prisma.vendor.aggregate({
      where: { eventId },
      _sum: { cost: true, depositPaid: true },
    }),
    getGuestHeadcounts(eventId),
  ]);

  const totalCost = Number(vendorAgg._sum.cost ?? 0);
  const totalDeposit = Number(vendorAgg._sum.depositPaid ?? 0);
  const totalBudget = event.totalBudget ? Number(event.totalBudget) : null;

  return {
    totalCost,
    totalDeposit,
    totalBalance: totalCost - totalDeposit,
    totalBudget,
    confirmedHeadcount: headcounts.expectedHeadcount,
    overBudget: totalBudget !== null && totalCost > totalBudget,
    overBudgetBy: totalBudget !== null ? totalCost - totalBudget : 0,
  };
}

export async function getGuestHeadcounts(eventId: string) {
  const guests = await prisma.guest.findMany({
    where: { eventId },
    select: { invitationStatus: true, companions: true, checkedIn: true },
  });

  const confirmed = guests.filter((g) => g.invitationStatus === "CONFIRMADA");
  const expectedHeadcount = confirmed.reduce((sum, g) => sum + 1 + g.companions, 0);
  const arrivedHeadcount = confirmed
    .filter((g) => g.checkedIn)
    .reduce((sum, g) => sum + 1 + g.companions, 0);

  return {
    totalGuests: guests.length,
    confirmedGuests: confirmed.length,
    expectedHeadcount,
    arrivedGuests: confirmed.filter((g) => g.checkedIn).length,
    arrivedHeadcount,
  };
}

/** Inventory + per-seller sales totals for a feria/market-stall event. */
export async function getInventoryStats(eventId: string) {
  const items = await prisma.inventoryItem.findMany({
    where: { eventId },
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
