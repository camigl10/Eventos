import type { InventoryItem } from "@/generated/prisma/client";

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
    feriaId: item.feriaId,
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
