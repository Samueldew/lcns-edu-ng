import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import { AdminSettings } from './AdminSettings';
import AdminManagement from './AdminManagement';
import { AdminGallery } from './AdminGallery';
import { CBTExamManager } from '../cbt/CBTExamManager';
import { Sliders, Camera, Award, UserCheck, ArrowUpCircle, GraduationCap, Users, Database, BookOpen, ShieldCheck, DollarSign, Crown, Trash2, Link2, Link2Off, Megaphone, Bell, Calendar, Send, Power, PowerOff, CheckCircle2, AlertCircle, RefreshCw, Eye, Server, Activity, Table, X, Edit3, UserPlus, MapPin, Phone, Droplet, User, Home, Hash, Briefcase } from 'lucide-react';
import { StudentPromotion } from './StudentPromotion';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';
import { getSupabase, getSupabaseConfig } from '../../lib/supabase';

const SUPABASE_BUCKET = 'lcns-media';

// ALL PORTAL ROLES - STAFF + STUDENT
const ALL_ROLES = [
  { value: 'STUDENT', label: 'STUDENT', color: 'bg-blue-100 text-blue-800', category: 'Student' },
  { value: 'LECTURER', label: 'LECTURER', color: 'bg-purple-100 text-purple-800', category: 'Staff' },
  { value: 'HOD', label: 'HOD - Head of Department', color: 'bg-indigo-100 text-indigo-800', category: 'Staff' },
  { value: 'EXAM_OFFICER', label: 'EXAM OFFICER', color: 'bg-orange-100 text-orange-800', category: 'Staff' },
  { value: 'PROVOST', label: 'PROVOST', color: 'bg-amber-100 text-amber-800', category: 'Principal' },
  { value: 'REGISTRAR', label: 'REGISTRAR', color: 'bg-teal-100 text-teal-800', category: 'Principal' },
  { value: 'BURSAR', label: 'BURSAR', color: 'bg-emerald-100 text-emerald-800', category: 'Principal' },
  { value: 'LIBRARIAN', label: 'LIBRARIAN', color: 'bg-cyan-100 text-cyan-800', category: 'Staff' },
  { value: 'ADMISSION_OFFICER', label: 'ADMISSION OFFICER', color: 'bg-pink-100 text-pink-800', category: 'Staff' },
  { value: 'ICT_OFFICER', label: 'ICT OFFICER / DIRECTOR OF ICT', color: 'bg-slate-800 text-white', category: 'Staff' },
  { value: 'DEAN', label: 'DEAN', color: 'bg-yellow-100 text-yellow-800', category: 'Principal' },
  { value: 'ADMIN', label: 'ADMIN - Full Access', color: 'bg-red-100 text-red-800', category: 'Admin' },
];

interface AdminDashboardProps {
  initialTab?: 'settings' | 'management' | 'gallery' | 'users' | 'cbt' | 'system' | 'cms' | 'promotion' | 'courses' | 'applicants' | 'backend' | 'bursar' | 'application' | 'announcements';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>(() => JSON.parse(localStorage.getItem('lcns_courses') || '[]'));
  const [payments, setPayments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [backendData, setBackendData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{text:string, type:'success'|'error'}|null>(null);
  const [appStatus, setAppStatus] = useState<{isOpen: boolean, link: string, deadline: string, message: string}>({
    isOpen: true,
    link: '/apply',
    deadline: '',
    message: 'Admissions open for 2025/2026 - Apply Now!'
  });
  const [annForm, setAnnForm] = useState({title: '', message: '', type: 'announcement', is_published: true});
  const [eventForm, setEventForm] = useState({title: '', description: '', date: '', location: '', is_published: true});
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userType, setUserType] = useState<'STUDENT' | 'STAFF'>('STUDENT');
  const [newUser, setNewUser] = useState({
    fullName: '',
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    phone: '',
    bloodGroup: '',
    sex: '',
    parentName: '',
    parentPhone: '',
    email: '',
    staying: '',
    level: '',
    department: 'Nursing',
    role: 'STUDENT',
    staffId: '',
    qualification: '',
    staffDepartment: 'Nursing'
  });

  const [activeAdminTab, setActiveAdminTab] = useState<
    'settings' | 'management' | 'gallery' | 'users' | 'cbt' | 'system' | 'cms' | 'promotion' | 'courses' | 'applicants' | 'backend' | 'bursar' | 'application' | 'announcements'
  >(initialTab || 'settings');

  const showStatus = (text:string, type:'success'|'error'='success') => {
    setStatus({text, type});
    setTimeout(()=>setStatus(null), 6000);
  };

  useEffect(() => {
    try {
      const allUsers = StorageService.getUsers ? StorageService.getUsers() : JSON.parse(localStorage.getItem('lcns_users') || '[]');
      setUsers(allUsers);
    } catch {}
    loadBackend();
  }, [activeAdminTab]);

  const loadBackend = async () => {
    setLoading(true);
    try {
      const sb = getSupabase();
      const cfg = getSupabaseConfig();
      const data: any = { supabaseUrl: cfg.url || 'https://liqwfikatnkndbdbdarx.supabase.co', connected: !!sb, tables: {} };
      if (sb) {
        const tables = ['school_settings', 'management', 'gallery', 'users', 'profiles', 'payments', 'announcements', 'events', 'app_settings', 'students'];
        for (const t of tables) {
          try { const { count } = await sb.from(t).select('*', { count: 'exact', head: true }); data.tables[t] = count ?? 0; } catch { data.tables[t] = 0; }
        }
        try { const { data: payData } = await sb.from('payments').select('*').order('created_at', { ascending: false }).limit(100); if (payData) setPayments(payData); } catch {}
        try { const { data: ann } = await sb.from('announcements').select('*').order('created_at', { ascending: false }); if (ann) setAnnouncements(ann); const { data: evt } = await sb.from('events').select('*').order('created_at', { ascending: false }); if (evt) setEvents(evt); } catch { const localAnn = JSON.parse(localStorage.getItem('lcns_announcements') || '[]'); if (localAnn.length) setAnnouncements(localAnn); }
      }
      setBackendData(data);
    } catch {} finally { setLoading(false); }
  };

  const generateMatricNo = (level: string): string => {
    const currentSession = localStorage.getItem('lcns_current_session') || '2025/2026';
    const year = currentSession.split('/')[0] || new Date().getFullYear().toString();
    const cleanLevel = level.toUpperCase().includes('HND') ? (level.toUpperCase().includes('2') ? 'HND2' : 'HND1') : (level.toUpperCase().includes('2') && !level.toUpperCase().includes('ND1') ? 'ND2' : 'ND1');
    const counterKey = `lcns_matric_counter_${cleanLevel}_${year}`;
    let counters = JSON.parse(localStorage.getItem('lcns_matric_counters') || '{}');
    let currentCount = counters[counterKey] || 0;
    const existingMatrics = users.filter((u:any) => u.matricNumber && u.matricNumber.includes(cleanLevel) && u.matricNumber.includes(year));
    if (existingMatrics.length > 0) {
      const maxNum = Math.max(...existingMatrics.map((u:any) => { const parts = u.matricNumber.split('\\'); return parseInt(parts[parts.length-1]) || 0; }), 0);
      if (maxNum > currentCount) currentCount = maxNum;
    }
    currentCount += 1;
    counters[counterKey] = currentCount;
    localStorage.setItem('lcns_matric_counters', JSON.stringify(counters));
    const padded = String(currentCount).padStart(3, '0');
    return `LCNS\\${cleanLevel}\\${year}\\${padded}`;
  };

  const generateStaffId = (role: string): string => {
    const currentSession = localStorage.getItem('lcns_current_session') || '2025/2026';
    const year = currentSession.split('/')[0] || '2026';
    const prefix = role.substring(0,3).toUpperCase();
    const counterKey = `lcns_staff_counter_${role}_${year}`;
    let counters = JSON.parse(localStorage.getItem('lcns_staff_counters') || '{}');
    let currentCount = counters[counterKey] || 0;
    currentCount += 1;
    counters[counterKey] = currentCount;
    localStorage.setItem('lcns_staff_counters', JSON.stringify(counters));
    const padded = String(currentCount).padStart(3, '0');
    return `LCNS\\${prefix}\\${year}\\${padded}`;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.fullName || !newUser.email) { showStatus('Fill Full Name and Email', 'error'); return; }
    if (userType === 'STUDENT' && (!newUser.level || !newUser.sex)) { showStatus('For student: Fill Sex, Level', 'error'); return; }
    try {
      let matricNo = '';
      let staffId = '';
      if (userType === 'STUDENT') {
        matricNo = generateMatricNo(newUser.level);
      } else {
        staffId = newUser.staffId || generateStaffId(newUser.role);
      }
      const fullName = newUser.fullName || `${newUser.firstName} ${newUser.middleName} ${newUser.lastName}`.trim();
      const userData = {
        id: Date.now().toString(),
        email: newUser.email.toLowerCase().trim(),
        fullName: fullName,
        firstName: newUser.firstName,
        middleName: newUser.middleName,
        lastName: newUser.lastName,
        name: fullName,
        address: newUser.address,
        phone: newUser.phone,
        bloodGroup: newUser.bloodGroup,
        sex: newUser.sex,
        parentName: newUser.parentName,
        parentPhone: newUser.parentPhone,
        staying: newUser.staying,
        level: userType === 'STUDENT' ? newUser.level.toUpperCase() : '',
        department: newUser.department,
        staffDepartment: newUser.staffDepartment,
        role: newUser.role.toUpperCase(),
        matricNumber: matricNo,
        staffId: staffId,
        qualification: newUser.qualification,
        userType: userType,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        academicYear: localStorage.getItem('lcns_current_session') || '2025/2026',
        password: 'lcns1234'
      };
      const sb = getSupabase();
      if (sb) { try { await sb.from('users').insert([userData]); } catch {} }
      const updatedUsers = [...users, userData];
      setUsers(updatedUsers);
      localStorage.setItem('lcns_users', JSON.stringify(updatedUsers));
      setNewUser({ fullName: '', firstName: '', middleName: '', lastName: '', address: '', phone: '', bloodGroup: '', sex: '', parentName: '', parentPhone: '', email: '', staying: '', level: '', department: 'Nursing', role: userType === 'STAFF' ? 'LECTURER' : 'STUDENT', staffId: '', qualification: '', staffDepartment: 'Nursing' });
      setShowCreateUser(false);
      showStatus(`✅ ${userType} CREATED! ${fullName} - ${userType === 'STUDENT' ? `Matric: ${matricNo}` : `Staff ID: ${staffId} - Role: ${userData.role}`} - Will NOT repeat unless deleted!`);
    } catch (err:any) { showStatus('Create failed: ' + err.message, 'error'); }
  };

  const assignRole = async (userEmail: string, newRole: string) => {
    try {
      const sb = getSupabase();
      const updatedUsers = users.map((u:any) => u.email === userEmail ? {...u, role: newRole.toUpperCase()} : u);
      setUsers(updatedUsers);
      localStorage.setItem('lcns_users', JSON.stringify(updatedUsers));
      if (sb) { try { await sb.from('users').update({ role: newRole.toUpperCase() }).eq('email', userEmail); } catch {} }
      showStatus(`✅ Role changed! ${userEmail} now ${newRole.toUpperCase()} - HOD/Exam Officer/Provost/Registrar/Bursar/Admin assigned!`);
    } catch (err:any) { showStatus(err.message, 'error'); }
  };

  const deleteUser = async (userEmail: string, fullName: string, matricNo?: string) => {
    if (!confirm(`DELETE ${fullName} (${userEmail})? Matric/Staff ID ${matricNo || ''} will be freed!`)) return;
    try {
      const sb = getSupabase();
      const filtered = users.filter((u:any) => u.email !== userEmail);
      setUsers(filtered);
      localStorage.setItem('lcns_users', JSON.stringify(filtered));
      if (sb) { try { await sb.from('users').delete().eq('email', userEmail); } catch {} }
      showStatus(`🗑️ ${fullName} DELETED - ID ${matricNo || ''} freed - Can reuse only if deleted!`);
    } catch (err:any) { showStatus(err.message, 'error'); }
  };

  const deletePayment = async (paymentId: string) => { if (!confirm('DELETE payment?')) return; try { const sb = getSupabase(); if (sb) await sb.from('payments').delete().eq('id', paymentId); setPayments(prev => prev.filter(p => p.id !== paymentId)); showStatus('Payment deleted'); } catch {} };
  const toggleApplication = async () => { const ns = { ...appStatus, isOpen: !appStatus.isOpen }; setAppStatus(ns); localStorage.setItem('lcns_application_status', JSON.stringify(ns)); localStorage.setItem('application_open', String(ns.isOpen)); const sb = getSupabase(); if (sb) try { await sb.from('school_settings').upsert({ key: 'application_open', value: String(ns.isOpen) }, { onConflict: 'key' }); } catch {} showStatus(ns.isOpen ? '✅ Application OPENED' : '🔒 Application CLOSED'); };
  const saveAppSettings = async () => { localStorage.setItem('lcns_application_status', JSON.stringify(appStatus)); showStatus('Application settings saved'); };
  const publishAnnouncement = async (e: React.FormEvent) => { e.preventDefault(); if (!annForm.title) { showStatus('Enter title', 'error'); return; } const newAnn = { id: Date.now().toString(), title: annForm.title, message: annForm.message, type: annForm.type, is_published: annForm.is_published, created_at: new Date().toISOString() }; const updated = [newAnn, ...announcements]; setAnnouncements(updated); localStorage.setItem('lcns_announcements', JSON.stringify(updated)); const sb = getSupabase(); if (sb) try { await sb.from('announcements').insert([newAnn]); } catch {} setAnnForm({title: '', message: '', type: 'announcement', is_published: true}); showStatus(`📢 PUBLISHED!`); };
  const publishEvent = async (e: React.FormEvent) => { e.preventDefault(); if (!eventForm.title) { showStatus('Enter title', 'error'); return; } const newEvent = { id: Date.now().toString(), title: eventForm.title, description: eventForm.description, date: eventForm.date, location: eventForm.location, is_published: eventForm.is_published, created_at: new Date().toISOString() }; const updated = [newEvent, ...events]; setEvents(updated); localStorage.setItem('lcns_events', JSON.stringify(updated)); const sb = getSupabase(); if (sb) try { await sb.from('events').insert([newEvent]); } catch {} setEventForm({title: '', description: '', date: '', location: '', is_published: true}); showStatus('📅 EVENT PUBLISHED!'); };
  const deleteAnnouncement = async (id: string) => { if (!confirm('Delete?')) return; setAnnouncements(prev => prev.filter(a => a.id !== id)); setEvents(prev => prev.filter(e => e.id !== id)); showStatus('Deleted'); };

  const lecturers = users.filter((u: any) => ['LECTURER','HOD'].includes(u.role));
  const currentSession = localStorage.getItem('lcns_current_session') || '2025/2026';
  const currentYear = currentSession.split('/')[0] || '2026';
  const getRoleColor = (role: string) => { const found = ALL_ROLES.find(r => r.value === role); return found ? found.color : 'bg-slate-100'; };

  return (
    <div className="space-y-8">
      {status && (<div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl border shadow-xl flex gap-3 ${status.type==='success'?'bg-emerald-50 border-emerald-200':'bg-red-50 border-red-200'}`}><CheckCircle2 className="w-5 h-5 text-emerald-600"/><span className="text-xs font-bold">{status.text}</span></div>)}
      <div className="bg-gradient-to-r from-slate-900 via-[#0a4d2e] to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-black/30 px-3 py-1 rounded-full">Director of ICT - Admin Portal - STAFF + STUDENT + ALL ROLES</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase mt-2 flex items-center gap-2"><GraduationCap className="w-8 h-8 text-amber-400"/>Administrator Dashboard</h1>
            <p className="text-xs text-emerald-200 mt-1">Session: {currentSession} • Users: {users.length} • Staff: {users.filter((u:any)=>u.userType==='STAFF' || ['LECTURER','HOD','PROVOST','BURSAR','REGISTRAR','ADMIN'].includes(u.role)).length} • Students: {users.filter((u:any)=>u.role==='STUDENT').length} • Matric Year: {currentYear}</p>
          </div>
          <div className="flex gap-2"><div className={`px-4 py-2 rounded-xl text-xs font-black ${backendData.connected?'bg-emerald-600':'bg-red-600'}`}>{backendData.connected?'● CONNECTED':'● OFFLINE'}</div><button onClick={loadBackend} className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold flex gap-2"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/> REFRESH</button></div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button onClick={() => setActiveAdminTab('backend')} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab === 'backend' ? 'bg-slate-900 text-white' : 'border'}`}><Server className="w-4 h-4"/>Backend</button>
        <button onClick={() => setActiveAdminTab('users')} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab === 'users' ? 'bg-[#0a4d2e] text-white ring-2 ring-emerald-300' : 'border-2'}`}><UserCheck className="w-4 h-4"/>Users - Create Staff+Student + Change Role<span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-700 text-white">{users.length}</span></button>
        <button onClick={() => setActiveAdminTab('application')} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab === 'application' ? 'bg-red-700 text-white' : 'border-2 border-red-300'}`}><Link2 className="w-4 h-4"/>App {appStatus.isOpen?'OPEN':'CLOSED'}</button>
        <button onClick={() => setActiveAdminTab('announcements')} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab === 'announcements' ? 'bg-blue-700 text-white' : 'border-2 border-blue-300'}`}><Megaphone className="w-4 h-4"/>Announcements</button>
        <button onClick={() => setActiveAdminTab('bursar')} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab === 'bursar' ? 'bg-emerald-700 text-white' : 'border-2'}`}><DollarSign className="w-4 h-4"/>Bursar</button>
        <button onClick={() => setActiveAdminTab('promotion')} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab === 'promotion' ? 'bg-amber-500 text-black' : 'border'}`}><ArrowUpCircle className="w-4 h-4"/>Promote</button>
        <button onClick={() => setActiveAdminTab('courses')} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab === 'courses' ? 'bg-emerald-700 text-white' : 'border-2 border-emerald-300'}`}><BookOpen className="w-4 h-4"/>Courses</button>
        <button onClick={() => setActiveAdminTab('applicants')} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab === 'applicants' ? 'bg-purple-700 text-white' : 'border-2 border-purple-300'}`}><GraduationCap className="w-4 h-4"/>Applicants</button>
        <button onClick={() => setActiveAdminTab('settings')} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold ${activeAdminTab === 'settings' ? 'bg-[#0a4d2e] text-white' : 'hover:bg-slate-100'}`}><Sliders className="w-4 h-4"/>Settings</button>
        <button onClick={() => setActiveAdminTab('management')} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold ${activeAdminTab === 'management' ? 'bg-[#0a4d2e] text-white' : 'hover:bg-slate-100'}`}><Users className="w-4 h-4"/>Management</button>
        <button onClick={() => setActiveAdminTab('gallery')} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold ${activeAdminTab === 'gallery' ? 'bg-[#0a4d2e] text-white' : 'hover:bg-slate-100'}`}><Camera className="w-4 h-4"/>Gallery</button>
        <button onClick={() => setActiveAdminTab('cbt')} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold ${activeAdminTab === 'cbt' ? 'bg-[#0a4d2e] text-white' : 'hover:bg-slate-100'}`}><Award className="w-4 h-4"/>CBT</button>
        <button onClick={() => setActiveAdminTab('system')} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold ${activeAdminTab === 'system' ? 'bg-[#0a4d2e] text-white' : 'hover:bg-slate-100'}`}><Database className="w-4 h-4"/>System</button>
      </div>

      {activeAdminTab === 'backend' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border-2"><h3 className="font-black text-xs">SUPABASE</h3><p className="text-[11px] mt-2 break-all bg-slate-50 p-2 rounded-lg">{backendData.supabaseUrl}</p></div>
          <div className="bg-white rounded-2xl p-5 border"><h3 className="font-black text-xs">TABLES COUNT</h3><div className="mt-3 space-y-1 text-[11px]">{Object.entries(backendData.tables||{}).map(([t,c])=><div key={t} className="flex justify-between bg-slate-50 px-2 py-1 rounded-lg"><span>{t}</span><span className="bg-emerald-600 text-white px-2 rounded-full">{String(c)}</span></div>)}</div></div>
          <div className="bg-white rounded-2xl p-5 border"><h3 className="font-black text-xs">STATUS</h3><div className="mt-3 text-[11px] space-y-2"><div className="flex justify-between"><span>Users</span><span>{users.length}</span></div><div className="flex justify-between"><span>Payments</span><span>{payments.length}</span></div></div></div>
        </div>
      )}

      {activeAdminTab === 'application' && (
        <div className="space-y-6"><div className={`rounded-3xl p-6 border-2 ${appStatus.isOpen?'bg-emerald-50 border-emerald-300':'bg-red-50 border-red-300'}`}><div className="flex justify-between items-center gap-4"><div><h2 className="text-xl font-black">CLOSE/OPEN APPLICATION</h2><div className={`mt-3 inline-flex px-4 py-2 rounded-xl font-black ${appStatus.isOpen?'bg-emerald-600 text-white':'bg-red-600 text-white'}`}>{appStatus.isOpen?'OPEN':'CLOSED'}</div></div><button onClick={toggleApplication} className={`px-8 py-4 rounded-2xl font-black ${appStatus.isOpen?'bg-red-600 text-white':'bg-emerald-600 text-white'}`}>{appStatus.isOpen?'CLOSE NOW':'OPEN NOW'}</button></div></div><div className="bg-white rounded-3xl border-2 p-6 space-y-4"><button onClick={saveAppSettings} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black">SAVE</button></div></div>
      )}

      {activeAdminTab === 'announcements' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-700 to-emerald-700 text-white rounded-3xl p-6"><h2 className="text-xl font-black">PUBLISH ANNOUNCEMENT/EVENT - FIXED!</h2></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border-2 border-blue-200 p-6 space-y-4"><form onSubmit={publishAnnouncement} className="space-y-3"><input value={annForm.title} onChange={e=>setAnnForm({...annForm, title: e.target.value})} placeholder="Title" className="w-full px-4 py-2.5 border-2 rounded-xl text-xs font-bold"/><textarea value={annForm.message} onChange={e=>setAnnForm({...annForm, message: e.target.value})} placeholder="Message" className="w-full px-4 py-2.5 border-2 rounded-xl text-xs h-24"/><button type="submit" className="w-full py-3 bg-blue-700 text-white rounded-xl text-xs font-black">PUBLISH ANNOUNCEMENT</button></form></div>
            <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 space-y-4"><form onSubmit={publishEvent} className="space-y-3"><input value={eventForm.title} onChange={e=>setEventForm({...eventForm, title: e.target.value})} placeholder="Event Title" className="w-full px-4 py-2.5 border-2 rounded-xl text-xs font-bold"/><div className="grid grid-cols-2 gap-3"><input type="date" value={eventForm.date} onChange={e=>setEventForm({...eventForm, date: e.target.value})} className="w-full px-4 py-2.5 border-2 rounded-xl text-xs"/><input value={eventForm.location} onChange={e=>setEventForm({...eventForm, location: e.target.value})} placeholder="Location" className="w-full px-4 py-2.5 border-2 rounded-xl text-xs"/></div><textarea value={eventForm.description} onChange={e=>setEventForm({...eventForm, description: e.target.value})} placeholder="Description" className="w-full px-4 py-2.5 border-2 rounded-xl text-xs h-24"/><button type="submit" className="w-full py-3 bg-emerald-700 text-white rounded-xl text-xs font-black">PUBLISH EVENT</button></form></div>
          </div>
          <div className="bg-white rounded-3xl border p-6"><div className="grid gap-2">{[...announcements, ...events].map((item:any)=><div key={item.id} className="flex justify-between bg-slate-50 p-3 rounded-xl border text-[11px]"><span><b>{item.title}</b></span><button onClick={()=>deleteAnnouncement(item.id)} className="bg-red-600 text-white p-1.5 rounded-lg"><Trash2 className="w-3 h-3"/></button></div>)}</div></div>
        </div>
      )}

      {activeAdminTab === 'bursar' && (<div className="bg-white rounded-3xl border-2 p-6"><h2 className="font-black text-lg mb-4">BURSAR - PAYMENTS</h2><table className="w-full text-xs"><thead><tr className="bg-emerald-900 text-white"><th className="p-3 text-left">Student</th><th className="p-3">Amount</th><th className="p-3">Delete</th></tr></thead><tbody>{payments.map((p:any)=><tr key={p.id} className="border-b"><td className="p-3">{p.student_name||p.email}</td><td className="p-3">₦{p.amount||0}</td><td className="p-3"><button onClick={()=>deletePayment(p.id)} className="bg-red-600 text-white px-3 py-1 rounded-xl text-[10px] font-black">DELETE</button></td></tr>)}</tbody></table></div>)}

      {/* USERS - CREATE STAFF + STUDENT + ALL ROLES - ADMIN CAN CHANGE ROLE */}
      {activeAdminTab === 'users' && (
        <div className="bg-white rounded-3xl border-2 p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h3 className="font-black text-lg flex gap-2"><UserCheck className="w-5 h-5"/> Users - CREATE STAFF + STUDENT - ALL PORTAL ROLES - ADMIN CAN CHANGE ROLE</h3>
              <p className="text-[11px] text-slate-600 mt-1">Create: Student (Full Biodata + Auto Matric LCNS\ND\{currentYear}\002) + Staff (HOD, Exam Officer, Provost, Registrar, Bursar, Lecturer, Admin etc) + Admin can change role anytime - Roles: {ALL_ROLES.map(r=>r.label).join(', ')}</p>
            </div>
            <button onClick={()=>setShowCreateUser(!showCreateUser)} className="px-6 py-3 bg-[#0a4d2e] hover:bg-black text-white rounded-xl text-xs font-black flex gap-2 shadow-md"><UserPlus className="w-4 h-4"/> {showCreateUser ? 'CLOSE FORM' : '+ CREATE USER - STAFF OR STUDENT'}</button>
          </div>

          {showCreateUser && (
            <div className="bg-gradient-to-br from-slate-50 to-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 space-y-4">
              <div className="flex gap-3">
                <button onClick={()=>{setUserType('STUDENT'); setNewUser({...newUser, role: 'STUDENT'});}} className={`flex-1 py-3 rounded-xl text-xs font-black flex justify-center gap-2 ${userType==='STUDENT'?'bg-blue-700 text-white':'bg-white border-2'}`}><GraduationCap className="w-4 h-4"/> CREATE STUDENT</button>
                <button onClick={()=>{setUserType('STAFF'); setNewUser({...newUser, role: 'LECTURER'});}} className={`flex-1 py-3 rounded-xl text-xs font-black flex justify-center gap-2 ${userType==='STAFF'?'bg-[#0a4d2e] text-white':'bg-white border-2'}`}><Briefcase className="w-4 h-4"/> CREATE STAFF - HOD/EXAM OFFICER/PROVOST/REGISTRAR/BURSAR</button>
              </div>

              <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-[11px]">
                {userType==='STUDENT' ? <p className="font-bold">Student Matric Preview: LCNS\{newUser.level || 'ND1'}\{currentYear}\XXX → Example: LCNS\ND1\{currentYear}\002 - Auto {parseInt(currentYear)+1} next session - Never repeats unless deleted!</p> : <p className="font-bold">Staff ID Preview: LCNS\{newUser.role.substring(0,3)}\{currentYear}\XXX → Example: LCNS\LEC\{currentYear}\001 for Lecturer - Auto assigns based on role - Never repeats unless deleted!</p>}
              </div>

              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3"><label className="text-[11px] font-black">Full Names *</label><input value={newUser.fullName} onChange={e=>setNewUser({...newUser, fullName: e.target.value})} placeholder="Full name as in certificate" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs font-bold" required/></div>
                <div><label className="text-[11px] font-bold">First Name</label><input value={newUser.firstName} onChange={e=>setNewUser({...newUser, firstName: e.target.value})} placeholder="First Name" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs"/></div>
                <div><label className="text-[11px] font-bold">Middle Name</label><input value={newUser.middleName} onChange={e=>setNewUser({...newUser, middleName: e.target.value})} placeholder="Middle Name" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs"/></div>
                <div><label className="text-[11px] font-bold">Last Name</label><input value={newUser.lastName} onChange={e=>setNewUser({...newUser, lastName: e.target.value})} placeholder="Last Name" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs"/></div>
                
                <div className="md:col-span-2"><label className="text-[11px] font-bold flex gap-1"><MapPin className="w-3 h-3"/> Address *</label><input value={newUser.address} onChange={e=>setNewUser({...newUser, address: e.target.value})} placeholder="Address" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs" required={userType==='STUDENT'}/></div>
                <div><label className="text-[11px] font-bold flex gap-1"><Phone className="w-3 h-3"/> Phone *</label><input value={newUser.phone} onChange={e=>setNewUser({...newUser, phone: e.target.value})} placeholder="080..." className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs" required/></div>

                {userType==='STUDENT' ? (
                  <>
                    <div><label className="text-[11px] font-bold flex gap-1"><Droplet className="w-3 h-3"/> Blood Group</label><select value={newUser.bloodGroup} onChange={e=>setNewUser({...newUser, bloodGroup: e.target.value})} className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs"><option value="">Select</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select></div>
                    <div><label className="text-[11px] font-bold">Sex *</label><select value={newUser.sex} onChange={e=>setNewUser({...newUser, sex: e.target.value})} className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs" required><option value="">Select Sex</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                    <div><label className="text-[11px] font-bold flex gap-1"><Home className="w-3 h-3"/> Hostel/Off-Campus *</label><select value={newUser.staying} onChange={e=>setNewUser({...newUser, staying: e.target.value})} className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs" required><option value="">Select</option><option value="hostel">Hostel</option><option value="offcampus">Off-Campus</option></select></div>
                    <div className="md:col-span-2"><label className="text-[11px] font-bold">Parent/Guardian Name *</label><input value={newUser.parentName} onChange={e=>setNewUser({...newUser, parentName: e.target.value})} placeholder="Parent Name" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs" required/></div>
                    <div><label className="text-[11px] font-bold">Parent Phone *</label><input value={newUser.parentPhone} onChange={e=>setNewUser({...newUser, parentPhone: e.target.value})} placeholder="Parent Phone" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs" required/></div>
                  </>
                ) : (
                  <>
                    <div><label className="text-[11px] font-bold">Qualification</label><input value={newUser.qualification} onChange={e=>setNewUser({...newUser, qualification: e.target.value})} placeholder="e.g., MSc Nursing, PhD" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs"/></div>
                    <div><label className="text-[11px] font-bold">Staff Department</label><select value={newUser.staffDepartment} onChange={e=>setNewUser({...newUser, staffDepartment: e.target.value})} className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs"><option value="Nursing">Nursing</option><option value="Midwifery">Midwifery</option><option value="Admin">Admin</option><option value="Bursary">Bursary</option><option value="Registry">Registry</option><option value="ICT">ICT</option></select></div>
                    <div><label className="text-[11px] font-bold">Staff ID (Auto if empty)</label><input value={newUser.staffId} onChange={e=>setNewUser({...newUser, staffId: e.target.value})} placeholder="Auto: LCNS/LEC/2026/001" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs"/></div>
                  </>
                )}

                <div><label className="text-[11px] font-bold">Email *</label><input type="email" value={newUser.email} onChange={e=>setNewUser({...newUser, email: e.target.value})} placeholder="email@lcns.edu.ng" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs" required/></div>
                
                {userType==='STUDENT' ? (
                  <div><label className="text-[11px] font-bold">Level *</label><select value={newUser.level} onChange={e=>setNewUser({...newUser, level: e.target.value})} className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs font-bold" required><option value="">Select Level</option><option value="ND1">ND1</option><option value="ND2">ND2 (N2)</option><option value="HND1">HND1</option><option value="HND2">HND2</option></select></div>
                ) : <div><label className="text-[11px] font-bold">Department</label><input value={newUser.department} onChange={e=>setNewUser({...newUser, department: e.target.value})} placeholder="Department" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs"/></div>}

                <div><label className="text-[11px] font-bold">Role - ALL PORTAL ROLES *</label><select value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})} className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs font-bold" required>
                  {userType==='STUDENT' ? <option value="STUDENT">STUDENT</option> : ALL_ROLES.filter(r=>r.category!=='Student').map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
                  {userType==='STUDENT' && ALL_ROLES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
                </select></div>

                <div className="md:col-span-3 flex gap-3 pt-2">
                  <button type="submit" className="flex-1 py-3 bg-[#0a4d2e] text-white rounded-xl text-xs font-black flex justify-center gap-2"><UserPlus className="w-4 h-4"/> CREATE {userType} - {userType==='STUDENT' ? `MATRIC LCNS\\${newUser.level || 'LEVEL'}\\${currentYear}\\XXX` : `STAFF ID - ROLE ${newUser.role}`}</button>
                  <button type="button" onClick={()=>setShowCreateUser(false)} className="px-6 py-3 bg-slate-200 rounded-xl text-xs font-bold">CANCEL</button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-black text-sm">All Users - Staff + Students - Admin Can Change Role - HOD, Exam Officer, Provost, Registrar, Bursar, etc ({users.length})</h4>
            <div className="grid gap-3">
              {users.map((u:any) => (
                <div key={u.email} className="border-2 p-4 rounded-2xl bg-slate-50 hover:bg-white space-y-2">
                  <div className="flex flex-col lg:flex-row justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="font-black text-sm flex flex-wrap gap-2 items-center">
                        <span>{u.fullName || u.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${getRoleColor(u.role)}`}>{u.role}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 text-white">{u.matricNumber || u.staffId || u.id?.slice(0,8) || 'No ID'}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100">{u.level || u.userType || 'No Level'}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100">{u.userType || (u.role==='STUDENT'?'STUDENT':'STAFF')}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-[11px] text-slate-600">
                        <span>Email: {u.email}</span><span>Phone: {u.phone || 'N/A'}</span><span>Sex: {u.sex || 'N/A'}</span><span>Dept: {u.department || u.staffDepartment || 'N/A'}</span>
                        {u.userType==='STUDENT' || u.role==='STUDENT' ? <><span className="md:col-span-2">Address: {u.address || 'N/A'}</span><span>Parent: {u.parentName || 'N/A'}</span><span>Parent Phone: {u.parentPhone || 'N/A'}</span></> : <><span>Qualification: {u.qualification || 'N/A'}</span><span>Staff Dept: {u.staffDepartment || 'N/A'}</span></>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] font-black text-slate-700">CHANGE ROLE - ADMIN CAN CHANGE TO ANY ROLE ON PORTAL:</div>
                      <div className="flex flex-wrap gap-1">
                        {ALL_ROLES.map(r=>(
                          <button key={r.value} onClick={()=>assignRole(u.email, r.value)} className={`px-2 py-1 rounded-xl text-[9px] font-black border ${u.role===r.value?'bg-slate-900 text-white ring-2 ring-amber-300':'bg-white hover:bg-slate-100'}`}>{r.value.replace('_',' ')}</button>
                        ))}
                      </div>
                      <button onClick={()=>deleteUser(u.email, u.fullName||u.email, u.matricNumber||u.staffId)} className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-[10px] font-black flex gap-1 justify-center"><Trash2 className="w-3 h-3"/> DELETE USER - FREES MATRIC/STAFF ID</button>
                    </div>
                  </div>
                </div>
              ))}
              {users.length===0 && <p className="text-xs text-center py-8 bg-red-50 border-2 border-dashed rounded-xl">No users - Click CREATE USER - Choose STAFF or STUDENT - For Staff: HOD, Exam Officer, Provost, Registrar, Bursar etc - For Student: Auto Matric LCNS\ND\{currentYear}\002</p>}
            </div>
          </div>
        </div>
      )}

      {activeAdminTab === 'promotion' && <StudentPromotion />}
      {activeAdminTab === 'settings' && <AdminSettings />}
      {activeAdminTab === 'management' && <AdminManagement />}
      {activeAdminTab === 'gallery' && <AdminGallery />}
      {activeAdminTab === 'cbt' && <CBTExamManager currentUser={{id:'admin',email:'admin@lcns.edu.ng',role:'ADMIN',fullName:'Admin',status:'ACTIVE'}} />}
      {activeAdminTab === 'courses' && (<div className="bg-white rounded-3xl border-2 p-4"><h2 className="font-black">📚 Courses - {courses.length} - Lecturers {lecturers.length}</h2><div className="overflow-x-auto border-2 rounded-xl mt-3"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">Code</th><th className="p-2">Title</th><th className="p-2">Lecturer</th></tr></thead><tbody>{courses.map((c:any)=><tr key={c.id} className="border-b"><td className="p-2 font-mono">{c.code}</td><td className="p-2">{c.title}</td><td className="p-2">{c.lecturer}</td></tr>)}</tbody></table></div></div>)}
      {activeAdminTab === 'applicants' && (<div className="space-y-4"><div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">🎓 Applicants - App {appStatus.isOpen?'OPEN':'CLOSED'}</div><AdminAdmissionManager currentUser={{id:'admin',email:'admin@lcns.edu.ng',role:'ADMIN',fullName:'Admin',status:'ACTIVE'}} /></div>)}
      {activeAdminTab === 'system' && (<div className="bg-white rounded-3xl border-2 p-6 text-xs"><h3 className="font-black">System Health</h3><p>Session: {currentSession} - Matric Year: {currentYear}</p><p>Users: {users.length} - Staff: {users.filter((u:any)=>['LECTURER','HOD','EXAM_OFFICER','PROVOST','REGISTRAR','BURSAR'].includes(u.role)).length} - Students: {users.filter((u:any)=>u.role==='STUDENT').length}</p><p>All Roles Available: {ALL_ROLES.map(r=>r.value).join(', ')}</p></div>)}
    </div>
  );
};

export default AdminDashboard;
