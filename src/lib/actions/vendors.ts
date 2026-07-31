"use server";

import { prisma } from "@/lib/prisma";
import { VendorCategory, VendorStatus } from "@/generated/prisma/enums";
import { getGuestHeadcounts } from "@/lib/stats";
import { revalidatePath } from "next/cache";

function revalidateEvent(eventId: string) {
  revalidatePath("/");
  revalidatePath(`/eventos/${eventId}`);
  revalidatePath(`/eventos/${eventId}/proveedores`);
  revalidatePath(`/eventos/${eventId}/menu`);
}

function parseVendorFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre del proveedor es obligatorio");

  const category = String(formData.get("category") ?? "");
  if (!Object.values(VendorCategory).includes(category as VendorCategory)) {
    throw new Error("Categoría inválida");
  }

  const status = String(formData.get("status") ?? VendorStatus.COTIZADO);
  if (!Object.values(VendorStatus).includes(status as VendorStatus)) {
    throw new Error("Estado inválido");
  }

  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const serviceDescription = String(formData.get("serviceDescription") ?? "").trim();
  const cost = Number(formData.get("cost") ?? 0) || 0;
  const depositPaid = Number(formData.get("depositPaid") ?? 0) || 0;
  const costPerPersonRaw = String(formData.get("costPerPerson") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  return {
    name,
    category: category as VendorCategory,
    status: status as VendorStatus,
    contactName: contactName || null,
    contactPhone: contactPhone || null,
    contactEmail: contactEmail || null,
    serviceDescription: serviceDescription || null,
    cost,
    depositPaid,
    costPerPerson: costPerPersonRaw ? Number(costPerPersonRaw) : null,
    notes: notes || null,
  };
}

/** When costPerPerson is set, the total cost is always derived from confirmed headcount. */
async function withAutoCost<T extends { costPerPerson: number | null; cost: number }>(
  eventId: string,
  data: T
): Promise<T> {
  if (data.costPerPerson === null) return data;
  const headcounts = await getGuestHeadcounts(eventId);
  return { ...data, cost: data.costPerPerson * headcounts.expectedHeadcount };
}

export async function createVendor(eventId: string, formData: FormData) {
  const data = await withAutoCost(eventId, parseVendorFields(formData));
  await prisma.vendor.create({ data: { ...data, eventId } });
  revalidateEvent(eventId);
}

export async function updateVendor(eventId: string, vendorId: string, formData: FormData) {
  const data = await withAutoCost(eventId, parseVendorFields(formData));
  await prisma.vendor.update({ where: { id: vendorId }, data });
  revalidateEvent(eventId);
}

export async function deleteVendor(eventId: string, vendorId: string) {
  await prisma.vendor.delete({ where: { id: vendorId } });
  revalidateEvent(eventId);
}

/** Recomputes a catering vendor's cost from the current confirmed headcount without editing other fields. */
export async function recalculateVendorCost(eventId: string, vendorId: string) {
  const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });
  if (vendor.costPerPerson === null) return;
  const headcounts = await getGuestHeadcounts(eventId);
  await prisma.vendor.update({
    where: { id: vendorId },
    data: { cost: Number(vendor.costPerPerson) * headcounts.expectedHeadcount },
  });
  revalidateEvent(eventId);
}
