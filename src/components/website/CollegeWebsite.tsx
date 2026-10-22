import React, { useState, useEffect } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { COLLEGE_CONFIG, CMSConfig } from '../../types';
import { StorageService } from '../../services/storage';
import { getManagementMembers, getGalleryItems } from '../../lib/uploadPermanent';
import { SupabaseManagementMember, SupabaseGalleryItem } from '../../lib/supabase';
import { GraduationCap, ShieldCheck, Award, CheckCircle2, FileText, Building2, Users, BookOpen, ArrowRight, Stethoscope, HeartPulse, Activity, Phone, Mail, MapPin, Sparkles, Church, Image as ImageIcon, X, Maximize2 } from 'lucide-react';
import { getSupabase, getHostelImageUrl } from '../../lib/supabase';

interface CollegeWebsiteProps { onOpenLogin: () => void; onOpenApplication: () => void; onOpenAdmissionChecker: () => void; }

export const CollegeWebsite: React.FC<CollegeWebsiteProps> = ({ onOpenLogin, onOpenApplication, onOpenAdmissionChecker }) => {
  const [cmsConfig, setCmsConfig] = useState<CMSConfig>(StorageService.getCMSConfig());
  const [galleryFilter, setGalleryFilter] = useState<string>('All');
  const [managementList, setManagementList] = useState<SupabaseManagementMember[]>([]);
  const [galleryList, setGalleryList] = useState<SupabaseGalleryItem[]>([]);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<SupabaseGalleryItem | null>(null);
  const hostelItem = galleryList.find((g) => g.category?.toLowerCase() === 'hostel' || g.title?.toLowerCase().includes('hostel'));
  const hostelImage = hostelItem?.image_url || getHostelImageUrl();
  const loadData = async () => { try { const sb = getSupabase(); if (sb) { const { data: galleryData } = await sb.from('gallery').select('*').order('created_at', { ascending: false }); if (galleryData && galleryData.length > 0) setGalleryList(galleryData); else { const f = await getGalleryItems('All'); setGalleryList(f); } const { data: mgmtData } = await sb.from('management').select('*').order('display_order', { ascending: true }); if (mgmtData && mgmtData.length > 0) setManagementList(mgmtData); else { const fm = await getManagementMembers(); setManagementList(fm); } } } catch (e) { console.warn(e); } };
  useEffect(() => { loadData(); const h = () => { setCmsConfig(StorageService.getCMSConfig()); loadData(); }; window.addEventListener('lcns_storage_update', h); return () => window.removeEventListener('lcns_storage_update', h); }, []);

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a4d2e] via-[#06321e] to-[#042114] text-white pt-12 pb-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#06321e] border border-[#22c55e]/30 text-emerald-200 text-xs font-bold uppercase"><Sparkles className="w-3.5 h-3.5 text-[#ca8a04]" />2026/2027 Admissions Now Open</div>
              <h1 className="text-3xl sm:text-5xl font-black uppercase leading-tight">Labe College of <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#facc15] via-[#ca8a04] to-[#fef08a]">Nursing Sciences, Gboko</span></h1>
              <p className="text-emerald-100 max-w-2xl">Pioneering excellence in collegiate nursing education through 4-Year ND/HND. Bishop, Catholic Diocese of Gboko, accredited by NMCN & NBTE.</p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button onClick={onOpenApplication} className="px-6 py-3.5 bg-[#ca8a04] text-slate-950 font-black rounded-xl text-sm flex items-center gap-2"><GraduationCap className="w-5 h-5" />Apply Now</button>
                <button onClick={onOpenAdmissionChecker} className="px-5 py-3.5 bg-[#0a4d2e] border border-[#22c55e]/40 text-white font-bold rounded-xl text-sm flex items-center gap-2"><FileText className="w-4 h-4" />Check Admission</button>
                <button onClick={onOpenLogin} className="px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-sm">Student & Staff Portal →</button>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center"><div className="w-full max-w-md bg-gradient-to-br from-[#0a4d2e]/90 to-[#042114]/90 p-8 rounded-3xl border border-[#22c55e]/30 text-center"><CollegeLogo size="xl" /><h3 className="text-xl font-black text-white uppercase mt-4">LCNS Gboko</h3><p className="text-xs text-[#ca8a04] font-bold uppercase">Motto: Learn, Serve & Save</p></div></div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6">
          <div className="p-7 bg-emerald-50 rounded-3xl border-2 border-emerald-200"><h3 className="font-black text-[#0a4d2e] text-xl uppercase">LEARN</h3><p className="text-sm text-slate-700 mt-4">Facilitating reflective, active and lifelong learning in an engaging, dynamic and innovative educational environment.</p></div>
          <div className="p-7 bg-amber-50 rounded-3xl border-2 border-amber-200"><h3 className="font-black text-[#ca8a04] text-xl uppercase">SERVE</h3><p className="text-sm text-slate-700 mt-4">Providing innovative caring for the needs of all people with sensitivity, compassion, and holistic Christ-centered service.</p></div>
          <div className="p-7 bg-slate-900 rounded-3xl border-2 border-slate-700 text-white"><h3 className="font-black text-[#ca8a04] text-xl uppercase">SAVE</h3><p className="text-sm text-slate-300 mt-4">Decisive clinical competence and evidence-based practice to preserve human life, alleviate suffering, and promote wellness.</p></div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold bg-slate-900 text-white px-3 py-1 rounded-full uppercase">About The College</span>
          <h2 className="text-3xl font-black uppercase mt-3">Founding & Heritage</h2>
          <div className="mt-8 bg-white border-2 rounded-3xl p-8 space-y-4">
            <p className="text-sm leading-relaxed">Is the brainchild of the Bishop, Catholic Diocese of Gboko, Most Rev. William A. Avenya, and is named after a humanitarian, late Pharmacist Ternenge Labe in a bid to immortalize him for the selfless services he rendered to people within Gboko Diocese, Benue State and beyond.</p>
            <p className="text-sm leading-relaxed">It says the institution aims to train Nigerian youths: With compassion and fear of God, on the best global nursing practices. It further states that the programme is intended to improve students skills and prepare them to become world-class nursing practitioners, including indigent youths who may not be able to afford studying outside Nigeria.</p>
            <div className="grid md:grid-cols-3 gap-4 pt-4">
              <div className="bg-emerald-50 p-5 rounded-2xl border"><h4 className="font-bold text-sm text-[#0a4d2e]">Named After</h4><p className="text-xs mt-1"><strong>Late Pharmacist Ternenge Labe</strong> - honours his selfless services to people within Gboko Diocese, Benue State and beyond.</p></div>
              <div className="bg-amber-50 p-5 rounded-2xl border"><h4 className="font-bold text-sm text-[#ca8a04]">Proprietor / Brainchild</h4><p className="text-xs mt-1"><strong>Most Rev. William A. Avenya</strong> - Catholic Bishop of Gboko Diocese.</p></div>
              <div className="bg-slate-900 text-white p-5 rounded-2xl"><h4 className="font-bold text-sm text-[#ca8a04]">Campus</h4><p className="text-xs mt-1">Off Gboko Hill Road, Gboko, PMB 1955, Gboko</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-[#0a4d2e] to-[#042114] text-white p-8 rounded-3xl"><span className="text-xs font-bold text-[#22c55e] uppercase">4. Vision</span><p className="text-sm mt-3 leading-relaxed">Labe College of Nursing Sciences (LCNS) is committed to be an outstanding College of Nursing Sciences, recognized for excellence in healthcare training and practice, with a commitment to improving health care delivery, promoting social justice, and advancing the medical profession.</p></div>
          <div className="bg-gradient-to-br from-slate-900 to-[#0a4d2e] text-white p-8 rounded-3xl"><span className="text-xs font-bold text-[#ca8a04] uppercase">5. Mission</span><p className="text-sm mt-3 leading-relaxed">Our mission is to provide high-quality nursing training and service that fosters compassionate, competent, and innovative healthcare professionals who improve healthcare outcomes and promote wellness with the fear of God, within the Diocese and beyond.</p></div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="bg-white rounded-3xl p-8 border shadow-md">
            <span className="text-xs font-bold bg-amber-50 text-[#ca8a04] px-3 py-1 rounded-full uppercase border">6. College Philosophy</span>
            <h3 className="text-2xl font-black uppercase mt-3">College Philosophy</h3>
            <p className="text-sm text-slate-700 mt-4">Healthcare education is a lifelong process progressing from basic to advanced learning. It emphasizes: Evidence-based nursing practice, Scholarly and research activities, Healthcare improvement, Diversity and equity, Professional and social conscience, Best-practice standards, Development of healthcare leaders.</p>
            <h4 className="font-black uppercase mt-8 text-[#0a4d2e]">Nursing beliefs - six major beliefs covering:</h4>
            <div className="mt-4 grid md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border">1. Nursing as a human science vocation and professional discipline.</div>
              <div className="p-4 bg-slate-50 rounded-xl border">2. Respect for the uniqueness, values and cultural beliefs of every client.</div>
              <div className="p-4 bg-slate-50 rounded-xl border">3. Core nursing competencies including clinical judgement, advocacy, caring, systems thinking and clinical inquiry.</div>
              <div className="p-4 bg-slate-50 rounded-xl border">4. Faculty commitment to excellence, lifelong learning, social justice and cultural harmony.</div>
              <div className="p-4 bg-slate-50 rounded-xl border">5. Active student participation and accountability in learning.</div>
              <div className="p-4 bg-slate-50 rounded-xl border">6. Collaboration with local and international, governmental and non-governmental organizations.</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border shadow-md">
            <span className="text-xs font-bold bg-emerald-100 text-[#0a4d2e] px-3 py-1 rounded-full uppercase">7. College Objectives</span>
            <h3 className="text-2xl font-black uppercase mt-3">College Objectives</h3>
            <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-emerald-50 rounded-xl border">1. Train youths with compassion and fear of God on global nursing best practices.</div>
              <div className="p-4 bg-emerald-50 rounded-xl border">2. Enhance clinical skills and widen horizons to produce world-class nursing practitioners.</div>
              <div className="p-4 bg-amber-50 rounded-xl border">3. Provide accessible high-standard healthcare education for indigent youths without foreign study expenses.</div>
              <div className="p-4 bg-amber-50 rounded-xl border">4. Promote wellness, prevent illness and provide holistic care within the Catholic Diocese of Gboko and beyond.</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#0a4d2e] to-[#083c24] text-white p-8 rounded-3xl">
            <h3 className="text-2xl font-black uppercase text-center">8. Core Values - 11 Core Values</h3>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {['1. Commitment','2. Conscience','3. Competence','4. Compassion','5. Confidence','6. Professionalism','7. Caring','8. Services','9. Quality','10. Learning','11. Individuality of Care'].map((v) => (<div key={v} className="bg-white/10 border border-white/20 p-3 rounded-xl text-center font-bold text-xs">{v}</div>))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border shadow-md">
            <span className="text-xs font-bold bg-amber-100 text-[#ca8a04] px-3 py-1 rounded-full uppercase">9. School Colours & Logo Symbolism</span>
            <h3 className="text-2xl font-black uppercase mt-3">Six Colours</h3>
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              <div className="bg-green-50 border-2 border-green-200 p-6 rounded-2xl"><h4 className="font-black">Green - Healing, growth, care</h4><p className="text-xs mt-1">Represents health, healing, life, growth and renewal.</p></div>
              <div className="bg-slate-50 border-2 p-6 rounded-2xl"><h4 className="font-black">White - Purity, ethics, professionalism</h4><p className="text-xs mt-1">Represents purity, cleanliness, peace, integrity and nursing professionalism.</p></div>
              <div className="bg-slate-100 border-2 p-6 rounded-2xl"><h4 className="font-black">Black - Medical seriousness, tradition</h4><p className="text-xs mt-1">Represents strength, seriousness, professionalism and diocesan cultural identity.</p></div>
              <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl"><h4 className="font-black">Red - Passion, service, urgency</h4><p className="text-xs mt-1">Represents passion, sacrifice, care and the lifesaving nature of nursing.</p></div>
              <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-2xl"><h4 className="font-black">Orange - Motivation, optimism, creativity</h4><p className="text-xs mt-1">Represents enthusiasm, creativity, encouragement and motivation.</p></div>
              <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-2xl"><h4 className="font-black">Brown Oil Lamp - Wisdom, nursing tradition</h4><p className="text-xs mt-1">Represents tradition, wisdom and reliability and references Florence Nightingale's nursing tradition.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold bg-emerald-100 px-3 py-1 rounded-full uppercase">10. Programmes</span>
          <h2 className="text-3xl font-black uppercase mt-3">ND/HND Nursing Science - Code: ND-NUR - Duration: 4Years</h2>
          <p className="text-sm text-slate-700 mt-3">Accredited ND/HND Nursing Science programme designed to produce compassionate, clinically proficient, and ethical nurses equipped for modern healthcare delivery.</p>
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border"><span className="font-bold text-xs uppercase">Entry Requirements</span><p className="text-xs mt-2">Minimum of 5 O-Level credit passes in English Language, Mathematics, Biology, Chemistry, Physics at not more than two sittings in WAEC/NECO/NABTEB, together with a valid JAMB UTME score.</p></div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border"><span className="text-xs font-bold bg-slate-900 text-white px-3 py-1 rounded-full uppercase">11. Departments</span><h3 className="text-2xl font-black uppercase mt-3">Department of Nursing Sciences</h3><p className="text-sm mt-2">Department of Nursing Sciences - Comprehensive nursing education.</p></div>
          <div className="bg-white p-8 rounded-3xl border"><span className="text-xs font-bold bg-[#0a4d2e] text-white px-3 py-1 rounded-full uppercase">12. Facilities</span><h3 className="text-2xl font-black uppercase mt-3">College Facilities</h3><div className="mt-4 grid grid-cols-1 gap-2 text-xs">{['Administrative block','Large classroom','Computer/ICT laboratory','Library','Nursing laboratory','Midwifery laboratory','Provost office','Registrar office','Bursary','Staff common room','Staff offices','Hostel','Cafeteria','Matron/Sister offices','Sick bay','Large multipurpose auditorium with capacity of over 1,000','ICT centre','Nursing demonstration rooms','Midwifery demonstration rooms','Reserved sports centre'].map((f) => (<div key={f} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"><CheckCircle2 className="w-3 h-3 text-[#22c55e]" />{f}</div>))}</div></div>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="hostel">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {hostelImage ? <img src={hostelImage} alt="LCNS Girls Hostel" className="w-full h-[400px] object-cover rounded-xl shadow-lg" /> : <div>No hostel image yet</div>}
          <div><h2 className="text-3xl font-bold uppercase">Girls Hostel Accommodation</h2><p className="text-sm text-gray-700 mt-4">Safe, comfortable, conducive hostel environment for female students.</p></div>
        </div>
      </section>

      <section id="gallery" className="py-16 bg-slate-100/70 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between mb-8"><div><span className="text-xs font-bold bg-emerald-100 px-3 py-1 rounded-full uppercase">Visual Tour</span><h2 className="text-3xl font-black uppercase mt-2">Campus Media Gallery</h2></div><div className="flex gap-1 bg-white p-1 rounded-xl border text-xs font-bold">{['All','General','Events','Campus','Hostel','Students'].map((c) => (<button key={c} onClick={() => setGalleryFilter(c)} className={`px-3 py-1.5 rounded-lg ${galleryFilter === c ? 'bg-[#0a4d2e] text-white' : 'hover:bg-slate-100'}`}>{c}</button>))}</div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              const filtered = galleryFilter === 'All' ? galleryList : galleryList.filter((g) => g.category === galleryFilter);
              const list = filtered.length > 0 ? filtered : galleryList;
              return list.map((item) => (
                <div key={item.id} onClick={() => setSelectedGalleryPhoto(item)} className="rounded-2xl overflow-hidden border bg-white group cursor-pointer"><div className="h-72 bg-slate-900 overflow-hidden"><img src={item.image_url} alt="LCNS" className="w-full h-full object-cover group-hover:scale-105 transition" /></div></div>
              ));
            })()}
          </div>
        </div>
      </section>

      {selectedGalleryPhoto && (<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedGalleryPhoto(null)}><div className="relative max-w-4xl w-full"><button onClick={() => setSelectedGalleryPhoto(null)} className="absolute -top-10 right-0 text-white bg-white/20 p-2 rounded-full"><X className="w-6 h-6" /></button><img src={selectedGalleryPhoto.image_url} alt="LCNS" className="w-full max-h-[80vh] object-contain rounded-xl" /></div></div>)}

      <section id="contact" className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10">
          <div><span className="text-xs font-bold bg-[#ca8a04] text-slate-950 px-3 py-1 rounded-full uppercase">17. Contact</span><h2 className="text-3xl font-black uppercase mt-3">Labe College of Nursing Sciences, Gboko</h2><div className="mt-6 space-y-4 text-sm"><div className="flex gap-3"><MapPin className="w-5 h-5 text-[#ca8a04]" />Off Gboko Hill Road, Gboko, PMB 1955, Gboko</div><div className="flex gap-3"><Mail className="w-5 h-5 text-[#ca8a04]" />lcnsgboko@gmail.com</div><div className="flex gap-3"><Phone className="w-5 h-5 text-[#ca8a04]" />ICT 08126799565</div></div><div className="mt-8 flex flex-wrap gap-2 text-xs font-bold"><span className="bg-white/10 px-3 py-1 rounded-full">Home</span><span className="bg-white/10 px-3 py-1 rounded-full">About College</span><span className="bg-white/10 px-3 py-1 rounded-full">Provost Welcome</span><span className="bg-white/10 px-3 py-1 rounded-full">Facilities</span><span className="bg-white/10 px-3 py-1 rounded-full">Contact</span><span className="bg-white/10 px-3 py-1 rounded-full">Portal Login</span></div></div>
          <div className="bg-white text-slate-900 p-8 rounded-3xl"><h3 className="font-black uppercase">Send Enquiry</h3><p className="text-xs text-slate-600 mt-2">Admissions & ICT Support will respond promptly.</p></div>
        </div>
      </section>
    </div>
  );
};
