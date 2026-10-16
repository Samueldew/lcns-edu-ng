import React, { useState } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { ApiService } from '../../services/api';
import { User, UserRole, COLLEGE_CONFIG } from '../../types';
import { StorageService } from '../../services/storage';
import {
  X,
  Lock,
  Mail,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isResetMode, setIsResetMode] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your email or matric number and password.');
      return;
    }

    setLoading(true);
    const result = await ApiService.login(identifier, password);
    setLoading(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user);
      onClose();
    } else {
      setError(result.message || 'Invalid login details.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccess(null);

    if (!resetIdentifier.trim()) {
      setError('Please enter your email or matric/form number.');
      return;
    }
    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please verify.');
      return;
    }

    const res = StorageService.resetUserPassword(resetIdentifier, newPassword);
    if (res.success) {
      setResetSuccess(res.message);
      setIdentifier(resetIdentifier);
      setPassword(newPassword);
      setTimeout(() => {
        setIsResetMode(false);
        setResetSuccess(null);
      }, 2500);
    } else {
      setError(res.message);
    }
  };

  const handleQuickLogin = (email: string, pass: string = 'admin123') => {
    setIdentifier(email);
    setPassword(pass);
    setError(null);
    setIsResetMode(false);
  };

  const demoAccounts: { role: string; email: string; name: string }[] = [
    { role: 'Admin (ICT)', email: 'info@lcns.edu.ng', name: 'Director of ICT' },
    { role: 'Provost', email: 'provost@lcns.edu.ng', name: 'Prof. G. T. Labe' },
    { role: 'Registrar', email: 'registrar@lcns.edu.ng', name: 'Barr. T. J. Iorbee' },
    { role: 'Admission Officer', email: 'admission@lcns.edu.ng', name: 'Mrs. B. N. Terfa' },
    { role: 'Exam Officer', email: 'exam@lcns.edu.ng', name: 'Dr. E. O. Agada' },
    { role: 'HOD Nursing', email: 'hod.nursing@lcns.edu.ng', name: 'Dr. Mrs. R. Chia' },
    { role: 'Lecturer', email: 'lecturer@lcns.edu.ng', name: 'Nurse E. Gbaorun' },
    { role: 'Bursar', email: 'bursar@lcns.edu.ng', name: 'Mr. S. T. Tyavyar' },
    { role: 'Student', email: 'student@lcns.edu.ng', name: 'Deborah Vershima' },
    { role: 'Applicant', email: 'applicant@lcns.edu.ng', name: 'Terwase Moses' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a4d2e] to-[#042114] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <CollegeLogo size="sm" />
            <div>
              <h2 className="text-xl font-black uppercase font-serif-crest leading-tight">
                {isResetMode ? 'Reset Account Password' : 'Login'}
              </h2>
              <p className="text-xs text-emerald-300">Labe College of Nursing Sciences, Gboko</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[#0a4d2e] font-bold text-xs flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-[#22c55e] mt-0.5" />
              <span>{resetSuccess}</span>
            </div>
          )}

          {isResetMode ? (
            /* Reset Password Form */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email / Matric No / Form No *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value)}
                    placeholder="e.g. student@lcns.edu.ng or LCNS/2026/ND/014"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0a4d2e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0a4d2e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0a4d2e]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetMode(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel / Back to Login
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[#0a4d2e] hover:bg-[#06321e] text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Save New Password
                </button>
              </div>
            </form>
          ) : (
            /* Standard Login Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email / Matric No / Form No
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. info@lcns.edu.ng or LCNS/2026/ND/014"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setResetIdentifier(identifier);
                      setError(null);
                    }}
                    className="text-[11px] font-bold text-[#ca8a04] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your portal password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-1 flex justify-between items-center text-[11px] text-slate-500">
                  <span>Default test password: <code className="bg-slate-100 px-1 py-0.5 rounded text-[#0a4d2e] font-bold">admin123</code></span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#0a4d2e] hover:bg-[#073822] text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Login</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Role Clickers */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                1-Click Quick Demo Login:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickLogin(acc.email)}
                  className={`text-left p-1.5 rounded-lg text-[11px] border transition-colors flex flex-col ${
                    identifier === acc.email
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold'
                      : 'bg-white border-slate-200 hover:bg-emerald-50 text-slate-700'
                  }`}
                >
                  <span className="font-semibold text-emerald-900">{acc.role}</span>
                  <span className="text-[10px] text-slate-500 truncate">{acc.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
