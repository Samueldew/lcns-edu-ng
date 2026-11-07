import { useState } from 'react';
import { ApiService } from '../../services/api';
import { StorageService } from '../../services/storage';
import { User } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: User) => void;
}

const SCHOOL_LOGO = "https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/uploads/school_logo_1791012211898.jpg";

export const LoginModal = ({ isOpen, onClose, onLoginSuccess }: Props) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res: any = await ApiService.login(identifier, password);
      if (!res.success) {
        setError(res.message);
        setLoading(false);
        return;
      }
      const user = res.user;
      setSuccess(`Welcome ${user.fullName || user.full_name}!`);

      const userStr = JSON.stringify(user);
      localStorage.setItem('lcns_current_user', userStr);
      localStorage.setItem('current_user', userStr);
      localStorage.setItem('lcns_user', userStr);
      localStorage.setItem('currentUser', userStr);
      StorageService.setCurrentUser(user);

      window.dispatchEvent(new Event('lcns_auth_update'));
      window.dispatchEvent(new Event('lcns_storage_update'));

      setTimeout(() => {
        onClose();
        if (onLoginSuccess) onLoginSuccess(user);
      }, 600);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl">✕</button>
        
        {/* COLLEGE LOGO - YOUR REAL LOGO FROM SUPABASE */}
        <div className="flex flex-col items-center mb-5">
          <img 
            src={SCHOOL_LOGO}
            alt="LCNS Logo - Labe College of Nursing Sciences" 
            className="w-24 h-24 object-contain mb-2 rounded-full"
          />
          <h2 className="text-2xl font-bold text-green-800 tracking-wider">LCNS</h2>
          <p className="text-[12px] text-gray-500 text-center mt-1 leading-tight">
            Labe College of Nursing Sciences, Gboko
          </p>
        </div>

        <h3 className="text-lg font-semibold text-center mb-6 text-gray-800">Staff / Student Login</h3>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              value={identifier} 
              onChange={e=>setIdentifier(e.target.value)} 
              placeholder="e.g. email or Staff ID or Matric Number" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                placeholder="Enter your password" 
                className="w-full p-3 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-700 text-lg"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">{success}</div>}
          
          <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white p-3 rounded-lg font-bold disabled:opacity-60">
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-center text-sm text-gray-500">
            <a href="/forgot-password" className="text-green-700 hover:underline">Forgot Password?</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
