# Morabash Tournament Dashboard

This project is a Next.js tournament dashboard backed by Supabase. It includes a secure
admin area for managing teams, matches, score entry, and standings in real time.

## Supabase Configuration

The application expects a Supabase project with the following setup:

1. **Create the database schema**
   - Run [`scripts/001_create_tables.sql`](scripts/001_create_tables.sql) in the Supabase SQL
     editor to provision all tournament tables.
   - The `teams` table must contain the columns `name` and `captain`. The script also enables
     row level security and policies that allow public reads while restricting writes to
     authenticated users.

2. **Seed development data**
   - Execute [`scripts/002_seed_data.sql`](scripts/002_seed_data.sql) to populate sample teams,
     standings, matches, and players. Update or remove the seed script as needed for production.

3. **Provision admin profiles**
   - Run [`scripts/003_create_admin_users.sql`](scripts/003_create_admin_users.sql). This creates a
     `profiles` table linked to `auth.users`, sets a default `role` of `admin`, and configures the
     trigger that inserts a profile whenever a new auth user is created.
   - Create admin accounts in Supabase Authentication (or through the `/auth/sign-up` page). Each
     admin must have a corresponding profile row with `role = 'admin'`.

4. **Environment variables**
   - Add the Supabase project URL and anon key to `.env.local`:

     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

   - Restart the Next.js dev server after updating environment variables.

## Admin Features

Authenticated users with the `admin` role gain access to the `/admin` routes:

- **Dashboard:** overview of teams, matches, and quick links to common tasks.
- **Teams:** create, edit, and delete entries in the Supabase `teams` table.
- **Matches and Score Entry:** manage match lifecycle and update live scores.

Middleware and server-side checks ensure only admin users can reach these pages. Non-admin users
are redirected to `/auth/error?error=not-authorized`.

## Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Run linting before committing changes:

```bash
npm run lint
```
