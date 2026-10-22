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
      {/* HERO SECTION - FULL RESTORED */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a4d2e] via-[#06321e] to-[#042114] text-white pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#06321e] border border-[#22c55e]/30 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#ca8a04]" />
                <span>2026/2027 Admissions Now Open • Apply Today</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black uppercase font-serif-crest leading-tight tracking-tight">
                Labe College of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#facc15] via-[#ca8a04] to-[#fef08a]">Nursing Sciences, Gboko</span>
              </h1>
              <p className="text-emerald-100 text-base sm:text-lg max-w-2xl leading-relaxed">
                Pioneering excellence in collegiate nursing education in Benue State through our comprehensive <strong>4-Year Uninterrupted ND/HND in Nursing Sciences</strong>. Established by Benue State Law under the Catholic Diocese of Gboko, accredited by NMCN and NBTE.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button onClick={onOpenApplication} className="px-6 py-3.5 bg-[#ca8a04] hover:bg-[#a16207] text-slate-950 font-black rounded-xl text-sm shadow-xl transition-all flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#0a4d2e]" />
                  <span>Apply for 4-Year ND/HND Nursing</span>
                </button>
                <button onClick={onOpenAdmissionChecker} className="px-5 py-3.5 bg-[#0a4d2e] hover:bg-[#073822] border border-[#22c55e]/40 text-white font-bold rounded-xl text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#22c55e]" />
                  <span>Check Admission Status</span>
                </button>
                <button onClick={onOpenLogin} className="px-4 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-emerald-100 font-semibold rounded-xl text-sm">
                  <span>Student & Staff Portal →</span>
                </button>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-gradient-to-br from-[#0a4d2e]/90 to-[#042114]/90 p-8 rounded-3xl border border-[#22c55e]/30 shadow-2xl backdrop-blur-xl text-center">
                <div className="flex justify-center mb-4"><CollegeLogo size="xl" /></div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider">LCNS Gboko</h3>
                <p className="text-xs text-[#ca8a04] font-bold uppercase tracking-widest mt-1">Motto: Learn, Serve & Save</p>
                <div className="mt-6 pt-6 border-t border-[#0a4d2e]/80 grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 bg-[#06321e]/80 rounded-xl border border-[#22c55e]/30"><div className="text-lg font-black text-[#ca8a04]">4 Years</div><div className="text-[10px] text-emerald-200 uppercase font-semibold">ND/HND Nursing</div></div>
                  <div className="p-2 bg-[#06321e]/80 rounded-xl border border-[#22c55e]/30"><div className="text-lg font-black text-[#ca8a04]">150+</div><div className="text-[10px] text-emerald-200 uppercase font-semibold">JAMB Cut-Off</div></div>
                  <div className="p-2 bg-[#06321e]/80 rounded-xl border border-[#22c55e]/30"><div className="text-lg font-black text-[#ca8a04]">NYSC</div><div className="text-[10px] text-emerald-200 uppercase font-semibold">Mobilization</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK SERVICES */}
      <section className="bg-white border-y border-slate-200 shadow-xs relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={onOpenApplication} className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-left flex items-start gap-3.5"><div className="p-2.5 bg-[#0a4d2e] text-white rounded-xl"><GraduationCap className="w-5 h-5 text-[#ca8a04]" /></div><div><h4 className="font-bold text-slate-900 text-sm">Online Admission Form</h4><p className="text-xs text-slate-600">Complete 2026/2027 application.</p></div></button>
            <button onClick={onOpenAdmissionChecker} className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-left flex items-start gap-3.5"><div className="p-2.5 bg-[#ca8a04] rounded-xl"><FileText className="w-5 h-5 text-[#0a4d2e]" /></div><div><h4 className="font-bold text-slate-900 text-sm">Check Admission Status</h4><p className="text-xs text-slate-600">Verify merit list & print letter.</p></div></button>
            <button onClick={onOpenLogin} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left flex items-start gap-3.5"><div className="p-2.5 bg-[#0a4d2e] text-white rounded-xl"><BookOpen className="w-5 h-5 text-[#22c55e]" /></div><div><h4 className="font-bold text-slate-900 text-sm">Student ERP Portal</h4><p className="text-xs text-slate-600">Course registration & results.</p></div></button>
            <a href="#contact" className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-left flex items-start gap-3.5"><div className="p-2.5 bg-[#0a4d2e] text-white rounded-xl"><Phone className="w-5 h-5 text-[#ca8a04]" /></div><div><h4 className="font-bold text-slate-900 text-sm">ICT Support Desk</h4><p className="text-xs text-slate-600">08126799565 / info@lcns.edu.ng</p></div></a>
          </div>
        </div>
      </section>

      {/* ABOUT - FULL RESTORED */}
      <section id="about" className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border-4 border-[#0a4d2e] shadow-xl bg-slate-900 text-white p-7 text-center">
                <div className="w-36 h-44 mx-auto rounded-2xl overflow-hidden border-4 border-[#ca8a04] mb-4 bg-[#06321e] flex items-center justify-center">
                  {cmsConfig.provostPhotoUrl ? <img src={cmsConfig.provostPhotoUrl} alt={cmsConfig.provostName || 'Provost'} className="w-full h-full object-cover" /> : <CollegeLogo size="lg" />}
                </div>
                <h3 className="text-base font-bold text-white">{cmsConfig.provostName || 'Mrs Terna Fiase Msc, Bnsc'}</h3>
                <p className="text-xs font-semibold text-[#ca8a04] uppercase">{cmsConfig.provostTitle || 'Provost, LCNS Gboko'}</p>
                <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-300 italic">"{cmsConfig.provostMessage || 'At LCNS Gboko, our solemn oath is to train nurses who embody compassion.'}"</div>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase">Shaping the Future of Nursing & Healthcare in Nigeria</h2>
              <p className="text-slate-600 text-sm leading-relaxed"><strong>Labe College of Nursing Sciences (LCNS), Gboko</strong> was established under the Catholic Diocese of Gboko. Approved and fully accredited for 5 years by NMCN and NBTE, offers exclusively 4-Year ND/HND in Nursing Sciences.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200"><h4 className="font-bold text-[#0a4d2e] text-sm mb-2">Vision Statement</h4><p className="text-xs text-slate-700">Labe College of Nursing Sciences is committed to be an outstanding College recognized for excellence in healthcare training and practice.</p></div>
                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200"><h4 className="font-bold text-[#ca8a04] text-sm mb-2">Mission Statement</h4><p className="text-xs text-slate-700">Provide high-quality nursing training that fosters compassionate, competent, and innovative healthcare professionals.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP - FULL RESTORED */}
      <section id="leadership" className="py-16 bg-gradient-to-b from-amber-50/60 via-slate-50 to-white border-t border-[#ca8a04]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto"><h2 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase">College Leadership & Principal Officers</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {managementList.filter((m) => m.is_active).map((member) => (
              <div key={member.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                <div className="relative aspect-[3/4] bg-slate-900 overflow-hidden">
                  {member.photo_url ? <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 text-xs">LCNS Officer</div>}
                </div>
                <div className="p-5"><h3 className="font-black text-slate-900 text-sm">{member.name}</h3><p className="text-xs font-semibold text-[#0a4d2e]">{member.title}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMMES - FULL RESTORED */}
      <section id="programmes" className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12"><h2 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase">4-Year ND/HND in Nursing Sciences</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programmes.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.id} className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
                  <div className="flex items-start justify-between"><div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl"><Icon className="w-7 h-7" /></div><span className="text-[11px] font-black uppercase bg-slate-100 px-3 py-1 rounded-full">{p.tag}</span></div>
                  <h3 className="text-lg font-black text-slate-900 mt-4 uppercase">{p.title}</h3>
                  <p className="text-xs text-slate-600 mt-2">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOSTEL */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="hostel">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {hostelImage ? <img src={hostelImage} alt="LCNS Girls Hostel" className="w-full h-[400px] object-cover rounded-xl shadow-lg" /> : <div>No hostel image yet</div>}
          <div><h2 className="text-3xl font-bold mb-4">GIRLS' HOSTEL ACCOMMODATION</h2><p className="text-gray-700">Safe, comfortable hostel environment for female students.</p></div>
        </div>
      </section>

      {/* GALLERY - ONLY PICTURES - FIXED BUILD */}
      <section id="gallery" className="py-16 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">Visual Tour</span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase mt-2">Campus & Clinical Media Gallery</h2>
              <p className="text-xs text-slate-600 mt-1">Original campus photos from LCNS Gboko</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 text-xs font-bold">
              {['All', 'General', 'Events', 'Campus', 'Hostel', 'Students'].map((cat) => (
                <button key={cat} onClick={() => setGalleryFilter(cat)} className={`px-3 py-1.5 rounded-xl ${galleryFilter === cat ? 'bg-[#0a4d2e] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{cat}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              const filtered = galleryFilter === 'All' ? galleryList : galleryList.filter((g) => g.category === galleryFilter);
              const list = filtered.length > 0 ? filtered : galleryList;
              return list.map((item) => (
                <div key={item.id} onClick={() => setSelectedGalleryPhoto(item)} className="rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all group cursor-pointer border border-slate-200 bg-white">
                  <div className="relative h-72 overflow-hidden bg-slate-900">
                    <img src={item.image_url} alt="LCNS Gboko" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <div className="p-3 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Maximize2 className="w-5 h-5 text-slate-900" /></div>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </section>

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-6"><h2 className="text-2xl font-black uppercase">Contact LCNS Gboko</h2><p className="text-sm text-slate-300 mt-2">Off Gboko Hill, Along Agbile Road, Gboko, Benue State | 08126799565 | info@lcns.edu.ng</p></div>
            <div className="lg:col-span-6 bg-white text-slate-900 p-8 rounded-3xl"><h3 className="font-black uppercase">Send Enquiry</h3><p className="text-xs text-slate-600 mt-2">ICT Support Desk will respond promptly.</p></div>
          </div>
        </div>
      </section>
    </div>
  );
};
