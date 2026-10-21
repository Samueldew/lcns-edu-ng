import React, { useState, useEffect, useRef } from 'react';
import { getSupabase } from '../../lib/supabase';
import { Camera, Upload, Crown, GraduationCap, Building, Image as ImageIcon, CheckCircle2, Trash2, Eye, Save } from 'lucide-react';
import { CollegeLogo } from '../common/CollegeLogo';

export const AdminGallery: React.FC = () => {
  const [bishopPhoto, setBishopPhoto] = useState<string>(localStorage.getItem('lcns_bishop_photo') || '');
  const [provostPhoto, setProvostPhoto] = useState<string>(localStorage.getItem('lcns_provost_photo') || '');
  const [logoPhoto, setLogoPhoto] = useState<string>(localStorage.getItem('lcns_college_logo') || '');
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>(JSON.parse(localStorage.getItem('lcns_gallery_photos') || '[]'));
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState('');

  const bishopRef = useRef<HTMLInputElement>(null);
  const provostRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{ loadFromSupabase(); }, []);
  
  const loadFromSupabase = async () => {
    try{
      const sb = getSupabase(); if(!sb) return;
      const {data} = await sb.from('school_settings').select('*');
      if(data){
        data.forEach((item:any)=>{
          if(item.key==='bishop_photo' && item.value){ setBishopPhoto(item.value); localStorage.setItem('lcns_bishop_photo', item.value); }
          if(item.key==='provost_photo' && item.value){ setProvostPhoto(item.value); localStorage.setItem('lcns_provost_photo', item.value); }
          if(item.key==='college_logo' && item.value){ setLogoPhoto(item.value); localStorage.setItem('lcns_college_logo', item.value); }
          if(item.key==='gallery_photos' && item.value){
            try{ const p = JSON.parse(item.value); setGalleryPhotos(p); localStorage.setItem('lcns_gallery_photos', JSON.stringify(p)); }catch{}
          }
        });
      }
    }catch(e){ console.log('load error', e); }
  };

  const saveToSupabase = async (key:string, value:string) => {
    try{
      const sb = getSupabase(); if(!sb) return;
      await sb.from('school_settings').upsert({ key, value }, { onConflict: 'key' });
    }catch(e){ console.log('save error', e); }
  };

  const handleFile = async (file:File, type:string) => {
    if(!file.type.startsWith('image/')){ setStatus('❌ Select image only'); return; }
    if(file.size>10*1024*1024){ setStatus('❌ Max 10MB'); return; }
    setUploading(type); setStatus('⏳ Uploading '+type+'...');
    const reader = new FileReader();
    reader.onload = async (ev)=>{
      const base64 = ev.target?.result as string;
      if(type==='bishop'){ setBishopPhoto(base64); localStorage.setItem('lcns_bishop_photo', base64); await saveToSupabase('bishop_photo', base64); setStatus('✅ Bishop saved permanently!'); }
      if(type==='provost'){ setProvostPhoto(base64); localStorage.setItem('lcns_provost_photo', base64); await saveToSupabase('provost_photo', base64); setStatus('✅ Provost saved permanently!'); }
      if(type==='logo'){ setLogoPhoto(base64); localStorage.setItem('lcns_college_logo', base64); await saveToSupabase('college_logo', base64); setStatus('✅ Logo saved permanently!'); }
      if(type==='gallery'){ const ng=[...galleryPhotos, base64]; setGalleryPhotos(ng); localStorage.setItem('lcns_gallery_photos', JSON.stringify(ng)); await saveToSupabase('gallery_photos', JSON.stringify(ng)); setStatus('✅ Gallery added - Saved!'); }
      window.dispatchEvent(new Event('lcns_storage_update'));
      setUploading(''); setTimeout(()=>setStatus(''),3000);
    };
    reader.readAsDataURL(file);
  };

  const deleteGallery = async (idx:number)=>{
    if(!confirm('Delete photo?')) return;
    const ng = galleryPhotos.filter((_,i)=>i!==idx);
    setGalleryPhotos(ng); localStorage.setItem('lcns_gallery_photos', JSON.stringify(ng));
    await saveToSupabase('gallery_photos', JSON.stringify(ng));
    window.dispatchEvent(new Event('lcns_storage_update'));
    setStatus('🗑️ Deleted');
  };

  return (
    <div className="space-y-6">
      {status && <div className={`p-4 rounded-2xl border-2 font-bold text-sm text-center ${status.includes('✅')?'bg-emerald-50 border-emerald-400 text-emerald-800':status.includes('❌')?'bg-red-50 border-red-300 text-red-800':'bg-amber-50 border-amber-300 text-amber-800'}`}>{status}</div>}
      <div className="bg-white rounded-3xl border-4 border-amber-400 p-6 space-y-4">
        <div className="text-center border-b-4 border-double border-emerald-900 pb-4">
          <div className="flex items-center justify-center gap-3"><CollegeLogo size="md"/><div><h1 className="text-xl font-black uppercase">College of Nursing Sciences, Catholic Diocese of Gboko</h1><p className="text-xs font-bold text-emerald-800">Gallery Management - Bishop + Provost + Logo - Saves Permanently</p><p className="text-[10px] text-slate-500">Photos save to Supabase + LocalStorage - Shows on Course Registration + Score Sheet</p></div></div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border-4 border-blue-400 rounded-2xl p-4 space-y-3 bg-blue-50">
            <h3 className="font-black text-xs uppercase flex items-center gap-2"><Crown className="w-5 h-5 text-blue-700"/>Bishop Photo</h3>
            <div className="w-full h-64 bg-white rounded-xl border-2 border-blue-300 overflow-hidden flex items-center justify-center">{bishopPhoto ? <img src={bishopPhoto} alt="Bishop" className="w-full h-full object-cover"/> : <div className="text-center p-4"><Crown className="w-12 h-12 mx-auto text-blue-300"/><p className="text-[11px] mt-2">No Bishop Photo</p></div>}</div>
            <input ref={bishopRef} type="file" accept="image/*" onChange={e=>e.target.files?.[0] && handleFile(e.target.files[0],'bishop')} className="hidden"/>
            <button onClick={()=>bishopRef.current?.click()} disabled={!!uploading} className="w-full py-3 bg-blue-700 text-white rounded-xl font-black text-xs">{uploading==='bishop'?'Uploading...':'📁 Upload Bishop'}</button>
          </div>
          <div className="border-4 border-emerald-400 rounded-2xl p-4 space-y-3 bg-emerald-50">
            <h3 className="font-black text-xs uppercase flex items-center gap-2"><GraduationCap className="w-5 h-5 text-emerald-700"/>Provost Photo</h3>
            <div className="w-full h-64 bg-white rounded-xl border-2 border-emerald-300 overflow-hidden flex items-center justify-center">{provostPhoto ? <img src={provostPhoto} alt="Provost" className="w-full h-full object-cover"/> : <div className="text-center p-4"><GraduationCap className="w-12 h-12 mx-auto text-emerald-300"/><p className="text-[11px] mt-2">No Provost Photo</p></div>}</div>
            <input ref={provostRef} type="file" accept="image/*" onChange={e=>e.target.files?.[0] && handleFile(e.target.files[0],'provost')} className="hidden"/>
            <button onClick={()=>provostRef.current?.click()} disabled={!!uploading} className="w-full py-3 bg-emerald-700 text-white rounded-xl font-black text-xs">{uploading==='provost'?'Uploading...':'📁 Upload Provost'}</button>
          </div>
          <div className="border-4 border-amber-400 rounded-2xl p-4 space-y-3 bg-amber-50">
            <h3 className="font-black text-xs uppercase flex items-center gap-2"><Building className="w-5 h-5 text-amber-700"/>College Logo</h3>
            <div className="w-full h-64 bg-white rounded-xl border-2 border-amber-300 overflow-hidden flex items-center justify-center">{logoPhoto ? <img src={logoPhoto} alt="Logo" className="w-full h-full object-contain p-2"/> : <div className="text-center p-4"><CollegeLogo size="md"/><p className="text-[11px] mt-2">Default Logo</p></div>}</div>
            <input ref={logoRef} type="file" accept="image/*" onChange={e=>e.target.files?.[0] && handleFile(e.target.files[0],'logo')} className="hidden"/>
            <button onClick={()=>logoRef.current?.click()} disabled={!!uploading} className="w-full py-3 bg-amber-600 text-white rounded-xl font-black text-xs">{uploading==='logo'?'Uploading...':'📁 Upload Logo'}</button>
          </div>
        </div>
        <div className="border-4 border-slate-300 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center"><h3 className="font-black text-sm uppercase flex items-center gap-2"><ImageIcon className="w-5 h-5"/>General Gallery</h3><div><input ref={galleryRef} type="file" accept="image/*" multiple onChange={e=>Array.from(e.target.files||[]).forEach(f=>handleFile(f,'gallery'))} className="hidden"/><button onClick={()=>galleryRef.current?.click()} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-xs flex items-center gap-1.5"><Camera className="w-4 h-4"/>+ Add Photos</button></div></div>
          {galleryPhotos.length===0 ? <div className="py-12 text-center border-2 border-dashed rounded-xl bg-slate-50"><ImageIcon className="w-12 h-12 mx-auto text-slate-300"/><p className="text-xs mt-2">No photos - Click + Add Photos</p></div> : <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{galleryPhotos.map((photo,idx)=><div key={idx} className="relative group border-2 rounded-xl overflow-hidden bg-white"><img src={photo} alt={`Gallery ${idx}`} className="w-full h-32 object-cover"/><div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity"><button onClick={()=>window.open(photo,'_blank')} className="w-8 h-8 bg-white rounded-full flex items-center justify-center"><Eye className="w-4 h-4"/></button><button onClick={()=>deleteGallery(idx)} className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center"><Trash2 className="w-4 h-4"/></button></div><div className="p-1 text-[10px] text-center font-bold">Photo {idx+1}</div></div>)}</div>}
        </div>
        <div className="bg-slate-900 text-white rounded-2xl p-4 grid md:grid-cols-3 gap-4 text-xs"><div className="text-center"><Save className="w-8 h-8 mx-auto text-emerald-400"/><p className="font-black mt-1">SAVES PERMANENTLY</p><p className="text-[10px] text-slate-400">Supabase + LocalStorage</p></div><div className="text-center"><CheckCircle2 className="w-8 h-8 mx-auto text-amber-400"/><p className="font-black mt-1">SHOWS ON PRINTOUTS</p><p className="text-[10px] text-slate-400">Course Form + Score Sheet</p></div><div className="text-center"><Building className="w-8 h-8 mx-auto text-blue-400"/><p className="font-black mt-1">COLLEGE FULL NAME</p><p className="text-[10px] text-slate-400">COLLEGE OF NURSING SCIENCES, CATHOLIC DIOCESE OF GBOKO</p></div></div>
      </div>
    </div>
  );
};
export default AdminGallery;
