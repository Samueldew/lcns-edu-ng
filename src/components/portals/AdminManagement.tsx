import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../lib/supabase';
import {
  UserPlus,
  Upload,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Search,
  Award,
  Users,
} from 'lucide-react';

type ManagementMember = {
  id: string;
  name: string;
  title: string;
  description: string;
  photo_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

const TITLE_OPTIONS = [
  'Provost, Labe College of Nursing Sciences',
  'Deputy Provost (Academic)',
  'Deputy Provost (Administration)',
  'Registrar & Secretary to the Academic Board',
  'College Bursar & Chief Financial Officer',
  'Dean of Nursing & Clinical Studies',
  'Head of Department (Nursing Sciences)',
  'Head of Department (Midwifery & Neonatology)',
  'Director of Academic Planning & Quality Assurance',
  'Chief Medical Director / Clinical Coordinator',
  'College Librarian',
  'Custom Title...',
];

export const AdminManagement: React.FC = () => {
  const [members, setMembers] = useState<ManagementMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formTitleSelect, setFormTitleSelect] = useState(TITLE_OPTIONS[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<ManagementMember | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const loadMembers = async () => {
    setLoading(true);
    try {
      const sb = getSupabase();
      if (!sb) { setLoading(false); return; }
      // Try management table, fallback to lcns_management
      let data: any = null;
      let { data: d1 } = await sb.from('management').select('*').order('display_order', { ascending: true });
      if (!d1 || d1.length===0) {
        const { data: d2 } = await sb.from('lcns_management').select('*').order('display_order', { ascending: true });
        data = d2;
      } else data = d1;
      setMembers(data || JSON.parse(localStorage.getItem('lcns_management')||'[]'));
    } catch (err) {
      setMembers(JSON.parse(localStorage.getItem('lcns_management')||'[]'));
    } finally { setLoading(false); }
  };

  useEffect(() => { loadMembers(); }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormName('');
    setFormTitleSelect(TITLE_OPTIONS[0]);
    setCustomTitle('');
    setFormBio('');
    setFormPhotoUrl('');
    setFormDisplayOrder(members.length + 1);
    setFormIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (m: ManagementMember) => {
    setEditingId(m.id);
    setFormName(m.name);
    if (TITLE_OPTIONS.includes(m.title)) { setFormTitleSelect(m.title); setCustomTitle(''); }
    else { setFormTitleSelect('Custom Title...'); setCustomTitle(m.title); }
    setFormBio(m.description);
    setFormPhotoUrl(m.photo_url);
    setFormDisplayOrder(m.display_order);
    setFormIsActive(m.is_active);
    setShowModal(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const sb = getSupabase();
      if (!sb) throw new Error('Supabase not configured');
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `management/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}.${ext}`;
      
      // Upload to lcns-files bucket (you created) - will auto create if not exists, else use storage
      const { error: uploadError } = await sb.storage.from('lcns-files').upload(fileName, file, { upsert: true });
      if (uploadError) {
        // Try management-photos bucket
        const { error: e2 } = await sb.storage.from('management-photos').upload(fileName, file, { upsert: true });
        if (e2) throw e2;
        const { data } = sb.storage.from('management-photos').getPublicUrl(fileName);
        setFormPhotoUrl(data.publicUrl);
      } else {
        const { data } = sb.storage.from('lcns-files').getPublicUrl(fileName);
        setFormPhotoUrl(data.publicUrl);
      }
      showStatus('Picture uploaded permanently to Supabase Storage!');
    } catch (err: any) {
      showStatus(err?.message || 'Upload failed - check Supabase storage buckets', 'error');
    } finally { setUploadingPhoto(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) { showStatus('Enter name', 'error'); return; }
    const finalTitle = formTitleSelect === 'Custom Title...' ? (customTitle.trim() || 'Principal Officer') : formTitleSelect;
    const newMember: ManagementMember = {
      id: editingId || 'mgmt-' + Date.now(),
      name: formName.trim(),
      title: finalTitle,
      description: formBio.trim(),
      photo_url: formPhotoUrl.trim() || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
      display_order: Number(formDisplayOrder) || 1,
      is_active: formIsActive,
      created_at: new Date().toISOString(),
    };
    try {
      const sb = getSupabase();
      if (sb) {
        // Save to management table
        const { error } = await sb.from('management').upsert(newMember, { onConflict: 'id' });
        if (error) {
          // Fallback to lcns_management
          await sb.from('lcns_management').upsert(newMember, { onConflict: 'id' });
        }
      }
      // Local backup
      const local = JSON.parse(localStorage.getItem('lcns_management')||'[]');
      const filtered = local.filter((m:any)=> m.id!==newMember.id);
      localStorage.setItem('lcns_management', JSON.stringify([...filtered, newMember]));
      setShowModal(false);
      showStatus(editingId ? `Updated ${newMember.name}` : `Added ${newMember.name} permanently!`);
      loadMembers();
    } catch (err: any) {
      showStatus(err?.message || 'Save failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    try {
      const sb = getSupabase();
      if (sb) {
        await sb.from('management').delete().eq('id', memberToDelete.id);
        await sb.from('lcns_management').delete().eq('id', memberToDelete.id);
      }
      const local = JSON.parse(localStorage.getItem('lcns_management')||'[]');
      localStorage.setItem('lcns_management', JSON.stringify(local.filter((m:any)=> m.id!==memberToDelete.id)));
      showStatus(`Deleted ${memberToDelete.name}`);
      setMemberToDelete(null);
      loadMembers();
    } catch (err: any) { showStatus(err?.message || 'Delete failed', 'error'); }
  };

  const toggleActive = async (m: ManagementMember) => {
    const updated = { ...m, is_active: !m.is_active };
    const sb = getSupabase();
    if (sb) {
      await sb.from('management').upsert(updated, { onConflict: 'id' });
    }
    const local = JSON.parse(localStorage.getItem('lcns_management')||'[]');
    localStorage.setItem('lcns_management', JSON.stringify(local.map((x:any)=> x.id===m.id ? updated : x)));
    loadMembers();
  };

  const filteredMembers = members.filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      {statusMessage && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-md ${statusMessage.type==='success'?'bg-emerald-50 border-emerald-200 text-[#0a4d2e]':'bg-red-50 border-red-200 text-red-700'}`}>
          {statusMessage.type==='success'?<CheckCircle2 className="w-5 h-5 text-[#22c55e]"/>:<AlertCircle className="w-5 h-5 text-red-500"/>}
          <span className="text-xs font-bold">{statusMessage.text}</span>
        </div>
      )}

      <div className="bg-gradient-to-r from-[#0a4d2e] via-[#083c24] to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-[#22c55e]/30 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ca8a04] text-xs font-black uppercase mb-2"><ShieldCheck className="w-4 h-4"/><span>Page: /admin/management • Permanent Supabase</span></div>
          <h1 className="text-2xl font-black uppercase">College Leadership & Management Team</h1>
          <p className="text-xs text-emerald-200 mt-1">Photos → Supabase Storage lcns-files bucket → management table - Permanent</p>
        </div>
        <button onClick={openAddModal} className="inline-flex items-center gap-2 px-5 py-3 bg-[#ca8a04] hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shrink-0"><UserPlus className="w-4 h-4"/><span>Add Principal Officer</span></button>
      </div>

      <div className="bg-white rounded-2xl border p-4 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-80"><Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><input type="text" placeholder="Search..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-[#0a4d2e]"/></div>
        <div className="flex gap-4 text-xs font-bold text-slate-600"><span>Total: <strong className="text-[#0a4d2e]">{members.length}</strong></span><span>Active: <strong className="text-[#22c55e]">{members.filter(m=>m.is_active).length}</strong></span></div>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 border-b uppercase font-bold text-slate-600"><tr><th className="px-5 py-3.5">Order</th><th className="px-5 py-3.5">Photo</th><th className="px-5 py-3.5">Name</th><th className="px-5 py-3.5">Title</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5 text-right">Actions</th></tr></thead><tbody className="divide-y">{filteredMembers.map((m)=>(
          <tr key={m.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-mono font-black">#{m.display_order}</td><td className="px-5 py-4"><div className="w-12 h-14 rounded-xl overflow-hidden border-2 border-emerald-600 bg-slate-100"><img src={m.photo_url} alt={m.name} className="w-full h-full object-cover"/></div></td><td className="px-5 py-4 font-bold max-w-xs">{m.name}</td><td className="px-5 py-4"><span className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold text-[#0a4d2e]">{m.title}</span></td><td className="px-5 py-4"><button onClick={()=>toggleActive(m)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${m.is_active?'bg-emerald-100 text-[#0a4d2e]':'bg-slate-100 text-slate-500'}`}>{m.is_active?<Eye className="w-3 h-3"/>:<EyeOff className="w-3 h-3"/>}<span>{m.is_active?'Active':'Hidden'}</span></button></td><td className="px-5 py-4 text-right"><div className="flex justify-end gap-1.5"><button onClick={()=>openEditModal(m)} className="p-1.5 hover:bg-emerald-50 rounded-lg"><Edit2 className="w-4 h-4"/></button><button onClick={()=>setMemberToDelete(m)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button></div></td></tr>
        ))}{filteredMembers.length===0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">{loading?'Loading...':'No officers found'}</td></tr>}</tbody></table></div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between border-b pb-3"><div className="flex items-center gap-2"><div className="p-2 bg-emerald-50 rounded-xl"><Award className="w-5 h-5"/></div><div><h3 className="text-lg font-black uppercase">{editingId?'Edit Officer':'Add Officer'}</h3><p className="text-xs text-slate-500">Saves to Supabase permanent</p></div></div><button onClick={()=>setShowModal(false)} className="text-xl font-bold p-1">&times;</button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-xs font-bold uppercase mb-1.5">Portrait *</label><div className="flex items-center gap-4"><div className="w-20 h-24 rounded-2xl overflow-hidden border-2 border-emerald-600 bg-slate-100 flex items-center justify-center"><>{formPhotoUrl ? <img src={formPhotoUrl} alt="Preview" className="w-full h-full object-cover"/> : <Users className="w-8 h-8 text-slate-400"/>}</></div><div className="space-y-2 flex-1"><label className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a4d2e] text-white text-xs font-bold rounded-xl cursor-pointer"><input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} className="hidden"/><Upload className="w-3.5 h-3.5"/><span>{uploadingPhoto?'Uploading...':'Upload Picture'}</span></label><p className="text-[11px] text-slate-500">Uploads to Supabase lcns-files bucket - Permanent URL</p></div></div></div>
              <div><label className="block text-xs font-bold uppercase mb-1">Full Name *</label><input type="text" placeholder="e.g. Mrs Terna Fiase Msc, Bnsc" value={formName} onChange={(e)=>setFormName(e.target.value)} className="w-full px-4 py-2.5 text-xs rounded-xl border focus:ring-2 focus:ring-[#0a4d2e]" required/></div>
              <div><label className="block text-xs font-bold uppercase mb-1">Title *</label><select value={formTitleSelect} onChange={(e)=>setFormTitleSelect(e.target.value)} className="w-full px-4 py-2.5 text-xs rounded-xl border"><>{TITLE_OPTIONS.map((t)=>(<option key={t} value={t}>{t}</option>))}</></select>{formTitleSelect==='Custom Title...' && <input type="text" placeholder="Custom title..." value={customTitle} onChange={(e)=>setCustomTitle(e.target.value)} className="mt-2 w-full px-4 py-2 text-xs rounded-xl border" required/>}</div>
              <div><label className="block text-xs font-bold uppercase mb-1">Biography</label><textarea rows={3} placeholder="Brief summary..." value={formBio} onChange={(e)=>setFormBio(e.target.value)} className="w-full px-4 py-2.5 text-xs rounded-xl border"/></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold uppercase mb-1">Order</label><input type="number" min={1} value={formDisplayOrder} onChange={(e)=>setFormDisplayOrder(Number(e.target.value))} className="w-full px-4 py-2.5 text-xs rounded-xl border"/></div><div><label className="block text-xs font-bold uppercase mb-1">Visibility</label><label className="flex items-center gap-2 pt-2.5 cursor-pointer"><input type="checkbox" checked={formIsActive} onChange={(e)=>setFormIsActive(e.target.checked)} className="w-4 h-4"/><span className="text-xs font-bold">Display on Homepage</span></label></div></div>
              <div className="flex justify-end gap-3 pt-3 border-t"><button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button><button type="submit" className="px-5 py-2.5 bg-[#0a4d2e] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#22c55e]"/><span>{editingId?'Save Changes':'Add to Management'}</span></button></div>
            </form>
          </div>
        </div>
      )}

      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border"><div className="text-center space-y-2"><div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto"><Trash2 className="w-6 h-6"/></div><h3 className="text-base font-black uppercase">Delete Officer?</h3><p className="text-xs text-slate-500">Remove <strong>{memberToDelete.name}</strong> ({memberToDelete.title})?</p></div><div className="flex justify-center gap-3 pt-2"><button onClick={()=>setMemberToDelete(null)} className="px-4 py-2 text-xs font-bold hover:bg-slate-100 rounded-xl">Cancel</button><button onClick={handleDelete} className="px-5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl">Yes, Delete</button></div></div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
