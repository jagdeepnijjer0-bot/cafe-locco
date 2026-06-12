import { supabase } from './supabase';

/** Comma-separated admin emails from env, e.g. EXPO_PUBLIC_ADMIN_EMAILS="a@x.com,b@y.com" */
const ADMIN_EMAILS = (process.env.EXPO_PUBLIC_ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  // If no admin list is configured, any signed-in user may manage the gallery.
  if (ADMIN_EMAILS.length === 0) return true;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Upload a local image (from expo-image-picker) to Supabase Storage and
 * insert a matching row into gallery_images so it appears in the app.
 */
export async function uploadGalleryImage(params: {
  uri: string;
  caption?: string;
  orderIndex?: number;
}): Promise<void> {
  const { uri, caption, orderIndex } = params;

  const ext = (uri.split('.').pop() || 'jpg').split('?')[0].toLowerCase();
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  // Read the local file into an ArrayBuffer for the Storage upload.
  const arrayBuffer = await fetch(uri).then((r) => r.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from('gallery')
    .upload(path, arrayBuffer, { contentType, upsert: false });
  if (uploadError) throw uploadError;

  const { data: pub } = supabase.storage.from('gallery').getPublicUrl(path);

  const { error: insertError } = await supabase.from('gallery_images').insert({
    image_url: pub.publicUrl,
    caption: caption?.trim() || null,
    order_index: orderIndex ?? Date.now(),
  });
  if (insertError) throw insertError;
}

/** Remove a gallery row (and best-effort delete its Storage object). */
export async function deleteGalleryImage(id: string, imageUrl: string): Promise<void> {
  const { error } = await supabase.from('gallery_images').delete().eq('id', id);
  if (error) throw error;

  // Best-effort: remove the stored object if it lives in our bucket.
  const marker = '/gallery/';
  const idx = imageUrl.indexOf(marker);
  if (idx !== -1) {
    const path = imageUrl.slice(idx + marker.length);
    await supabase.storage.from('gallery').remove([path]).catch(() => {});
  }
}
