import { prisma } from "@/lib/prisma";
import { serializeVendor } from "@/lib/serialize";
import { createMenuItem } from "@/lib/actions/menu";
import { MenuBoard } from "@/components/MenuBoard";
import { AddPopover } from "@/components/AddPopover";
import { SubmitButton } from "@/components/SubmitButton";
import { MenuCourse } from "@/generated/prisma/enums";
import { menuCourseLabels } from "@/lib/labels";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [items, cateringVendors] = await Promise.all([
    prisma.menuItem.findMany({ where: { eventId }, orderBy: { order: "asc" } }),
    prisma.vendor.findMany({ where: { eventId, category: "CATERING" }, orderBy: { name: "asc" } }),
  ]);

  const createMenuItemWithEvent = createMenuItem.bind(null, eventId);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Menú</h2>
          <p className="text-sm text-foreground/60">
            Arma el menú por tiempos y vincúlalo al proveedor de catering.
          </p>
        </div>
        <AddPopover label="+ Agregar platillo" action={createMenuItemWithEvent}>
          <div className="flex flex-col gap-2.5">
            <select
              name="course"
              defaultValue={MenuCourse.PLATO_FUERTE}
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            >
              {Object.values(MenuCourse).map((c) => (
                <option key={c} value={c}>
                  {menuCourseLabels[c]}
                </option>
              ))}
            </select>
            <input
              name="name"
              required
              placeholder="Nombre del platillo"
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            />
            <textarea
              name="description"
              rows={2}
              placeholder="Descripción"
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            />
            {cateringVendors.length > 0 && (
              <select
                name="vendorId"
                defaultValue=""
                className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
              >
                <option value="">Sin proveedor vinculado</option>
                {cateringVendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            )}
            <div className="flex gap-3 text-sm">
              <label className="flex items-center gap-1.5">
                <input type="checkbox" name="isVegetarian" /> Vegetariano
              </label>
              <label className="flex items-center gap-1.5">
                <input type="checkbox" name="isKidsOption" /> Infantil
              </label>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <SubmitButton>Agregar</SubmitButton>
          </div>
        </AddPopover>
      </div>

      {cateringVendors.length === 0 && (
        <p className="rounded-md border border-dashed border-border p-3 text-sm text-foreground/60">
          Todavía no registraste un proveedor de catering en Proveedores — hazlo para vincular el menú y calcular su costo por persona automáticamente.
        </p>
      )}

      <MenuBoard eventId={eventId} items={items} cateringVendors={cateringVendors.map(serializeVendor)} />
    </div>
  );
}
