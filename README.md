# Feria Inventario

App para manejar el inventario de artículos que se venden en una feria/puesto: foto, precio, quién lo vende (cuando son varias personas vendiendo juntas) y si ya se vendió. Calcula automáticamente cuánto vendió cada persona.

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind CSS)
- [Prisma ORM](https://www.prisma.io) + PostgreSQL (vía `@prisma/adapter-pg`)

## Modelo de datos

Cada feria es independiente y contiene su propio inventario. Ver [`prisma/schema.prisma`](./prisma/schema.prisma):

- **Feria** — nombre, fecha, lugar.
- **InventoryItem** (artículo) — nombre, foto (guardada en la base de datos), precio, quién lo vende, si ya se vendió.

## Interfaz

- **Dashboard** (`/`) — tarjetas de todas las ferias con total vendido y artículos disponibles; crear feria nueva.
- **Por feria** (`/ferias/[id]`) — alta de artículos con foto, marcar vendido/disponible, editar y eliminar, totales de ventas por persona, editar/eliminar la feria.

## Empezar

```bash
npm install                # instala dependencias y genera el cliente de Prisma
cp .env.example .env       # si no existe .env; completá DATABASE_URL con tu conexión de Postgres
npm run db:migrate         # aplica el esquema a la base de datos
npm run db:seed            # carga una feria de ejemplo con artículos
npm run dev                # http://localhost:3000
```

Necesitás una base de datos PostgreSQL accesible (local o en la nube, por ejemplo Neon, Supabase o Vercel Postgres). Para desplegarla en internet (por ejemplo en Vercel) y poder usarla desde el celular o tablet, conectá el repositorio y configurá la variable de entorno `DATABASE_URL` con la conexión de tu base en la nube.

Otros comandos útiles:

- `npm run db:studio` — explorador visual de la base de datos (Prisma Studio).
- `npm run lint` — ESLint.
- `npm run build` — build de producción.
