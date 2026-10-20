import React, { useState, useEffect } from 'react';
import { getSchoolSetting, setSchoolSetting, saveSchoolSetting, getLocalSettings } from '../../lib/uploadPermanent';
import { getSupabaseConfig, getSupabase, SUPABASE_SETUP_SQL, getHostelImageUrl } from '../../lib/supabase';
import { CollegeLogo } from '../common/CollegeLogo';
import { StorageService } from '../../services/storage';
import { ShieldCheck, Upload, CheckCircle2, AlertCircle, Copy, Check, RefreshCw, Database, Image as ImageIcon, Key, Globe, Home, Trash2, Crown, User } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [logoMain, setLogoMain] = useState<string>('');
  const [logoWhite, setLogoWhite] = useState<string>('');
  const [faviconUrl, setFaviconUrl] = useState<string>('');
  const [hostelPhoto, setHostelPhoto] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('');
  const [schoolMotto, setSchoolMotto] = useState<string>('');
  const [schoolAddress, setSchoolAddress] = useState<string>('');
  const [schoolEmail, setSchoolEmail] = useState<string>('');
  const [schoolPhone, setSchoolPhone] = useState<string>('');
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingWhite, setUploadingWhite] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingHostel, setUploadingHostel] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [sbStatus, setSbStatus] = useState<'connected' | 'not_connected' | 'checking'>('checking');
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [cmsConfig, setCmsConfig] = useState<any>(() => StorageService.getCMSConfig());
  const [uploadingBishop, setUploadingBishop] = useState(false);
  const [uploadingProvost, setUploadingProvost] = useState(false);

  useEffect(() => { loadSettings(); loadSupabaseInfo(); setCmsConfig(StorageService.getCMSConfig()); }, []);
  const showStatus = (text: string, type: 'success' | 'error' = 'success') => { setStatusMessage({ text, type }); setTimeout(() => setStatusMessage(null), 6000); };
  const loadSettings = async () => {
    try {
      const local = getLocalSettings();
      setLogoMain(await getSchoolSetting('school_logo', local.school_logo));
      setLogoWhite(await getSchoolSetting('school_logo_white', local.school_logo_white));
      setFaviconUrl(await getSchoolSetting('favicon', local.favicon));
      setSchoolName(await getSchoolSetting('school_name', local.school_name));
      setSchoolMotto(await getSchoolSetting('school_motto', local.school_motto));
      setSchoolAddress(await getSchoolSetting('school_address', local.school_address));
      setSchoolEmail(await getSchoolSetting('school_email', local.school_email));
      setSchoolPhone(await getSchoolSetting('school_phone', local.school_phone));
      setHostelPhoto(await getSchoolSetting('hostel_image_url', getHostelImageUrl()));
    } catch {}
  };
  const loadSupabaseInfo = () => {
    const cfg = getSupabaseConfig();
    const fallbackUrl = 'https://liqwfikatnkndbdbdarx.supabase.co';
    const fallbackKey = 'sb_publishable_hiApqAXF6f7-ZYVcBGJXXA_SdqwDYEW';
    setSupabaseUrl(cfg.url || fallbackUrl);
    setSupabaseAnonKey(cfg.anonKey || fallbackKey);
    checkSupabaseConnection(cfg.url || fallbackUrl, cfg.anonKey || fallbackKey);
  };
  const checkSupabaseConnection = async (url: string, key: string) => {
    if (!url || !key) { setSbStatus('not_connected'); return; }
    setSbStatus('checking');
    try { const sb = getSupabase(); if (!sb) { setSbStatus('not_connected'); return; } await sb.from('school_settings').select('key').limit(1); setSbStatus('connected'); } catch { setSbStatus('not_connected'); }
  };
  const handleUploadMainLogo = async (e: any) => { const file = e.target.files?.[0]; if (!file) return; try { setUploadingMain(true); const url = await saveSchoolSetting('school_logo', file); setLogoMain(url); showStatus('Logo saved permanently!'); } catch (err: any) { showStatus(err.message, 'error'); } finally { setUploadingMain(false); } };
  const handleUploadWhiteLogo = async (e: any) => { const file = e.target.files?.[0]; if (!file) return; try { setUploadingWhite(true); const url = await saveSchoolSetting('school_logo_white', file); setLogoWhite(url); showStatus('White logo saved!'); } catch (err: any) { showStatus(err.message, 'error'); } finally { setUploadingWhite(false); } };
  const handleUploadFavicon = async (e: any) => { const file = e.target.files?.[0]; if (!file) return; try { setUploadingFavicon(true); const url = await saveSchoolSetting('favicon', file); setFaviconUrl(url); showStatus('Favicon saved!'); } catch (err: any) { showStatus(err.message, 'error'); } finally { setUploadingFavicon(false); } };
  const handleUploadHostel = async (e: any) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { setUploadingHostel(true); const sb = getSupabase(); if (!sb) throw new Error('No supabase'); const path = 'real-school/girls-hostel-accommodation.jpg'; const { error } = await sb.storage.from('lcns-files').upload(path, file, { upsert: true }); if (error) throw error; const { data } = sb.storage.from('lcns-files').getPublicUrl(path); await setSchoolSetting('hostel_image_url', data.publicUrl); setHostelPhoto(data.publicUrl); showStatus('Hostel saved!'); } catch (err: any) { showStatus(err.message, 'error'); } finally { setUploadingHostel(false); }
  };
  const handleSaveTextSettings = async (e: any) => { e.preventDefault(); try { await setSchoolSetting('school_name', schoolName); await setSchoolSetting('school_motto', schoolMotto); await setSchoolSetting('school_address', schoolAddress); await setSchoolSetting('school_email', schoolEmail); await setSchoolSetting('school_phone', schoolPhone); showStatus('Branding saved permanently!'); } catch (err: any) { showStatus(err.message, 'error'); } };
  const handleSaveSupabaseConfig = (e: any) => { e.preventDefault(); localStorage.setItem('lcns_supabase_config', JSON.stringify({ url: supabaseUrl.trim(), anonKey: supabaseAnonKey.trim() })); checkSupabaseConnection(supabaseUrl.trim(), supabaseAnonKey.trim()); showStatus('Supabase config saved!'); };
  const handleCopySql = () => { navigator.clipboard.writeText(SUPABASE_SETUP_SQL); setCopiedSql(true); setTimeout(() => setCopiedSql(false), 2500); };

  const handleUploadBishopPhoto = async (e: any) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { setUploadingBishop(true); const url = await saveSchoolSetting('bishop_photo_url', file); const newCms = { ...cmsConfig, bishopPhotoUrl: url }; setCmsConfig(newCms); StorageService.saveCMSConfig(newCms); showStatus('Bishop photo uploaded permanently!'); } catch { const reader = new FileReader(); reader.onload = (ev) => { const b64 = ev.target?.result as string; const newCms = { ...cmsConfig, bishopPhotoUrl: b64 }; setCmsConfig(newCms); StorageService.saveCMSConfig(newCms); }; reader.readAsDataURL(file); showStatus('Bishop saved locally!'); } finally { setUploadingBishop(false); }
  };
  const handleUploadProvostPhoto = async (e: any) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { setUploadingProvost(true); const url = await saveSchoolSetting('provost_photo_url', file); const newCms = { ...cmsConfig, provostPhotoUrl: url }; setCmsConfig(newCms); StorageService.saveCMSConfig(newCms); showStatus('Provost photo uploaded!'); } catch { const reader = new FileReader(); reader.onload = (ev) => { const b64 = ev.target?.result as string; const newCms = { ...cmsConfig, provostPhotoUrl: b64 }; setCmsConfig(newCms); StorageService.saveCMSConfig(newCms); }; reader.readAsDataURL(file); showStatus('Provost saved locally!'); } finally { setUploadingProvost(false); }
  };
  const handleSaveBishopProvost = () => { StorageService.saveCMSConfig(cmsConfig); localStorage.setItem('lcns_bishop_data', JSON.stringify({ name: cmsConfig.bishopName, title: cmsConfig.bishopTitle, message: cmsConfig.bishopMessage, photo: cmsConfig.bishopPhotoUrl })); window.dispatchEvent(new Event('lcns_storage_update')); showStatus('SAVED! Bishop ' + (cmsConfig.bishopName || 'REMOVED') + ' saved! Old AI will NOT return!'); };
  const removeBishopPermanent = async () => {
    if (!confirm('PERMANENTLY DELETE Bishop William Avenya? Deletes from Supabase so NEVER returns!')) return;
    try { const sb = getSupabase(); if (sb) { try { await sb.from('school_settings').delete().ilike('key', '%bishop%'); await sb.from('management').delete().ilike('name', '%Avenya%'); await sb.from('management').delete().ilike('name', '%William%'); } catch {} } localStorage.removeItem('lcns_bishop_data'); const newCms = { ...cmsConfig, bishopName: '', bishopTitle: '', bishopMessage: '', bishopPhotoUrl: '' }; setCmsConfig(newCms); StorageService.saveCMSConfig(newCms); showStatus('Bishop PERMANENTLY DELETED! Will NOT return! Create yours now!'); setTimeout(() => window.location.reload(), 1500); } catch (err: any) { showStatus(err.message, 'error'); }
  };
  const removeProvostPermanent = async () => {
    if (!confirm('Permanently delete Provost?')) return;
    try { const sb = getSupabase(); if (sb) { try { await sb.from('school_settings').delete().ilike('key', '%provost%'); } catch {} } localStorage.removeItem('lcns_provost_data'); const newCms = { ...cmsConfig, provostName: '', provostTitle: '', provostMessage: '', provostPhotoUrl: '' }; setCmsConfig(newCms); StorageService.saveCMSConfig(newCms); showStatus('Provost PERMANENTLY deleted!'); } catch (err: any) { showStatus(err.message, 'error'); }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {statusMessage && (<div className={'p-4 rounded-2xl flex items-center gap-3 border ' + (statusMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-[#0a4d2e]' : 'bg-red-50 border-red-200 text-red-700')}><CheckCircle2 className="w-5 h-5" /><span className="text-xs font-bold">{statusMessage.text}</span></div>)}
      <div className="bg-gradient-to-r from-[#0a4d2e] to-slate-900 text-white rounded-3xl p-6 shadow-xl"><h1 className="text-2xl font-black uppercase">School Settings - FIXED BUILD</h1><p className="text-xs text-emerald-200">Build error fixed + Permanent delete - Other info SAFE</p></div>
      <div className="bg-white rounded-3xl border p-6 space-y-6">
        <h2 className="text-xl font-black uppercase">Logos - Your other info SAFE</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-50 rounded-2xl p-5 border space-y-4"><span className="text-xs font-black">Main Logo</span><div className="w-32 h-32 mx-auto bg-white rounded-2xl border-2 border-dashed flex items-center justify-center">{logoMain ? <img src={logoMain} alt="logo" className="w-full h-full object-contain"/> : <CollegeLogo size="lg"/>}</div><label className="block w-full text-center px-4 py-2.5 bg-[#0a4d2e] text-white text-xs font-bold rounded-xl cursor-pointer"><input type="file" accept="image/*" onChange={handleUploadMainLogo} className="hidden"/><span>{uploadingMain ? 'Uploading...' : 'Upload Main'}</span></label></div>
          <div className="bg-slate-900 text-white rounded-2xl p-5 border space-y-4"><span className="text-xs font-black">White Logo</span><div className="w-32 h-32 mx-auto bg-slate-800 rounded-2xl border-2 border-dashed flex items-center justify-center">{logoWhite ? <img src={logoWhite} alt="logo" className="w-full h-full object-contain"/> : <CollegeLogo size="lg"/>}</div><label className="block w-full text-center px-4 py-2.5 bg-[#ca8a04] text-slate-950 text-xs font-black rounded-xl cursor-pointer"><input type="file" accept="image/*" onChange={handleUploadWhiteLogo} className="hidden"/><span>{uploadingWhite ? 'Uploading...' : 'Upload White'}</span></label></div>
          <div className="bg-slate-50 rounded-2xl p-5 border space-y-4"><span className="text-xs font-black">Favicon</span><div className="w-20 h-20 mx-auto bg-white rounded-2xl border-2 border-dashed flex items-center justify-center">{faviconUrl ? <img src={faviconUrl} alt="fav" className="w-10 h-10"/> : <Globe className="w-8 h-8 text-slate-400"/>}</div><label className="block w-full text-center px-4 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"><input type="file" accept="image/*" onChange={handleUploadFavicon} className="hidden"/><span>{uploadingFavicon ? 'Uploading...' : 'Upload Favicon'}</span></label></div>
          <div className="bg-emerald-50 rounded-2xl p-5 border space-y-4"><span className="text-xs font-black">Hostel Photo</span><div className="w-full h-32 bg-white rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden">{hostelPhoto ? <img src={hostelPhoto} alt="hostel" className="w-full h-full object-cover"/> : <span className="text-[10px]">No Hostel</span>}</div><label className="block w-full text-center px-4 py-2.5 bg-[#0a4d2e] text-white text-xs font-bold rounded-xl cursor-pointer"><input type="file" accept="image/*" onChange={handleUploadHostel} className="hidden"/><span>{uploadingHostel ? 'Uploading...' : 'Upload Hostel'}</span></label></div>
        </div>
        <form onSubmit={handleSaveTextSettings} className="pt-6 border-t space-y-4"><h3 className="text-sm font-black uppercase">School Info - Kept Safe</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-xs font-bold">School Name</label><input value={schoolName} onChange={e=>setSchoolName(e.target.value)} className="w-full px-4 py-2.5 text-xs rounded-xl border"/></div><div><label className="text-xs font-bold">Motto</label><input value={schoolMotto} onChange={e=>setSchoolMotto(e.target.value)} className="w-full px-4 py-2.5 text-xs rounded-xl border"/></div><div className="md:col-span-2"><label className="text-xs font-bold">Address</label><input value={schoolAddress} onChange={e=>setSchoolAddress(e.target.value)} className="w-full px-4 py-2.5 text-xs rounded-xl border"/></div><div><label className="text-xs font-bold">Email</label><input value={schoolEmail} onChange={e=>setSchoolEmail(e.target.value)} className="w-full px-4 py-2.5 text-xs rounded-xl border"/></div><div><label className="text-xs font-bold">Phone</label><input value={schoolPhone} onChange={e=>setSchoolPhone(e.target.value)} className="w-full px-4 py-2.5 text-xs rounded-xl border"/></div></div><button type="submit" className="px-6 py-2.5 bg-[#0a4d2e] text-white text-xs font-bold rounded-xl">Save Branding</button></form>
      </div>
      <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 space-y-6">
        <div className="bg-gradient-to-r from-amber-500 to-emerald-700 text-white p-4 rounded-2xl"><h2 className="text-lg font-black flex gap-2"><Crown className="w-5 h-5"/> ABOUT US - BISHOP & PROVOST - REMOVE OLD & CREATE YOURS</h2><p className="text-[11px] mt-1">Other info SAFE - This only controls About Us Episcopal Patron</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center"><h3 className="font-black text-xs flex gap-2"><Crown className="w-4 h-4"/> BISHOP</h3><button onClick={removeBishopPermanent} className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black flex gap-1"><Trash2 className="w-3 h-3"/> REMOVE WILLIAM AVENYA PERMANENTLY</button></div>
            <div className="w-full h-56 bg-white rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden">{cmsConfig.bishopPhotoUrl ? <img src={cmsConfig.bishopPhotoUrl} alt="Bishop" className="w-full h-full object-cover"/> : <span className="text-[10px]">No Photo - Old AI will NOT return after permanent delete</span>}</div>
            <label className="block w-full text-center px-4 py-2.5 bg-black text-amber-400 text-xs font-black rounded-xl cursor-pointer"><input type="file" accept="image/*" onChange={handleUploadBishopPhoto} className="hidden"/><span>{uploadingBishop ? 'Uploading...' : 'UPLOAD NEW BISHOP PHOTO'}</span></label>
            <input value={cmsConfig.bishopName || ''} onChange={e=>setCmsConfig({...cmsConfig, bishopName:e.target.value})} placeholder="Leave empty to REMOVE old Bishop" className="w-full border-2 p-2.5 rounded-xl text-xs font-bold"/>
            <input value={cmsConfig.bishopTitle || ''} onChange={e=>setCmsConfig({...cmsConfig, bishopTitle:e.target.value})} placeholder="Catholic Bishop of Gboko & Proprietor" className="w-full border-2 p-2.5 rounded-xl text-xs"/>
            <textarea value={cmsConfig.bishopMessage || ''} onChange={e=>setCmsConfig({...cmsConfig, bishopMessage:e.target.value})} placeholder="Bishop message..." className="w-full border-2 p-2.5 rounded-xl text-xs h-20"/>
          </div>
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center"><h3 className="font-black text-xs flex gap-2"><User className="w-4 h-4"/> PROVOST</h3><button onClick={removeProvostPermanent} className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black flex gap-1"><Trash2 className="w-3 h-3"/> REMOVE PROVOST PERMANENTLY</button></div>
            <div className="w-full h-56 bg-white rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden">{cmsConfig.provostPhotoUrl ? <img src={cmsConfig.provostPhotoUrl} alt="Provost" className="w-full h-full object-cover"/> : <span className="text-[10px]">No Photo</span>}</div>
            <label className="block w-full text-center px-4 py-2.5 bg-[#0a4d2e] text-white text-xs font-bold rounded-xl cursor-pointer"><input type="file" accept="image/*" onChange={handleUploadProvostPhoto} className="hidden"/><span>{uploadingProvost ? 'Uploading...' : 'UPLOAD PROVOST PHOTO'}</span></label>
            <input value={cmsConfig.provostName || ''} onChange={e=>setCmsConfig({...cmsConfig, provostName:e.target.value})} placeholder="Mrs Terna Fiase" className="w-full border-2 p-2.5 rounded-xl text-xs font-bold"/>
            <input value={cmsConfig.provostTitle || ''} onChange={e=>setCmsConfig({...cmsConfig, provostTitle:e.target.value})} placeholder="Provost" className="w-full border-2 p-2.5 rounded-xl text-xs"/>
            <textarea value={cmsConfig.provostMessage || ''} onChange={e=>setCmsConfig({...cmsConfig, provostMessage:e.target.value})} placeholder="Provost message..." className="w-full border-2 p-2.5 rounded-xl text-xs h-20"/>
          </div>
        </div>
        <button onClick={handleSaveBishopProvost} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm flex justify-center gap-2"><CheckCircle2 className="w-5 h-5 text-amber-400"/> SAVE BISHOP & PROVOST - DISPLAY ON WEBSITE - OTHER INFO SAFE</button>
      </div>
    </div>
  );
};

// FIX BUILD ERROR - NEED BOTH EXPORTS
export default AdminSettings;
