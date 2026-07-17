import { supabase } from './supabaseClient';

const BUCKET = 'crm-uploads';

export async function uploadCrmImage(file, folder = 'bookings') {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadCrmImages(files, folder = 'bookings') {
  const uploads = Array.from(files).map((file) => uploadCrmImage(file, folder));
  return Promise.all(uploads);
}
