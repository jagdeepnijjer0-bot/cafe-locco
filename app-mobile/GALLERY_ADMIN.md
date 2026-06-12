# Gallery — admin upload guide

The app gallery is backed by the Supabase table `public.gallery_images` and a
public Supabase **Storage** bucket called `gallery`. Admins can add/remove
photos from inside the app — no SQL needed.

## One-time setup (Supabase)
1. Apply migration `supabase/migrations/027_gallery_storage.sql` in the
   Supabase SQL editor. This creates the public `gallery` storage bucket and
   the upload/delete policies.
2. In `app-mobile/.env`, set `EXPO_PUBLIC_ADMIN_EMAILS` to the email(s) that
   should be allowed to manage the gallery, e.g.
   `EXPO_PUBLIC_ADMIN_EMAILS=info@cafelocco.co.uk`.
   (Leave it blank to allow **any** signed-in user.)

## How to use
1. Sign in with an admin account (Membership → Sign In).
2. Open **Gallery** from the menu. Admins see a **MANAGE GALLERY** button.
3. Tap it to open the admin screen (`/admin/gallery`):
   - **Upload:** add an optional caption, tap **UPLOAD PHOTO**, pick an image.
     It is uploaded to Storage and appears in the gallery instantly (realtime).
   - **Delete:** tap the trash icon on any photo to remove it.

Non-admins never see the button and cannot reach the screen.
