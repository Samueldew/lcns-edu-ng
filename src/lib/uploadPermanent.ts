import { supabase } from './supabase';
export const LOCAL_TABLES = {} as any;
export const DEFAULT_SETTINGS = {} as any;
export const DEFAULT_MANAGEMENT: any[] = [];
export const DEFAULT_GALLERY: any[] = [];
export type SupabaseGalleryItem = any;
export type SupabaseManagementMember = any;
export const getSupabase = () => supabase;
export function fileToDataUrl(file: File | Blob): Promise<string> { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result as string); reader.onerror = reject; reader.readAsDataURL(file); }); }
export async function getSchoolSetting(key: string): Promise<string | null> { try { const { data } = await supabase.from('school_settings').select('value').eq('key', key).single(); return data?.value || null; } catch { return null; } }
export async function getSchoolSettings(): Promise<Record<string, string>> { try { const { data } = await supabase.from('school_settings').select('*'); const s: Record<string,string> = {}; data?.forEach((r:any)=>s[r.key]=r.value); return s; } catch { return {}; } }
export async function saveSchoolSetting(key: string, value: string) { const { error } = await supabase.from('school_settings').upsert({ key, value }, { onConflict: 'key' }); if(error) throw error; return true; }
export const setSchoolSetting = saveSchoolSetting;
export const getSettings = getSchoolSettings;
export const getAllSettings = getSchoolSettings;
export const getLocalSettings = getSchoolSettings;
export const setLocalSettings = saveSchoolSetting;
export const saveLocalSettings = saveSchoolSetting;
export const getLocalSetting = getSchoolSetting;
export const getLocalTable = () => [];
export const saveLocalTable = async () => true;
export const getLocalData = () => ({});
export const saveLocalData = async () => true;
export async function uploadPermanent(file: File, folder: string = 'general'): Promise<string> { const fileName = `${folder}/${Date.now()}-${file.name}`; const { error } = await supabase.storage.from('school-files').upload(fileName, file); if(error) throw error; const { data } = supabase.storage.from('school-files').getPublicUrl(fileName); return data.publicUrl; }
export async function deletePermanentFile(path: string) { try { const { error } = await supabase.storage.from('school-files').remove([path]); if(error) throw error; return true; } catch { return false; } }
export const uploadFile = uploadPermanent;
export const deleteFile = deletePermanentFile;
export const removeFile = deletePermanentFile;
export async function getManagementMembers(): Promise<any[]> { try { const { data } = await supabase.from('management_members').select('*'); return data || []; } catch { return []; } }
export async function saveManagementMember(d: any) { const { error } = await supabase.from('management_members').upsert(d); if(error) throw error; }
export async function deleteManagementMember(id: string) { const { error } = await supabase.from('management_members').delete().eq('id', id); if(error) throw error; }
export const getManagement = getManagementMembers;
export const saveManagement = saveManagementMember;
export const deleteManagement = deleteManagementMember;
export async function getGalleryItems(): Promise<any[]> { try { const { data } = await supabase.from('gallery_items').select('*'); return data || []; } catch { return []; } }
export async function saveGalleryItem(d: any) { const { error } = await supabase.from('gallery_items').upsert(d); if(error) throw error; }
export async function deleteGalleryItem(id: string) { const { error } = await supabase.from('gallery_items').delete().eq('id', id); if(error) throw error; }
export const getGallery = getGalleryItems;
export const saveGallery = saveGalleryItem;
export const deleteGallery = deleteGalleryItem;
export async function getDashboardStats() { return { management: 0, gallery: 0 }; }
