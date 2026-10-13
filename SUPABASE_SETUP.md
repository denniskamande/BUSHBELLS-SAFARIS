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

After the gallery is working, run [`supabase/package-manager-setup.sql`](supabase/package-manager-setup.sql) in the same Supabase **SQL Editor**. This creates the public safari catalogue table and lets only the approved gallery administrator make changes. Open `/admin`, sign in, then select **Safaris**. The current safari list is copied into the catalogue the first time the editor opens. From there, add or edit names, duration, price estimate, description, destinations, gallery cover photo and day-by-day itinerary. Saving publishes the safari to the website and its enquiry dropdown.

New destinations still need to exist on the website before they can be selected for a safari. Upload package cover images in the Gallery tab before choosing them in the safari editor.

The setup script creates the public media bucket, access policies, and destination placement fields. Visitors can view gallery photos and videos; only IDs in `gallery_admins` can add, reorder, or delete media. Supported uploads are JPG, PNG, WebP, AVIF, MP4 and WebM, up to 15 MB each. Videos play in the gallery and are not assigned to destination highlights; photos can appear there as well. After deploying the media update, rerun `supabase/gallery-setup.sql` in the SQL Editor to update an existing project’s media type field, bucket file types and storage policies.
