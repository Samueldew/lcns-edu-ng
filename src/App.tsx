import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { User } from './types';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CollegeWebsite } from './components/website/CollegeWebsite';
import { LoginModal } from './components/auth/LoginModal';
import { ApplicationFormModal } from './components/website/ApplicationFormModal';
import { AdmissionCheckerModal } from './components/website/AdmissionCheckerModal';
import { PortalShell } from './components/portals/PortalShell';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(StorageService.getCurrentUser());
  const [activeView, setActiveView] = useState<'website' | 'portal'>('website');

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isAdmissionCheckerOpen, setIsAdmissionCheckerOpen] = useState(false);
  const [checkerDefaultFormNo, setCheckerDefaultFormNo] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleAuthUpdate = () => {
      setCurrentUser(StorageService.getCurrentUser());
    };

    window.addEventListener('lcns_auth_update', handleAuthUpdate);
    window.addEventListener('lcns_storage_update', handleAuthUpdate);

    // If query parameter ?page=portal or ?page=admin is present, auto-open portal or login
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page === 'portal' || page === 'admin' || page === 'provost' || page === 'registrar' || page === 'bursar' || page === 'lecturer' || page === 'hod' || page === 'exam' || page === 'student') {
      if (StorageService.getCurrentUser()) {
        setActiveView('portal');
      } else {
        setIsLoginOpen(true);
      }
    }

    return () => {
      window.removeEventListener('lcns_auth_update', handleAuthUpdate);
      window.removeEventListener('lcns_storage_update', handleAuthUpdate);
    };
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveView('portal');
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setActiveView('website');
  };

  const handleOpenAdmissionCheckerWithForm = (formNo?: string) => {
    setIsApplicationOpen(false);
    setCheckerDefaultFormNo(formNo);
    setIsAdmissionCheckerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-[#0a4d2e] selection:text-white">
      {/* Top Moving Marquee Banner on All Pages */}
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

      {/* Primary Sticky Header */}
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

      {/* Main View: Either ERP Portal or Public Institutional Website */}
      <div className="flex-1">
        {activeView === 'portal' && currentUser ? (
          <PortalShell
            currentUser={currentUser}
            onLogout={handleLogout}
            onBackToWebsite={() => setActiveView('website')}
          />
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

      {/* Institutional Footer (rendered on public website) */}
      {activeView === 'website' && (
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

      {/* Authentication Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Online Application Form Modal */}
      <ApplicationFormModal
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
        onOpenAdmissionChecker={handleOpenAdmissionCheckerWithForm}
      />

      {/* Admission Status Checker Modal */}
      <AdmissionCheckerModal
        isOpen={isAdmissionCheckerOpen}
        onClose={() => setIsAdmissionCheckerOpen(false)}
        defaultFormNo={checkerDefaultFormNo}
        onOpenLogin={() => setIsLoginOpen(true)}
      />
    </div>
  );
}
