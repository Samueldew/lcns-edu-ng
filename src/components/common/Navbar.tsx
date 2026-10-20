import React, { useState, useEffect } from 'react';
import { CollegeLogo } from './CollegeLogo';
import { COLLEGE_CONFIG, User, UserRole } from '../../types';
import { StorageService } from '../../services/storage';
import {
  GraduationCap, LogIn, LogOut, Phone, Mail, ChevronDown, LayoutDashboard,
  CheckCircle2, FileText, Sparkles, Menu, X, Megaphone, Trash2, Plus, Eye, EyeOff
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenApplication: () => void;
  onOpenAdmissionChecker: () => void;
  activeView: 'website' | 'portal';
  setActiveView: (view: 'website' | 'portal') => void;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  isActive: boolean;
  showInMarquee: boolean;
  createdAt: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser, onOpenLogin, onOpenApplication, onOpenAdmissionChecker, activeView, setActiveView,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [annType, setAnnType] = useState('announcement');

  const STORAGE_KEY = 'lcns_announcements';

  const loadAnnouncements = () => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setAnnouncements(data);
    } catch { setAnnouncements([]); }
  };

  useEffect(() => {
    loadAnnouncements();
    const handler = () => loadAnnouncements();
    window.addEventListener('announcements-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('announcements-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const saveAll = (list: Announcement[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setAnnouncements(list);
    window.dispatchEvent(new Event('announcements-updated'));
  };

  const handleCreate = () => {
    if(!title.trim() || !message.trim()) return alert('Enter title and message');
    const newItem: Announcement = {
      id: 'ANC-' + Date.now(),
      title: title.trim(),
      message: message.trim(),
      type: annType,
      isActive: true,
      showInMarquee: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...announcements];
    saveAll(updated);
    setTitle(''); setMessage('');
    alert('Published! It will now show in moving bar');
  };

  const handleDelete = (id: string) => {
    if(!confirm('Delete this announcement?')) return;
    saveAll(announcements.filter(a => a.id !== id));
  };

  const handleToggle = (id: string) => {
    saveAll(announcements.map(a => a.id === id ? {...a, isActive: !a.isActive} : a));
  };

  const activeMarquee = announcements.filter(a => a.isActive && a.showInMarquee);
  const canManage = currentUser && ['ADMIN','PROVOST','REGISTRAR','ADMISSION_OFFICER'].includes(currentUser.role);

  const handleRoleQuickSwitch = (role: UserRole) => {
    const users = StorageService.getUsers();
    const target = users.find((u) => u.role === role);
    if (target) {
      const { password: _, ...safeUser } = target;
      StorageService.setCurrentUser(safeUser as User);
      setActiveView('portal');
      setShowRoleMenu(false);
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setActiveView('website');
    window.history.pushState({}, '', '/');
  };

  const scrollToId = (id: string) => {
    setMobileOpen(false);
    setActiveView('website');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); window.history.pushState({}, '', `/#${id}`); }
      else { window.location.hash = id; }
    }, 100);
  };

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'ADMIN', label: 'ICT Administrator', desc: 'System config & Supabase' },
    { role: 'PROVOST', label: 'College Provost', desc: 'Executive oversight' },
    { role: 'REGISTRAR', label: 'Academic Registrar', desc: 'Student records' },
    { role: 'ADMISSION_OFFICER', label: 'Admission Officer', desc: 'Screening & admission' },
    { role: 'EXAM_OFFICER', label: 'Examination Officer', desc: 'Broadsheets & GPA' },
    { role: 'HOD', label: 'HOD Nursing Sciences', desc: 'Curriculum' },
    { role: 'LECTURER', label: 'Course Lecturer', desc: 'CA & Exam scores' },
    { role: 'BURSAR', label: 'College Bursar', desc: 'Fees & receipts' },
    { role: 'STUDENT', label: 'Nursing Student', desc: 'Grades & ID card' },
    { role: 'APPLICANT', label: 'Prospective Applicant', desc: 'Admission status' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a4d2e] text-white shadow-md border-b border-[#06321e] no-print">
      <div className="bg-[#06321e] text-emerald-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-[#042114]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium"><Mail className="w-3.5 h-3.5 text-[#22c55e]" /><a href="mailto:info@lcns.edu.ng" className="hover:text-emerald-200">{COLLEGE_CONFIG.OFFICIAL_EMAIL}</a></span>
          <span className="hidden sm:inline text-emerald-400/50">&bull;</span>
          <span className="flex items-center gap-1.5 font-medium"><Phone className="w-3.5 h-3.5 text-[#22c55e]" />Support: {COLLEGE_CONFIG.SUPPORT_PHONE}</span>
        </div>
        <div className="relative ml-auto flex items-center gap-2">
          {canManage && (
            <button onClick={()=>setShowAnnounceModal(true)} className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black px-3 py-1 rounded-full text-[11px] font-black">
              <Megaphone className="w-3 h-3"/> Publish Announcement ({announcements.length})
            </button>
          )}
          <button onClick={() => setShowRoleMenu(!showRoleMenu)} className="flex items-center gap-1.5 bg-[#06321e] hover:bg-[#042114] text-white px-2.5 py-0.5 rounded text-[11px] font-semibold border border-[#22c55e]/30">
            <Sparkles className="w-3 h-3 text-[#ca8a04] animate-pulse" />Switch Role<ChevronDown className="w-3 h-3 opacity-75" />
          </button>
          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 text-slate-800 z-50">
              <div className="p-2 text-xs font-bold text-emerald-900 uppercase">Select Portal Role</div>
              <div className="max-h-80 overflow-y-auto py-1">
                {rolesList.map((r) => (
                  <button key={r.role} onClick={() => handleRoleQuickSwitch(r.role)} className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between ${currentUser?.role === r.role ? 'bg-emerald-50 font-bold' : 'hover:bg-slate-50'}`}>
                    <div><div className="font-semibold text-slate-900">{r.label}</div><div className="text-[10px] text-slate-500">{r.desc}</div></div>
                    {currentUser?.role === r.role && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DYNAMIC MOVING BAR - DARK BLACK BOLD */}
      <div className="bg-[#ca8a04] py-1.5 overflow-hidden whitespace-nowrap border-b-2 border-black">
        <div className="animate-marquee-fast flex items-center gap-12">
          {activeMarquee.length > 0 ? (
            activeMarquee.map((a) => (
              <React.Fragment key={a.id}>
                <span className="font-black text-black text-[13px]">🔔 {a.title.toUpperCase()}: {a.message.toUpperCase()}</span>
                <span className="font-black text-black text-[13px]">•</span>
              </React.Fragment>
            ))
          ) : (
            <>
              <span className="font-black text-black text-[13px]">🔔 Labe College of Nursing Sciences, Catholic Diocese of Gboko, Benue State</span>
              <span className="font-black text-black text-[13px]">•</span>
              <span className="font-black text-black text-[13px]">ADMISSION IN PROGRESS FOR 2026/2027 ND/HND NURSING SCIENCE</span>
              <span className="font-black text-black text-[13px]">•</span>
              <span className="font-black text-black text-[13px]">NMCN APPROVED • NBTE ACCREDITED • CATHOLIC DIOCESE OF GBOKO</span>
              <span className="font-black text-black text-[13px]">•</span>
              <span className="font-black text-black text-[13px]">LEARN, SERVE & SAVE • APPLY NOW AT LCNS.EDU.NG</span>
            </>
          )}
          <span className="font-black text-black text-[13px]">• 🔔 Labe College of Nursing Sciences, Catholic Diocese of Gboko</span>
        </div>
      </div>

      <style>{`
        @keyframes marquee-fast { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-marquee-fast { display: inline-flex; animation: marquee-fast 15s linear infinite; min-width: 200%; }
        .animate-marquee-fast:hover { animation-play-state: paused; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button onClick={() => { setActiveView('website'); window.scrollTo({ top: 0, behavior: 'smooth' }); window.history.pushState({}, '', '/'); setMobileOpen(false); }} className="flex items-center gap-3 text-left group">
            <CollegeLogo size="md" />
            <div className="hidden sm:block">
              <span className="block font-black text-white text-[13px] sm:text-[15px] leading-tight uppercase tracking-tight group-hover:text-amber-300">Labe College of Nursing Sciences</span>
              <span className="block text-[10px] sm:text-[11px] font-bold text-amber-300 uppercase leading-tight">Catholic Diocese of Gboko, Benue State</span>
              <span className="block text-[9px] font-semibold text-emerald-200 uppercase">Gboko &bull; Learn, Serve & Save</span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-white/90">
            <button onClick={() => { setActiveView('website'); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-amber-300">Home</button>
            <button onClick={() => scrollToId('about')} className="hover:text-amber-300">About</button>
            <button onClick={() => scrollToId('programmes')} className="hover:text-amber-300">Programmes</button>
            <button onClick={() => scrollToId('values-philosophy')} className="hover:text-amber-300">Values</button>
            <button onClick={() => scrollToId('hostel')} className="hover:text-amber-300">Hostel</button>
            <button onClick={() => scrollToId('gallery')} className="hover:text-amber-300 font-bold text-amber-300">Gallery</button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={onOpenAdmissionChecker} className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-white/10 border border-white/20 rounded-lg"><FileText className="w-3.5 h-3.5 text-amber-300" /><span>Check Admission</span></button>
            <button onClick={onOpenApplication} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-[#F59E0B] rounded-lg"><GraduationCap className="w-4 h-4" /><span>Apply</span></button>
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveView('portal')} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-[#0a4d2e]"><LayoutDashboard className="w-3 h-3" /><span className="hidden md:inline">Portal</span></button>
                <button onClick={handleLogout} className="p-2 text-white/70 hover:text-red-300"><LogOut className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={onOpenLogin} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 rounded-lg"><LogIn className="w-3.5 h-3.5" /><span>Login</span></button>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 bg-white/10 rounded-lg">{mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-[#06321e] border-t px-4 py-4 space-y-1">
          <button onClick={() => { setActiveView('website'); window.scrollTo({top:0, behavior:'smooth'}); setMobileOpen(false); }} className="w-full text-left px-3 py-3 text-sm font-bold uppercase hover:bg-white/10 rounded-lg">Home</button>
          <button onClick={() => scrollToId('about')} className="w-full text-left px-3 py-3 text-sm font-bold uppercase hover:bg-white/10 rounded-lg">About</button>
          <button onClick={() => scrollToId('programmes')} className="w-full text-left px-3 py-3 text-sm font-bold uppercase hover:bg-white/10 rounded-lg">Programmes</button>
          <button onClick={() => scrollToId('gallery')} className="w-full text-left px-3 py-3 text-sm font-bold uppercase bg-amber-500/20 text-amber-300 rounded-lg">Gallery</button>
          <div className="pt-3 border-t border-white/10 space-y-2">
            <button onClick={() => { setMobileOpen(false); onOpenAdmissionChecker(); }} className="w-full py-3 text-xs font-bold uppercase bg-white/10 rounded-lg">Check Admission</button>
            <button onClick={() => { setMobileOpen(false); onOpenLogin(); }} className="w-full py-3 text-xs font-bold uppercase bg-white text-[#0a4d2e] rounded-lg">Portal Login</button>
            {canManage && <button onClick={()=>{setMobileOpen(false); setShowAnnounceModal(true);}} className="w-full py-3 text-xs font-black uppercase bg-amber-400 text-black rounded-lg">Publish Announcement</button>}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT PUBLISH MODAL */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex justify-between items-center bg-emerald-900 text-white rounded-t-xl">
              <h3 className="font-black flex items-center gap-2"><Megaphone className="w-5 h-5"/> Publish Announcement / Event</h3>
              <button onClick={()=>setShowAnnounceModal(false)} className="bg-white/20 p-1.5 rounded"><X className="w-4 h-4"/></button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="grid gap-3 bg-slate-50 p-4 rounded-xl border">
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title: e.g. MATRICULATION CEREMONY 2026" className="px-3 py-2.5 border rounded-lg text-sm font-bold text-black"/>
                <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Message: e.g. All newly admitted students are to..." rows={3} className="px-3 py-2.5 border rounded-lg text-sm text-black"/>
                <div className="flex gap-2 flex-wrap items-center">
                  <select value={annType} onChange={e=>setAnnType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm text-black font-bold">
                    <option value="announcement">📢 Announcement</option>
                    <option value="event">📅 Event</option>
                    <option value="admission">🎓 Admission</option>
                    <option value="urgent">🚨 Urgent</option>
                  </select>
                  <button onClick={handleCreate} className="ml-auto bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-lg text-sm font-black flex items-center gap-1"><Plus className="w-4 h-4"/> Publish Now</button>
                </div>
                <p className="text-[11px] text-slate-500">It will appear instantly in the yellow moving bar on top and you can delete anytime.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-sm">Published Announcements ({announcements.length})</h4>
                {announcements.length===0 && <p className="text-xs text-slate-500 py-4 text-center border rounded-lg">No announcement yet. Publish one above.</p>}
                {announcements.map(a=>(
                  <div key={a.id} className={`p-3 rounded-lg border flex justify-between gap-3 ${a.type==='urgent'?'bg-red-50 border-red-200': a.type==='event'?'bg-blue-50':'bg-white'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap"><span className="text-[10px] font-black uppercase bg-black text-white px-1.5 py-0.5 rounded">{a.type}</span><span className="font-bold text-sm text-black">{a.title}</span><span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-black">MARQUEE</span></div>
                      <p className="text-xs text-slate-700 mt-1">{a.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(a.createdAt).toLocaleString()} • {a.isActive?'Active':'Hidden'}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={()=>handleToggle(a.id)} className="p-2 bg-slate-100 rounded hover:bg-slate-200" title={a.isActive?'Hide':'Show'}>{a.isActive?<Eye className="w-4 h-4"/>:<EyeOff className="w-4 h-4"/>}</button>
                      <button onClick={()=>handleDelete(a.id)} className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Delete"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
