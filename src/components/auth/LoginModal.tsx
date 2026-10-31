import { useState } from 'react';
import { ApiService } from '../../services/api';
import { StorageService } from '../../services/storage';
import { User } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: User) => void;
}

export const LoginModal = ({ isOpen, onClose, onLoginSuccess }: Props) => {
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
        
        <div className="flex flex-col items-center mb-5">
          <img src="/logo.png" alt="LCNS Logo" className="w-20 h-20 object-contain mb-2"
            onError={(e) => { (e.target as HTMLImageElement).src = '/lcns-logo.png'; }} />
          <h2 className="text-2xl font-bold text-green-800 tracking-wider">LCNS</h2>
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
      </div>
    </div>
  );
};

export default LoginModal;
