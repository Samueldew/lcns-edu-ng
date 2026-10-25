import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultFormNo?: string;
  onOpenLogin?: () => void;
  onFound?: (formNo: string) => void;
}

export const AdmissionCheckerModal: React.FC<Props> = ({ isOpen, onClose, defaultFormNo, onFound }) => {
  const [formNo, setFormNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // === ADD ONLY - AUTO FILL WHEN COMING FROM APPLICATION FORM ===
  useEffect(() => {
    if (defaultFormNo) {
      setFormNo(defaultFormNo);
    }
  }, [defaultFormNo, isOpen]);
  // === END ADD ===

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNo.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      const cleanFormNo = formNo.trim().toUpperCase();
      
      // Search in Supabase - FIXED: use eq for exact match first, then fallback to ilike
      let { data, error: dbError } = await supabase
        .from('college_applications')
        .select('form_no')
        .eq('form_no', cleanFormNo)
        .maybeSingle();

      // If not found with exact, try ilike
      if (!data) {
        const result = await supabase
          .from('college_applications')
          .select('form_no')
          .ilike('form_no', `%${cleanFormNo}%`)
          .limit(1)
          .maybeSingle();
        data = result.data;
        dbError = result.error;
      }

      if (!data) {
        setError(`No record found for ${cleanFormNo}. Please check your Form Number. Example: LCNS/2026/8902`);
        setLoading(false);
        return;
      }

      // FOUND - Redirect to private dashboard using App.tsx method
      setLoading(false);
      onClose();
      
      if (onFound) {
        onFound(data.form_no);
      } else {
        // Fallback for old App.tsx
        window.history.pushState({}, '', `/applicant/dashboard?app_no=${encodeURIComponent(data.form_no)}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }

    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-emerald-950 text-white p-5 flex justify-between items-center">
          <h2 className="font-bold uppercase text-sm">Check Admission Status</h2>
          <button onClick={onClose} className="text-white text-xl">&times;</button>
        </div>
        
        <form onSubmit={handleSearch} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-slate-600">Enter Application / Form Number</label>
            <input
              type="text"
              value={formNo}
              onChange={(e) => setFormNo(e.target.value)}
              placeholder="e.g. LCNS/2026/8902"
              className="w-full mt-2 px-4 py-3 border-2 border-slate-200 rounded-xl text-sm uppercase font-bold focus:border-emerald-600 outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-2">Example: LCNS/2026/8902</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-bold shadow-md disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </form>
      </div>
    </div>
  );
};
