import { prisma } from "@/lib/prisma";

export async function listEventSummaries() {
  const events = await prisma.event.findMany({ orderBy: { date: "asc" } });

  return Promise.all(
    events.map(async (event) => {
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
