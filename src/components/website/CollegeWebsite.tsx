import React, { useState, useEffect } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { COLLEGE_CONFIG, Notice, CMSConfig, GalleryItem } from '../../types';
import { StorageService } from '../../services/storage';
import {
  getManagementMembers,
  getGalleryItems,
  deleteGalleryItem,
} from '../../lib/uploadPermanent';
import { SupabaseManagementMember, SupabaseGalleryItem } from '../../lib/supabase';
import {
  GraduationCap,
  ShieldCheck,
  Award,
  CheckCircle2,
  Calendar,
  FileText,
  Building2,
  Users,
  BookOpen,
  ArrowRight,
  Stethoscope,
  HeartPulse,
  Baby,
  Activity,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  Church,
  Image as ImageIcon,
  X,
  Maximize2,
} from 'lucide-react';
import { getSupabase, getHostelImageUrl } from '../../lib/supabase';

interface CollegeWebsiteProps {
  onOpenLogin: () => void;
  onOpenApplication: () => void;
  onOpenAdmissionChecker: () => void;
}

export const CollegeWebsite: React.FC<CollegeWebsiteProps> = ({
  onOpenLogin,
  onOpenApplication,
  onOpenAdmissionChecker,
}) => {
  const [currentUser, setCurrentUser] = useState(StorageService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'all' | 'nd' | 'rn' | 'rm'>('all');
  const [cmsConfig, setCmsConfig] = useState<CMSConfig>(StorageService.getCMSConfig());
  const [galleryFilter, setGalleryFilter] = useState<string>('All');
  const [managementList, setManagementList] = useState<SupabaseManagementMember[]>([]);
  const [galleryList, setGalleryList] = useState<SupabaseGalleryItem[]>([]);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<SupabaseGalleryItem | null>(null);

  const hostelItem = galleryList.find(
    (g) => g.category?.toLowerCase() === 'hostel' || g.title?.toLowerCase().includes('hostel')
  );
  const hostelImageUrl = hostelItem?.image_url || getHostelImageUrl();

  const loadData = async () => {
    try {
      const sb = getSupabase();
      if (sb) {
        const { data: galleryData } = await sb.from('gallery').select('*').order('created_at', { ascending: false });
        if (galleryData && galleryData.length > 0) {
          setGalleryList(galleryData);
        } else {
          const fallback = await getGalleryItems('All');
          setGalleryList(fallback);
        }
        const { data: mgmtData } = await sb.from('management').select('*').order('display_order', { ascending: true });
        if (mgmtData && mgmtData.length > 0) {
          setManagementList(mgmtData);
        } else {
          const fallbackMgmt = await getManagementMembers();
          setManagementList(fallbackMgmt);
        }
      }
    } catch (err) {
      console.warn('Error loading:', err);
    }
  };

  useEffect(() => {
    loadData();
    const handleStorageUpdate = () => {
      setCmsConfig(StorageService.getCMSConfig());
      setCurrentUser(StorageService.getCurrentUser());
      loadData();
    };
    window.addEventListener('lcns_storage_update', handleStorageUpdate);
    window.addEventListener('lcns_auth_update', handleStorageUpdate);
    window.addEventListener('lcns_management_update', handleStorageUpdate);
    window.addEventListener('lcns_gallery_update', handleStorageUpdate);
    return () => {
      window.removeEventListener('lcns_storage_update', handleStorageUpdate);
      window.removeEventListener('lcns_auth_update', handleStorageUpdate);
      window.removeEventListener('lcns_management_update', handleStorageUpdate);
      window.removeEventListener('lcns_gallery_update', handleStorageUpdate);
    };
  }, []);

  const programmes = [
    {
      id: 'nd-hnd-programme',
      title: 'ND/HND Nursing Science 4years',
      duration: '4 Years (Uninterrupted Collegiate Track)',
      icon: Stethoscope,
      desc: 'Accredited 4-year collegiate nursing curriculum by NBTE & NMCN.',
      entry: 'JAMB UTME minimum score of 150+ with Use of English, Biology, Chemistry, Physics + 5 O\'Level credits.',
      tag: '4-Year Collegiate Track',
    },
    {
      id: 'licensing',
      title: 'Professional Licensing & Dual Council Certifications',
      duration: 'NMCN & NBTE Collegiate Awards',
      icon: HeartPulse,
      desc: 'Graduates receive ND & HND in Nursing Sciences, RN and RPHN license.',
      entry: 'Awarded upon passing NMCN Professional Qualifying Examinations.',
      tag: 'RN & RPHN Licenses',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* HERO - RESTORED */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a4d2e] via-[#06321e] to-[#042114] text-white pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#06321e] border border-[#22c55e]/30 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#ca8a04]" />
                <span>2026/2027 Admissions Now Open • Apply Today</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black uppercase leading-tight">
                Labe College of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#facc15] via-[#ca8a04] to-[#fef08a]">Nursing Sciences, Gboko</span>
              </h1>
              <p className="text-emerald-100 text-base max-w-2xl">Pioneering excellence in collegiate nursing education in Benue State through our comprehensive 4-Year ND/HND.</p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button onClick={onOpenApplication} className="px-6 py-3.5 bg-[#ca8a04] text-slate-950 font-black rounded-xl text-sm flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Apply for 4-Year ND/HND</button>
                <button onClick={onOpenAdmissionChecker} className="px-5 py-3.5 bg-[#0a4d2e] border border-[#22c55e]/40 text-white font-bold rounded-xl text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-[#22c55e]" /> Check Admission Status</button>
                <button onClick={onOpenLogin} className="px-4 py-3.5 bg-white/10 border border-white/20 text-emerald-100 font-semibold rounded-xl text-sm">Student & Staff Portal →</button>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-gradient-to-br from-[#0a4d2e]/90 to-[#042114]/90 p-8 rounded-3xl border border-[#22c55e]/30 text-center">
                <CollegeLogo size="xl" />
                <h3 className="text-xl font-black text-white uppercase mt-4">LCNS Gboko</h3>
                <p className="text-xs text-[#ca8a04] font-bold uppercase">Motto: Learn, Serve & Save</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOSTEL */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="hostel">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {hostelImageUrl ? <img src={hostelImageUrl} alt="LCNS Girls Hostel" className="w-full h-[400px] object-cover rounded-xl shadow-lg" /> : <div>No hostel image yet</div>}
          <div>
            <h2 className="text-3xl font-bold mb-4">GIRLS' HOSTEL ACCOMMODATION</h2>
            <p className="text-gray-700 leading-relaxed">Safe, comfortable, and conducive hostel environment for female students.</p>
            <p className="font-semibold text-[#0a4d2e] mt-2">Learn, Grow, and Excel in a Safe Environment.</p>
          </div>
        </div>
      </section>

      {/* GALLERY - ONLY PICTURES NOW */}
      <section id="gallery" className="py-16 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">Visual Tour</span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase mt-2">Campus & Clinical Media Gallery</h2>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 text-xs font-bold">
              {['All', 'General', 'Events', 'Campus', 'Hostel', 'Students'].map((cat) => (
                <button key={cat} onClick={() => setGalleryFilter(cat)} className={`px-3 py-1.5 rounded-xl ${galleryFilter === cat ? 'bg-[#0a4d2e] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{cat}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(galleryFilter === 'All' ? galleryList : galleryList.filter((g) => g.category === galleryFilter)).length > 0
              ? galleryFilter === 'All' ? galleryList : galleryList.filter((g) => g.category === galleryFilter)
              : galleryList
            ).map((item) => (
              <div key={item.id} onClick={() => setSelectedGalleryPhoto(item)} className="rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all group cursor-pointer border border-slate-200 bg-white">
                <div className="relative h-72 overflow-hidden bg-slate-900">
                  <img src={item.image_url} alt="LCNS Gboko" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="p-3 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Maximize2 className="w-5 h-5 text-slate-900" /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      {selectedGalleryPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedGalleryPhoto(null)}>
          <div className="relative max-w-4xl w-full">
            <button onClick={() => setSelectedGalleryPhoto(null)} className="absolute -top-10 right-0 text-white bg-white/20 p-2 rounded-full"><X className="w-6 h-6" /></button>
            <img src={selectedGalleryPhoto.image_url} alt="LCNS" className="w-full h-auto max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* CONTACT */}
      <section id="contact" className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-black uppercase">Contact LCNS Gboko</h2>
          <p className="text-sm text-slate-300 mt-2">Off Gboko Hill, Along Agbile Road, Gboko, Benue State | 08126799565 | info@lcns.edu.ng</p>
        </div>
      </section>
    </div>
  );
};
