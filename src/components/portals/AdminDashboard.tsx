import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { COLLEGE_CONFIG } from '../../types';
import { 
  Users, 
  Settings, 
  Image as ImageIcon, 
  BookOpen, 
  GraduationCap,
  Search,
  Plus,
  Trash2,
  Upload,
  Save
} from 'lucide-react';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';

interface Props {
  initialTab?: 'settings' | 'management' | 'gallery' | 'users' | 'cbt' | 'system';
}

export const AdminDashboard: React.FC<Props> = ({ initialTab = 'management' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [users, setUsers] = useState(StorageService.getUsers ? StorageService.getUsers() : []);
  const [courses, setCourses] = useState(StorageService.getCourses ? StorageService.getCourses() : JSON.parse(localStorage.getItem('lcns_courses')||'[]'));
  const [gallery, setGallery] = useState(JSON.parse(localStorage.getItem('lcns_gallery')||'[]'));
  const [search, setSearch] = useState('');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ code: '', title: '', level: 'ND 1', semester: 'First', lecturer: '' });
  const [pictureUrl, setPictureUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const lecturers = users.filter((u:any) => u.role === 'LECTURER' || u.role === 'HOD');

  const handlePictureUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setPictureUrl(url);
        // Save to gallery
        const newGallery = [...gallery, { id: Date.now(), url, title: file.name, date: new Date().toISOString() }];
        setGallery(newGallery);
        localStorage.setItem('lcns_gallery', JSON.stringify(newGallery));
        setUploading(false);
        alert('Picture uploaded! Check Gallery tab');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAllocateCourse = () => {
    if (!newCourse.code || !newCourse.title || !newCourse.lecturer) {
      alert('Fill all fields');
      return;
    }
    const course = { id: Date.now(), ...newCourse, createdAt: new Date().toISOString() };
    const newCourses = [...courses, course];
    setCourses(newCourses);
    localStorage.setItem('lcns_courses', JSON.stringify(newCourses));
    if (StorageService.saveCourses) StorageService.saveCourses(newCourses);
    setShowAddCourse(false);
    setNewCourse({ code: '', title: '', level: 'ND 1', semester: 'First', lecturer: '' });
  };

  const filteredCourses = courses.filter((c:any) => `${c.code} ${c.title} ${c.lecturer}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl">
        <h1 className="text-2xl font-black">Admin Dashboard - Director of ICT</h1>
        <p className="text-xs text-slate-300">Course Allocation to Lecturers + All Applicants Link - Super Fine - Fixed Import Path + Picture Upload</p>
      </div>

      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border shadow-sm no-print">
        <button onClick={()=>setActiveTab('management')} className={`px-4 py-2.5 rounded-xl text-xs font-black flex gap-2 items-center ${activeTab==='management'?'bg-slate-900 text-white':'bg-slate-100'}`}><BookOpen className="w-4 h-4"/>📚 Allocate Courses to Lecturers</button>
        <button onClick={()=>setActiveTab('users')} className={`px-4 py-2.5 rounded-xl text-xs font-black flex gap-2 items-center ${activeTab==='users'?'bg-slate-900 text-white':'bg-slate-100'}`}><Users className="w-4 h-4"/>Users - Lecturers</button>
        <button onClick={()=>setActiveTab('gallery')} className={`px-4 py-2.5 rounded-xl text-xs font-black flex gap-2 items-center ${activeTab==='gallery'?'bg-slate-900 text-white':'bg-slate-100'}`}><ImageIcon className="w-4 h-4"/>Gallery - Pictures</button>
        <button onClick={()=>setActiveTab('settings')} className={`px-4 py-2.5 rounded-xl text-xs font-black flex gap-2 items-center ${activeTab==='settings'?'bg-slate-900 text-white':'bg-slate-100'}`}><Settings className="w-4 h-4"/>Settings</button>
        <button onClick={()=>setActiveTab('system')} className={`px-4 py-2.5 rounded-xl text-xs font-black flex gap-2 items-center ${activeTab==='system'?'bg-purple-700 text-white':'bg-slate-100'}`}><GraduationCap className="w-4 h-4"/>🎓 All Applicants Records</button>
      </div>

      {activeTab==='management' && (
        <div className="bg-white rounded-3xl border-2 p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-black text-lg">📚 Course Allocation - Admin Assigns to Lecturer</h2>
              <p className="text-xs">Lecturer sees on portal - {courses.length} courses - {lecturers.length} lecturers found</p>
            </div>
            <button onClick={()=>setShowAddCourse(true)} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1"><Plus className="w-4 h-4"/>+ Allocate Course</button>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border">
            <Search className="w-4 h-4 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search code, title, lecturer..." className="flex-1 py-2 text-xs bg-transparent outline-none"/>
          </div>

          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-slate-900 text-white"><tr><th className="p-2 text-left">Code</th><th className="p-2 text-left">Title</th><th className="p-2 text-left">Level/Sem</th><th className="p-2 text-left">Lecturer</th><th className="p-2">Action</th></tr></thead>
              <tbody>
                {filteredCourses.length===0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-black">No courses - Click + Allocate - Create LECTURER accounts first</td></tr> :
                filteredCourses.map((c:any)=>(
                  <tr key={c.id} className="border-b hover:bg-slate-50"><td className="p-2 font-mono font-black">{c.code}</td><td className="p-2 font-bold">{c.title}</td><td className="p-2">{c.level} / {c.semester}</td><td className="p-2">{c.lecturer}</td><td className="p-2 text-center"><button onClick={()=>{const nc=courses.filter((x:any)=>x.id!==c.id);setCourses(nc);localStorage.setItem('lcns_courses',JSON.stringify(nc))}} className="p-1 bg-red-100 text-red-700 rounded"><Trash2 className="w-4 h-4"/></button></td></tr>
                ))}
              </tbody>
            </table>
          </div>

          {showAddCourse && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-3">
                <h3 className="font-black">Allocate Course to Lecturer</h3>
                <input value={newCourse.code} onChange={e=>setNewCourse({...newCourse,code:e.target.value})} placeholder="Course Code e.g NRS 111" className="w-full border rounded-xl p-2 text-xs"/>
                <input value={newCourse.title} onChange={e=>setNewCourse({...newCourse,title:e.target.value})} placeholder="Course Title" className="w-full border rounded-xl p-2 text-xs"/>
                <select value={newCourse.level} onChange={e=>setNewCourse({...newCourse,level:e.target.value})} className="w-full border rounded-xl p-2 text-xs"><option>ND 1</option><option>ND 2</option><option>HND 1</option><option>HND 2</option></select>
                <select value={newCourse.semester} onChange={e=>setNewCourse({...newCourse,semester:e.target.value})} className="w-full border rounded-xl p-2 text-xs"><option>First</option><option>Second</option></select>
                <select value={newCourse.lecturer} onChange={e=>setNewCourse({...newCourse,lecturer:e.target.value})} className="w-full border rounded-xl p-2 text-xs">
                  <option value="">Select Lecturer</option>
                  {lecturers.map((l:any)=><option key={l.email} value={l.fullName}>{l.fullName} - {l.email}</option>)}
                </select>
                <div className="flex gap-2"><button onClick={()=>setShowAddCourse(false)} className="flex-1 py-2 bg-slate-100 rounded-xl text-xs font-black">Cancel</button><button onClick={handleAllocateCourse} className="flex-1 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black">Save Allocation</button></div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab==='gallery' && (
        <div className="bg-white rounded-3xl border-2 p-6 space-y-4">
          <h2 className="font-black text-lg">Gallery - Set Pictures</h2>
          <div className="border-2 border-dashed rounded-2xl p-8 text-center space-y-3">
            <Upload className="w-8 h-8 mx-auto text-slate-400"/>
            <p className="text-xs font-bold">Upload College Pictures - Provost, Registrar, Campus</p>
            <input type="file" accept="image/*" onChange={handlePictureUpload} className="text-xs"/>
            {uploading && <p className="text-xs text-amber-600">Uploading...</p>}
            {pictureUrl && <img src={pictureUrl} alt="preview" className="w-32 h-32 object-cover mx-auto rounded-xl border-2"/>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {gallery.map((g:any)=><div key={g.id} className="border rounded-xl overflow-hidden"><img src={g.url} alt={g.title} className="w-full h-24 object-cover"/><p className="p-1 text-[10px] font-bold truncate">{g.title}</p></div>)}
          </div>
          {gallery.length===0 && <p className="text-xs text-slate-400 text-center">No pictures yet - Upload above</p>}
        </div>
      )}

      {activeTab==='users' && (
        <div className="bg-white rounded-3xl border-2 p-4">
          <h2 className="font-black">Lecturers: {lecturers.length} found</h2>
          <div className="mt-3 space-y-2">{lecturers.map((l:any)=><div key={l.email} className="flex justify-between border p-2 rounded-xl text-xs"><span className="font-bold">{l.fullName} - {l.email} - {l.role}</span><span className="bg-green-100 px-2 rounded">{l.status}</span></div>)}</div>
          {lecturers.length===0 && <p className="text-xs text-red-500 mt-2">No lecturers - Go to Settings tab to create LECTURER accounts - You cleared code!</p>}
        </div>
      )}

      {activeTab==='system' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">All Applicants Records - CBT + Interview + Admit - Super Fine Link</div>
          <AdminAdmissionManager currentUser={{id:'admin',email:'admin@lcns.edu.ng',role:'ADMIN',fullName:'Admin',status:'ACTIVE'}} />
        </div>
      )}

      {activeTab==='settings' && (
        <div className="bg-white rounded-3xl border-2 p-6">
          <h2 className="font-black">College Settings - Pictures + Info</h2>
          <p className="text-xs mt-2">College Name: {COLLEGE_CONFIG.NAME}</p>
          <p className="text-xs">Session: {COLLEGE_CONFIG.CURRENT_SESSION}</p>
          <p className="text-xs mt-4 font-bold">To restore your old picture settings, check GitHub history for AdminDashboard.tsx before today</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
