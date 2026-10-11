# Supabase gallery setup

The gallery uses Supabase Auth, Storage, and a small Postgres table. The project URL and publishable key are public browser configuration values; never put a Supabase secret or service-role key in a `VITE_` variable.

1. Create a Supabase project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. In **SQL Editor**, run [`supabase/gallery-setup.sql`](supabase/gallery-setup.sql).
3. Under **Authentication → Users**, invite the gallery administrator. Copy the new user's UUID.
4. In **SQL Editor**, grant that account gallery access:

   ```sql
   insert into public.gallery_admins (user_id)
   values ('ADMIN-USER-UUID');
   ```

5. Copy `.env.example` to `.env.local`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the Supabase project's **Connect** dialog.
6. Restart the local development server. Visit `/admin` and sign in with the invited admin account.

The setup script creates the public image bucket and access policies. Visitors can read gallery entries and image files; only IDs in `gallery_admins` can add, reorder, or delete them. The gallery keeps its four bundled photos and shows newly uploaded photos first.
