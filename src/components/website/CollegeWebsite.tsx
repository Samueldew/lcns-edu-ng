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
  const hostelImage = hostelImageUrl;

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
      } else {
        const [members, gallery] = await Promise.all([getManagementMembers(), getGalleryItems('All')]);
        setManagementList(members);
        setGalleryList(gallery);
      }
    } catch (err) {
      console.warn('Error loading management / gallery in website:', err);
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
      isBoldTitle: true,
      duration: '4 Years (Uninterrupted Collegiate Track)',
      icon: Stethoscope,
      desc: 'Accredited 4-year collegiate nursing curriculum by NBTE & NMCN. Covers Foundational Nursing, Gross Anatomy, Physiology, Medical Biochemistry, Microbiology, and Clinical Skills Simulation leading directly to higher clinical mastery and council registration.',
      entry: 'JAMB UTME minimum score of 150+ with Use of English, Biology, Chemistry, Physics + 5 O\'Level credits in WAEC/NECO/NABTEB.',
      tag: '4-Year Collegiate Track',
      color: 'emerald',
    },
    {
      id: 'licensing',
      title: 'Professional Licensing & Dual Council Certifications',
      duration: 'NMCN & NBTE Collegiate Awards',
      icon: HeartPulse,
      desc: 'Graduates receive the National Diploma (ND) & Higher National Diploma (HND) in Nursing Sciences, Registered Nurse (RN) license from the Nursing and Midwifery Council of Nigeria (NMCN), and Registered Public Health Nurse (RPHN) license.',
      entry: 'Awarded upon passing the mandatory Nursing and Midwifery Council of Nigeria Professional Qualifying Examinations.',
      tag: 'RN & RPHN Licenses',
      color: 'blue',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* HERO, ABOUT, LEADERSHIP, PROGRAMMES, VALUES sections remain same as your file */}
      {/* ... KEEP ALL YOUR EXISTING SECTIONS UP TO GALLERY ... */}

      {/* GIRLS' HOSTEL ACCOMMODATION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="hostel">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {hostelImage ? (
            <img src={hostelImage} alt="LCNS Girls Hostel" className="w-full h-[400px] object-cover rounded-xl shadow-lg" />
          ) : (
            <div>No hostel image yet</div>
          )}
          <div>
            <h2 className="text-3xl font-bold mb-4">GIRLS' HOSTEL ACCOMMODATION</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Labe College of Nursing Sciences, Gboko, provides a safe, comfortable, and conducive hostel environment for female students.
            </p>
            <p className="font-semibold text-[#0a4d2e]">Learn, Grow, and Excel in a Safe Environment.</p>
          </div>
        </div>
      </section>

      {/* CAMPUS MEDIA GALLERY - ONLY PICTURES, NO TEXT */}
      <section id="gallery" className="py-16 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">Visual Tour</span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase font-serif-crest mt-2">Campus & Clinical Media Gallery</h2>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold">
              {['All', 'General', 'Events', 'Campus', 'Hostel', 'Students'].map((cat) => (
                <button key={cat} onClick={() => setGalleryFilter(cat)} className={`px-3 py-1.5 rounded-xl transition-all ${galleryFilter === cat ? 'bg-[#0a4d2e] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>{cat}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(galleryFilter === 'All' ? galleryList : galleryList.filter((g) => g.category === galleryFilter)).map((item) => (
              <div key={item.id} onClick={() => setSelectedGalleryPhoto(item)} className="rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group cursor-pointer border border-slate-200 bg-white">
                <div className="relative h-72 overflow-hidden bg-slate-900">
                  <img src={item.image_url} alt="LCNS" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="p-3 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Maximize2 className="w-5 h-5 text-slate-900" /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KEEP YOUR CONTACT SECTION BELOW */}
    </div>
  );
};
