import { useState } from 'react';
import { ApiService } from '../../services/api';

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
      setSuccess(`Welcome ${user.fullName || user.full_name}!`);

      const userStr = JSON.stringify(user);
      localStorage.setItem('lcns_current_user', userStr);
      localStorage.setItem('lcns_erp_current_user', userStr);
      localStorage.setItem('current_user', userStr);
      localStorage.setItem('lcns_user', userStr);
      localStorage.setItem('lcns-current-user', userStr);

      setTimeout(() => {
        onClose();
        const role = (user.role || '').toUpperCase().trim();
        if (role === 'ADMIN') window.location.replace('/admin');
        else if (role === 'PROVOST') window.location.replace('/provost');
        else if (role === 'REGISTRAR') window.location.replace('/registrar');
        else if (role === 'HOD') window.location.replace('/hod');
        else if (role === 'LECTURER') window.location.replace('/lecturer');
        else if (role === 'BURSAR') window.location.replace('/bursar');
        else if (role === 'STUDENT') window.location.replace('/student');
        else window.location.replace('/dashboard');
        setTimeout(() => window.location.reload(), 500);
      }, 800);
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
        
        {/* SCHOOL LOGO - CENTERED */}
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/logo.png" 
            alt="LCNS Logo" 
            className="w-20 h-20 object-contain mb-3"
            onError={(e) => {
              // Fallback if logo.png not found - Try other paths
              const target = e.target as HTMLImageElement;
              if (target.src.includes('/logo.png')) target.src = '/lcns-logo.png';
              else if (target.src.includes('lcns-logo.png')) target.src = '/assets/logo.png';
              else target.style.display = 'none';
            }}
          />
          <h2 className="text-2xl font-bold text-green-800">LCNS</h2>
          <p className="text-sm text-gray-600 font-medium">College of Nursing Sciences</p>
          <p className="text-xs text-gray-400 mt-1">Port Harcourt • Rivers State</p>
        </div>

        <h3 className="text-lg font-semibold text-center mb-6 text-gray-800">Staff / Student Login</h3>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email / Staff ID / Matric No</label>
            <input 
              type="text" 
              value={identifier} 
              onChange={e=>setIdentifier(e.target.value)} 
              placeholder="Enter your Email or ID" 
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none" 
              required 
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              placeholder="Enter your password" 
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none" 
              required 
            />
          </div>

          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200">{success}</div>}

          <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white p-3 rounded-lg font-bold transition disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          LCNS Portal © 2026 | ICT Support: 08126799565
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
