import { supabase } from './supabase';

export const LOCAL_TABLES = {} as any;
export const DEFAULT_SETTINGS = {} as any;
export const DEFAULT_MANAGEMENT: any[] = [];
export const DEFAULT_GALLERY: any[] = [];
export type SupabaseGalleryItem = any;
export type SupabaseManagementMember = any;
export const getSupabase = () => supabase;

export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function getSchoolSetting(key: string): Promise<string | null> {
  try {
    const { data } = await supabase.from('school_settings').select('value').eq('key', key).single();
    return data?.value || null;
  } catch { return null; }
}

export async function getSchoolSettings(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase.from('school_settings').select('*');
    const settings: Record<string, string> = {};
    data?.forEach((row: any) => settings[row.key] = row.value);
    return settings;
  } catch { return {}; }
}

export async function saveSchoolSetting(key: string, value: string) {
  const { error } = await supabase.from('school_settings').upsert({ key, value }, { onConflict: 'key' });
  if (error) throw error;
  return true;
}

export async function uploadPermanent(file: File, folder: string = 'general'): Promise<string> {
  const fileName = `${folder}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('school-files').upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage.from('school-files').getPublicUrl(fileName);
  return data.publicUrl;
}

export async function getManagementMembers(): Promise<any[]> {
  try {
    const { data } = await supabase.from('management_members').select('*').order('id');
    return data || [];
  } catch { return []; }
}

export async function getGalleryItems(): Promise<any[]> {
  try {
    const { data } = await supabase.from('gallery_items').select('*').order('id');
    return data || [];
  } catch { return []; }
}

// Extra compatibility exports to prevent other missing export errors
export async function getAllSettings() { return getSchoolSettings(); }
export const uploadFile = uploadPermanent;
export const getSettings = getSchoolSettings;
