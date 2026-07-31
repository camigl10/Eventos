# Eventos

Aplicación web para organizadores de eventos (bodas, XV años, cumpleaños, corporativos, etc). Reemplaza el papel y las hojas de Excel sueltas: cada evento es completamente independiente y contiene su propia agenda, invitados, proveedores, menú y presupuesto.

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind CSS)
- [Prisma ORM](https://www.prisma.io) + SQLite (vía `@prisma/adapter-better-sqlite3`)

## Modelo de datos

Todo cuelga de `Event` mediante `eventId`, así que los datos de un evento nunca se mezclan con los de otro. Ver [`prisma/schema.prisma`](./prisma/schema.prisma):

- **Event** — nombre, tipo (boda/XV años/cumpleaños/corporativo/otro), fecha, lugar, cliente/anfitrión, presupuesto total, notas para el DJ.
- **Guest** (invitados) — nombre, grupo/mesa, acompañantes, contacto, estado de invitación (no enviada/enviada/confirmada/rechazada), notas (alergias, niños, etc.), check-in (`checkedIn` + `checkInTime` para el día del evento).
- **Vendor** (proveedores) — categoría (catering/DJ/fotografía/flores/salón/mobiliario/otro), contacto, servicio contratado, costo, anticipo pagado (el saldo se calcula como `cost - depositPaid`), estado (cotizado/contratado/pagado). `costPerPerson` es específico de catering para auto-calcular el costo total según invitados confirmados.
- **MenuItem** — tiempo del menú (entrada/plato fuerte/postre/bebida), opciones vegetarianas/infantiles, vinculado al proveedor de catering.
- **ScheduleItem** (cronograma) — hora, actividad, responsable, duración y orden (para reordenar el itinerario).
- **MusicItem** (DJ) — momento musical, canción, hora, estado (pendiente/confirmada) y notas especiales.

## Empezar

```bash
npm install                # instala dependencias y genera el cliente de Prisma
cp .env.example .env       # si no existe .env (ya viene con DATABASE_URL="file:./dev.db")
npm run db:migrate         # crea la base de datos SQLite y aplica el esquema
npm run db:seed            # carga datos de ejemplo (una boda y un evento corporativo)
npm run dev                # http://localhost:3000
```

Otros comandos útiles:

- `npm run db:studio` — explorador visual de la base de datos (Prisma Studio).
- `npm run lint` — ESLint.
- `npm run build` — build de producción.
