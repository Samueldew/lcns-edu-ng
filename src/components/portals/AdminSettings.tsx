import React, { useState, useEffect } from 'react';
import {
  getSchoolSetting,
  setSchoolSetting,
  saveSchoolSetting,
  getLocalSettings,
  uploadPermanent,
  deletePermanentFile,
} from '../../lib/uploadPermanent';
import { getSupabaseConfig, getSupabase, SUPABASE_SETUP_SQL, getHostelImageUrl } from '../../lib/supabase';
import { CollegeLogo } from '../common/CollegeLogo';
import {
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Database,
  Image as ImageIcon,
  Key,
  Globe,
  Sliders,
  Home,
} from 'lucide-react';

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

  useEffect(() => {
    loadSettings();
    loadSupabaseInfo();
  }, []);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4500);
  };

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
    } catch (err) {
      console.warn('Failed to load settings:', err);
    }
  };

  // FIXED: Never allow empty, auto-save fallback
  const loadSupabaseInfo = () => {
    const cfg = getSupabaseConfig();
    const fallbackUrl = 'https://liqwfikatnkndbdbdarx.supabase.co';
    const fallbackKey = 'sb_publishable_hiApqAXF6f7-ZYVcBGJXXA_SdqwDYEW';
    const url = cfg.url || fallbackUrl;
    const key = cfg.anonKey || fallbackKey;
    setSupabaseUrl(url);
    setSupabaseAnonKey(key);
    try {
      if (typeof window !== 'undefined' && !localStorage.getItem('lcns_supabase_config')) {
        localStorage.setItem('lcns_supabase_config', JSON.stringify({ url, anonKey: key }));
      }
    } catch {}
    checkSupabaseConnection(url, key);
  };

  const checkSupabaseConnection = async (url: string, key: string) => {
    if (!url || !key) {
      setSbStatus('not_connected');
      return;
    }
    setSbStatus('checking');
    try {
      const sb = getSupabase();
      if (!sb) {
        setSbStatus('not_connected');
        return;
      }
      const { error } = await sb.from('school_settings').select('key').limit(1);
      setSbStatus('connected');
    } catch {
      setSbStatus('not_connected');
    }
  };

  const handleUploadMainLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingMain(true);
      const publicUrl = await saveSchoolSetting('school_logo', file);
      setLogoMain(publicUrl);
      showStatus('Logo saved permanently to Supabase! Header and website updated everywhere.');
    } catch (err: any) {
      showStatus(err?.message || 'Failed to upload logo', 'error');
    } finally {
      setUploadingMain(false);
    }
  };

  const handleUploadWhiteLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingWhite(true);
      const publicUrl = await saveSchoolSetting('school_logo_white', file);
      setLogoWhite(publicUrl);
      showStatus('White/Contrast logo saved permanently to Supabase!');
    } catch (err: any) {
      showStatus(err?.message || 'Failed to upload logo', 'error');
    } finally {
      setUploadingWhite(false);
    }
  };

  const handleUploadFavicon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingFavicon(true);
      const publicUrl = await saveSchoolSetting('favicon', file);
      setFaviconUrl(publicUrl);
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (link) link.href = publicUrl;
      showStatus('Favicon updated and saved permanently to Supabase!');
    } catch (err: any) {
      showStatus(err?.message || 'Failed to upload favicon', 'error');
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleUploadHostel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingHostel(true);
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase is not configured.');
      const path = 'real-school/girls-hostel-accommodation.jpg';
      const { error: uploadError } = await supabase.storage.from('lcns-files').upload(path, file, { upsert: true, cacheControl: '3600' });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('lcns-files').getPublicUrl(path);
      const publicUrl = urlData.publicUrl;
      await setSchoolSetting('hostel_image_url', publicUrl);
      setHostelPhoto(publicUrl);
      await supabase.from('gallery').upsert([{ image_url: publicUrl, title: 'Girls Hostel Accommodation', description: 'Safe and comfortable hostel for female students', category: 'hostel', created_at: new Date().toISOString() }], { onConflict: 'title' });
      window.dispatchEvent(new CustomEvent('lcns_gallery_update'));
      showStatus("Girls' Hostel photo uploaded to Supabase lcns-files & saved to gallery table!");
    } catch (err: any) {
      showStatus(err?.message || 'Failed to upload hostel photo', 'error');
    } finally {
      setUploadingHostel(false);
    }
  };

  const handleSaveTextSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setSchoolSetting('school_name', schoolName);
      await setSchoolSetting('school_motto', schoolMotto);
      await setSchoolSetting('school_address', schoolAddress);
      await setSchoolSetting('school_email', schoolEmail);
      await setSchoolSetting('school_phone', schoolPhone);
      showStatus('School branding information saved permanently!');
    } catch (err: any) {
      showStatus(err?.message || 'Failed to save settings', 'error');
    }
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('lcns_supabase_config', JSON.stringify({ url: supabaseUrl.trim(), anonKey: supabaseAnonKey.trim() }));
    checkSupabaseConnection(supabaseUrl.trim(), supabaseAnonKey.trim());
    showStatus('Supabase project credentials saved! Refreshing will keep it now.');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {statusMessage && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-md ${statusMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-[#0a4d2e]' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
          <span className="text-xs sm:text-sm font-bold">{statusMessage.text}</span>
        </div>
      )}

      <div className="bg-gradient-to-r from-[#0a4d2e] via-[#073922] to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#22c55e]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ca8a04] text-xs font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-[#ca8a04]" />
            <span>Permanent Storage System • Git Pull Safe</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase">School Logo & Branding Settings</h1>
          <p className="text-xs text-emerald-200 mt-1">All uploaded logos and media are saved in database storage and never get deleted during git pulls.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 flex items-center gap-3">
          <Database className="w-5 h-5 text-[#22c55e]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">Supabase Storage</span>
              <span className={`w-2 h-2 rounded-full ${sbStatus === 'connected' ? 'bg-[#22c55e] animate-pulse' : 'bg-amber-400'}`} />
            </div>
            <div className="text-xs font-bold text-white">{sbStatus === 'connected' ? 'Connected & Active' : sbStatus === 'checking' ? 'Checking...' : 'Local + Cloud Bridge Active'}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0a4d2e] uppercase tracking-wider mb-1">
              <ImageIcon className="w-4 h-4 text-[#22c55e]" />
              <span>Section: School Logo & Branding - Permanent</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase">Official Institutional Logos</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">School Logo (Main)</span>
              <div className="w-32 h-32 mx-auto bg-white rounded-2xl border-2 border-dashed border-emerald-300 flex items-center justify-center p-3 shadow-inner mt-4">
                {logoMain ? <img src={logoMain} alt="School Logo Main" className="w-full h-full object-contain" /> : <CollegeLogo size="lg" />}
              </div>
            </div>
            <label className="block w-full text-center px-4 py-2.5 bg-[#0a4d2e] hover:bg-[#073922] text-white text-xs font-bold rounded-xl cursor-pointer">
              <input type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" onChange={handleUploadMainLogo} disabled={uploadingMain} className="hidden" />
              <span className="inline-flex items-center gap-2"><Upload className="w-3.5 h-3.5" /><span>{uploadingMain ? 'Uploading...' : 'Upload School Logo (Main)'}</span></span>
            </label>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-white">School Logo White</span>
              <div className="w-32 h-32 mx-auto bg-slate-800/80 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center p-3 shadow-inner mt-4">
                {logoWhite ? <img src={logoWhite} alt="School Logo White" className="w-full h-full object-contain" /> : <CollegeLogo size="lg" />}
              </div>
            </div>
            <label className="block w-full text-center px-4 py-2.5 bg-[#ca8a04] hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl cursor-pointer">
              <input type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" onChange={handleUploadWhiteLogo} disabled={uploadingWhite} className="hidden" />
              <span className="inline-flex items-center gap-2"><Upload className="w-3.5 h-3.5" /><span>{uploadingWhite ? 'Uploading...' : 'Upload Logo White'}</span></span>
            </label>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">Favicon</span>
              <div className="w-20 h-20 mx-auto bg-white rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center p-2 shadow-inner mt-4">
                {faviconUrl ? <img src={faviconUrl} alt="Favicon" className="w-10 h-10 object-contain" /> : <Globe className="w-8 h-8 text-slate-400" />}
              </div>
            </div>
            <label className="block w-full text-center px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer">
              <input type="file" accept="image/x-icon,image/png,image/svg+xml" onChange={handleUploadFavicon} disabled={uploadingFavicon} className="hidden" />
              <span className="inline-flex items-center gap-2"><Upload className="w-3.5 h-3.5" /><span>{uploadingFavicon ? 'Uploading...' : 'Upload Favicon'}</span></span>
            </label>
          </div>

          <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-200 space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">Girls' Hostel Photo</span>
              <div className="w-full h-32 mx-auto bg-white rounded-2xl border-2 border-dashed border-emerald-300 flex items-center justify-center p-1 shadow-inner overflow-hidden mt-4">
                {hostelPhoto ? <img src={hostelPhoto} alt="Girls Hostel" className="w-full h-full object-cover rounded-xl" /> : <div className="text-center p-2 text-slate-400"><Home className="w-8 h-8 mx-auto text-emerald-600 mb-1" /><span className="text-[10px] font-bold">No Hostel Photo</span></div>}
              </div>
            </div>
            <label className="block w-full text-center px-4 py-2.5 bg-[#0a4d2e] hover:bg-[#073922] text-white text-xs font-bold rounded-xl cursor-pointer">
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUploadHostel} disabled={uploadingHostel} className="hidden" />
              <span className="inline-flex items-center gap-2"><Upload className="w-3.5 h-3.5" /><span>{uploadingHostel ? 'Uploading...' : 'Upload Hostel Photo'}</span></span>
            </label>
          </div>
        </div>

        <form onSubmit={handleSaveTextSettings} className="pt-6 border-t border-slate-200 space-y-5">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2"><Sliders className="w-4 h-4 text-[#0a4d2e]" /><span>School Name, Motto & Official Contact</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official School Name</label><input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300" required /></div>
            <div><label className="block text-xs font-bold text-slate-700 uppercase mb-1">School Motto</label><input type="text" value={schoolMotto} onChange={(e) => setSchoolMotto(e.target.value)} className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300" required /></div>
            <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Physical Campus Address</label><input type="text" value={schoolAddress} onChange={(e) => setSchoolAddress(e.target.value)} className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300" /></div>
            <div><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official Email</label><input type="email" value={schoolEmail} onChange={(e) => setSchoolEmail(e.target.value)} className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300" /></div>
            <div><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official ICT Support Phone</label><input type="text" value={schoolPhone} onChange={(e) => setSchoolPhone(e.target.value)} className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300" /></div>
          </div>
          <div className="flex justify-end pt-2"><button type="submit" className="px-6 py-2.5 bg-[#0a4d2e] hover:bg-[#073922] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#22c55e]" /><span>Save School Branding to Database</span></button></div>
        </form>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#ca8a04] uppercase tracking-wider mb-1"><Database className="w-4 h-4 text-[#22c55e]" /><span>Supabase Cloud Integration Configuration</span></div>
            <h2 className="text-xl font-black text-white uppercase">Supabase Project Connection & SQL Schema</h2>
            <p className="text-xs text-slate-400">Configure your Supabase Project URL and Public Anon Key for permanent external cloud file hosting.</p>
          </div>
          <button onClick={() => setShowSqlModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-600"><Copy className="w-3.5 h-3.5 text-[#ca8a04]" /><span>View & Copy Setup SQL</span></button>
        </div>
        <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-slate-300 uppercase mb-1">Supabase Project URL</label><input type="text" placeholder="https://your-project.supabase.co" value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)} className="w-full px-4 py-2.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white" /></div>
            <div><label className="block text-xs font-bold text-slate-300 uppercase mb-1">Supabase Anon Public Key (supports sb_publishable_...)</label><input type="text" placeholder="sb_publishable_..." value={supabaseAnonKey} onChange={(e) => setSupabaseAnonKey(e.target.value)} className="w-full px-4 py-2.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white" /></div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-400 flex items-center gap-2"><Key className="w-3.5 h-3.5 text-[#ca8a04]" /><span>Keys are stored safely in runtime environment and browser persistent memory.</span></div>
            <button type="submit" className="px-5 py-2.5 bg-[#22c55e] hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl inline-flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5" /><span>Save & Test Connection</span></button>
          </div>
        </form>
      </div>

      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div><h3 className="text-base font-black uppercase text-[#ca8a04]">Supabase Setup SQL Script</h3><p className="text-xs text-slate-400">Run this in your Supabase Dashboard &gt; SQL Editor</p></div>
              <button onClick={() => setShowSqlModal(false)} className="text-slate-400 hover:text-white text-lg font-bold p-1">&times;</button>
            </div>
            <div className="relative">
              <pre className="bg-slate-950 p-4 rounded-xl text-[11px] font-mono text-emerald-300 max-h-96 overflow-y-auto border border-slate-800">{SUPABASE_SETUP_SQL}</pre>
              <button onClick={handleCopySql} className="absolute top-3 right-3 px-3 py-1.5 bg-[#0a4d2e] hover:bg-[#073922] text-white text-xs font-bold rounded-lg border border-[#22c55e]/40 inline-flex items-center gap-1.5">{copiedSql ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}<span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span></button>
            </div>
            <div className="flex justify-end pt-2"><button onClick={() => setShowSqlModal(false)} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
};
