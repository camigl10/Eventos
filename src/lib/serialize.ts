import type { Vendor, InventoryItem } from "@/generated/prisma/client";

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

/**
 * `photoData` is a raw Buffer (the image bytes) and can't cross the
 * Server->Client Component boundary. Replace it with a URL to the route that
 * streams it back out, the same way an uploaded file would be served.
 */
export type SerializedInventoryItem = Omit<InventoryItem, "price" | "photoData" | "photoMime"> & {
  price: number;
  photoUrl: string | null;
};

export function serializeInventoryItem(item: InventoryItem): SerializedInventoryItem {
  return {
    id: item.id,
    eventId: item.eventId,
    name: item.name,
    sellerName: item.sellerName,
    sold: item.sold,
    soldAt: item.soldAt,
    notes: item.notes,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    price: Number(item.price),
    photoUrl: item.photoData ? `/api/inventario-foto/${item.id}` : null,
  };
}
