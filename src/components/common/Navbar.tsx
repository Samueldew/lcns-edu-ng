import React, { useState } from 'react';
import { CollegeLogo } from './CollegeLogo';
import { COLLEGE_CONFIG, User, UserRole } from '../../types';
import { StorageService } from '../../services/storage';
import {
  GraduationCap,
  LogIn,
  LogOut,
  UserCheck,
  Phone,
  Mail,
  ShieldCheck,
  ChevronDown,
  LayoutDashboard,
  CheckCircle2,
  FileText,
  User as UserIcon,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenApplication: () => void;
  onOpenAdmissionChecker: () => void;
  activeView: 'website' | 'portal';
  setActiveView: (view: 'website' | 'portal') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenLogin,
  onOpenApplication,
  onOpenAdmissionChecker,
  activeView,
  setActiveView,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState({}, '', `/#${id}`);
      } else {
        window.location.hash = id;
      }
    }, 100);
  };

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'ADMIN', label: 'ICT Administrator', desc: 'System config & Supabase database' },
    { role: 'PROVOST', label: 'College Provost', desc: 'Executive institutional oversight' },
    { role: 'REGISTRAR', label: 'Academic Registrar', desc: 'Student records & matriculation' },
    { role: 'ADMISSION_OFFICER', label: 'Admission Officer', desc: 'Screening & admission list' },
    { role: 'EXAM_OFFICER', label: 'Examination Officer', desc: 'Broadsheets & GPA/CGPA' },
    { role: 'HOD', label: 'HOD Nursing Sciences', desc: 'Curriculum & course allocations' },
    { role: 'LECTURER', label: 'Course Lecturer', desc: 'CA & Exam score upload' },
    { role: 'BURSAR', label: 'College Bursar', desc: 'Fees, payments & Remita receipts' },
    { role: 'STUDENT', label: 'Nursing Student', desc: 'Registration, grades & ID card' },
    { role: 'APPLICANT', label: 'Prospective Applicant', desc: 'Admission letter & status' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a4d2e] text-white shadow-md border-b border-[#06321e] no-print">
      {/* TOP CONTACT BAR */}
      <div className="bg-[#06321e] text-emerald-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-[#042114]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium">
            <Mail className="w-3.5 h-3.5 text-[#22c55e]" />
            <a href="mailto:info@lcns.edu.ng" className="hover:text-emerald-200 transition-colors">
              {COLLEGE_CONFIG.OFFICIAL_EMAIL}
            </a>
          </span>
          <span className="hidden sm:inline text-emerald-400/50">&bull;</span>
          <span className="flex items-center gap-1.5 font-medium">
            <Phone className="w-3.5 h-3.5 text-[#22c55e]" />
            <span>Support: {COLLEGE_CONFIG.SUPPORT_PHONE}</span>
          </span>
        </div>
        <div className="relative ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 bg-[#06321e] hover:bg-[#042114] text-white px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wide border border-[#22c55e]/30 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-[#ca8a04] animate-pulse" />
            <span>Switch Role</span>
            <ChevronDown className="w-3 h-3 opacity-75" />
          </button>
          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 text-slate-800 z-50 divide-y divide-slate-100">
              <div className="p-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Select Portal Role to Test
              </div>
              <div className="max-h-80 overflow-y-auto py-1">
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => handleRoleQuickSwitch(r.role)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between group ${
                      currentUser?.role === r.role ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-emerald-700">{r.label}</div>
                      <div className="text-[10px] text-slate-500">{r.desc}</div>
                    </div>
                    {currentUser?.role === r.role && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAST MOVING - DARK BLACK BOLD */}
      <div className="bg-[#ca8a04] py-1.5 overflow-hidden whitespace-nowrap border-b-2 border-black">
        <div className="animate-marquee-fast flex items-center gap-12">
          <span className="font-black text-black text-[13px]">🔔 Labe College of Nursing Sciences, Catholic Diocese of Gboko, Benue State</span>
          <span className="font-black text-black text-[13px]">•</span>
          <span className="font-black text-black text-[13px]">ADMISSION IN PROGRESS FOR 2026/2027 ND/HND NURSING SCIENCE</span>
          <span className="font-black text-black text-[13px]">•</span>
          <span className="font-black text-black text-[13px]">NMCN APPROVED • NBTE ACCREDITED • CATHOLIC DIOCESE OF GBOKO</span>
          <span className="font-black text-black text-[13px]">•</span>
          <span className="font-black text-black text-[13px]">LEARN, SERVE & SAVE • APPLY NOW AT LCNS.EDU.NG</span>
          <span className="font-black text-black text-[13px]">•</span>
          <span className="font-black text-black text-[13px]">🔔 Labe College of Nursing Sciences, Catholic Diocese of Gboko, Benue State</span>
        </div>
      </div>

      <style>{`
        @keyframes marquee-fast {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee-fast {
          display: inline-flex;
          animation: marquee-fast 15s linear infinite;
          min-width: 200%;
        }
        .animate-marquee-fast:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button
            onClick={() => {
              setActiveView('website');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              window.history.pushState({}, '', '/');
              setMobileOpen(false);
            }}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <CollegeLogo size="md" />
            <div className="hidden sm:block">
              <span className="block font-black text-white text-[13px] sm:text-[15px] leading-tight uppercase font-serif-crest tracking-tight group-hover:text-amber-300 transition-colors">
                Labe College of Nursing Sciences
              </span>
              <span className="block text-[10px] sm:text-[11px] font-bold text-amber-300 tracking-wider uppercase leading-tight">
                Catholic Diocese of Gboko, Benue State
              </span>
              <span className="block text-[9px] font-semibold text-emerald-200 tracking-widest uppercase">
                Gboko &bull; Learn, Serve & Save
              </span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-white/90">
            <button onClick={() => { setActiveView('website'); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-amber-300 transition-colors">Home</button>
            <button onClick={() => scrollToId('about')} className="hover:text-amber-300 transition-colors">About</button>
            <button onClick={() => scrollToId('programmes')} className="hover:text-amber-300 transition-colors">Programmes</button>
            <button onClick={() => scrollToId('values-philosophy')} className="hover:text-amber-300 transition-colors">Values & Philosophy</button>
            <button onClick={() => scrollToId('hostel')} className="hover:text-amber-300 transition-colors">Hostel</button>
            <button onClick={() => scrollToId('gallery')} className="hover:text-amber-300 transition-colors font-bold text-amber-300">Gallery</button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={onOpenAdmissionChecker} className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors">
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>Check Admission / Candidate</span>
            </button>
            <button onClick={onOpenApplication} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-[#F59E0B] hover:bg-amber-400 rounded-lg shadow-sm">
              <GraduationCap className="w-4 h-4 text-slate-950" />
              <span>Apply</span>
            </button>
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveView('portal')} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl border bg-white text-[#0a4d2e] border-[#0a4d2e]/30">
                  <LayoutDashboard className="w-3 h-3" />
                  <span className="hidden md:inline">Portal</span>
                </button>
                <button onClick={handleLogout} className="p-2 text-white/70 hover:text-red-300"><LogOut className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={onOpenLogin} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg">
                <LogIn className="w-3.5 h-3.5 text-slate-600" />
                <span>Portal Login</span>
              </button>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 bg-white/10 rounded-lg">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-[#06321e] border-t border-[#042114] px-4 py-4 space-y-1">
          <button onClick={() => { setActiveView('website'); window.scrollTo({top:0, behavior:'smooth'}); setMobileOpen(false); }} className="w-full text-left px-3 py-3 text-sm font-bold uppercase hover:bg-white/10 rounded-lg">Home</button>
          <button onClick={() => scrollToId('about')} className="w-full text-left px-3 py-3 text-sm font-bold uppercase hover:bg-white/10 rounded-lg">About</button>
          <button onClick={() => scrollToId('programmes')} className="w-full text-left px-3 py-3 text-sm font-bold uppercase hover:bg-white/10 rounded-lg">Programmes</button>
          <button onClick={() => scrollToId('values-philosophy')} className="w-full text-left px-3 py-3 text-sm font-bold uppercase hover:bg-white/10 rounded-lg">Values & Philosophy</button>
          <button onClick={() => scrollToId('hostel')} className="w-full text-left px-3 py-3 text-sm font-bold uppercase hover:bg-white/10 rounded-lg">Hostel</button>
          <button onClick={() => scrollToId('gallery')} className="w-full text-left px-3 py-3 text-sm font-bold uppercase bg-amber-500/20 text-amber-300 rounded-lg">Gallery</button>
          <div className="pt-3 border-t border-white/10 space-y-2">
            <button onClick={() => { setMobileOpen(false); onOpenAdmissionChecker(); }} className="w-full py-3 text-xs font-bold uppercase bg-white/10 rounded-lg">Check Admission + Candidate Portal</button>
            <button onClick={() => { setMobileOpen(false); onOpenLogin(); }} className="w-full py-3 text-xs font-bold uppercase bg-white text-[#0a4d2e] rounded-lg">Portal Login</button>
          </div>
        </div>
      )}
    </header>
  );
};
