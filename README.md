# KrishiLens Nepal

KrishiLens Nepal is an agriculture market intelligence and decision-support platform for farmers, traders, and agricultural planners.

It combines daily wholesale market prices from AMPIS with historical market analysis, crop recommendations, market comparison tools, and Nepali/English localization.

## Features

- Daily wholesale prices across Nepal's major agricultural markets
- AMPIS live price ingestion
- Market and commodity comparison
- Commodity detail pages with recent price trends
- Crop recommendations based on:
  - District
  - Irrigation status
  - Nepali planting month
  - Historical market trends
- Nepali and English language switching
- Admin dashboard for:
  - Commodity image management
  - Manual reference price benchmarks
  - Daily price overrides
- Protected admin routes with HTTP-only session authentication
- Responsive mobile and desktop interface

## Technology

- Next.js App Router
- React and TypeScript
- Drizzle ORM
- Neon PostgreSQL
- Tailwind CSS
- Recharts
- GitHub Actions
- AMPIS data source

## Requirements

- Node.js 20 or newer
- npm
- Neon PostgreSQL database

## Local setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Anuj-Dhungana/krishilense.git
   cd krishilense
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file:

   ```bash
   copy .env.example .env.local
   ```

   On macOS or Linux:

   ```bash
   cp .env.example .env.local
   ```

4. Configure the values in `.env.local`.

5. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See [.env.example](./.env.example) for the complete list.

Required database variables:

```env
DATABASE_URL=your_neon_pooler_connection_string
DATABASE_URL_UNPOOLED=your_neon_direct_connection_string
```

Admin authentication variables:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-admin-password
ADMIN_SESSION_SECRET=your-random-32-character-secret-key
```

Never commit `.env`, `.env.local`, database URLs, passwords, or session secrets.

## Application routes

| Route | Purpose |
|---|---|
| `/` | Daily market prices |
| `/plan` | Crop recommendation planner |
| `/compare` | Market price comparison |
| `/commodity/[code]` | Commodity details and price trends |
| `/methodology` | Methodology and data sources |
| `/admin/login` | Admin login |
| `/admin` | Protected admin dashboard |

## Admin API routes

| Endpoint | Purpose |
|---|---|
| `POST /api/admin/login` | Create an admin session |
| `POST /api/admin/logout` | Clear the admin session |
| `GET /api/admin/commodities` | List commodities |
| `PATCH /api/admin/commodities` | Update a commodity image URL |
| `GET /api/admin/prices` | Load markets, commodities, and today's prices |
| `POST /api/admin/prices` | Post or update a reference benchmark |

Admin API routes are protected by [src/middleware.ts](./src/middleware.ts).

## Price ingestion

The active live ingestion script is:

```bash
npm run ingest:live
```

It fetches date-filtered prices from AMPIS and upserts market/commodity/date records without deleting unrelated benchmark prices.

The legacy ingestion command is:

```bash
npm run ingest:daily
```

Use the live AMPIS command for current government market prices.

## Automated updates

[.github/workflows/daily-update.yml](./.github/workflows/daily-update.yml) runs automatically twice each day:

- 10:00 AM Nepal time — `04:15 UTC`
- 1:00 PM Nepal time — `07:15 UTC`

It can also be started manually with GitHub Actions.

Configure these GitHub repository secrets:

- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`

## Database migrations

The Drizzle schema is defined in [src/db/schema.ts](./src/db/schema.ts). SQL migrations are stored in [drizzle/](./drizzle/).

After changing the schema, review the generated migration before applying it to production.

## Validation commands

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Project structure

```text
src/
  app/              Next.js pages and API route handlers
  components/       Shared navigation and site components
  db/               Drizzle database client and schema
  lib/              Translations, authentication, icons, and ingestion helpers
scripts/            Data ingestion and database utilities
drizzle/            Database migration files
public/             Static images and assets
.github/workflows/  Automated AMPIS ingestion workflow
```

## Data sources

Market prices are sourced from the Agriculture Market Price Information System (AMPIS). The application also references historical market data, the Kalimati Board, and Agriculture Information and Training Centre (AITC) methodology where applicable.

## License

This project does not currently declare a public software license. Contact the repository owner before redistributing or reusing the source.