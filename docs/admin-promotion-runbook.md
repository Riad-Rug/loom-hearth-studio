# Admin Promotion Runbook

## Source of truth

- Prisma model: `User`
- Prisma field: `User.role`
- Allowed role values: `admin`, `editor`, `viewer`

These are defined in:

- `prisma/schema.prisma`
- `types/domain/customer.ts`
- `lib/auth/service.ts`

## Safest current promotion path

Use the internal-only CLI script:

```bash
npm run admin:promote-user -- --email "user@example.com" --role admin
```

This updates an existing registered user only. It does not create a new user.

## Local procedure

1. Ensure the user has already registered through the current auth flow.
2. Ensure `DATABASE_URL` points at the correct local or shared database.
3. Run one of:

```bash
npm run admin:promote-user -- --email "user@example.com" --role admin
npm run admin:promote-user -- --email "user@example.com" --role editor
npm run admin:promote-user -- --email "user@example.com" --role viewer
```

4. Sign out and sign back in for the updated role to appear in a fresh session.
5. Confirm access at `/admin`.

## Production procedure

1. Confirm the target user already exists in the production database.
2. Run the same script in the production environment with the production `DATABASE_URL`:

```bash
npm run admin:promote-user -- --email "user@example.com" --role admin
```

3. Have the user sign out and sign back in.
4. Confirm the correct role can access the admin routes.

## Direct SQL fallback

If the script cannot be used, the equivalent SQL is:

```sql
UPDATE "User"
SET "role" = 'admin'
WHERE "email" = 'user@example.com';
```

Use only one of: `admin`, `editor`, `viewer`.

## Precautions

- Promote only existing users you trust.
- Verify the `DATABASE_URL` target before running the command.
- The role change is immediate at the database level, but existing sessions may need a fresh sign-in to reflect the new role in the Auth.js session.
- There is no public UI for promotion, and that is intentional in the current implementation.
