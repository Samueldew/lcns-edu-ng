import { getSupabase, SUPABASE_BUCKET } from './supabase';

function getClient() {
  const c = getSupabase();
  if (!c) throw new Error('Supabase not configured');
  return c;
}

export const LOCAL_TABLES = {} as any;
export const DEFAULT_SETTINGS = {} as any;
export const DEFAULT_MANAGEMENT: any[] = [];
export const DEFAULT_GALLERY: any[] = [];
export type SupabaseGalleryItem = any;
export type SupabaseManagementMember = any;

export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export async function getSchoolSetting(key: string) {
  try { const { data } = await getClient().from('school_settings').select('value').eq('key', key).single(); return data?.value || null; } catch { return null; }
}
export async function getSchoolSettings() {
  try { const { data } = await getClient().from('school_settings').select('*'); const s: any = {}; data?.forEach((r: any) => s[r.key] = r.value); return s; } catch { return {}; }
}
export async function saveSchoolSetting(key: string, value: string) {
  const { error } = await getClient().from('school_settings').upsert({ key, value }, { onConflict: 'key' }); if (error) throw error; return true;
}
export const setSchoolSetting = saveSchoolSetting;
export const getSettings = getSchoolSettings;
export const getAllSettings = getSchoolSettings;
export const getLocalSettings = getSchoolSettings;
export const getLocalSetting = getSchoolSetting;
export const saveLocalSettings = saveSchoolSetting;
export const setLocalSettings = saveSchoolSetting;
export const getLocalTable = () => [];
export const saveLocalTable = async () => true;
export const getLocalData = () => ({});
export const saveLocalData = async () => true;

export async function uploadPermanent(file: File, folder: string = 'general') {
  const fileName = `${folder}/${Date.now()}-${file.name}`;
  const { error } = await getClient().storage.from(SUPABASE_BUCKET).upload(fileName, file);
  if (error) throw error;
  const { data } = getClient().storage.from(SUPABASE_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}
export async function deletePermanentFile(path: string) {
  try { const { error } = await getClient().storage.from(SUPABASE_BUCKET).remove([path]); if (error) throw error; return true; } catch { return false; }
}
export const uploadFile = uploadPermanent;
export const deleteFile = deletePermanentFile;
export const removeFile = deletePermanentFile;

export async function getManagementMembers() { try { const { data } = await getClient().from('management_members').select('*'); return data || []; } catch { return []; } }
export async function saveManagementMember(d: any) { const { error } = await getClient().from('management_members').upsert(d); if (error) throw error; }
export async function deleteManagementMember(id: string) { const { error } = await getClient().from('management_members').delete().eq('id', id); if (error) throw error; }
export const getManagement = getManagementMembers;
export const saveManagement = saveManagementMember;
export const deleteManagement = deleteManagementMember;

export async function getGalleryItems() { try { const { data } = await getClient().from('gallery_items').select('*'); return data || []; } catch { return []; } }
export async function saveGalleryItem(d: any) { const { error } = await getClient().from('gallery_items').upsert(d); if (error) throw error; }
export async function deleteGalleryItem(id: string) { const { error } = await getClient().from('gallery_items').delete().eq('id', id); if (error) throw error; }
export const getGallery = getGalleryItems;
export const saveGallery = saveGalleryItem;
export const deleteGallery = deleteGalleryItem;

export async function getDashboardStats() { return { management: 0, gallery: 0 }; }

export const supabase: any = new Proxy({} as any, {
  get(_: any, prop: string) {
    const client = getClient();
    const val = (client as any)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});
