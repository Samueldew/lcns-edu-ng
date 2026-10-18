import {
  getSupabase,
  LOCAL_TABLES,
  DEFAULT_SETTINGS,
  DEFAULT_MANAGEMENT,
  DEFAULT_GALLERY,
  SupabaseGalleryItem,
  SupabaseManagementMember,
} from './supabase';

/**
 * Converts a File or Blob into a base64 Data URL
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * uploads to Supabase Storage, returns public URL.
 * Never saves image file into public/ or local code folder.
 * If Supabase is connected, uploads directly to Supabase storage bucket.
 * If Supabase is not yet configured, returns a high-fidelity data URL and caches it in DB/local table
 * so pictures never disappear and git pull never touches it.
 */
export async function uploadPermanent(
  file: File | Blob,
  bucket: 'gallery' | 'management-photos' | 'school-assets' | string,
  path: string
): Promise<string> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      // 1. Upload to Supabase Storage bucket
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (error) {
        console.warn(`Supabase Storage upload warning (${bucket}/${path}):`, error.message);
      } else if (data) {
        // 2. Get public URL
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
        if (urlData?.publicUrl) {
          return urlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Error during Supabase storage upload:', err);
    }
  }

  // Fallback if Supabase not configured or failed: convert to DataURL for immediate browser persistence
  const dataUrl = await fileToDataUrl(file);
  return dataUrl;
}

/**
 * Delete a file from Supabase storage
 */
export async function deletePermanentFile(bucket: string, path: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.storage.from(bucket).remove([path]);
    } catch (err) {
      console.warn('Could not delete file from Supabase bucket:', err);
    }
  }
}

// -------------------------------------------------------------------
// SCHOOL SETTINGS (Logo, School Name, Motto, Favicon)
// -------------------------------------------------------------------

export async function getSchoolSetting(key: string, fallback?: string): Promise<string> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('school_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (!error && data?.value) {
        // Cache locally for offline/fast load
        const cached = getLocalSettings();
        cached[key] = data.value;
        localStorage.setItem(LOCAL_TABLES.SETTINGS, JSON.stringify(cached));
        return data.value;
      }
    } catch (err) {
      console.warn('Error fetching setting from Supabase:', err);
    }
  }

  // Fallback to local table cache or defaults
  const local = getLocalSettings();
  if (local[key]) return local[key];
  if (DEFAULT_SETTINGS[key]) return DEFAULT_SETTINGS[key];
  return fallback || '';
}

export async function setSchoolSetting(key: string, value: string): Promise<void> {
  // Update local table cache immediately
  const local = getLocalSettings();
  local[key] = value;
  localStorage.setItem(LOCAL_TABLES.SETTINGS, JSON.stringify(local));

  // Dispatch global event so header and other components update immediately
  window.dispatchEvent(new CustomEvent('lcns_school_settings_update', { detail: { key, value } }));

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('school_settings').upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );
      if (error) {
        console.warn('Could not sync school_setting to Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Supabase upsert setting error:', err);
    }
  }
}

export function getLocalSettings(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LOCAL_TABLES.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore error
  }
  return { ...DEFAULT_SETTINGS };
}

// -------------------------------------------------------------------
// MANAGEMENT TEAM (Provost, Rector, Registrar, Bursar, Deans)
// -------------------------------------------------------------------

export async function getManagementMembers(): Promise<SupabaseManagementMember[]> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('management')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        localStorage.setItem(LOCAL_TABLES.MANAGEMENT, JSON.stringify(data));
        return data as SupabaseManagementMember[];
      }
    } catch (err) {
      console.warn('Error fetching management from Supabase:', err);
    }
  }

  // Fallback to local table
  try {
    const raw = localStorage.getItem(LOCAL_TABLES.MANAGEMENT);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => a.display_order - b.display_order);
      }
    }
  } catch {
    // Ignore
  }

  // Default seed
  localStorage.setItem(LOCAL_TABLES.MANAGEMENT, JSON.stringify(DEFAULT_MANAGEMENT));
  return DEFAULT_MANAGEMENT;
}

export async function saveManagementMember(
  member: SupabaseManagementMember
): Promise<void> {
  const current = await getManagementMembers();
  const existingIdx = current.findIndex((m) => m.id === member.id);

  let updated: SupabaseManagementMember[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = member;
  } else {
    updated = [...current, member];
  }

  updated.sort((a, b) => a.display_order - b.display_order);
  localStorage.setItem(LOCAL_TABLES.MANAGEMENT, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('lcns_management_update'));

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('management').upsert(member);
    } catch (err) {
      console.warn('Could not upsert management member to Supabase:', err);
    }
  }
}

export async function deleteManagementMember(id: string): Promise<void> {
  const current = await getManagementMembers();
  const target = current.find((m) => m.id === id);
  const updated = current.filter((m) => m.id !== id);
  localStorage.setItem(LOCAL_TABLES.MANAGEMENT, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('lcns_management_update'));

  // Also remove photo from storage if url matches
  if (target?.photo_url && target.photo_url.includes('management-photos/')) {
    const filename = target.photo_url.split('management-photos/').pop()?.split('?')[0];
    if (filename) {
      deletePermanentFile('management-photos', filename);
    }
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('management').delete().eq('id', id);
    } catch (err) {
      console.warn('Could not delete management member from Supabase:', err);
    }
  }
}

// -------------------------------------------------------------------
// GALLERY ITEMS (Title, Description, Category, Image URL)
// -------------------------------------------------------------------

export async function getGalleryItems(category?: string): Promise<SupabaseGalleryItem[]> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      let query = supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (category && category !== 'All') {
        query = query.eq('category', category);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        if (!category || category === 'All') {
          localStorage.setItem(LOCAL_TABLES.GALLERY, JSON.stringify(data));
        }
        return data as SupabaseGalleryItem[];
      }
    } catch (err) {
      console.warn('Error fetching gallery from Supabase:', err);
    }
  }

  // Fallback to local table
  try {
    const raw = localStorage.getItem(LOCAL_TABLES.GALLERY);
    if (raw) {
      const parsed: SupabaseGalleryItem[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (category && category !== 'All') {
          return parsed.filter((item) => item.category === category);
        }
        return parsed;
      }
    }
  } catch {
    // Ignore
  }

  localStorage.setItem(LOCAL_TABLES.GALLERY, JSON.stringify(DEFAULT_GALLERY));
  if (category && category !== 'All') {
    return DEFAULT_GALLERY.filter((item) => item.category === category);
  }
  return DEFAULT_GALLERY;
}

export async function addGalleryItem(
  item: Omit<SupabaseGalleryItem, 'id'> & { id?: string }
): Promise<SupabaseGalleryItem> {
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
  if (supabase) {
    try {
      await supabase.from('gallery').insert([newItem]);
    } catch (err) {
      console.warn('Could not insert gallery item to Supabase:', err);
    }
  }

  return newItem;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const current = await getGalleryItems('All');
  const target = current.find((item) => item.id === id);
  const updated = current.filter((item) => item.id !== id);
  localStorage.setItem(LOCAL_TABLES.GALLERY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('lcns_gallery_update'));

  // Also remove from storage bucket if stored there
  if (target?.image_url && target.image_url.includes('gallery/')) {
    const filename = target.image_url.split('gallery/').pop()?.split('?')[0];
    if (filename) {
      deletePermanentFile('gallery', filename);
    }
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('gallery').delete().eq('id', id);
    } catch (err) {
      console.warn('Could not delete gallery item from Supabase:', err);
    }
  }
}
