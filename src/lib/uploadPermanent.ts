import {
  getSupabase,
  LOCAL_TABLES,
  SupabaseGalleryItem,
  SupabaseManagementMember,
  DEFAULT_SETTINGS,
  DEFAULT_MANAGEMENT,
  DEFAULT_GALLERY
} from './supabase';

export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadPermanent(
  file: File | Blob,
  bucket: string,
  path: string
): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: true });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("No public URL");
  return data.publicUrl;
}

export async function deletePermanentFile(bucket: string, path: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) { try { await supabase.storage.from(bucket).remove([path]); } catch {} }
}

export function getLocalSettings(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LOCAL_TABLES.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export async function getSchoolSetting(key: string, fallback?: string): Promise<string> {
  const local = getLocalSettings();
  if (local[key]?.length > 10) return local[key];
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase.from('school_settings').select('value').eq('key', key).single();
      if (data?.value) return data.value;
    } catch {}
  }
  return DEFAULT_SETTINGS[key] || fallback || '';
}

export async function setSchoolSetting(key: string, value: string): Promise<void> {
  const local = getLocalSettings();
  local[key] = value;
  localStorage.setItem(LOCAL_TABLES.SETTINGS, JSON.stringify(local));
  window.dispatchEvent(new CustomEvent('lcns_school_settings_update', { detail: { key, value } }));
  const supabase = getSupabase();
  if (supabase) { try { await supabase.from('school_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' }); } catch {} }
}

export async function getManagementMembers(): Promise<SupabaseManagementMember[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase.from('management').select('*').order('display_order', { ascending: true });
      if (data && data.length > 0) return data as SupabaseManagementMember[];
    } catch {}
  }
  try {
    const raw = localStorage.getItem(LOCAL_TABLES.MANAGEMENT);
    if (raw) { const p = JSON.parse(raw); if (p.length > 0) return p; }
  } catch {}
  return DEFAULT_MANAGEMENT;
}

export async function saveManagementMember(member: SupabaseManagementMember): Promise<void> {
  const current = await getManagementMembers();
  const idx = current.findIndex((m) => m.id === member.id);
  let updated = idx >= 0 ? [...current] : [...current, member];
  if (idx >= 0) updated[idx] = member;
  localStorage.setItem(LOCAL_TABLES.MANAGEMENT, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('lcns_management_update'));
  const supabase = getSupabase();
  if (supabase) { try { await supabase.from('management').upsert(member); } catch {} }
}

export async function deleteManagementMember(id: string): Promise<void> {
  const current = await getManagementMembers();
  localStorage.setItem(LOCAL_TABLES.MANAGEMENT, JSON.stringify(current.filter((m) => m.id !== id)));
  window.dispatchEvent(new CustomEvent('lcns_management_update'));
  const supabase = getSupabase();
  if (supabase) { try { await supabase.from('management').delete().eq('id', id); } catch {} }
}

export async function getGalleryItems(category?: string): Promise<SupabaseGalleryItem[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let q = supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (category && category !== 'All') q = q.eq('category', category);
      const { data } = await q;
      if (data && data.length > 0) return data as SupabaseGalleryItem[];
    } catch {}
  }
  try {
    const raw = localStorage.getItem(LOCAL_TABLES.GALLERY);
    if (raw) {
      const p = JSON.parse(raw);
      if (category && category !== 'All') return p.filter((i: any) => i.category === category);
      return p;
    }
  } catch {}
  return category && category !== 'All' ? DEFAULT_GALLERY.filter((i) => i.category === category) : DEFAULT_GALLERY;
}

export async function addGalleryItem(item: Omit<SupabaseGalleryItem, 'id'> & { id?: string }): Promise<SupabaseGalleryItem> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");
  if (item.image_url.startsWith('data:')) throw new Error("DataURL not allowed - storage upload failed");
  const newItem = { id: item.id || 'gal-' + Date.now(), title: item.title, description: item.description || '', image_url: item.image_url, category: item.category, created_at: new Date().toISOString() };
  const { error } = await supabase.from('gallery').insert([newItem]);
  if (error) throw new Error(`Insert failed: ${error.message}`);
  const current = await getGalleryItems('All');
  localStorage.setItem(LOCAL_TABLES.GALLERY, JSON.stringify([newItem, ...current]));
  window.dispatchEvent(new CustomEvent('lcns_gallery_update'));
  return newItem as SupabaseGalleryItem;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const current = await getGalleryItems('All');
  localStorage.setItem(LOCAL_TABLES.GALLERY, JSON.stringify(current.filter((i) => i.id !== id)));
  window.dispatchEvent(new CustomEvent('lcns_gallery_update'));
  const supabase = getSupabase();
  if (supabase) { try { await supabase.from('gallery').delete().eq('id', id); } catch {} }
}
