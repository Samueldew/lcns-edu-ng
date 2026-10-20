import React from 'react';
import { User } from '../../types';
import AdminDashboard from './AdminDashboard';
import ProvostDashboard from './ProvostDashboard';
import RegistrarDashboard from './RegistrarDashboard';
import AdmissionOfficerDashboard from './AdmissionOfficerDashboard';
import ExamOfficerDashboard from './ExamOfficerDashboard';
import HODDashboard from './HODDashboard';
import LecturerDashboard from './LecturerDashboard';
import BursarDashboard from './BursarDashboard';
import StudentPortal from './StudentPortal';
import ApplicantPortal from './ApplicantPortal';
import {
  Globe,
  LogOut,
} from 'lucide-react';

interface PortalShellProps {
  currentUser: User;
  onLogout: () => void;
  onBackToWebsite: () => void;
  adminInitialTab?: 'settings' | 'management' | 'gallery' | 'users' | 'cbt' | 'system';
}

export const PortalShell: React.FC<PortalShellProps> = ({
  currentUser,
  onLogout,
  onBackToWebsite,
  adminInitialTab,
}) => {
  const renderDashboardByRole = () => {
    switch (currentUser.role) {
      case 'ADMIN':
        return <AdminDashboard initialTab={adminInitialTab} />;
      case 'PROVOST':
        return <ProvostDashboard />;
      case 'REGISTRAR':
        return <RegistrarDashboard />;
      case 'ADMISSION_OFFICER':
        return <AdmissionOfficerDashboard />;
      case 'EXAM_OFFICER':
        return <ExamOfficerDashboard />;
      case 'HOD':
        return <HODDashboard />;
      case 'LECTURER':
        return <LecturerDashboard />;
      case 'BURSAR':
        return <BursarDashboard />;
      case 'STUDENT':
        return <StudentPortal />;
      case 'APPLICANT':
        return <ApplicantPortal />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <div className="bg-[#0a4d2e] text-white px-4 py-3 border-b border-[#06321e] shadow-sm no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onBackToWebsite} className="inline-flex items-center gap-1.5 text-xs text-[#22c55e] hover:text-white font-semibold transition-colors group">
              <Globe className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
              <span>&larr; Public Website</span>
            </button>
            <span className="text-emerald-800">|</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-100">Current Role:</span>
              <span className="bg-[#ca8a04] text-[#0a4d2e] font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 text-emerald-100">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
              <span className="font-semibold">{currentUser.fullName}</span>
              <span className="text-[#22c55e]">({currentUser.email})</span>
            </div>
            <button onClick={onLogout} className="inline-flex items-center gap-1 px-3 py-1 bg-red-950/80 hover:bg-red-900 text-red-200 rounded-lg text-xs font-bold border border-red-800 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboardByRole()}
      </main>
    </div>
  );
};

export default PortalShell;
