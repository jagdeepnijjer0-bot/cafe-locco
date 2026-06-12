-- ============================================================
-- Migration 027 — Gallery image storage + admin write policies
-- Enables in-app admin uploads to the gallery.
-- Run in: Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- 1) Public storage bucket that holds the uploaded gallery photos
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- 2) Storage object policies
--    Anyone can VIEW gallery photos (public bucket); only signed-in
--    users (the admin) can upload / replace / remove them.
do $$
begin
  begin
    create policy "gallery objects public read"
      on storage.objects for select
      using (bucket_id = 'gallery');
  exception when duplicate_object then null; end;

  begin
    create policy "gallery objects auth insert"
      on storage.objects for insert to authenticated
      with check (bucket_id = 'gallery');
  exception when duplicate_object then null; end;

  begin
    create policy "gallery objects auth update"
      on storage.objects for update to authenticated
      using (bucket_id = 'gallery');
  exception when duplicate_object then null; end;

  begin
    create policy "gallery objects auth delete"
      on storage.objects for delete to authenticated
      using (bucket_id = 'gallery');
  exception when duplicate_object then null; end;
end $$;

-- 3) Allow signed-in users to add / remove rows in gallery_images
--    (the public read policy already exists from migration 023/025).
do $$
begin
  begin
    create policy "gallery_images: auth insert"
      on public.gallery_images for insert to authenticated
      with check (true);
  exception when duplicate_object then null; end;

  begin
    create policy "gallery_images: auth update"
      on public.gallery_images for update to authenticated
      using (true);
  exception when duplicate_object then null; end;

  begin
    create policy "gallery_images: auth delete"
      on public.gallery_images for delete to authenticated
      using (true);
  exception when duplicate_object then null; end;
end $$;
