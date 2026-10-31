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
      localStorage.setItem('lcns_current_user', JSON.stringify(user));
      localStorage.setItem('current_user', JSON.stringify(user));
      setTimeout(() => {
        onClose();
        const role = (user.role || '').toUpperCase();
        if (role === 'ADMIN') window.location.href = '/admin';
        else if (role === 'PROVOST') window.location.href = '/provost';
        else if (role === 'REGISTRAR') window.location.href = '/registrar';
        else if (role === 'LECTURER') window.location.href = '/lecturer';
        else if (role === 'STUDENT') window.location.href = '/student';
        else window.location.href = '/dashboard';
      }, 800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500">✕</button>
        <h2 className="text-2xl font-bold text-center text-green-800">LCNS Portal Login</h2>
        <p className="text-center text-sm text-gray-500 mb-6">Email or Staff ID</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder="samuel@lcns.edu.ng or LCNS/ADM/26/001" className="w-full p-3 border rounded-lg" required />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Lcns@33" className="w-full p-3 border rounded-lg" required />
          <p className="text-xs text-gray-500">Staff: Lcns@33 | Students: 6-digit PIN</p>
          {error && <div className="bg-red-50 text-red-700 p-3 rounded text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 p-3 rounded text-sm">{success}</div>}
          <button type="submit" disabled={loading} className="w-full bg-green-700 text-white p-3 rounded-lg font-bold">{loading?'Logging in...':'Login'}</button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
