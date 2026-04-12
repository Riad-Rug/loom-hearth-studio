# Loom & Hearth Studio

Loom & Hearth Studio is a Next.js commerce application for a curated home decor storefront. It includes a public storefront, cart and checkout flow, account authentication, admin tooling, catalog management, and order persistence around Stripe Checkout.

## Architecture

The project uses a modular monolith architecture:

- `app/`: Next.js App Router routes, layouts, and API endpoints
- `features/`: page-level UI and feature-specific presentation logic
- `components/`: shared UI, layout, SEO, and media components
- `lib/`: business logic and service boundaries for auth, catalog, checkout, orders, Stripe, email, Cloudinary, security, and database access
- `prisma/`: Prisma schema and migrations
- `config/`: site-level configuration and business constants
- `types/`: shared domain types

At a high level, the request flow is:

1. App Router pages and API routes receive requests.
2. Feature and service modules in `lib/` validate input and execute business logic.
3. Prisma repositories persist and query application data in PostgreSQL.
4. External integrations handle payments, email delivery, and media upload signing.

## Database

The application currently uses:

- Database: PostgreSQL
- ORM: Prisma
- Prisma client: `@prisma/client`
- Schema: [prisma/schema.prisma](/home/hp/loom-hearth-studio/prisma/schema.prisma)

Main persisted entities include:

- users, sessions, accounts, and password reset tokens
- login rate limit attempts
- catalog products
- orders and order line items
- fulfillment execution records
- homepage content records
- blog author records

## Technologies

Core stack:

- Next.js 15 with App Router
- React 19
- TypeScript
- Prisma
- PostgreSQL

Authentication and security:

- NextAuth with Prisma adapter
- Credentials-based authentication
- JWT session strategy
- Login rate limiting and admin access guards

Payments and order flow:

- Stripe Checkout session creation
- Stripe webhook signature verification
- Order persistence after confirmed payment

Infrastructure integrations:

- Postmark for transactional email
- Cloudinary signed uploads for media workflows
- Vercel-compatible deployment setup via Next.js build output

## Current Functional Areas

- Public storefront and category browsing
- Product detail pages
- Cart and multi-step checkout flow
- Stripe-based payment handoff
- Order confirmation handling
- Account registration, login, and password reset
- Admin pages for products, orders, homepage content, blog, customers, promos, analytics, newsletter, and SEO
- Policy and content pages such as FAQ, About, Contact, Lookbook, and testimonials

## Project Structure

```text
.
|-- app/
|-- components/
|-- config/
|-- features/
|-- lib/
|-- prisma/
|-- public/
|-- scripts/
|-- styles/
`-- types/
```

## Environment Variables

The main environment variables expected by the app are defined in [.env.example](/home/hp/loom-hearth-studio/.env.example).

Important groups:

- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_SECRET`: NextAuth secret
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe checkout configuration
- `EMAIL_FROM`, `POSTMARK_SERVER_TOKEN`: transactional email configuration
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: media signing configuration
- `NEXT_PUBLIC_SITE_URL`: canonical site URL

## Scripts

- `npm run dev`: start local development
- `npm run build`: run Prisma deploy/bootstrap steps and build the app
- `npm run start`: start the production server
- `npm run typecheck`: run TypeScript checks
- `npm run lint`: run Next.js linting
- `npm run prisma:generate`: generate Prisma client
- `npm run prisma:migrate:dev`: run Prisma development migrations
- `npm run prisma:migrate:deploy`: apply deploy-time migrations
- `npm run catalog:bootstrap`: seed/bootstrap launch catalog data
- `npm run catalog:import-launch-local`: import local launch products
- `npm run admin:promote-user`: promote a user for admin access

## Local Development

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run dev
```

If PostgreSQL is empty, run the appropriate Prisma migration workflow before testing catalog, auth, or order flows.

## Known Gaps

Some parts of the codebase still contain TODO markers or placeholder logic, especially around:

- newsletter provider integration
- final hosting/runtime assumptions
- some environment variable descriptions that still mention older placeholder states
- operational hardening for production flows
