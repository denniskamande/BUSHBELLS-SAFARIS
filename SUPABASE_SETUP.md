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

## Manage safari packages

After the gallery is working, run [`supabase/package-manager-setup.sql`](supabase/package-manager-setup.sql) in the same Supabase **SQL Editor**. This creates the public safari and destination catalogues and lets only the approved gallery administrator make changes. If you already ran it before destination management was added, run the updated script again; it is safe to rerun. Open `/admin`, sign in, then select **Safaris** or **Destinations**. The existing listings are copied into their catalogues when each editor is opened for the first time.

In **Safaris**, add or edit names, duration, price estimate, description, destinations, cover photos and day-by-day itineraries. In **Destinations**, add or edit the name, country, short and full descriptions, best visiting season, highlights, and cover photo. Photos uploaded from either editor are also added to the Gallery. Saving publishes the change on the website. A destination cannot be deleted while a safari still uses it; remove it from those safari routes first.

The setup script creates the public media bucket, access policies, and destination placement fields. Visitors can view gallery photos and videos; only IDs in `gallery_admins` can add, reorder, or delete media. Supported uploads are JPG, PNG, WebP, AVIF, GIF, MP4 and WebM, up to 15 MB each. Large photos are compressed in the browser before upload when needed. Videos play in the gallery and are not assigned to destination highlights; photos can appear there as well. After deploying the media update, rerun `supabase/gallery-setup.sql` in the SQL Editor to update an existing project’s media type field, bucket file types and storage policies.
