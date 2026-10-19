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

  const handleRoleQuickSwitch = (role: UserRole) => {
    const users = StorageService.getUsers();
    const target = users.find((u) => u.role === role);
    if (target) {
      const { password: _, ...safeUser } = target;
      StorageService.setCurrentUser(safeUser as User);
      setActiveView('portal');
      setShowRoleMenu(false);
    }
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setActiveView('website');
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
      {/* Top Institutional Notification Bar */}
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
          <span className="hidden md:inline text-emerald-400/50">&bull;</span>
          <span className="hidden md:flex items-center gap-1 text-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ca8a04]" />
            <span>Accredited by NMCN &amp; NBTE</span>
          </span>
        </div>

        {/* Quick Demo Switcher Button in Header */}
        <div className="relative ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 bg-[#06321e] hover:bg-[#042114] text-white px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wide border border-[#22c55e]/30 transition-colors"
            title="Switch demo roles to preview all ERP portals"
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

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & College Identity */}
          <button
            onClick={() => setActiveView('website')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <CollegeLogo size="md" />
            <div>
              <span className="block font-black text-white text-base sm:text-lg leading-tight uppercase font-serif-crest tracking-tight group-hover:text-amber-300 transition-colors">
                Labe College of Nursing Sciences
              </span>
              <span className="block text-xs font-semibold text-amber-300 tracking-wider uppercase">
                Gboko, Benue State &bull; Learn, Serve &amp; Save
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-white/90">
            <button
              onClick={() => setActiveView('website')}
              className={`transition-colors hover:text-amber-300 ${
                activeView === 'website' ? 'text-amber-300 font-bold' : ''
              }`}
            >
              Public Portal
            </button>
            <a href="#about" onClick={() => setActiveView('website')} className="hover:text-amber-300 transition-colors">
              About
            </a>
            <a href="#programmes" onClick={() => setActiveView('website')} className="hover:text-amber-300 transition-colors">
              Programmes
            </a>
            <a href="#values-philosophy" onClick={() => setActiveView('website')} className="hover:text-amber-300 transition-colors">
              Values &amp; Philosophy
            </a>
            <a href="/check-admission" className="hover:text-amber-300 transition-colors">
              Admission Status
            </a>
            <a href="/applicant/dashboard" className="hover:text-amber-300 transition-colors">
              Candidate Portal
            </a>
            <a href="/bursar/applicants" className="hover:text-amber-300 transition-colors">
              Bursary
            </a>
            <a href="/admissions" className="hover:text-amber-300 transition-colors">
              Admissions Desk
            </a>
            <a href="#hostel" onClick={() => setActiveView('website')} className="hover:text-amber-300 transition-colors">
              Hostel
            </a>
            <a href="#gallery" onClick={() => setActiveView('website')} className="hover:text-amber-300 transition-colors">
              Gallery
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admission Status Checker Quick Button */}
            <button
              onClick={onOpenAdmissionChecker}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>Check Admission</span>
            </button>

            {/* Apply Now CTA */}
            <button
              onClick={onOpenApplication}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-[#F59E0B] hover:bg-amber-400 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-black"
            >
              <GraduationCap className="w-4 h-4 text-slate-950" />
              <span>Apply Now</span>
            </button>

            {/* Portal Dashboard / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView('portal')}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    activeView === 'portal'
                      ? 'bg-[#0a4d2e] text-white border-[#06321e] shadow-sm'
                      : 'bg-white text-[#0a4d2e] border-[#0a4d2e]/30 hover:bg-emerald-50'
                  }`}
                >
                  {currentUser.photoUrl ? (
                    <img
                      src={currentUser.photoUrl}
                      alt={currentUser.fullName}
                      className="w-6 h-6 rounded-full object-cover border border-emerald-400"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#0a4d2e] flex items-center justify-center font-bold text-[10px]">
                      {currentUser.fullName.charAt(0)}
                    </div>
                  )}
                  <span className="hidden md:inline font-bold">Portal</span>
                  <span className="text-[10px] bg-[#ca8a04] text-[#0a4d2e] font-black px-1.5 py-0.5 rounded uppercase">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </button>

                <button
                  onClick={handleLogout}
                  title="Sign out of portal"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-600" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
