import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { User, COLLEGE_CONFIG } from './types';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CollegeWebsite } from './components/website/CollegeWebsite';
import { LoginModal } from './components/auth/LoginModal';
import { ApplicationFormModal } from './components/website/ApplicationFormModal';
import { AdmissionCheckerModal } from './components/website/AdmissionCheckerModal';
import { PortalShell } from './components/portals/PortalShell';
import { CollegeLogo } from './components/common/CollegeLogo';
import { ApiService } from './services/api';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { CheckAdmissionPage } from './components/applicant/CheckAdmissionPage';
import { ApplicantDashboard } from './components/applicant/ApplicantDashboard';
import { ApplicantPrintoutPage } from './components/applicant/ApplicantPrintoutPage';
import { ApplicantCBTPage } from './components/applicant/ApplicantCBTPage';
import { AdmissionProcessingView } from './components/portals/AdmissionProcessingView';
import { BursarDashboard } from './components/portals/BursarDashboard';
import { AdminApplicantCBTPage } from './components/admin/AdminApplicantCBTPage';
import { CourseManagerView } from './components/common/CourseManagerView';
import { CBTExamManager } from './components/cbt/CBTExamManager';
import { StudentPortal } from './components/portals/StudentPortal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(StorageService.getCurrentUser());
  const [activeView, setActiveView] = useState<'website' | 'portal'>('website');
  const [customView, setCustomView] = useState<
    | null
    | 'check-admission'
    | 'applicant-dashboard'
    | 'applicant-printout'
    | 'applicant-cbt'
    | 'admissions'
    | 'bursar'
    | 'admin-applicant-cbt'
    | 'courses'
    | 'lecturer-cbt-create'
    | 'student-cbt'
  >(null);
  const [adminInitialTab, setAdminInitialTab] = useState<
    'settings' | 'management' | 'gallery' | 'users' | 'cbt' | 'system'
  >('settings');

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isAdmissionCheckerOpen, setIsAdmissionCheckerOpen] = useState(false);
  const [checkerDefaultFormNo, setCheckerDefaultFormNo] = useState<string | undefined>(undefined);

  const [adminEmail, setAdminEmail] = useState('info@lcns.edu.ng');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  const syncRouteFromUrl = () => {
    const pathname = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');

    if (pathname === '/applicant/printout') {
      setCustomView('applicant-printout');
      setActiveView('website');
      return;
    } else if (pathname === '/applicant/dashboard') {
      setCustomView('applicant-dashboard');
      setActiveView('website');
      return;
    } else if (pathname === '/check-admission') {
      setCustomView('check-admission');
      setActiveView('website');
      return;
    } else if (pathname === '/admin/applicant-cbt') {
      setCustomView('admin-applicant-cbt');
      setActiveView('website');
      return;
    } else if (pathname.startsWith('/applicant/cbt')) {
      setCustomView('applicant-cbt');
      setActiveView('website');
      return;
    } else if (
      pathname === '/admin/courses' ||
      pathname === '/hod/courses' ||
      pathname === '/registrar/courses'
    ) {
      setCustomView('courses');
      setActiveView('website');
      return;
    } else if (pathname.startsWith('/lecturer/cbt')) {
      setCustomView('lecturer-cbt-create');
      setActiveView('website');
      return;
    } else if (pathname.startsWith('/student/cbt')) {
      setCustomView('student-cbt');
      setActiveView('website');
      return;
    } else if (pathname === '/admissions') {
      setCustomView('admissions');
      setActiveView('website');
      return;
    } else if (pathname.startsWith('/bursar/applicants') || pathname === '/bursar') {
      setCustomView('bursar');
      setActiveView('website');
      return;
    } else if (pathname === '/apply') {
      setCustomView(null);
      setActiveView('website');
      setIsApplicationOpen(true);
      return;
    }

    setCustomView(null);

    if (pathname.startsWith('/admin')) {
      if (pathname.includes('/settings')) {
        setAdminInitialTab('settings');
      } else if (pathname.includes('/management')) {
        setAdminInitialTab('management');
      } else if (pathname.includes('/gallery')) {
        setAdminInitialTab('gallery');
      } else if (pathname.includes('/users')) {
        setAdminInitialTab('users');
      } else if (pathname.includes('/cbt')) {
        setAdminInitialTab('cbt');
      } else {
        setAdminInitialTab('settings');
      }
      const cur = StorageService.getCurrentUser();
      if (cur) {
        setActiveView('portal');
      } else {
        setActiveView('website');
      }
      return;
    }

    if (
      pageParam === 'portal' ||
      pageParam === 'provost' ||
      pageParam === 'registrar' ||
      pageParam === 'bursar' ||
      pageParam === 'lecturer' ||
      pageParam === 'hod' ||
      pageParam === 'exam' ||
      pageParam === 'student'
    ) {
      if (StorageService.getCurrentUser()) {
        setActiveView('portal');
      } else {
        setIsLoginOpen(true);
      }
      return;
    }

    if (pathname === '/gallery' || window.location.hash === '#gallery') {
      setActiveView('website');
      setTimeout(() => {
        const el = document.getElementById('gallery');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      setActiveView('website');
    }
  };

  useEffect(() => {
    const handleAuthUpdate = () => {
      setCurrentUser(StorageService.getCurrentUser());
    };

    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (
        href &&
        (href.startsWith('/applicant/') ||
          href.startsWith('/check-admission') ||
          href.startsWith('/bursar') ||
          href.startsWith('/admissions') ||
          href.startsWith('/admin/applicant-cbt') ||
          href.startsWith('/admin/courses') ||
          href.startsWith('/hod/courses') ||
          href.startsWith('/registrar/courses') ||
          href.startsWith('/lecturer/cbt') ||
          href.startsWith('/student/cbt') ||
          href === '/apply')
      ) {
        e.preventDefault();
        window.history.pushState({}, '', href);
        syncRouteFromUrl();
      }
    };

    window.addEventListener('lcns_auth_update', handleAuthUpdate);
    window.addEventListener('lcns_storage_update', handleAuthUpdate);
    window.addEventListener('popstate', syncRouteFromUrl);
    document.addEventListener('click', handleLinkClick);

    syncRouteFromUrl();

    return () => {
      window.removeEventListener('lcns_auth_update', handleAuthUpdate);
      window.removeEventListener('lcns_storage_update', handleAuthUpdate);
      window.removeEventListener('popstate', syncRouteFromUrl);
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveView('portal');
    if (user.role.toLowerCase().includes('admin')) {
      window.history.pushState({}, '', '/admin');
      setAdminInitialTab('settings');
    }
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setActiveView('website');
    window.history.pushState({}, '', '/');
  };

  const handleOpenAdmissionCheckerWithForm = (formNo?: string) => {
    setIsApplicationOpen(false);
    setCheckerDefaultFormNo(formNo);
    setIsAdmissionCheckerOpen(true);
  };

  const handleDirectAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError(null);
    setAdminLoginLoading(true);

    const result = await ApiService.login(adminEmail, adminPassword);
    setAdminLoginLoading(false);

    if (result.success && result.user) {
      handleLoginSuccess(result.user);
    } else {
      setAdminLoginError(result.message || 'Invalid credentials');
    }
  };

  const isDirectAdminUrl = window.location.pathname.toLowerCase().startsWith('/admin');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-[#0a4d2e] selection:text-white">
      <div
        className="marquee-top no-print"
        style={{
          background: '#ca8a04',
          color: '#0a4d2e',
          fontWeight: 900,
          textTransform: 'uppercase',
          padding: '8px 0',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          fontSize: '14px',
          letterSpacing: '0.5px',
        }}
      >
        <div style={{ display: 'inline-block', animation: 'marquee 25s linear infinite' }}>
          LABE COLLEGE OF NURSING SCIENCES GBOKO - PHYSICAL ADDRESS: OFF GBOKO HILL, ALONG AGBILE ROAD, GBOKO BENUE STATE - EMAIL: INFO@LCNS.EDU.NG - ICT SUPPORT: 08126799565 - ADMISSION FOR 2026/2027 ACADEMIC SESSION IS OPEN - LEARN, SERVE &amp; SAVE &nbsp;&nbsp;&nbsp; LABE COLLEGE OF NURSING SCIENCES GBOKO - PHYSICAL ADDRESS: OFF GBOKO HILL, ALONG AGBILE ROAD, GBOKO BENUE STATE
        </div>
      </div>

      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenApplication={() => setIsApplicationOpen(true)}
        onOpenAdmissionChecker={() => {
          setCheckerDefaultFormNo(undefined);
          setIsAdmissionCheckerOpen(true);
        }}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <div className="flex-1">
        {customView === 'applicant-printout' ? (
          <ApplicantPrintoutPage />
        ) : customView === 'applicant-dashboard' ? (
          <ApplicantDashboard />
        ) : customView === 'check-admission' ? (
          <CheckAdmissionPage
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenApplication={() => setIsApplicationOpen(true)}
          />
        ) : customView === 'applicant-cbt' ? (
          <ApplicantCBTPage />
        ) : customView === 'admissions' ? (
          <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <AdmissionProcessingView />
            </div>
          </div>
        ) : customView === 'bursar' ? (
          <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <BursarDashboard />
            </div>
          </div>
        ) : customView === 'admin-applicant-cbt' ? (
          <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <AdminApplicantCBTPage />
            </div>
          </div>
        ) : customView === 'courses' ? (
          <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <CourseManagerView portalRole="Academic Staff &amp; Curriculum" />
            </div>
          </div>
        ) : customView === 'lecturer-cbt-create' ? (
          <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <CBTExamManager
                currentUser={
                  currentUser || {
                    id: 'LCNS/2026/LC/001',
                    email: 'lecturer@lcns.edu.ng',
                    role: 'LECTURER',
                    fullName: 'Nurse Emmanuel Gbaorun (FWACN)',
                    department: 'Department of Nursing Sciences',
                    status: 'ACTIVE',
                  }
                }
                allowedTypes={['COURSE_TEST']}
              />
            </div>
          </div>
        ) : customView === 'student-cbt' ? (
          <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <StudentPortal />
            </div>
          </div>
        ) : activeView === 'portal' && currentUser ? (
          <PortalShell
            currentUser={currentUser}
            onLogout={handleLogout}
            onBackToWebsite={() => {
              setActiveView('website');
              window.history.pushState({}, '', '/');
            }}
            adminInitialTab={adminInitialTab}
          />
        ) : isDirectAdminUrl && !currentUser ? (
          <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gradient-to-b from-slate-900 via-[#0a4d2e] to-slate-950 py-12">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-emerald-700/40">
              <div className="bg-gradient-to-r from-[#0a4d2e] to-[#042114] text-white p-7 text-center">
                <div className="flex justify-center mb-3">
                  <CollegeLogo size="lg" />
                </div>
                <h2 className="text-xl font-black uppercase font-serif-crest tracking-wide">
                  Central ICT Administration
                </h2>
                <p className="text-xs text-emerald-200 mt-1">
                  Labe College of Nursing Sciences, Gboko
                </p>
                <div className="inline-block mt-3 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-[#ca8a04] uppercase tracking-wider border border-white/10">
                  Protected System Access
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                {adminLoginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{adminLoginError}</span>
                  </div>
                )}

                <form onSubmit={handleDirectAdminSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Admin Email / Username
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Admin Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={adminLoginLoading}
                    className="w-full py-3 px-4 bg-[#0a4d2e] hover:bg-[#073822] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {adminLoginLoading ? (
                      <span>Verifying...</span>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 text-[#22c55e]" />
                        <span>Sign In as Master Administrator</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      window.history.pushState({}, '', '/');
                      setActiveView('website');
                    }}
                    className="text-slate-500 hover:text-slate-900 font-bold"
                  >
                    &larr; Return to Website
                  </button>

                  <button
                    onClick={() => {
                      setAdminEmail('info@lcns.edu.ng');
                      setAdminPassword('admin123');
                    }}
                    className="text-[#0a4d2e] font-bold hover:underline text-[11px]"
                  >
                    Auto-Fill Credentials
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <CollegeWebsite
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenApplication={() => setIsApplicationOpen(true)}
            onOpenAdmissionChecker={() => {
              setCheckerDefaultFormNo(undefined);
              setIsAdmissionCheckerOpen(true);
            }}
          />
        )}
      </div>

      {activeView === 'website' && !isDirectAdminUrl && (!customView || customView === 'check-admission') && (
        <Footer
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenApplication={() => setIsApplicationOpen(true)}
          onOpenAdmissionChecker={() => {
            setCheckerDefaultFormNo(undefined);
            setIsAdmissionCheckerOpen(true);
          }}
          setActiveView={setActiveView}
        />
      )}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ApplicationFormModal
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
        onOpenAdmissionChecker={handleOpenAdmissionCheckerWithForm}
      />

      <AdmissionCheckerModal
        isOpen={isAdmissionCheckerOpen}
        onClose={() => setIsAdmissionCheckerOpen(false)}
        defaultFormNo={checkerDefaultFormNo}
        onOpenLogin={() => setIsLoginOpen(true)}
      />
    </div>
  );
}
