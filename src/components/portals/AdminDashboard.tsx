import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import { AdminSettings } from './AdminSettings';
import AdminManagement from './AdminManagement';
import { AdminGallery } from './AdminGallery';
import { CBTExamManager } from '../cbt/CBTExamManager';
import { Sliders, Camera, Award, UserCheck, ArrowUpCircle, GraduationCap, Users, Database, BookOpen, ShieldCheck, DollarSign, Crown, Trash2, Link2, Link2Off, Megaphone, Bell, Calendar, Send, Power, PowerOff, CheckCircle2, AlertCircle, RefreshCw, Eye, Server, Activity, Table, X, Edit3, UserPlus, MapPin, Phone, Droplet, User, Home, Hash } from 'lucide-react';
import { StudentPromotion } from './StudentPromotion';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';
import { getSupabase, getSupabaseConfig } from '../../lib/supabase';

const SUPABASE_BUCKET = 'lcns-media';

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
  // ADDED - CREATE USER STATES - NOT SCATTERED, IN SAME FILE
  const [showCreateUser, setShowCreateUser] = useState(false);
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
    role: 'STUDENT'
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
          try {
            const { count } = await sb.from(t).select('*', { count: 'exact', head: true });
            data.tables[t] = count ?? 0;
          } catch { data.tables[t] = 0; }
        }
        try {
          const { data: payData } = await sb.from('payments').select('*').order('created_at', { ascending: false }).limit(100);
          if (payData) setPayments(payData);
        } catch {}
        try {
          const { data: ann } = await sb.from('announcements').select('*').order('created_at', { ascending: false });
          if (ann) setAnnouncements(ann);
          const { data: evt } = await sb.from('events').select('*').order('created_at', { ascending: false });
          if (evt) setEvents(evt);
        } catch {
          const localAnn = JSON.parse(localStorage.getItem('lcns_announcements') || '[]');
          if (localAnn.length) setAnnouncements(localAnn);
        }
        try {
          const { data: appSet } = await sb.from('school_settings').select('*').eq('key', 'application_open').single();
          if (appSet) setAppStatus(prev => ({...prev, isOpen: appSet.value === 'true'}));
        } catch {
          const localApp = localStorage.getItem('lcns_application_status');
          if (localApp) setAppStatus(JSON.parse(localApp));
        }
      }
      setBackendData(data);
    } catch (err:any) { showStatus(err.message, 'error'); } finally { setLoading(false); }
  };

  // ADDED - AUTO GENERATE MATRIC NO - LCNS\ND\2026\002 - NEVER REPEAT UNLESS DELETED
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
    localStorage.setItem(counterKey, currentCount.toString());
    const padded = String(currentCount).padStart(3, '0');
    return `LCNS\\${cleanLevel}\\${year}\\${padded}`;
  };

  // ADDED - CREATE USER WITH FULL BIODATA + AUTO MATRIC
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.fullName || !newUser.email || !newUser.level || !newUser.sex) {
      showStatus('Fill Full Name, Email, Sex, Level', 'error');
      return;
    }
    try {
      const matricNo = generateMatricNo(newUser.level);
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
        level: newUser.level.toUpperCase(),
        department: newUser.department,
        role: newUser.role.toUpperCase(),
        matricNumber: matricNo,
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
      setNewUser({ fullName: '', firstName: '', middleName: '', lastName: '', address: '', phone: '', bloodGroup: '', sex: '', parentName: '', parentPhone: '', email: '', staying: '', level: '', department: 'Nursing', role: 'STUDENT' });
      setShowCreateUser(false);
      showStatus(`✅ STUDENT CREATED! ${fullName} - Matric: ${matricNo} - Will NOT repeat unless deleted! Year auto changes to ${parseInt(localStorage.getItem('lcns_current_session')?.split('/')[0] || '2026')+1} when session moves!`);
    } catch (err:any) { showStatus('Create failed: ' + err.message, 'error'); }
  };

  // ROLE ASSIGN - PROVOST, BURSAR, ADMIN
  const assignRole = async (userEmail: string, newRole: string) => {
    try {
      const sb = getSupabase();
      const updatedUsers = users.map((u:any) => u.email === userEmail ? {...u, role: newRole.toUpperCase()} : u);
      setUsers(updatedUsers);
      localStorage.setItem('lcns_users', JSON.stringify(updatedUsers));
      if (sb) {
        try { await sb.from('users').update({ role: newRole.toUpperCase() }).eq('email', userEmail); } catch {}
        try { await sb.from('profiles').update({ role: newRole.toUpperCase() }).eq('email', userEmail); } catch {}
      }
      showStatus(`✅ ${userEmail} now ${newRole.toUpperCase()} - Provost/Bursar/Admin assigned!`);
    } catch (err:any) { showStatus(err.message, 'error'); }
  };

  // DELETE USER - FREES MATRIC FOR REUSE IF DELETED
  const deleteUser = async (userEmail: string, fullName: string, matricNo?: string) => {
    if (!confirm(`PERMANENTLY DELETE USER ${fullName} (${userEmail}) Matric ${matricNo || ''}? This frees matric and deletes from portal!`)) return;
    try {
      const sb = getSupabase();
      const filtered = users.filter((u:any) => u.email !== userEmail);
      setUsers(filtered);
      localStorage.setItem('lcns_users', JSON.stringify(filtered));
      if (sb) {
        try { await sb.from('users').delete().eq('email', userEmail); } catch {}
        try { await sb.from('profiles').delete().eq('email', userEmail); } catch {}
      }
      showStatus(`🗑️ ${fullName} DELETED - Matric ${matricNo || ''} removed - Can be reassigned only if deleted!`);
    } catch (err:any) { showStatus(err.message, 'error'); }
  };

  // DELETE PAYMENT - BURSAR
  const deletePayment = async (paymentId: string) => {
    if (!confirm('DELETE this payment record in Bursar?')) return;
    try {
      const sb = getSupabase();
      if (sb) await sb.from('payments').delete().eq('id', paymentId);
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      showStatus('🗑️ Payment deleted in Bursar!');
    } catch (err:any) { showStatus(err.message, 'error'); }
  };

  // APPLICATION OPEN/CLOSE
  const toggleApplication = async () => {
    const newStatus = { ...appStatus, isOpen: !appStatus.isOpen };
    setAppStatus(newStatus);
    try {
      const sb = getSupabase();
      if (sb) await sb.from('school_settings').upsert({ key: 'application_open', value: String(newStatus.isOpen), updated_at: new Date().toISOString() }, { onConflict: 'key' });
      localStorage.setItem('lcns_application_status', JSON.stringify(newStatus));
      localStorage.setItem('application_open', String(newStatus.isOpen));
      showStatus(newStatus.isOpen ? '✅ ONLINE APPLICATION OPENED! /apply is LIVE' : '🔒 APPLICATION CLOSED! Students cannot apply');
    } catch (err:any) { showStatus(err.message, 'error'); }
  };

  const saveAppSettings = async () => {
    try {
      const sb = getSupabase();
      if (sb) {
        await sb.from('school_settings').upsert({ key: 'application_link', value: appStatus.link }, { onConflict: 'key' });
        await sb.from('school_settings').upsert({ key: 'application_deadline', value: appStatus.deadline }, { onConflict: 'key' });
        await sb.from('school_settings').upsert({ key: 'application_message', value: appStatus.message }, { onConflict: 'key' });
      }
      localStorage.setItem('lcns_application_status', JSON.stringify(appStatus));
      showStatus('✅ Application link settings saved & published live!');
    } catch (err:any) { showStatus(err.message, 'error'); }
  };

  // PUBLISH ANNOUNCEMENT / EVENT - FIXED BLANK ISSUE
  const publishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title) { showStatus('Enter title', 'error'); return; }
    try {
      const sb = getSupabase();
      const newAnn = { id: Date.now().toString(), title: annForm.title, message: annForm.message, type: annForm.type, is_published: annForm.is_published, created_at: new Date().toISOString(), author: 'Admin' };
      if (sb) try { await sb.from('announcements').insert([newAnn]); } catch {}
      const updated = [newAnn, ...announcements];
      setAnnouncements(updated);
      localStorage.setItem('lcns_announcements', JSON.stringify(updated));
      const cms = StorageService.getCMSConfig();
      StorageService.saveCMSConfig({ ...cms, announcements: updated });
      setAnnForm({title: '', message: '', type: 'announcement', is_published: true});
      showStatus(`📢 ${annForm.type.toUpperCase()} PUBLISHED LIVE on website homepage!`);
      window.dispatchEvent(new Event('lcns_storage_update'));
    } catch (err:any) { showStatus(err.message, 'error'); }
  };

  const publishEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title) { showStatus('Enter event title', 'error'); return; }
    try {
      const sb = getSupabase();
      const newEvent = { id: Date.now().toString(), title: eventForm.title, description: eventForm.description, date: eventForm.date, location: eventForm.location, is_published: eventForm.is_published, created_at: new Date().toISOString() };
      if (sb) try { await sb.from('events').insert([newEvent]); } catch {}
      const updated = [newEvent, ...events];
      setEvents(updated);
      localStorage.setItem('lcns_events', JSON.stringify(updated));
      setEventForm({title: '', description: '', date: '', location: '', is_published: true});
      showStatus('📅 EVENT PUBLISHED LIVE on website!');
    } catch (err:any) { showStatus(err.message, 'error'); }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement/event?')) return;
    try {
      const sb = getSupabase();
      if (sb) { try { await sb.from('announcements').delete().eq('id', id); } catch {}; try { await sb.from('events').delete().eq('id', id); } catch {}; }
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      setEvents(prev => prev.filter(e => e.id !== id));
      showStatus('🗑️ Deleted from website!');
    } catch (err:any) { showStatus(err.message, 'error'); }
  };

  const lecturers = users.filter((u: any) => u.role === 'LECTURER' || u.role === 'HOD');
  const currentSession = localStorage.getItem('lcns_current_session') || '2025/2026';
  const currentYear = currentSession.split('/')[0] || '2026';

  return (
    <div className="space-y-8">
      {status && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl border shadow-xl flex gap-3 ${status.type==='success'?'bg-emerald-50 border-emerald-200 text-emerald-800':'bg-red-50 border-red-200 text-red-700'}`}>
          {status.type==='success'?<CheckCircle2 className="w-5 h-5"/>:<AlertCircle className="w-5 h-5"/>}
          <span className="text-xs font-bold">{status.text}</span>
        </div>
      )}

      <div className="bg-gradient-to-r from-slate-900 via-[#0a4d2e] to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-black/30 px-3 py-1 rounded-full">Director of ICT - Admin Portal - FULL CONTROL RESTORED - NOT SCATTERED</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase mt-2 flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-amber-400"/>
              Administrator Dashboard
            </h1>
            <p className="text-xs text-emerald-200 mt-1">
              Supabase PostgreSQL • Bucket: {SUPABASE_BUCKET} • {currentSession} Session • Users: {users.length} • Lecturers: {lecturers.length} • App: {appStatus.isOpen?'OPEN':'CLOSED'} • Matric Year: {currentYear} • Announcements: {announcements.length+events.length}
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <div className={`px-4 py-2 rounded-xl text-xs font-black ${backendData.connected?'bg-emerald-600':'bg-red-600'}`}>{backendData.connected?'● CONNECTED':'● OFFLINE'}</div>
            <button onClick={loadBackend} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex gap-2"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/> REFRESH BACKEND</button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button onClick={() => setActiveAdminTab('backend')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeAdminTab === 'backend' ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-400' : 'text-slate-700 hover:bg-slate-100 border-2'}`}>
          <Server className="w-4 h-4" />Backend Connections
        </button>
        <button onClick={() => setActiveAdminTab('application')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeAdminTab === 'application' ? 'bg-red-700 text-white shadow-md ring-2 ring-red-300' : 'text-red-800 hover:bg-red-50 border-2 border-red-300'}`}>
          <Link2 className="w-4 h-4" />{appStatus.isOpen?'Close Application':'Open Application'}<span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${appStatus.isOpen?'bg-emerald-400 text-black':'bg-red-400 text-white'}`}>{appStatus.isOpen?'OPEN':'CLOSED'}</span>
        </button>
        <button onClick={() => setActiveAdminTab('announcements')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeAdminTab === 'announcements' ? 'bg-blue-700 text-white shadow-md ring-2 ring-blue-300' : 'text-blue-800 hover:bg-blue-50 border-2 border-blue-300'}`}>
          <Megaphone className="w-4 h-4" />Publish Announcement/Event
        </button>
        <button onClick={() => setActiveAdminTab('bursar')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeAdminTab === 'bursar' ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-300' : 'text-emerald-800 hover:bg-emerald-50 border-2 border-emerald-300'}`}>
          <DollarSign className="w-4 h-4" />Bursar - Payments<span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-black text-white">{payments.length}</span>
        </button>
        <button onClick={() => setActiveAdminTab('promotion')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeAdminTab === 'promotion' ? 'bg-amber-500 text-black shadow-md ring-2 ring-amber-300' : 'text-slate-600 hover:bg-amber-50 border border-amber-200'}`}>
          <ArrowUpCircle className="w-4 h-4" />Promote Students & New Session
        </button>
        <button onClick={() => setActiveAdminTab('courses')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeAdminTab === 'courses' ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-300' : 'text-emerald-800 hover:bg-emerald-50 border-2 border-emerald-300'}`}>
          <BookOpen className="w-4 h-4" />Allocate Courses<span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-black text-white">{courses.length}</span>
        </button>
        <button onClick={() => setActiveAdminTab('applicants')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeAdminTab === 'applicants' ? 'bg-purple-700 text-white shadow-md ring-2 ring-purple-300' : 'text-purple-800 hover:bg-purple-50 border-2 border-purple-300'}`}>
          <GraduationCap className="w-4 h-4" />All Applicants
        </button>
        <button onClick={() => setActiveAdminTab('settings')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeAdminTab === 'settings' ? 'bg-[#0a4d2e] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Sliders className="w-4 h-4 text-[#ca8a04]" />School Settings
        </button>
        <button onClick={() => setActiveAdminTab('management')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeAdminTab === 'management' ? 'bg-[#0a4d2e] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Users className="w-4 h-4 text-emerald-400" />Management Team
        </button>
        <button onClick={() => setActiveAdminTab('gallery')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeAdminTab === 'gallery' ? 'bg-[#0a4d2e] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Camera className="w-4 h-4 text-amber-400" />Photo Gallery
        </button>
        <button onClick={() => setActiveAdminTab('users')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeAdminTab === 'users' ? 'bg-[#0a4d2e] text-white ring-2 ring-emerald-300' : 'text-slate-600 hover:bg-slate-100 border-2'}`}>
          <UserCheck className="w-4 h-4 text-emerald-400" />Users & Roles - Create + Full Biodata<span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-700 text-white">{users.length}</span>
        </button>
        <button onClick={() => setActiveAdminTab('cbt')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeAdminTab === 'cbt' ? 'bg-[#0a4d2e] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Award className="w-4 h-4 text-amber-400" />CBT Tests
        </button>
        <button onClick={() => setActiveAdminTab('system')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeAdminTab === 'system' ? 'bg-[#0a4d2e] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Database className="w-4 h-4 text-emerald-400" />Sync & Health
        </button>
      </div>

      {/* BACKEND TAB */}
      {activeAdminTab === 'backend' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border-2 border-emerald-200 shadow-sm">
              <h3 className="font-black text-xs flex gap-2"><Database className="w-4 h-4 text-emerald-600"/> SUPABASE CONNECTION - FULL DATE</h3>
              <p className="text-[11px] mt-2 break-all bg-slate-50 p-2 rounded-lg border">{backendData.supabaseUrl}</p>
              <p className={`text-xs font-bold mt-2 px-3 py-1 rounded-full inline-block ${backendData.connected?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800'}`}>{backendData.connected?'● CONNECTED - Backend Active':'● NOT CONNECTED'}</p>
              <div className="mt-3 text-[11px] space-y-1"><p>Bucket: {SUPABASE_BUCKET}</p><p>Session: {currentSession}</p><p>Matric Year: {currentYear} - Auto changes to {parseInt(currentYear)+1} next session</p></div>
            </div>
            <div className="bg-white rounded-2xl p-5 border shadow-sm">
              <h3 className="font-black text-xs flex gap-2"><Table className="w-4 h-4"/> DATABASE TABLES - FULL COUNT</h3>
              <div className="mt-3 space-y-1 text-[11px] max-h-60 overflow-y-auto">
                {Object.entries(backendData.tables || {}).map(([table, count])=>(
                  <div key={table} className="flex justify-between bg-slate-50 px-3 py-1.5 rounded-lg border"><span className="font-bold">{table}</span><span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-black">{String(count)}</span></div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border shadow-sm">
              <h3 className="font-black text-xs flex gap-2"><Activity className="w-4 h-4"/> LIVE SYSTEM STATUS</h3>
              <div className="mt-3 text-[11px] space-y-2.5">
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg"><span>Backend</span><span className="font-black text-emerald-600">Online</span></div>
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg"><span>Users</span><span className="font-bold">{users.length} loaded</span></div>
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg"><span>Payments</span><span className="font-bold">{payments.length} records</span></div>
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg"><span>Announcements</span><span className="font-bold">{announcements.length+events.length}</span></div>
                <div className="flex justify-between bg-amber-50 p-2 rounded-lg border border-amber-200"><span>Application</span><span className={`font-black ${appStatus.isOpen?'text-emerald-700':'text-red-700'}`}>{appStatus.isOpen?'OPEN':'CLOSED'}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeAdminTab === 'application' && (
        <div className="space-y-6">
          <div className={`rounded-3xl p-6 border-2 shadow-lg ${appStatus.isOpen?'bg-emerald-50 border-emerald-300':'bg-red-50 border-red-300'}`}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-black flex gap-2">{appStatus.isOpen?<Link2 className="w-6 h-6 text-emerald-600"/>:<Link2Off className="w-6 h-6 text-red-600"/>} ADMIN TO CLOSE / OPEN ONLINE APPLICATION LINK</h2>
                <div className={`mt-4 inline-flex px-5 py-2.5 rounded-xl font-black text-sm shadow-md ${appStatus.isOpen?'bg-emerald-600 text-white':'bg-red-600 text-white'}`}>{appStatus.isOpen ? '● APPLICATION IS OPEN - Students can apply at /apply' : '● APPLICATION IS CLOSED - Applicants blocked'}</div>
              </div>
              <button onClick={toggleApplication} className={`px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl ${appStatus.isOpen?'bg-red-600 hover:bg-red-700 text-white':'bg-emerald-600 hover:bg-emerald-700 text-white'}`}><>{appStatus.isOpen ? <><Link2Off className="w-5 h-5"/> CLOSE APPLICATION LINK NOW</> : <><Power className="w-5 h-5"/> OPEN APPLICATION LINK NOW</>}</></button>
            </div>
          </div>
          <div className="bg-white rounded-3xl border-2 p-6 space-y-4 shadow-sm">
            <h3 className="font-black text-sm">Edit Application Link Settings</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="text-xs font-bold">Application Link URL</label><input value={appStatus.link} onChange={e=>setAppStatus({...appStatus, link: e.target.value})} className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs font-bold"/></div>
              <div><label className="text-xs font-bold">Deadline Date</label><input type="date" value={appStatus.deadline} onChange={e=>setAppStatus({...appStatus, deadline: e.target.value})} className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs"/></div>
              <div className="md:col-span-2"><label className="text-xs font-bold">Message When Closed</label><textarea value={appStatus.message} onChange={e=>setAppStatus({...appStatus, message: e.target.value})} className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs h-20"/></div>
            </div>
            <button onClick={saveAppSettings} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black flex gap-2"><CheckCircle2 className="w-4 h-4"/> SAVE & PUBLISH LIVE</button>
          </div>
        </div>
      )}

      {activeAdminTab === 'announcements' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-700 via-purple-700 to-emerald-700 text-white rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-black flex gap-2"><Megaphone className="w-6 h-6"/> ADMIN TO PUBLISH ONLINE ANNOUNCEMENT / EVENT - FIXED BLANK!</h2>
            <p className="text-xs text-blue-100 mt-2">Was blank before - Now fixed - Publish shows on homepage instantly!</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border-2 border-blue-200 p-6 space-y-4 shadow-sm">
              <h3 className="font-black text-sm flex gap-2"><Bell className="w-4 h-4 text-blue-600"/> PUBLISH ANNOUNCEMENT</h3>
              <form onSubmit={publishAnnouncement} className="space-y-3">
                <input value={annForm.title} onChange={e=>setAnnForm({...annForm, title: e.target.value})} placeholder="Title" className="w-full px-4 py-2.5 border-2 rounded-xl text-xs font-bold"/>
                <select value={annForm.type} onChange={e=>setAnnForm({...annForm, type: e.target.value})} className="w-full px-4 py-2.5 border-2 rounded-xl text-xs"><option value="announcement">Announcement</option><option value="news">News</option><option value="urgent">Urgent</option><option value="admission">Admission</option></select>
                <textarea value={annForm.message} onChange={e=>setAnnForm({...annForm, message: e.target.value})} placeholder="Message" className="w-full px-4 py-2.5 border-2 rounded-xl text-xs h-24"/>
                <button type="submit" className="w-full py-3 bg-blue-700 text-white rounded-xl text-xs font-black flex justify-center gap-2"><Send className="w-4 h-4"/> PUBLISH ANNOUNCEMENT LIVE</button>
              </form>
            </div>
            <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 space-y-4 shadow-sm">
              <h3 className="font-black text-sm flex gap-2"><Calendar className="w-4 h-4 text-emerald-600"/> PUBLISH EVENT</h3>
              <form onSubmit={publishEvent} className="space-y-3">
                <input value={eventForm.title} onChange={e=>setEventForm({...eventForm, title: e.target.value})} placeholder="Event Title" className="w-full px-4 py-2.5 border-2 rounded-xl text-xs font-bold"/>
                <div className="grid grid-cols-2 gap-3"><input type="date" value={eventForm.date} onChange={e=>setEventForm({...eventForm, date: e.target.value})} className="w-full px-4 py-2.5 border-2 rounded-xl text-xs"/><input value={eventForm.location} onChange={e=>setEventForm({...eventForm, location: e.target.value})} placeholder="Location" className="w-full px-4 py-2.5 border-2 rounded-xl text-xs"/></div>
                <textarea value={eventForm.description} onChange={e=>setEventForm({...eventForm, description: e.target.value})} placeholder="Description" className="w-full px-4 py-2.5 border-2 rounded-xl text-xs h-24"/>
                <button type="submit" className="w-full py-3 bg-emerald-700 text-white rounded-xl text-xs font-black flex justify-center gap-2"><Calendar className="w-4 h-4"/> PUBLISH EVENT LIVE</button>
              </form>
            </div>
          </div>
          <div className="bg-white rounded-3xl border p-6 shadow-sm">
            <h3 className="font-black text-sm mb-4">PUBLISHED ON WEBSITE - Live ({announcements.length + events.length})</h3>
            <div className="grid gap-3">
              {[...announcements, ...events].map((item:any)=>(
                <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border"><div className="text-[11px] flex-1"><span className={`px-2 py-1 rounded-full text-[9px] font-black mr-2 ${item.type==='urgent'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>{(item.type||'EVENT').toUpperCase()}</span><span className="font-bold">{item.title}</span></div><button onClick={()=>deleteAnnouncement(item.id)} className="bg-red-600 text-white p-2 rounded-lg ml-2"><Trash2 className="w-3.5 h-3.5"/></button></div>
              ))}
              {announcements.length===0 && events.length===0 && <p className="text-xs text-center py-8 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed">No announcements yet - Use forms above - Blank fixed!</p>}
            </div>
          </div>
        </div>
      )}

      {activeAdminTab === 'bursar' && (
        <div className="bg-white rounded-3xl border-2 p-6 shadow-sm">
          <h2 className="font-black text-lg flex gap-2 mb-4"><DollarSign className="w-5 h-5 text-emerald-600"/> BURSAR - PAYMENTS - DELETE PAYMENT</h2>
          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs"><thead><tr className="bg-emerald-900 text-white text-[11px] uppercase"><th className="p-3 text-left">Student</th><th className="p-3">Amount</th><th className="p-3">Type</th><th className="p-3">Status</th><th className="p-3">Delete</th></tr></thead><tbody>{payments.length>0 ? payments.map((p:any)=><tr key={p.id} className="border-b"><td className="p-3 font-bold">{p.student_name||p.email||'N/A'}</td><td className="p-3 font-black">₦{p.amount||0}</td><td className="p-3">{p.payment_type||'Fee'}</td><td className="p-3">{p.status||'pending'}</td><td className="p-3"><button onClick={()=>deletePayment(p.id)} className="bg-red-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black">DELETE PAYMENT</button></td></tr>) : <tr><td colSpan={5} className="p-6 text-center text-slate-500">No payments yet - Bursar can delete here</td></tr>}</tbody></table>
          </div>
        </div>
      )}

      {/* USERS TAB - ADDED CREATE USER WITH FULL BIODATA + AUTO MATRIC - NOT SCATTERED */}
      {activeAdminTab === 'users' && (
        <div className="bg-white rounded-3xl border-2 p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h3 className="font-black text-lg flex gap-2"><UserCheck className="w-5 h-5"/> Users Information - CREATE USER + FULL BIODATA + AUTO MATRIC</h3>
              <p className="text-[11px] text-slate-600 mt-1">Full Biodata: Full Names, Address, Phone, Blood Group, Sex, Parent Name/Phone, Email, Hostel/Off-Campus, Level ND1/ND2/HND1/HND2 → Auto Matric LCNS\ND\{currentYear}\002 → Auto {parseInt(currentYear)+1} next session → Never repeats unless deleted!</p>
            </div>
            <button onClick={()=>setShowCreateUser(!showCreateUser)} className="px-6 py-3 bg-[#0a4d2e] hover:bg-black text-white rounded-xl text-xs font-black flex gap-2 shadow-md"><UserPlus className="w-4 h-4"/> {showCreateUser ? 'CLOSE FORM' : '+ CREATE NEW STUDENT'}</button>
          </div>

          {showCreateUser && (
            <div className="bg-gradient-to-br from-slate-50 to-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 space-y-4">
              <h4 className="font-black text-sm flex gap-2"><Hash className="w-4 h-4"/> CREATE STUDENT - FULL BIODATA + AUTO MATRIC LCNS\LEVEL\YEAR\NUMBER</h4>
              <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-[11px]">
                <p className="font-bold">Preview: LCNS\{newUser.level || 'ND1'}\{currentYear}\XXX → Example: LCNS\ND1\{currentYear}\002 - Session {currentSession} → Next session {parseInt(currentYear)+1}/{parseInt(currentYear)+2} will auto LCNS\ND1\{parseInt(currentYear)+1}\XXX</p>
                <p className="mt-1">Counter per level per year - Never repeats - Only if deleted from portal, matric freed!</p>
              </div>
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3"><label className="text-[11px] font-black flex gap-1"><User className="w-3 h-3"/> Full Names *</label><input value={newUser.fullName} onChange={e=>setNewUser({...newUser, fullName: e.target.value})} placeholder="Terna James Fiase - Full name" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs font-bold" required/></div>
                <div><label className="text-[11px] font-bold">First Name</label><input value={newUser.firstName} onChange={e=>setNewUser({...newUser, firstName: e.target.value})} placeholder="First Name" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs"/></div>
                <div><label className="text-[11px] font-bold">Middle Name</label><input value={newUser.middleName} onChange={e=>setNewUser({...newUser, middleName: e.target.value})} placeholder="Middle Name" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs"/></div>
                <div><label className="text-[11px] font-bold">Last Name</label><input value={newUser.lastName} onChange={e=>setNewUser({...newUser, lastName: e.target.value})} placeholder="Last Name" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs"/></div>
                <div className="md:col-span-2"><label className="text-[11px] font-bold flex gap-1"><MapPin className="w-3 h-3"/> Address *</label><input value={newUser.address} onChange={e=>setNewUser({...newUser, address: e.target.value})} placeholder="No 10 Gboko Road, Makurdi" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs" required/></div>
                <div><label className="text-[11px] font-bold flex gap-1"><Phone className="w-3 h-3"/> Phone Number *</label><input value={newUser.phone} onChange={e=>setNewUser({...newUser, phone: e.target.value})} placeholder="080..." className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs" required/></div>
                <div><label className="text-[11px] font-bold flex gap-1"><Droplet className="w-3 h-3"/> Blood Group</label><select value={newUser.bloodGroup} onChange={e=>setNewUser({...newUser, bloodGroup: e.target.value})} className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs"><option value="">Select</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select></div>
                <div><label className="text-[11px] font-bold">Sex *</label><select value={newUser.sex} onChange={e=>setNewUser({...newUser, sex: e.target.value})} className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs" required><option value="">Select Sex</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                <div><label className="text-[11px] font-bold flex gap-1"><Home className="w-3 h-3"/> Hostel/Off-Campus *</label><select value={newUser.staying} onChange={e=>setNewUser({...newUser, staying: e.target.value})} className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs" required><option value="">Select</option><option value="hostel">Hostel</option><option value="offcampus">Off-Campus (Off-Came)</option></select></div>
                <div className="md:col-span-2"><label className="text-[11px] font-bold">Parent/Guardian Name *</label><input value={newUser.parentName} onChange={e=>setNewUser({...newUser, parentName: e.target.value})} placeholder="Parent Full Name" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs" required/></div>
                <div><label className="text-[11px] font-bold">Parent Phone *</label><input value={newUser.parentPhone} onChange={e=>setNewUser({...newUser, parentPhone: e.target.value})} placeholder="Parent Phone" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs" required/></div>
                <div><label className="text-[11px] font-bold">Email *</label><input type="email" value={newUser.email} onChange={e=>setNewUser({...newUser, email: e.target.value})} placeholder="student@email.com" className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs" required/></div>
                <div><label className="text-[11px] font-bold">Level * ND1,ND2,HND1,HND2</label><select value={newUser.level} onChange={e=>setNewUser({...newUser, level: e.target.value})} className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs font-bold" required><option value="">Select Level</option><option value="ND1">ND1</option><option value="ND2">ND2 (N2)</option><option value="HND1">HND1</option><option value="HND2">HND2</option></select></div>
                <div><label className="text-[11px] font-bold">Role</label><select value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})} className="w-full mt-1 px-4 py-2.5 border-2 rounded-xl text-xs"><option value="STUDENT">STUDENT</option><option value="LECTURER">LECTURER</option><option value="PROVOST">PROVOST</option><option value="BURSAR">BURSAR</option><option value="ADMIN">ADMIN</option></select></div>
                <div className="md:col-span-3 flex gap-3 pt-2"><button type="submit" className="flex-1 py-3 bg-[#0a4d2e] text-white rounded-xl text-xs font-black flex justify-center gap-2"><UserPlus className="w-4 h-4"/> CREATE STUDENT + AUTO MATRIC {`LCNS\\${newUser.level || 'LEVEL'}\\${currentYear}\\XXX`}</button><button type="button" onClick={()=>setShowCreateUser(false)} className="px-6 py-3 bg-slate-200 rounded-xl text-xs font-bold">CANCEL</button></div>
              </form>
            </div>
          )}

          <div className="grid gap-3">
            {users.map((u:any) => (
              <div key={u.email} className="flex flex-col md:flex-row justify-between border-2 p-3 rounded-2xl text-xs gap-3 bg-slate-50 hover:bg-white shadow-sm">
                <div className="flex-1">
                  <div className="font-black text-sm flex flex-wrap gap-2 items-center"><span>{u.fullName || u.name || 'No Name'}</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 text-white">{u.matricNumber || u.id?.slice(0,8) || 'No Matric'}</span><span className={`px-2 py-0.5 rounded-full text-[10px] ${u.role==='ADMIN'?'bg-red-100 text-red-800':'bg-slate-200'}`}>{u.role}</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100">{u.level || 'No Level'}</span></div>
                  <div className="text-[11px] text-slate-600 mt-1 grid grid-cols-2 md:grid-cols-4 gap-1"><span>Email: {u.email}</span><span>Phone: {u.phone || 'N/A'}</span><span>Sex: {u.sex || 'N/A'} | Blood: {u.bloodGroup || 'N/A'}</span><span>Hostel: {u.staying || 'N/A'}</span><span className="md:col-span-2">Address: {u.address || 'N/A'}</span><span>Parent: {u.parentName || 'N/A'}</span><span>Parent Phone: {u.parentPhone || 'N/A'}</span></div>
                </div>
                <div className="flex flex-wrap gap-1.5 items-center">
                  <button onClick={()=>assignRole(u.email, 'provost')} className="px-2.5 py-1.5 bg-amber-600 text-white rounded-xl text-[10px] font-black">PROVOST</button>
                  <button onClick={()=>assignRole(u.email, 'bursar')} className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black">BURSAR</button>
                  <button onClick={()=>assignRole(u.email, 'admin')} className="px-2.5 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black">ADMIN</button>
                  <button onClick={()=>deleteUser(u.email, u.fullName||u.email, u.matricNumber)} className="px-2.5 py-1.5 bg-red-600 text-white rounded-xl text-[10px] font-black flex gap-1"><Trash2 className="w-3 h-3"/> DELETE</button>
                </div>
              </div>
            ))}
            {users.length===0 && <p className="text-xs text-center py-8 bg-red-50 border-2 border-dashed rounded-xl">No users - Click CREATE NEW STUDENT - Matric auto LCNS\ND\{currentYear}\002 - Year auto {parseInt(currentYear)+1} next session!</p>}
          </div>
        </div>
      )}

      {activeAdminTab === 'promotion' && <StudentPromotion />}
      {activeAdminTab === 'settings' && <AdminSettings />}
      {activeAdminTab === 'management' && <AdminManagement />}
      {activeAdminTab === 'gallery' && <AdminGallery />}
      {activeAdminTab === 'cbt' && <CBTExamManager currentUser={{id:'admin',email:'admin@lcns.edu.ng',role:'ADMIN',fullName:'Admin',status:'ACTIVE'}} />}
      {activeAdminTab === 'courses' && (
        <div className="bg-white rounded-3xl border-2 p-4">
          <h2 className="font-black">📚 Course Allocation - {courses.length} Courses - {lecturers.length} Lecturers</h2>
          <div className="overflow-x-auto border-2 rounded-xl mt-3">
            <table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">Code</th><th className="p-2">Title</th><th className="p-2">Lecturer</th></tr></thead><tbody>{courses.map((c:any)=><tr key={c.id} className="border-b"><td className="p-2 font-mono font-black">{c.code}</td><td className="p-2">{c.title}</td><td className="p-2">{c.lecturer}</td></tr>)}</tbody></table>
          </div>
        </div>
      )}
      {activeAdminTab === 'applicants' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">🎓 All Applicants Records - App Status: {appStatus.isOpen?'OPEN':'CLOSED'}</div>
          <AdminAdmissionManager currentUser={{id:'admin',email:'admin@lcns.edu.ng',role:'ADMIN',fullName:'Admin - Director of ICT',status:'ACTIVE'}} />
        </div>
      )}
      {activeAdminTab === 'system' && (
        <div className="bg-white rounded-3xl border-2 p-6 text-xs shadow-sm space-y-3">
          <h3 className="font-black text-sm flex gap-2"><Database className="w-4 h-4"/> System Health & Backend - Full Data</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border space-y-2">
              <p><span className="font-bold">Session:</span> {currentSession} - Year for Matric: {currentYear}</p>
              <p><span className="font-bold">Users:</span> {users.length}</p>
              <p><span className="font-bold">Bucket:</span> {SUPABASE_BUCKET}</p>
              <p><span className="font-bold">Matric Counters:</span> {Object.keys(JSON.parse(localStorage.getItem('lcns_matric_counters')||'{}')).length} levels - Never repeats unless deleted</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border">
              <p className="font-bold mb-2">All Tables Count:</p>
              {Object.entries(backendData.tables||{}).map(([k,v])=><div key={k} className="flex justify-between py-1 border-b text-[11px]"><span>{k}</span><span className="font-black">{String(v)}</span></div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
