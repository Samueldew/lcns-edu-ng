import {
  getSupabase,
  LOCAL_TABLES,
  DEFAULT_SETTINGS,
  DEFAULT_MANAGEMENT,
  DEFAULT_GALLERY,
  SupabaseGalleryItem,
  SupabaseManagementMember,
} from './supabase';

export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Failed to read file as data URL'));
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function uploadPermanent(
  file: File | Blob,
  bucket: 'gallery' | 'management-photos' | 'school-assets' | string,
  path: string
): Promise<string> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      // Try upload - if bucket doesn't exist, Supabase will error, we will fallback
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (!error && data) {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
        if (urlData?.publicUrl) return urlData.publicUrl;
      }
      console.warn(`Storage upload failed for ${bucket}/${path}:`, error?.message);
    } catch (err) {
      console.warn('Storage error:', err);
    }
  }

  // ALWAYS return DataURL as fallback - this is what saves your logo PERMANENTLY in browser + DB
  const dataUrl = await fileToDataUrl(file);
  console.log('Using DataURL fallback, length:', dataUrl.length);
  return dataUrl;
}

export async function deletePermanentFile(bucket: string, path: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    try { await supabase.storage.from(bucket).remove([path]); } catch {}
  }
}

// SCHOOL SETTINGS - FIXED TO ALWAYS SHOW LOCAL LOGO FIRST
export async function getSchoolSetting(key: string, fallback?: string): Promise<string> {
  // 1. FIRST check localStorage - so logo shows instantly
  const local = getLocalSettings();
  if (local[key] && local[key].length > 10) {
    return local[key];
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('school_settings').select('value').eq('key', key).single();
      if (!error && data?.value) {
        local[key] = data.value;
        localStorage.setItem(LOCAL_TABLES.SETTINGS, JSON.stringify(local));
        return data.value;
      }
    } catch {}
  }

  if (DEFAULT_SETTINGS[key]) return DEFAULT_SETTINGS[key];
  return fallback || '';
}

export async function setSchoolSetting(key: string, value: string): Promise<void> {
  const local = getLocalSettings();
  local[key] = value;
  localStorage.setItem(LOCAL_TABLES.SETTINGS, JSON.stringify(local));
  window.dispatchEvent(new CustomEvent('lcns_school_settings_update', { detail: { key, value } }));
  window.dispatchEvent(new Event('storage')); // force update

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('school_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      console.log('Saved to Supabase:', key);
    } catch (err) {
      console.warn('Supabase save error:', err);
    }
  }
}

export function getLocalSettings(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LOCAL_TABLES.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed }; // parsed overwrites defaults!
    }
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

// ... rest of file KEEP SAME AS BEFORE (Management & Gallery)
export async function getManagementMembers(): Promise<SupabaseManagementMember[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('management').select('*').order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        localStorage.setItem(LOCAL_TABLES.MANAGEMENT, JSON.stringify(data));
        return data as SupabaseManagementMember[];
      }
    } catch {}
  }
  try {
    const raw = localStorage.getItem(LOCAL_TABLES.MANAGEMENT);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.sort((a, b) => a.display_order - b.display_order);
    }
  } catch {}
  localStorage.setItem(LOCAL_TABLES.MANAGEMENT, JSON.stringify(DEFAULT_MANAGEMENT));
  return DEFAULT_MANAGEMENT;
}

export async function saveManagementMember(member: SupabaseManagementMember): Promise<void> {
  const current = await getManagementMembers();
  const existingIdx = current.findIndex((m) => m.id === member.id);
  let updated = existingIdx >= 0 ? [...current] : [...current, member];
  if (existingIdx >= 0) updated[existingIdx] = member;
  updated.sort((a, b) => a.display_order - b.display_order);
  localStorage.setItem(LOCAL_TABLES.MANAGEMENT, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('lcns_management_update'));
  const supabase = getSupabase();
  if (supabase) { try { await supabase.from('management').upsert(member); } catch {} }
}

export async function deleteManagementMember(id: string): Promise<void> {
  const current = await getManagementMembers();
  const target = current.find((m) => m.id === id);
  const updated = current.filter((m) => m.id !== id);
  localStorage.setItem(LOCAL_TABLES.MANAGEMENT, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('lcns_management_update'));
  if (target?.photo_url && target.photo_url.includes('management-photos/')) {
    const filename = target.photo_url.split('management-photos/').pop()?.split('?')[0];
    if (filename) deletePermanentFile('management-photos', filename);
  }
  const supabase = getSupabase();
  if (supabase) { try { await supabase.from('management').delete().eq('id', id); } catch {} }
}

export async function getGalleryItems(category?: string): Promise<SupabaseGalleryItem[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (category && category !== 'All') query = query.eq('category', category);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        if (!category || category === 'All') localStorage.setItem(LOCAL_TABLES.GALLERY, JSON.stringify(data));
        return data as SupabaseGalleryItem[];
      }
    } catch {}
  }
  try {
    const raw = localStorage.getItem(LOCAL_TABLES.GALLERY);
    if (raw) {
      const parsed: SupabaseGalleryItem[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (category && category !== 'All') return parsed.filter((item) => item.category === category);
        return parsed;
      }
    }
  } catch {}
  localStorage.setItem(LOCAL_TABLES.GALLERY, JSON.stringify(DEFAULT_GALLERY));
  if (category && category !== 'All') return DEFAULT_GALLERY.filter((item) => item.category === category);
  return DEFAULT_GALLERY;
}

export async function addGalleryItem(item: Omit<SupabaseGalleryItem, 'id'> & { id?: string }): Promise<SupabaseGalleryItem> {
  const newItem: SupabaseGalleryItem = {
    id: item.id || 'gal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    title: item.title,
    description: item.description || '',
    image_url: item.image_url,
    category: item.category,
    created_at: new Date().toISOString(),
  };
  const current = await getGalleryItems('All');
  const updated = [newItem, ...current];
  localStorage.setItem(LOCAL_TABLES.GALLERY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('lcns_gallery_update'));
  const supabase = getSupabase();
  if (supabase) { try { await supabase.from('gallery').insert([newItem]); } catch {} }
  return newItem;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const current = await getGalleryItems('All');
  const target = current.find((item) => item.id === id);
  const updated = current.filter((item) => item.id !== id);
  localStorage.setItem(LOCAL_TABLES.GALLERY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('lcns_gallery_update'));
  if (target?.image_url && target.image_url.includes('gallery/')) {
    const filename = target.image_url.split('gallery/').pop()?.split('?')[0];
    if (filename) deletePermanentFile('gallery', filename);
  }
  const supabase = getSupabase();
  if (supabase) { try { await supabase.from('gallery').delete().eq('id', id); } catch {} }
}
