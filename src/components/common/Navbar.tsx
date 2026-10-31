import React, { useState, useEffect } from 'react';
import { CollegeLogo } from './CollegeLogo';
import { COLLEGE_CONFIG, User, UserRole } from '../../types';
import { StorageService } from '../../services/storage';
import {
  GraduationCap, LogIn, LogOut, Phone, Mail, ChevronDown, LayoutDashboard,
  CheckCircle2, FileText, Sparkles, Menu, X, Megaphone, Trash2, Plus, Eye, EyeOff,
  Lock, Unlock, Calendar
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenApplication: () => void;
  onOpenAdmissionChecker: () => void;
  activeView: 'website' | 'portal';
  setActiveView: (view: 'website' | 'portal') => void;
}

interface Announcement { id: string; title: string; message: string; type: string; isActive: boolean; showInMarquee: boolean; createdAt: string; }
interface AdmissionSettings { isOpen: boolean; session: string; closedMessage: string; updatedAt: string; }

export const Navbar: React.FC<NavbarProps> = ({
  currentUser, onOpenLogin, onOpenApplication, onOpenAdmissionChecker, activeView, setActiveView,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'announce'|'admission'>('announce');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState(''); const [message, setMessage] = useState(''); const [annType, setAnnType] = useState('announcement');
  
  const [admissionSettings, setAdmissionSettings] = useState<AdmissionSettings>({
    isOpen: false, session: '2026/2027', closedMessage: 'Admission is CLOSED for 2026/2027 Academic Session. School resumes November, 2026 for first and new academic year. Contact: info@lcns.edu.ng | ict.lcns@lcns.edu.ng - portal.lcns.edu.ng', updatedAt: new Date().toISOString()
  });
  const [newSession, setNewSession] = useState('2026/2027');
  const [closedMsg, setClosedMsg] = useState('Admission is CLOSED for 2026/2027 Academic Session. School resumes November, 2026 for first and new academic year. Contact: info@lcns.edu.ng | ict.lcns@lcns.edu.ng');

  const ANN_KEY = 'lcns_announcements'; const ADM_KEY = 'lcns_admission_settings';

  const loadAll = () => {
    try { setAnnouncements(JSON.parse(localStorage.getItem(ANN_KEY) || '[]')); } catch { setAnnouncements([]); }
    try {
      const adm = JSON.parse(localStorage.getItem(ADM_KEY) || 'null');
      if(adm){ setAdmissionSettings(adm); setNewSession(adm.session); setClosedMsg(adm.closedMessage); }
      else {
        const defaultClosed: AdmissionSettings = {
          isOpen: false, session: '2026/2027',
          closedMessage: 'Admission is CLOSED for 2026/2027 Academic Session. School resumes November, 2026. Contact: info@lcns.edu.ng | ict.lcns@lcns.edu.ng',
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(ADM_KEY, JSON.stringify(defaultClosed));
        setAdmissionSettings(defaultClosed);
      }
    } catch {}
  };
  useEffect(() => { loadAll(); const h=()=>loadAll(); window.addEventListener('announcements-updated', h); window.addEventListener('storage', h); window.addEventListener('admission-updated', h); return ()=>{ window.removeEventListener('announcements-updated', h); window.removeEventListener('storage', h); window.removeEventListener('admission-updated', h); }; }, []);

  const saveAnn = (list: Announcement[]) => { localStorage.setItem(ANN_KEY, JSON.stringify(list)); setAnnouncements(list); window.dispatchEvent(new Event('announcements-updated')); };
  const saveAdmission = (settings: AdmissionSettings) => { localStorage.setItem(ADM_KEY, JSON.stringify(settings)); setAdmissionSettings(settings); window.dispatchEvent(new Event('admission-updated')); };

  const handleCreateAnn = () => {
    if(!title.trim() || !message.trim()) return alert('Enter title and message');
    const newItem: Announcement = { id: 'ANC-'+Date.now(), title: title.trim(), message: message.trim(), type: annType, isActive: true, showInMarquee: true, createdAt: new Date().toISOString() };
    saveAnn([newItem, ...announcements]); setTitle(''); setMessage(''); alert('Published!');
  };
  const handleDelete = (id: string) => { if(!confirm('Delete?')) return; saveAnn(announcements.filter(a=>a.id!==id)); };
  const handleToggle = (id: string) => { saveAnn(announcements.map(a=>a.id===id?{...a, isActive:!a.isActive}:a)); };

  const handleToggleAdmission = () => {
    const updated: AdmissionSettings = { ...admissionSettings, isOpen: !admissionSettings.isOpen, session: newSession, closedMessage: closedMsg || admissionSettings.closedMessage, updatedAt: new Date().toISOString() };
    saveAdmission(updated);
    alert(updated.isOpen ? `Admission OPENED for ${updated.session}` : `Admission CLOSED for ${updated.session} - Resumption Nov 2026`);
  };
  const handleUpdateSession = () => {
    if(!newSession.trim()) return alert('Enter session e.g. 2026/2027');
    const updated: AdmissionSettings = { ...admissionSettings, session: newSession.trim(), closedMessage: closedMsg.trim() || admissionSettings.closedMessage, updatedAt: new Date().toISOString() };
    saveAdmission(updated); alert(`Session updated to ${updated.session}`);
  };

  // ✅ FIXED: NOW BLOCKS WHEN CLOSED
  const handleApplyClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!admissionSettings.isOpen) {
      alert(`⛔ ${admissionSettings.closedMessage}\n\nAdmission is CLOSED for ${admissionSettings.session} - Resumption November 2026.\n\nExisting applicants can still use Check Admission Status.\n\nContact: info@lcns.edu.ng | ict.lcns@lcns.edu.ng`);
      return;
    }
    console.log("✅ Apply clicked - opening application for", admissionSettings.session);
    setMobileOpen(false);
    setShowRoleMenu(false);
    try {
      if (typeof onOpenApplication === 'function') {
        onOpenApplication();
      } else {
        console.error("onOpenApplication is not a function!", onOpenApplication);
        alert("Application handler not connected. Please check App.tsx - onOpenApplication prop is missing!");
      }
    } catch (err) {
      console.error("Failed to open application", err);
      alert("Error opening application form. Check console (F12).");
    }
  };

  const activeMarquee = announcements.filter(a => a.isActive && a.showInMarquee);
  const canManage = currentUser && ['ADMIN','PROVOST','REGISTRAR','ADMISSION_OFFICER'].includes(currentUser.role);

  const handleRoleQuickSwitch = (role: UserRole) => { const users = StorageService.getUsers(); const target = users.find(u=>u.role===role); if(target){ const {password:_,...safe}=target; StorageService.setCurrentUser(safe as User); setActiveView('portal'); setShowRoleMenu(false); setMobileOpen(false);} };
  const handleLogout = () => { StorageService.setCurrentUser(null); setActiveView('website'); window.history.pushState({}, '', '/'); };
  
  const scrollToId = (id: string) => { 
    setMobileOpen(false); 
    setActiveView('website'); 
    setTimeout(()=>{
      const el=document.getElementById(id); 
      if(el){ 
        const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({top: y, behavior:'smooth'});
      } 
    },100); 
  };
  
  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'ADMIN', label: 'ICT Administrator', desc: 'System config' }, { role: 'PROVOST', label: 'College Provost', desc: 'Executive oversight' },
    { role: 'REGISTRAR', label: 'Academic Registrar', desc: 'Student records' }, { role: 'ADMISSION_OFFICER', label: 'Admission Officer', desc: 'Screening' },
    { role: 'EXAM_OFFICER', label: 'Examination Officer', desc: 'Broadsheets' }, { role: 'HOD', label: 'HOD Nursing', desc: 'Curriculum' },
    { role: 'LECTURER', label: 'Course Lecturer', desc: 'Scores' }, { role: 'BURSAR', label: 'College Bursar', desc: 'Fees' },
    { role: 'STUDENT', label: 'Nursing Student', desc: 'Grades' }, { role: 'APPLICANT', label: 'Prospective Applicant', desc: 'Admission status' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a4d2e] text-white shadow-md border-b border-[#06321e] no-print">
      <div className="bg-[#06321e] text-emerald-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium"><Mail className="w-3.5 h-3.5 text-[#22c55e]" /><a href="mailto:info@lcns.edu.ng" className="hover:text-emerald-200">info@lcns.edu.ng</a></span>
          <span className="hidden sm:inline text-emerald-400/50">&bull;</span>
          <span className="flex items-center gap-1.5 font-medium"><Phone className="w-3.5 h-3.5 text-[#22c55e]" />Support: 08126799565 ICT | ict.lcns@lcns.edu.ng</span>
          <span className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${admissionSettings.isOpen?'bg-green-500 text-black':'bg-red-500 text-white'}`}><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>{admissionSettings.isOpen?`ADMISSION OPEN ${admissionSettings.session}`:`ADMISSION CLOSED ${admissionSettings.session}`}</span>
        </div>
        <div className="relative ml-auto flex items-center gap-2">
          {canManage && (
            <button type="button" onClick={()=>{setShowAnnounceModal(true); setActiveTab('admission');}} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black ${admissionSettings.isOpen?'bg-green-400 text-black':'bg-red-400 text-black'}`}>
              {admissionSettings.isOpen?<Unlock className="w-3 h-3"/>:<Lock className="w-3 h-3"/>} {admissionSettings.isOpen?'OPEN':'CLOSED'}: {admissionSettings.session}
            </button>
          )}
          {canManage && <button type="button" onClick={()=>{setShowAnnounceModal(true); setActiveTab('announce');}} className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black px-3 py-1 rounded-full text-[11px] font-black"><Megaphone className="w-3 h-3"/> Announce ({announcements.length})</button>}
          <button type="button" onClick={() => setShowRoleMenu(!showRoleMenu)} className="flex items-center gap-1.5 bg-[#06321e] hover:bg-[#042114] text-white px-2.5 py-0.5 rounded text-[11px] font-semibold border border-[#22c55e]/30"><Sparkles className="w-3 h-3 text-[#ca8a04] animate-pulse"/>Switch Role<ChevronDown className="w-3 h-3 opacity-75"/></button>
          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border p-2 text-slate-800 z-50">
              <div className="p-2 text-xs font-bold text-emerald-900 uppercase">Select Role</div>
              <div className="max-h-80 overflow-y-auto py-1">{rolesList.map(r=>(<button key={r.role} type="button" onClick={()=>handleRoleQuickSwitch(r.role)} className={`w-full text-left px-3 py-2 text-xs rounded-lg flex justify-between ${currentUser?.role===r.role?'bg-emerald-50 font-bold':'hover:bg-slate-50'}`}><div><div className="font-semibold">{r.label}</div><div className="text-[10px] text-slate-500">{r.desc}</div></div>{currentUser?.role===r.role&&<CheckCircle2 className="w-4 h-4 text-emerald-600"/>}</button>))}</div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#ca8a04] py-1.5 overflow-hidden whitespace-nowrap border-b-2 border-black">
        <div className="animate-marquee-fast flex items-center gap-12">
          {!admissionSettings.isOpen && <><span className="font-black text-red-900 bg-white px-2 rounded text-[13px]">🚫 ADMISSION CLOSED FOR {admissionSettings.session} - RESUMPTION NOVEMBER 2026 🚫</span><span className="font-black text-black text-[13px]">•</span></>}
          {admissionSettings.isOpen && <><span className="font-black text-black bg-green-200 px-2 rounded text-[13px]">✅ ADMISSION OPEN {admissionSettings.session} - APPLY NOW ✅</span><span className="font-black text-black text-[13px]">•</span></>}
          {activeMarquee.length>0 ? activeMarquee.map(a=>(<React.Fragment key={a.id}><span className="font-black text-black text-[13px]">🔔 {a.title.toUpperCase()}: {a.message.toUpperCase()}</span><span className="font-black text-black text-[13px]">•</span></React.Fragment>)) : (<><span className="font-black text-black text-[13px]">🔔 Labe College of Nursing Sciences, Catholic Diocese of Gboko, Benue State</span><span className="font-black text-black text-[13px]">•</span><span className="font-black text-black text-[13px]">ADMISSION CLOSED FOR {admissionSettings.session} - RESUMPTION NOV 2026</span><span className="font-black text-black text-[13px]">•</span><span className="font-black text-black text-[13px]">CONTACT: INFO@LCNS.EDU.NG | ICT.LCNS@LCNS.EDU.NG</span><span className="font-black text-black text-[13px]">•</span><span className="font-black text-black text-[13px]">NMCN APPROVED • NBTE ACCREDITED</span></>)}
        </div>
      </div>

      <style>{`@keyframes marquee-fast {0%{transform:translateX(100%)}100%{transform:translateX(-100%)}} .animate-marquee-fast{display:inline-flex;animation:marquee-fast 15s linear infinite;min-width:200%} .animate-marquee-fast:hover{animation-play-state:paused}`}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button type="button" onClick={()=>{setActiveView('website'); window.scrollTo({top:0,behavior:'smooth'}); window.history.pushState({},'','/'); setMobileOpen(false);}} className="flex items-center gap-3 text-left group"><CollegeLogo size="md"/><div className="hidden sm:block"><span className="block font-black text-white text-[13px] sm:text-[15px] leading-tight uppercase tracking-tight group-hover:text-amber-300">Labe College of Nursing Sciences</span><span className="block text-[10px] sm:text-[11px] font-bold text-amber-300 uppercase">Catholic Diocese of Gboko, Benue State</span><span className="block text-[9px] font-semibold text-emerald-200 uppercase">Gboko • Learn, Serve & Save • {admissionSettings.session} • Resumption Nov 2026</span></div></button>
          <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-white/90">
            <button type="button" onClick={()=>{setActiveView('website'); window.scrollTo({top:0,behavior:'smooth'});}} className="hover:text-amber-300">Home</button>
            <button type="button" onClick={()=>scrollToId('about-college')} className="hover:text-amber-300 font-bold">About</button>
            <button type="button" onClick={()=>scrollToId('programmes')} className="hover:text-amber-300">Programmes</button>
            <button type="button" onClick={()=>scrollToId('gallery')} className="hover:text-amber-300 font-bold text-amber-300">Gallery</button>
            <button type="button" onClick={()=>scrollToId('facilities')} className="hover:text-amber-300">Facilities</button>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <button type="button" onClick={onOpenAdmissionChecker} className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-white/10 border border-white/20 rounded-lg"><FileText className="w-3.5 h-3.5 text-amber-300"/><span>Check Admission</span></button>
            <button type="button" onClick={handleApplyClick} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg shadow-sm bg-[#F59E0B] text-slate-950 hover:bg-amber-400 cursor-pointer" title={`Apply for ${admissionSettings.session} - ${admissionSettings.isOpen ? 'OPEN' : 'CLOSED'}`}>
              <GraduationCap className="w-4 h-4"/><span>Apply {admissionSettings.session}</span>
            </button>
            {currentUser ? (<div className="flex items-center gap-2"><button type="button" onClick={()=>setActiveView('portal')} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-[#0a4d2e]"><LayoutDashboard className="w-3 h-3"/><span className="hidden md:inline">Portal</span></button><button type="button" onClick={handleLogout} className="p-2 text-white/70 hover:text-red-300"><LogOut className="w-4 h-4"/></button></div>) : (<button type="button" onClick={onOpenLogin} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 rounded-lg"><LogIn className="w-3.5 h-3.5"/><span>Login</span></button>)}
            <button type="button" onClick={()=>setMobileOpen(!mobileOpen)} className="lg:hidden p-2 bg-white/10 rounded-lg">{mobileOpen?<X className="w-5 h-5"/>:<Menu className="w-5 h-5"/>}</button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-[#06321e] border-t px-4 py-4 space-y-1">
          <div className={`p-2 rounded-lg text-center text-xs font-black ${admissionSettings.isOpen?'bg-green-500 text-black':'bg-red-500 text-white'}`}>{admissionSettings.isOpen?`✅ ADMISSION OPEN ${admissionSettings.session}`:`🚫 ADMISSION CLOSED ${admissionSettings.session} - RESUMPTION NOV 2026`}</div>
          <button type="button" onClick={()=>{setActiveView('website'); window.scrollTo({top:0,behavior:'smooth'}); setMobileOpen(false);}} className="w-full text-left px-3 py-3 text-sm font-bold uppercase hover:bg-white/10 rounded-lg">Home</button>
          <button type="button" onClick={()=>scrollToId('about-college')} className="w-full text-left px-3 py-3 text-sm font-bold uppercase hover:bg-white/10 rounded-lg bg-[#0a4d2e] border border-[#22c55e]/20">About - Who We Are</button>
          <button type="button" onClick={()=>scrollToId('programmes')} className="w-full text-left px-3 py-3 text-sm font-bold uppercase hover:bg-white/10 rounded-lg">Programmes</button>
          <button type="button" onClick={()=>scrollToId('facilities')} className="w-full text-left px-3 py-3 text-sm font-bold uppercase hover:bg-white/10 rounded-lg">Facilities</button>
          <button type="button" onClick={()=>scrollToId('gallery')} className="w-full text-left px-3 py-3 text-sm font-bold uppercase bg-amber-500/20 text-amber-300 rounded-lg">Gallery</button>
          <div className="pt-3 border-t border-white/10 space-y-2">
            <button type="button" onClick={handleApplyClick} className="w-full py-3 text-xs font-black uppercase rounded-lg bg-amber-400 text-black cursor-pointer">Apply {admissionSettings.session}</button>
            <button type="button" onClick={()=>{setMobileOpen(false); onOpenAdmissionChecker();}} className="w-full py-3 text-xs font-bold uppercase bg-white/10 rounded-lg">Check Admission</button>
          </div>
        </div>
      )}

      {showAnnounceModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center bg-emerald-900 text-white rounded-t-xl">
              <h3 className="font-black flex items-center gap-2 text-sm"><Megaphone className="w-5 h-5"/> Admin Control Panel</h3>
              <button type="button" onClick={()=>setShowAnnounceModal(false)} className="bg-white/20 p-1.5 rounded"><X className="w-4 h-4"/></button>
            </div>
            <div className="flex border-b">
              <button type="button" onClick={()=>setActiveTab('admission')} className={`flex-1 py-3 text-xs font-black uppercase flex items-center justify-center gap-1.5 ${activeTab==='admission'?'bg-amber-100 text-black border-b-2 border-amber-500':'bg-slate-50 text-slate-600'}`}><Calendar className="w-4 h-4"/> Admission Open/Close</button>
              <button type="button" onClick={()=>setActiveTab('announce')} className={`flex-1 py-3 text-xs font-black uppercase flex items-center justify-center gap-1.5 ${activeTab==='announce'?'bg-emerald-100 text-black border-b-2 border-emerald-600':'bg-slate-50 text-slate-600'}`}><Megaphone className="w-4 h-4"/> Announcements</button>
            </div>
            {activeTab==='admission' ? (
              <div className="p-5 space-y-5">
                <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${admissionSettings.isOpen?'bg-green-50 border-green-300':'bg-red-50 border-red-300'}`}>
                  <div><p className="text-xs text-slate-500">Current Status</p><p className={`font-black text-lg ${admissionSettings.isOpen?'text-green-700':'text-red-700'}`}>{admissionSettings.isOpen?'✅ ADMISSION OPEN':'🚫 ADMISSION CLOSED'}</p><p className="text-sm font-bold">Session: {admissionSettings.session} - Resumption Nov 2026</p><p className="text-[10px] text-slate-500 mt-1">BUILD MODE: Apply button still opens for building portal</p></div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${admissionSettings.isOpen?'bg-green-500':'bg-red-500'}`}>{admissionSettings.isOpen?<Unlock className="w-6 h-6 text-white"/>:<Lock className="w-6 h-6 text-white"/>}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border space-y-3">
                  <label className="text-xs font-black uppercase">Admission Session Year</label>
                  <input value={newSession} onChange={e=>setNewSession(e.target.value)} placeholder="2026/2027" className="w-full px-3 py-2.5 border rounded-lg text-sm font-bold text-black"/>
                  <label className="text-xs font-black uppercase">Message When Closed</label>
                  <textarea value={closedMsg} onChange={e=>setClosedMsg(e.target.value)} placeholder="Admission is currently closed..." rows={2} className="w-full px-3 py-2 border rounded-lg text-sm text-black"/>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleUpdateSession} className="flex-1 bg-slate-800 text-white py-2.5 rounded-lg text-xs font-black uppercase">Update Session Year</button>
                    <button type="button" onClick={handleToggleAdmission} className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase ${admissionSettings.isOpen?'bg-red-600 text-white':'bg-green-600 text-white'}`}>{admissionSettings.isOpen?`🔒 CLOSE ${newSession}`:`🔓 OPEN ${newSession}`}</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div className="grid gap-3 bg-slate-50 p-4 rounded-xl border">
                  <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="px-3 py-2.5 border rounded-lg text-sm font-bold text-black"/>
                  <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Message..." rows={2} className="px-3 py-2 border rounded-lg text-sm text-black"/>
                  <div className="flex gap-2 flex-wrap items-center">
                    <select value={annType} onChange={e=>setAnnType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm text-black font-bold"><option value="announcement">📢 Announcement</option><option value="event">📅 Event</option><option value="admission">🎓 Admission</option><option value="urgent">🚨 Urgent</option></select>
                    <button type="button" onClick={handleCreateAnn} className="ml-auto bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-black flex items-center gap-1"><Plus className="w-4 h-4"/> Publish</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-sm">Published ({announcements.length})</h4>
                  {announcements.map(a=>(<div key={a.id} className="p-3 rounded-lg border bg-white flex justify-between gap-3"><div className="flex-1"><div className="flex gap-2 flex-wrap"><span className="text-[10px] font-black uppercase bg-black text-white px-1.5 rounded">{a.type}</span><span className="font-bold text-sm text-black">{a.title}</span></div><p className="text-xs text-slate-700 mt-1">{a.message}</p></div><div className="flex flex-col gap-1"><button type="button" onClick={()=>handleToggle(a.id)} className="p-2 bg-slate-100 rounded">{a.isActive?<Eye className="w-4 h-4"/>:<EyeOff className="w-4 h-4"/>}</button><button type="button" onClick={()=>handleDelete(a.id)} className="p-2 bg-red-100 text-red-600 rounded"><Trash2 className="w-4 h-4"/></button></div></div>))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
