import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL as string,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean slate so seeding is repeatable.
  await prisma.musicItem.deleteMany();
  await prisma.scheduleItem.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.event.deleteMany();

  // ---------- Event 1: boda ----------
  const boda = await prisma.event.create({
    data: {
      name: "Boda de Ana & Luis",
      type: "BODA",
      date: new Date("2026-11-14T17:00:00-06:00"),
      location: "Salón Jardín Las Palmas",
      hostName: "Ana Torres",
      totalBudget: 180000,
      djNotes: "Nada de banda (grupero). Los novios piden que el DJ evite covers en inglés durante la cena.",
    },
  });

  const catering = await prisma.vendor.create({
    data: {
      eventId: boda.id,
      category: "CATERING",
      name: "Banquetes El Fogón",
      contactName: "Marta Ruiz",
      contactPhone: "555-100-2001",
      contactEmail: "marta@elfogon.mx",
      serviceDescription: "Cena de 3 tiempos + coctel de bienvenida",
      cost: 96000,
      depositPaid: 40000,
      costPerPerson: 800,
      status: "CONTRATADO",
    },
  });

  await prisma.vendor.create({
    data: {
      eventId: boda.id,
      category: "DJ",
      name: "DJ Fede",
      contactName: "Federico Gómez",
      contactPhone: "555-100-2002",
      serviceDescription: "Música ceremonia, cóctel y fiesta hasta las 2am",
      cost: 18000,
      depositPaid: 9000,
      status: "CONTRATADO",
    },
  });

  await prisma.vendor.create({
    data: {
      eventId: boda.id,
      category: "FOTOGRAFIA",
      name: "Estudio Luz Natural",
      contactName: "Diego Paredes",
      contactEmail: "diego@luznatural.mx",
      serviceDescription: "Foto y video, 8 horas de cobertura",
      cost: 32000,
      depositPaid: 32000,
      status: "PAGADO",
    },
  });

  await prisma.vendor.create({
    data: {
      eventId: boda.id,
      category: "FLORES",
      name: "Florería Primavera",
      contactPhone: "555-100-2003",
      serviceDescription: "Centros de mesa y arco de ceremonia",
      cost: 15000,
      depositPaid: 5000,
      status: "CONTRATADO",
    },
  });

  await prisma.vendor.create({
    data: {
      eventId: boda.id,
      category: "SALON",
      name: "Jardín Las Palmas",
      contactPhone: "555-100-2004",
      serviceDescription: "Renta de jardín y terraza",
      cost: 45000,
      depositPaid: 20000,
      status: "CONTRATADO",
    },
  });

  await prisma.vendor.create({
    data: {
      eventId: boda.id,
      category: "MOBILIARIO",
      name: "Rentas del Valle",
      serviceDescription: "Mesas, sillas Tiffany y mantelería",
      cost: 12000,
      depositPaid: 0,
      status: "COTIZADO",
    },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        eventId: boda.id,
        course: "ENTRADA",
        name: "Ensalada de pera y nuez",
        vendorId: catering.id,
        order: 1,
      },
      {
        eventId: boda.id,
        course: "PLATO_FUERTE",
        name: "Filete de res en salsa de vino tinto",
        vendorId: catering.id,
        order: 2,
      },
      {
        eventId: boda.id,
        course: "PLATO_FUERTE",
        name: "Portobello relleno de vegetales",
        isVegetarian: true,
        vendorId: catering.id,
        order: 3,
      },
      {
        eventId: boda.id,
        course: "PLATO_FUERTE",
        name: "Nuggets y papas fritas",
        isKidsOption: true,
        vendorId: catering.id,
        order: 4,
      },
      {
        eventId: boda.id,
        course: "POSTRE",
        name: "Pastel de bodas (3 pisos, vainilla y chocolate)",
        vendorId: catering.id,
        order: 5,
      },
      {
        eventId: boda.id,
        course: "BEBIDA",
        name: "Barra libre (whisky, tequila, vino, refrescos)",
        vendorId: catering.id,
        order: 6,
      },
    ],
  });

  await prisma.scheduleItem.createMany({
    data: [
      {
        eventId: boda.id,
        time: new Date("2026-11-14T17:00:00-06:00"),
        activity: "Ceremonia religiosa",
        responsible: "Maestro de ceremonias",
        durationMinutes: 45,
        order: 1,
      },
      {
        eventId: boda.id,
        time: new Date("2026-11-14T18:00:00-06:00"),
        activity: "Cóctel de bienvenida",
        responsible: "Staff banquetes",
        durationMinutes: 60,
        order: 2,
      },
      {
        eventId: boda.id,
        time: new Date("2026-11-14T19:00:00-06:00"),
        activity: "Entrada a salón",
        responsible: "DJ Fede",
        durationMinutes: 15,
        order: 3,
      },
      {
        eventId: boda.id,
        time: new Date("2026-11-14T19:30:00-06:00"),
        activity: "Cena",
        responsible: "Staff banquetes",
        durationMinutes: 60,
        order: 4,
      },
      {
        eventId: boda.id,
        time: new Date("2026-11-14T21:00:00-06:00"),
        activity: "Primer baile",
        responsible: "DJ Fede",
        durationMinutes: 10,
        order: 5,
      },
      {
        eventId: boda.id,
        time: new Date("2026-11-14T21:30:00-06:00"),
        activity: "Pista abierta",
        responsible: "DJ Fede",
        durationMinutes: 180,
        order: 6,
      },
    ],
  });

  await prisma.musicItem.createMany({
    data: [
      {
        eventId: boda.id,
        moment: "Entrada de los novios",
        songName: "Perfect",
        artist: "Ed Sheeran",
        time: new Date("2026-11-14T19:00:00-06:00"),
        status: "CONFIRMADA",
        order: 1,
      },
      {
        eventId: boda.id,
        moment: "Primer baile",
        songName: "Thinking Out Loud",
        artist: "Ed Sheeran",
        time: new Date("2026-11-14T21:00:00-06:00"),
        status: "CONFIRMADA",
        order: 2,
      },
      {
        eventId: boda.id,
        moment: "Hora loca",
        songName: "Playlist hora loca (mix cumbia/reggaeton)",
        time: new Date("2026-11-14T23:30:00-06:00"),
        status: "PENDIENTE",
        notes: "Evitar reggaeton explícito, hay niños en la fiesta",
        order: 3,
      },
    ],
  });

  const guestData: Array<{
    name: string;
    group: string;
    companions: number;
    phone: string;
    invitationStatus: "NO_ENVIADA" | "ENVIADA" | "CONFIRMADA" | "RECHAZADA";
    notes?: string;
    checkedIn?: boolean;
  }> = [
    { name: "Carlos Mendoza", group: "Familia novia", companions: 1, phone: "555-200-0001", invitationStatus: "CONFIRMADA", checkedIn: true },
    { name: "Sofía Ramírez", group: "Familia novia", companions: 0, phone: "555-200-0002", invitationStatus: "CONFIRMADA" },
    { name: "Jorge Herrera", group: "Amigos novio", companions: 2, phone: "555-200-0003", invitationStatus: "CONFIRMADA", notes: "Alérgico a los mariscos" },
    { name: "Lucía Fernández", group: "Trabajo novia", companions: 1, phone: "555-200-0004", invitationStatus: "ENVIADA" },
    { name: "Miguel Ángel Ortiz", group: "Familia novio", companions: 0, phone: "555-200-0005", invitationStatus: "RECHAZADA" },
    { name: "Valentina Cruz", group: "Amigos novia", companions: 1, phone: "555-200-0006", invitationStatus: "NO_ENVIADA" },
    { name: "Andrés Salinas", group: "Familia novio", companions: 3, phone: "555-200-0007", invitationStatus: "CONFIRMADA", notes: "Trae 2 niños pequeños, menú infantil", checkedIn: true },
    { name: "Renata Vega", group: "Trabajo novio", companions: 0, phone: "555-200-0008", invitationStatus: "CONFIRMADA" },
  ];

  await prisma.guest.createMany({
    data: guestData.map((g) => ({
      eventId: boda.id,
      name: g.name,
      group: g.group,
      companions: g.companions,
      phone: g.phone,
      invitationStatus: g.invitationStatus,
      notes: g.notes,
      checkedIn: g.checkedIn ?? false,
      checkInTime: g.checkedIn ? new Date("2026-11-14T18:45:00-06:00") : null,
    })),
  });

  // ---------- Event 2: evento corporativo (para probar el aislamiento entre eventos) ----------
  const corporativo = await prisma.event.create({
    data: {
      name: "Cena Anual Grupo Nortex",
      type: "CORPORATIVO",
      date: new Date("2026-12-05T20:00:00-06:00"),
      location: "Hotel Camino Real, Salón Azteca",
      hostName: "Grupo Nortex S.A. de C.V.",
      totalBudget: 250000,
    },
  });

  await prisma.vendor.create({
    data: {
      eventId: corporativo.id,
      category: "CATERING",
      name: "Catering Ejecutivo Nortex",
      cost: 150000,
      depositPaid: 75000,
      costPerPerson: 1000,
      status: "CONTRATADO",
    },
  });

  await prisma.guest.createMany({
    data: [
      { eventId: corporativo.id, name: "Roberto Salazar", group: "Directivos", companions: 1, invitationStatus: "CONFIRMADA" },
      { eventId: corporativo.id, name: "Patricia Núñez", group: "Directivos", companions: 0, invitationStatus: "ENVIADA" },
    ],
  });

  console.log("Seed completado:");
  console.log(`  - Evento "${boda.name}" (${guestData.length} invitados, 6 proveedores, 6 platillos, 6 actividades, 3 canciones)`);
  console.log(`  - Evento "${corporativo.name}" (2 invitados, 1 proveedor)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
