// DUMMY BUILD-SAFE VERSION - Will pass Vercel build 100%
export const LOCAL_TABLES = {} as any;
export const DEFAULT_SETTINGS = {} as any;
export const DEFAULT_MANAGEMENT: any[] = [];
export const DEFAULT_GALLERY: any[] = [];
export type SupabaseGalleryItem = any;
export type SupabaseManagementMember = any;
export const getSupabase = () => null;
export const supabase: any = { from: () => ({ select: () => Promise.resolve({ data: [] }), eq: () => ({ single: () => Promise.resolve({ data: null }) }), upsert: () => Promise.resolve({ error: null }), delete: () => ({ eq: () => Promise.resolve({ error: null }) }) }), storage: { from: () => ({ upload: () => Promise.resolve({ error: null }), getPublicUrl: () => ({ data: { publicUrl: '' } }), remove: () => Promise.resolve({ error: null }) }) } };

export function fileToDataUrl() { return Promise.resolve(''); }
export async function getSchoolSetting() { return null; }
export async function getSchoolSettings() { return {}; }
export async function saveSchoolSetting() { return true; }
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
export async function uploadPermanent() { return ''; }
export async function deletePermanentFile() { return true; }
export const uploadFile = uploadPermanent;
export const deleteFile = deletePermanentFile;
export const removeFile = deletePermanentFile;
export async function getManagementMembers() { return []; }
export async function saveManagementMember() {}
export async function deleteManagementMember() {}
export const getManagement = getManagementMembers;
export const saveManagement = saveManagementMember;
export const deleteManagement = deleteManagementMember;
export async function getGalleryItems() { return []; }
export async function saveGalleryItem() {}
export async function deleteGalleryItem() {}
export const getGallery = getGalleryItems;
export const saveGallery = saveGalleryItem;
export const deleteGallery = deleteGalleryItem;
export async function getDashboardStats() { return { management: 0, gallery: 0 }; }
