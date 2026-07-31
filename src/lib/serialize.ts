import type { Vendor } from "@/generated/prisma/client";

/**
 * Prisma's `Decimal` fields can't cross the Server->Client Component boundary as props.
 * Convert them to plain numbers before handing a vendor to a Client Component.
 */
export type SerializedVendor = Omit<Vendor, "cost" | "depositPaid" | "costPerPerson"> & {
  cost: number;
  depositPaid: number;
  costPerPerson: number | null;
};

export function serializeVendor(vendor: Vendor): SerializedVendor {
  return {
    ...vendor,
    cost: Number(vendor.cost),
    depositPaid: Number(vendor.depositPaid),
    costPerPerson: vendor.costPerPerson !== null ? Number(vendor.costPerPerson) : null,
  };
}
