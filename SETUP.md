# AuditFlow Setup Guide

## Supabase Project Setup

### Creating a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### Environment Variables

Update your `.env` file with the new credentials from your Supabase project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Database Connection (from Project Settings > Database)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

**Where to find these:**
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Project Settings > API
- `SUPABASE_SERVICE_ROLE_KEY`: Project Settings > API (under "service_role" - keep secret!)
- `DATABASE_URL` and `DIRECT_URL`: Project Settings > Database > Connection string (use Session pooler for DATABASE_URL, Direct for DIRECT_URL)

### Database Setup

```bash
# Push the schema to your database
pnpm prisma db push

# Seed the database with audit templates
pnpm prisma db seed
```

### Storage Setup

1. Go to Supabase Dashboard > Storage
2. Create a new bucket called `audit-photos`
3. Set the bucket to **Public** (for image display)
4. Add these RLS policies:

```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'audit-photos');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'audit-photos');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'audit-photos');
```

### Run the Application

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

---

## Migrating to a New Supabase Project

If you need to recreate on a new Free project (to avoid Pro plan charges):

1. Delete the existing Supabase project
2. Create a new project on a Free organization
3. Update `.env` with new credentials (see above)
4. Run `pnpm prisma db push` - recreates the schema
5. Run `pnpm prisma db seed` - adds audit templates
6. Create the `audit-photos` storage bucket again

**Note:** If you haven't added real data yet, you lose nothing important. All schema and code are stored locally and on GitHub.

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
