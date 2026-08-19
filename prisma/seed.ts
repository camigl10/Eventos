import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean slate so seeding is repeatable.
  await prisma.inventoryItem.deleteMany();
  await prisma.feria.deleteMany();

  const feria = await prisma.feria.create({
    data: {
      name: "Feria de Artesanías Otoño",
      date: new Date("2026-09-15T10:00:00"),
      location: "Plaza Central",
    },
  });

  await prisma.inventoryItem.createMany({
    data: [
      { feriaId: feria.id, name: "Aretes de resina", price: 1500, sellerName: "Cami", sold: true, soldAt: new Date() },
      { feriaId: feria.id, name: "Pulsera tejida", price: 800, sellerName: "Vale" },
      { feriaId: feria.id, name: "Llavero de cuero", price: 600, sellerName: "Cami" },
      { feriaId: feria.id, name: "Cuadro pintado a mano", price: 4500, sellerName: "Sofi", sold: true, soldAt: new Date() },
    ],
  });

  console.log(`Seed completado: feria "${feria.name}" con 4 artículos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
