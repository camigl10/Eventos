# Eventos

Aplicación web para organizadores de eventos (bodas, XV años, cumpleaños, corporativos, ferias, etc). Reemplaza el papel y las hojas de Excel sueltas: cada evento es completamente independiente y contiene su propia agenda, invitados, proveedores, menú, presupuesto o inventario según el tipo.

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind CSS)
- [Prisma ORM](https://www.prisma.io) + PostgreSQL (vía `@prisma/adapter-pg`)

## Modelo de datos

Todo cuelga de `Event` mediante `eventId`, así que los datos de un evento nunca se mezclan con los de otro. Ver [`prisma/schema.prisma`](./prisma/schema.prisma):

- **Event** — nombre, tipo (boda/XV años/cumpleaños/corporativo/feria/otro), fecha, lugar, cliente/anfitrión, presupuesto total, notas para el DJ.
- **Guest** (invitados) — nombre, grupo/mesa, acompañantes, contacto, estado de invitación (no enviada/enviada/confirmada/rechazada), notas (alergias, niños, etc.), check-in (`checkedIn` + `checkInTime` para el día del evento).
- **Vendor** (proveedores) — categoría (catering/DJ/fotografía/flores/salón/mobiliario/otro), contacto, servicio contratado, costo, anticipo pagado (el saldo se calcula como `cost - depositPaid`), estado (cotizado/contratado/pagado). `costPerPerson` es específico de catering para auto-calcular el costo total según invitados confirmados.
- **MenuItem** — tiempo del menú (entrada/plato fuerte/postre/bebida), opciones vegetarianas/infantiles, vinculado al proveedor de catering.
- **ScheduleItem** (cronograma) — hora, actividad, responsable, duración y orden (para reordenar el itinerario).
- **MusicItem** (DJ) — momento musical, canción, hora, estado (pendiente/confirmada) y notas especiales.
- **InventoryItem** (inventario de feria) — nombre, foto (guardada en la base de datos), precio, quién lo vende y si ya se vendió; usado por eventos de tipo Feria.

## Interfaz

- **Dashboard** (`/`) — tarjetas de todos los eventos con invitados confirmados y estado del presupuesto (o ventas del inventario para ferias); crear evento nuevo.
- **Por evento** (`/eventos/[id]/...`):
  - **Resumen** — estadísticas clave, edición de datos del evento, eliminar evento.
  - **Invitados** — tabla con búsqueda/filtro, edición inline, importar/exportar CSV.
  - **Check-in** — vista simple para celular con buscador grande y contadores en vivo.
  - **Proveedores** — presupuesto automático (suma de proveedores vs. presupuesto total, con alerta), exportar Excel/PDF.
  - **Menú** — platillos por tiempo, vinculados al proveedor de catering.
  - **Cronograma** — itinerario arrastrable, vista imprimible.
  - **DJ / Música** — canciones y momentos musicales, notas generales para el DJ.
  - **Inventario** (solo eventos tipo Feria) — alta de artículos con foto, marcar vendido/disponible, totales de ventas por persona.

## Empezar

```bash
npm install                # instala dependencias y genera el cliente de Prisma
cp .env.example .env       # si no existe .env; completá DATABASE_URL con tu conexión de Postgres
npm run db:migrate         # aplica el esquema a la base de datos
npm run db:seed            # carga datos de ejemplo (una boda y un evento corporativo)
npm run dev                # http://localhost:3000
```

Necesitás una base de datos PostgreSQL accesible (local o en la nube, por ejemplo Neon, Supabase o Vercel Postgres). Para desplegarla en internet (por ejemplo en Vercel) para poder usarla desde el celular o tablet, conectá el repositorio y configurá la variable de entorno `DATABASE_URL` con la conexión de tu base en la nube.

Otros comandos útiles:

- `npm run db:studio` — explorador visual de la base de datos (Prisma Studio).
- `npm run lint` — ESLint.
- `npm run build` — build de producción.
