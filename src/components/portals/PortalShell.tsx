import React from 'react';
import { User } from '../../types';
import AdminDashboard from './AdminDashboard';
import ProvostDashboard from './ProvostDashboard';
import RegistrarDashboard from './RegistrarDashboard';
import { AdmissionOfficerDashboard } from './AdmissionOfficerDashboard';
import ExamOfficerDashboard from './ExamOfficerDashboard';
import HODDashboard from './HODDashboard';
import LecturerDashboard from './LecturerDashboard';
import BursarDashboard from './BursarDashboard';
import { StudentPortal } from './StudentPortal';
import ApplicantPortal from './ApplicantPortal';
import { Globe, LogOut } from 'lucide-react';

interface PortalShellProps {
  currentUser: User;
  onLogout: () => void;
  onBackToWebsite: () => void;
  adminInitialTab?: any;
}

export const PortalShell: React.FC<PortalShellProps> = ({ currentUser, onLogout, onBackToWebsite, adminInitialTab }) => {
  const renderDashboardByRole = () => {
    switch (currentUser.role) {
      case 'ADMIN': return <AdminDashboard initialTab={adminInitialTab} />;
      case 'PROVOST': return <ProvostDashboard />;
      case 'REGISTRAR': return <RegistrarDashboard />;
      case 'ADMISSION_OFFICER': return <AdmissionOfficerDashboard />;
      case 'EXAM_OFFICER': return <ExamOfficerDashboard />;
      case 'HOD': return <HODDashboard />;
      case 'LECTURER': return <LecturerDashboard />;
      case 'BURSAR': return <BursarDashboard />;
      case 'STUDENT': return <StudentPortal />;
      case 'APPLICANT': return <ApplicantPortal />;
      default: return <AdminDashboard />;
    }
  };
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <div className="bg-[#0a4d2e] text-white px-4 py-3 flex justify-between">
        <button onClick={onBackToWebsite} className="text-xs text-[#22c55e]">&larr; Public Website | {currentUser.role}</button>
        <div className="flex gap-2"><span className="text-xs">{currentUser.fullName}</span><button onClick={onLogout} className="px-2 py-1 bg-red-900 rounded text-xs flex gap-1"><LogOut className="w-3 h-3"/>Sign Out</button></div>
      </div>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">{renderDashboardByRole()}</main>
    </div>
  );
};
export default PortalShell;
