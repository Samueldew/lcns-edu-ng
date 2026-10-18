export async function uploadPermanent(
  file: File | Blob,
  bucket: string,
  path: string
): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  
  if (error) throw new Error(`Storage upload failed: ${error.message} - Run SQL fix!`);

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!urlData?.publicUrl) throw new Error("Failed to get public URL");
  
  return urlData.publicUrl;
}

export async function addGalleryItem(item: Omit<SupabaseGalleryItem, 'id'> & { id?: string }): Promise<SupabaseGalleryItem> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const newItem = {
    id: item.id || 'gal-' + Date.now(),
    title: item.title,
    description: item.description || '',
    image_url: item.image_url, // Must be https:// URL, NOT data:image/...
    category: item.category,
    created_at: new Date().toISOString(),
  };

  if (newItem.image_url.startsWith('data:')) {
    throw new Error("Image is DataURL, not Supabase URL - Storage upload failed! Run SQL fix.");
  }

  const { error } = await supabase.from('gallery').insert([newItem]);
  if (error) throw new Error(`DB insert failed: ${error.message}`);

  // Only after Supabase success, update localStorage
  const current = await getGalleryItems('All');
  localStorage.setItem(LOCAL_TABLES.GALLERY, JSON.stringify([newItem, ...current]));
  window.dispatchEvent(new CustomEvent('lcns_gallery_update'));
  
  return newItem as SupabaseGalleryItem;
}
