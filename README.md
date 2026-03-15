# Loom & Hearth Studio

Scaffold-only foundation for the Loom & Hearth Studio website.

## Status

This repository currently contains:

- Next.js App Router project structure
- TypeScript configuration
- Shared design tokens and global styles
- Domain types for storefront, checkout, content, and admin-facing data
- Placeholder service boundaries for unresolved infrastructure decisions

## Pending Decisions

The following remain intentionally unresolved and are represented as typed boundaries plus TODO markers:

- Database and ORM
- Auth provider
- Stripe integration model
- Email provider
- Newsletter provider
- Tax handling
- Hosting/runtime details

## Next Step

Implement feature slices against the existing types and service contracts after unresolved provider decisions are validated.
