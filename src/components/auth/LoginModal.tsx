import { useState } from 'react';
import { ApiService } from '../../services/api';
import { StorageService } from '../../services/storage';

export const LoginModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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
      setSuccess(`Welcome ${user.fullName || user.full_name}! Redirecting...`);

      const userStr = JSON.stringify(user);
      localStorage.setItem('lcns_current_user', userStr);
      localStorage.setItem('lcns_erp_current_user', userStr);
      localStorage.setItem('current_user', userStr);
      localStorage.setItem('lcns_user', userStr);
      localStorage.setItem('lcns-current-user', userStr);
      localStorage.setItem('currentUser', userStr);
      try { StorageService.setCurrentUser(user); } catch {}

      // NO onClose() BEFORE REDIRECT - THIS WAS BLOCKING!
      const role = (user.role || '').toUpperCase().trim();
      
      // FORCE HARD REDIRECT - CANNOT BE BLOCKED BY REACT ROUTER
      setTimeout(() => {
        if (role === 'ADMIN') window.top!.location.href = '/admin';
        else if (role === 'PROVOST') window.top!.location.href = '/provost';
        else if (role === 'REGISTRAR') window.top!.location.href = '/registrar';
        else if (role === 'HOD') window.top!.location.href = '/hod';
        else if (role === 'LECTURER') window.top!.location.href = '/lecturer';
        else if (role === 'BURSAR') window.top!.location.href = '/bursar';
        else if (role === 'STUDENT') window.top!.location.href = '/student';
        else window.top!.location.href = '/dashboard';
      }, 600);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl">✕</button>
        
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/logo.png" 
            alt="LCNS Logo" 
            className="w-20 h-20 object-contain mb-2"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src.includes('/logo.png')) target.src = '/lcns-logo.png';
              else target.style.display = 'none';
            }}
          />
          <h2 className="text-2xl font-bold text-green-800 tracking-wider">LCNS</h2>
          <p className="text-[11px] text-green-700 font-semibold uppercase tracking-wide mt-1 text-center">Under Catholic Diocese of Gboko</p>
          <p className="text-[11px] text-green-700 font-semibold uppercase tracking-wide text-center">Benue State</p>
        </div>

        <h3 className="text-lg font-semibold text-center mb-6 text-gray-800">Staff / Student Login</h3>

        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder="Email / Staff ID / Matric No" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" required />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" required />
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">{success}</div>}
          <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white p-3 rounded-lg font-bold">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">LCNS Portal © 2026 | ICT Support: 08126799565</div>
      </div>
    </div>
  );
};

export default LoginModal;
