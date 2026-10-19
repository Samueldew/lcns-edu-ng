import { supabase } from './supabaseClient';

export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function getSchoolSetting(key: string): Promise<string | null> {
  const { data } = await supabase.from('school_settings').select('value').eq('key', key).single();
  return data?.value || null;
}

export async function getSchoolSettings(): Promise<Record<string, string>> {
  const { data } = await supabase.from('school_settings').select('*');
  const settings: Record<string, string> = {};
  data?.forEach((row: any) => settings[row.key] = row.value);
  return settings;
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
