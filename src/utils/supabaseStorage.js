// Helper function to get Supabase Storage URLs
// Replace with your actual Supabase project URL!
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://YOUR-PROJECT-ID.supabase.co";

export const getStorageUrl = (bucket, path) => {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
};

// Example usage:
// getStorageUrl("gallery", "Murudeshwar_temple_statue.jpg")
// Returns: https://YOUR-PROJECT-ID.supabase.co/storage/v1/object/public/gallery/Murudeshwar_temple_statue.jpg
