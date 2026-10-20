import React, { useState, useEffect } from 'react';
import { AnnouncementService } from '../../lib/announcementService';
import { Announcement } from '../../types/announcement';
import { Trash2, Megaphone, Calendar, AlertTriangle, Plus, Eye, EyeOff } from 'lucide-react';

export const AnnouncementManager: React.FC = () => {
  const [list, setList] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');
  const [showMarquee, setShowMarquee] = useState(true);

  const refresh = () => setList(AnnouncementService.getAll());
  useEffect(() => { refresh(); window.addEventListener('announcements-updated', refresh); return () => window.removeEventListener('announcements-updated', refresh); }, []);

  const handleCreate = () => {
    if(!title || !message) return alert('Fill title and message');
    AnnouncementService.create(title, message, type, showMarquee);
    setTitle(''); setMessage(''); refresh();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-black text-emerald-900 flex items-center gap-2"><Megaphone/> Publish Announcement / Event</h2>
      
      <div className="mt-6 grid gap-3 bg-slate-50 p-4 rounded-xl border">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title e.g. 2026/2027 Admission Closing Soon" className="px-3 py-2 border rounded-lg text-sm"/>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Full message e.g. This is to inform all applicants..." rows={3} className="px-3 py-2 border rounded-lg text-sm"/>
        <div className="flex gap-3 flex-wrap">
          <select value={type} onChange={e=>setType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="announcement">Announcement</option>
            <option value="event">Event</option>
            <option value="admission">Admission</option>
            <option value="urgent">Urgent (Red)</option>
          </select>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showMarquee} onChange={e=>setShowMarquee(e.target.checked)}/> Show in Moving Top Bar</label>
          <button onClick={handleCreate} className="ml-auto bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4"/> Publish</button>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <h3 className="font-bold text-sm">Published ({list.length}) - You can delete anytime</h3>
        {list.length===0 && <p className="text-xs text-slate-500">No announcement yet</p>}
        {list.map(a=>(
          <div key={a.id} className={`p-3 rounded-lg border flex justify-between gap-3 ${a.type==='urgent'?'bg-red-50 border-red-200': a.type==='event'?'bg-blue-50 border-blue-200':'bg-white'}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2"><span className="text-xs font-black uppercase bg-black text-white px-1.5 py-0.5 rounded">{a.type}</span><span className="font-bold text-sm">{a.title}</span>{a.showInMarquee && <span className="text-[10px] bg-amber-400 text-black px-1 rounded">MARQUEE</span>}</div>
              <p className="text-xs text-slate-600 mt-1">{a.message}</p>
              <p className="text-[10px] text-slate-400 mt-1">{new Date(a.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={()=>{AnnouncementService.toggle(a.id); refresh();}} className="p-2 bg-slate-100 rounded">{a.isActive?<Eye className="w-4 h-4"/>:<EyeOff className="w-4 h-4"/>}</button>
              <button onClick={()=>{if(confirm('Delete this?')){AnnouncementService.delete(a.id); refresh();}}} className="p-2 bg-red-100 text-red-600 rounded"><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
