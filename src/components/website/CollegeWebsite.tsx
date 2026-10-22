import React, { useState, useEffect } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { CMSConfig } from '../../types';
import { StorageService } from '../../services/storage';
import { getManagementMembers, getGalleryItems } from '../../lib/uploadPermanent';
import { SupabaseManagementMember, SupabaseGalleryItem } from '../../lib/supabase';
import { GraduationCap, FileText, CheckCircle2, Phone, Mail, MapPin, Sparkles, X } from 'lucide-react';
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
  const scrollTo = (id: string) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const bishop = managementList.find(m => m.title?.toLowerCase().includes('bishop') || m.title?.toLowerCase().includes('proprietor')) || managementList[0];
  const provost = managementList.find(m => m.title?.toLowerCase().includes('provost')) || managementList[1];

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="bg-[#0a4d2e] text-white text-[11px] py-2.5 border-b border-[#22c55e]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#ca8a04]" /> Off Gboko Hill Road, PMB 1955</span>
            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[#ca8a04]" /> lcnsgboko@gmail.com</span>
            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#ca8a04]" /> 08126799565</span>
          </div>
          <div className="flex gap-2 font-bold items-center">
            <button onClick={() => scrollTo('home')} className="hover:text-[#ca8a04] px-2">HOME</button>
            <button onClick={() => scrollTo('about-college')} className="hover:text-[#ca8a04] px-2">ABOUT</button>
            <button onClick={() => scrollTo('programmes')} className="hover:text-[#ca8a04] px-2">PROGRAM</button>
            <button onClick={() => scrollTo('gallery')} className="hover:text-[#ca8a04] px-2">GALLERY</button>
            <button onClick={onOpenLogin} className="bg-[#ca8a04] text-slate-950 px-4 py-1.5 rounded-full ml-2">PORTAL LOGIN</button>
          </div>
        </div>
      </div>

      <section id="home" className="relative overflow-hidden bg-gradient-to-b from-[#0a4d2e] via-[#06321e] to-[#042114] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-sm font-bold tracking-widest text-[#ca8a04] uppercase">LABE COLLEGE OF NURSING SCIENCES, GBOKO</h2>
          <p className="text-xs text-emerald-200 mt-1">Catholic Diocese of Gboko</p>
          <p className="text-xs font-black text-white mt-2 border border-[#ca8a04]/40 inline-block px-4 py-1 rounded-full">Motto: LEARN, SERVE AND SAVE</p>
          <h1 className="text-4xl md:text-6xl font-black uppercase mt-8 leading-tight">Educating Nurses.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#facc15] to-[#ca8a04]">Caring for Humanity.</span><br/>Preserving Lives.</h1>
          <p className="text-emerald-100 max-w-3xl mx-auto mt-6 text-sm leading-relaxed">Welcome to Labe College of Nursing Sciences, Gboko, an institution dedicated to preparing competent, compassionate, and professionally skilled nurses committed to improving healthcare delivery and saving lives.</p>
          <p className="font-black text-[#ca8a04] mt-6">Learn with excellence. Serve with compassion. Save lives with integrity.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button onClick={() => scrollTo('programmes')} className="px-6 py-3 bg-[#ca8a04] text-slate-950 font-black rounded-xl text-sm">Explore Our Programmes</button>
            <button onClick={onOpenApplication} className="px-6 py-3 bg-white text-[#0a4d2e] font-black rounded-xl text-sm">Apply for Admission</button>
            <button onClick={onOpenLogin} className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-sm">Access Student Portal</button>
          </div>
        </div>
      </section>

      <section id="about-college" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold bg-[#0a4d2e] text-white px-3 py-1 rounded-full uppercase">About The College</span>
          <h2 className="text-3xl font-black uppercase mt-3">Who We Are</h2>
          <div className="mt-6 bg-white border-2 rounded-3xl p-8 text-sm leading-relaxed space-y-4">
            <p>Labe College of Nursing Sciences, Gboko, is a Catholic nursing education institution established to contribute to the development of skilled, ethical, and compassionate healthcare professionals in Nigeria.</p>
            <p>The College is committed to providing a supportive learning environment where students acquire the theoretical knowledge, practical competence, clinical experience, and moral discipline required to deliver quality nursing care.</p>
          </div>
        </div>
      </section>

      <section id="history" className="py-16 bg-slate-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase">Our Historical Background</h2>
          <div className="mt-6 bg-white border-2 rounded-3xl p-8 text-sm leading-relaxed space-y-4">
            <p>The vision for Labe College of Nursing Sciences was conceived by <strong>Most Rev. William A. Avenya</strong>, Catholic Bishop of Gboko Diocese, as part of the Diocese's commitment to education, healthcare, and human development.</p>
            <p>The College was named in honour of the late <strong>Pharmacist Ternenge Labe</strong>, whose memory represents a legacy of humanitarian service and dedication to the wellbeing of others.</p>
          </div>
        </div>
      </section>

      <section id="motto" className="py-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase text-center">Our Motto - Learn, Serve and Save</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="p-8 bg-emerald-50 rounded-3xl border-2 border-emerald-200"><h3 className="font-black text-[#0a4d2e]">Learn</h3><p className="text-xs mt-3">We encourage students to pursue knowledge, develop professional competence, embrace lifelong learning.</p></div>
            <div className="p-8 bg-amber-50 rounded-3xl border-2 border-amber-200"><h3 className="font-black text-[#ca8a04]">Serve</h3><p className="text-xs mt-3">We promote compassion, humility, respect, and dedication to the care of patients, families, and communities.</p></div>
            <div className="p-8 bg-slate-900 text-white rounded-3xl border-2 border-slate-700"><h3 className="font-black text-[#ca8a04]">Save</h3><p className="text-xs mt-3">We prepare students to protect human life, promote health, prevent illness, support recovery.</p></div>
          </div>
        </div>
      </section>

      <section id="vision" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-[#0a4d2e] to-[#042114] text-white p-8 rounded-3xl"><h3 className="font-black uppercase text-[#22c55e]">Our Vision</h3><p className="text-sm mt-4">Labe College of Nursing Sciences, Gboko, is committed to becoming an outstanding institution for nursing education, recognised for excellence in healthcare training and practice, with a commitment to improving healthcare delivery, promoting social justice, and advancing the nursing profession.</p></div>
          <div id="mission" className="bg-white border-2 p-8 rounded-3xl"><h3 className="font-black uppercase text-[#0a4d2e]">Our Mission</h3><p className="text-sm mt-4">Our mission is to provide high-quality nursing education and training that develops compassionate, competent, and innovative healthcare professionals who improve healthcare outcomes and promote wellness with the fear of God, within the Diocese and beyond.</p></div>
        </div>
      </section>

      <section id="values" className="py-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase text-center">Our Core Values - The Five Cs</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white border-2 p-6 rounded-2xl"><h4 className="font-black text-sm text-[#0a4d2e]">Commitment</h4><p className="text-xs mt-2">Dedication to learning, professional development, patient welfare.</p></div>
            <div className="bg-white border-2 p-6 rounded-2xl"><h4 className="font-black text-sm text-[#0a4d2e]">Conscience</h4><p className="text-xs mt-2">Ability to make ethical decisions, uphold professional standards.</p></div>
            <div className="bg-white border-2 p-6 rounded-2xl"><h4 className="font-black text-sm text-[#0a4d2e]">Competence</h4><p className="text-xs mt-2">Knowledge, skills, judgment required to provide safe care.</p></div>
            <div className="bg-white border-2 p-6 rounded-2xl"><h4 className="font-black text-sm text-[#0a4d2e]">Compassion</h4><p className="text-xs mt-2">Genuine concern for suffering and wellbeing of others.</p></div>
            <div className="bg-white border-2 p-6 rounded-2xl"><h4 className="font-black text-sm text-[#0a4d2e]">Confidence</h4><p className="text-xs mt-2">Professional self-assurance, sound judgment, effective communication.</p></div>
            <div className="bg-slate-900 text-white p-6 rounded-2xl"><h4 className="font-black text-sm text-[#ca8a04]">Professionalism & Quality</h4><p className="text-xs mt-2">Lifelong learning, accountability, teamwork, individualised patient care.</p></div>
          </div>
        </div>
      </section>

      <section id="philosophy" className="py-16 bg-slate-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase">Our Philosophy</h2>
          <div className="mt-6 bg-white border-2 rounded-3xl p-8 text-sm leading-relaxed space-y-4">
            <p>Labe College of Nursing Sciences believes that nursing education is a lifelong process that combines scientific knowledge, practical skills, ethical responsibility, and compassionate service.</p>
            <p>We recognise nursing as both an art and a science. It requires scientific understanding, critical thinking, clinical judgment, effective communication, and the human qualities necessary to care for people during vulnerable moments.</p>
          </div>
        </div>
      </section>

      <section id="leadership" className="py-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase text-center">Leadership Messages - Linked to Admin Portal</h2>
          <div className="mt-10 grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[#0a4d2e] to-[#042114] text-white p-8 rounded-3xl border">
              <div className="flex gap-4 items-center">
                <div className="w-24 h-28 rounded-2xl overflow-hidden border-4 border-[#ca8a04] bg-[#06321e]">{bishop?.photo_url ? <img src={bishop.photo_url} alt={bishop.name} className="w-full h-full object-cover" /> : <CollegeLogo size="lg" />}</div>
                <div><h3 className="font-black text-sm">{bishop?.name || 'Most Rev. William A. Avenya'}</h3><p className="text-xs text-[#ca8a04]">{bishop?.title || 'Catholic Bishop | Proprietor'}</p>{bishop?.phone && <p className="text-xs text-emerald-200 mt-1 flex items-center gap-1"><Phone className="w-3 h-3" />{bishop.phone}</p>}</div>
              </div>
              <h4 className="font-bold mt-6 text-[#ca8a04]">Message from the Proprietor</h4>
              <p className="text-xs mt-3 leading-relaxed text-emerald-100">{bishop?.bio || 'Committed to growth of institution that prepares healthcare professionals to serve humanity with competence, compassion, integrity.'}</p>
            </div>
            <div className="bg-white border-2 p-8 rounded-3xl">
              <div className="flex gap-4 items-center">
                <div className="w-24 h-28 rounded-2xl overflow-hidden border-4 border-[#0a4d2e] bg-slate-100">{provost?.photo_url || cmsConfig.provostPhotoUrl ? <img src={provost?.photo_url || cmsConfig.provostPhotoUrl} alt="Provost" className="w-full h-full object-cover" /> : <CollegeLogo size="lg" />}</div>
                <div><h3 className="font-black text-sm">{provost?.name || cmsConfig.provostName || 'Mrs Terna Fiase'}</h3><p className="text-xs text-[#0a4d2e]">{provost?.title || 'Provost, LCNS Gboko'}</p>{provost?.phone && <p className="text-xs text-slate-600 mt-1 flex items-center gap-1"><Phone className="w-3 h-3" />{provost.phone}</p>}</div>
              </div>
              <h4 className="font-bold mt-6 text-[#0a4d2e]">Message from the Provost</h4>
              <p className="text-xs mt-3 leading-relaxed text-slate-700">{provost?.bio || cmsConfig.provostMessage || 'Welcome to Labe College of Nursing Sciences, where we learn, serve, and save.'}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="programmes" className="py-16 bg-slate-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold bg-[#0a4d2e] text-white px-3 py-1 rounded-full uppercase">Academic Programme</span>
          <h2 className="text-3xl font-black uppercase mt-3">Nursing Science - ND/HND</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-8">
            <div className="bg-white border-2 border-[#0a4d2e] rounded-3xl p-8"><h3 className="font-black">Programme: Nursing Science - ND/HND 4Years</h3><p className="text-xs mt-4">Accredited programme designed to produce compassionate, clinically proficient, and ethical nurses. Entry: 5 O-Level credits English, Maths, Biology, Chemistry, Physics at not more than two sittings + JAMB UTME.</p><button onClick={onOpenApplication} className="mt-6 px-6 py-3 bg-[#0a4d2e] text-white font-bold rounded-xl text-sm">Apply Now →</button></div>
            <div className="bg-white border-2 rounded-3xl p-8"><h3 className="font-black uppercase">Admission Requirements</h3><div className="mt-4 space-y-2 text-xs"><div className="p-3 bg-emerald-50 rounded-xl border flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#0a4d2e]" />Five credits English, Maths, Biology, Chemistry, Physics</div><div className="p-3 bg-emerald-50 rounded-xl border flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#0a4d2e]" />WAEC/NECO/NABTEB in not more than two sittings</div><div className="p-3 bg-amber-50 rounded-xl border flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#ca8a04]" />Valid JAMB UTME result</div></div></div>
          </div>
        </div>
      </section>

      <section id="facilities" className="py-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase">Our Facilities</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-4 text-xs">{['Administrative Block','Lecture Hall and Classrooms','Computer Laboratory and ICT Centre','Library','Nursing and Midwifery Laboratories','Demonstration Room','Provost, Registrar, and Bursary Offices','Staff Offices and Common Room','Students Hostel','Cafeteria','Sick Bay','Multipurpose Auditorium 1000+','Sports and Recreational Area'].map((f) => (<div key={f} className="bg-slate-50 border p-4 rounded-2xl"><h4 className="font-bold text-[#0a4d2e]">{f}</h4></div>))}</div>
        </div>
      </section>

      <section id="hostel" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="grid md:grid-cols-2 gap-8 items-center">{hostelImage ? <img src={hostelImage} alt="LCNS Girls Hostel" className="w-full h-[400px] object-cover rounded-xl shadow-lg" /> : <div>No hostel image yet - Add from Admin Portal</div>}<div><h2 className="text-3xl font-bold uppercase">Girls Hostel Accommodation</h2></div></div></section>

      <section id="gallery" className="py-16 bg-slate-100/70 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between mb-8 gap-4"><div><span className="text-xs font-bold bg-emerald-100 px-3 py-1 rounded-full uppercase">Visual Tour - Linked to Admin Portal</span><h2 className="text-3xl font-black uppercase mt-2">Our Gallery</h2><p className="text-xs text-slate-600 mt-1">Add new images from Admin Portal → Gallery. Campus and Institutional Development images.</p></div><div className="flex gap-1 bg-white p-1 rounded-xl border text-xs font-bold h-fit">{['All','General','Events','Campus','Hostel','Students'].map((c) => (<button key={c} onClick={() => setGalleryFilter(c)} className={`px-3 py-1.5 rounded-lg ${galleryFilter === c ? 'bg-[#0a4d2e] text-white' : 'hover:bg-slate-100'}`}>{c}</button>))}</div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{(() => { const filtered = galleryFilter === 'All' ? galleryList : galleryList.filter((g) => g.category === galleryFilter); const list = filtered.length > 0 ? filtered : galleryList; return list.map((item) => (<div key={item.id} onClick={() => setSelectedGalleryPhoto(item)} className="rounded-2xl overflow-hidden border bg-white group cursor-pointer"><div className="h-72 bg-slate-900 overflow-hidden relative"><img src={item.image_url} alt={item.title || 'LCNS'} className="w-full h-full object-cover group-hover:scale-105 transition" /><div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3"><p className="text-white text-xs font-bold">{item.title || 'LCNS Campus'}</p></div></div></div>)); })()}</div>
        </div>
      </section>

      {selectedGalleryPhoto && (<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedGalleryPhoto(null)}><div className="relative max-w-4xl w-full"><button onClick={() => setSelectedGalleryPhoto(null)} className="absolute -top-10 right-0 text-white bg-white/20 p-2 rounded-full"><X className="w-6 h-6" /></button><img src={selectedGalleryPhoto.image_url} alt="LCNS" className="w-full max-h-[80vh] object-contain rounded-xl" /></div></div>)}
    </div>
  );
};
