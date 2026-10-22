import React, { useState, useEffect } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { CMSConfig } from '../../types';
import { StorageService } from '../../services/storage';
import { getManagementMembers, getGalleryItems } from '../../lib/uploadPermanent';
import { SupabaseManagementMember, SupabaseGalleryItem } from '../../lib/supabase';
import { GraduationCap, FileText, CheckCircle2, Phone, Mail, MapPin, Sparkles, X, Maximize2 } from 'lucide-react';
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

  const scrollTo = (id: string) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* TOP CONTACT BAR - ADDED AS YOU ASKED */}
      <div className="bg-[#0a4d2e] text-white text-xs py-2 border-b border-[#22c55e]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#ca8a04]" /> Off Gboko Hill Road, Gboko, PMB 1955, Gboko, Benue State, Nigeria</span>
            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[#ca8a04]" /> lcnsgboko@gmail.com</span>
            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#ca8a04]" /> ICT: 08126799565</span>
          </div>
          <div className="flex gap-3 font-bold">
            <button onClick={() => scrollTo('home')} className="hover:text-[#ca8a04]">Home</button>
            <button onClick={() => scrollTo('about-college')} className="hover:text-[#ca8a04]">About</button>
            <button onClick={() => scrollTo('programmes')} className="hover:text-[#ca8a04]">Program</button>
            <button onClick={() => scrollTo('gallery')} className="hover:text-[#ca8a04]">Gallery</button>
            <button onClick={() => scrollTo('contact')} className="hover:text-[#ca8a04]">Contact</button>
            <button onClick={onOpenLogin} className="bg-[#ca8a04] text-slate-950 px-3 py-1 rounded-full">Portal Login</button>
          </div>
        </div>
      </div>

      <section id="home" className="relative overflow-hidden bg-gradient-to-b from-[#0a4d2e] via-[#06321e] to-[#042114] text-white pt-12 pb-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#06321e] border border-[#22c55e]/30 text-emerald-200 text-xs font-bold uppercase"><Sparkles className="w-3.5 h-3.5 text-[#ca8a04]" />LABE COLLEGE OF NURSING SCIENCES</div>
              <h1 className="text-3xl sm:text-5xl font-black uppercase leading-tight">Labe College of <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#facc15] via-[#ca8a04] to-[#fef08a]">Nursing Sciences, Gboko</span></h1>
              <p className="text-emerald-100 font-bold">Motto of the School: LEARN, SERVE AND SAVE</p>
              <p className="text-emerald-100 max-w-2xl text-sm">The brainchild of the Bishop, Catholic Diocese of Gboko, Most Rev. William A. Avenya, named after humanitarian late Pharmacist Ternenge Labe.</p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button onClick={onOpenApplication} className="px-6 py-3.5 bg-[#ca8a04] text-slate-950 font-black rounded-xl text-sm flex items-center gap-2"><GraduationCap className="w-5 h-5" />Apply Now</button>
                <button onClick={onOpenAdmissionChecker} className="px-5 py-3.5 bg-[#0a4d2e] border border-[#22c55e]/40 text-white font-bold rounded-xl text-sm flex items-center gap-2"><FileText className="w-4 h-4" />Check Admission</button>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center"><div className="w-full max-w-md bg-gradient-to-br from-[#0a4d2e]/90 to-[#042114]/90 p-8 rounded-3xl border border-[#22c55e]/30 text-center"><CollegeLogo size="xl" /><h3 className="text-xl font-black text-white uppercase mt-4">LCNS Gboko</h3><p className="text-xs text-[#ca8a04] font-bold uppercase mt-1">Motto: LEARN, SERVE AND SAVE</p></div></div>
          </div>
        </div>
      </section>

      <section id="motto" className="py-12 bg-white border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black uppercase text-center">Vision, Mission, Core Value and Philosophy Statements</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="p-7 bg-emerald-50 rounded-3xl border-2 border-emerald-200"><h3 className="font-black text-[#0a4d2e] text-xl uppercase">LEARN</h3><p className="text-sm text-slate-700 mt-4">Facilitating reflective, active and lifelong learning in an engaging, dynamic and innovative educational environment.</p></div>
            <div className="p-7 bg-amber-50 rounded-3xl border-2 border-amber-200"><h3 className="font-black text-[#ca8a04] text-xl uppercase">SERVE</h3><p className="text-sm text-slate-700 mt-4">Providing innovative caring for the needs of all people with sensitivity, compassion, and holistic Christ-centered service.</p></div>
            <div className="p-7 bg-slate-900 rounded-3xl border-2 border-slate-700 text-white"><h3 className="font-black text-[#ca8a04] text-xl uppercase">SAVE</h3><p className="text-sm text-slate-300 mt-4">Decisive clinical competence and evidence-based practice to preserve human life, alleviate suffering, and promote wellness.</p></div>
          </div>
        </div>
      </section>

      <section id="vision-mission" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="bg-white border-2 rounded-3xl p-8">
            <h3 className="font-black uppercase text-[#0a4d2e]">Vision Statement</h3>
            <p className="text-sm text-slate-700 mt-3">Labe College of Nursing Sciences (LCNS) is committed to be an outstanding College of Nursing Sciences, recognized for excellence in healthcare training and practice, with a commitment to improving health care delivery, promoting social justice, and advancing the medical profession.</p>
          </div>
          <div className="bg-white border-2 rounded-3xl p-8">
            <h3 className="font-black uppercase text-[#ca8a04]">Mission Statement</h3>
            <p className="text-sm text-slate-700 mt-3">Our mission is to provide high-quality nursing training and service that fosters compassionate, competent, and innovative healthcare professionals who improve healthcare outcomes and promote wellness with the fear of God, within the Diocese and beyond.</p>
          </div>
          <div className="bg-[#0a4d2e] text-white rounded-3xl p-8">
            <h3 className="font-black uppercase">Our Core Values</h3>
            <p className="text-sm text-emerald-100 mt-3">Our values are through commitment to the under mentioned to promote excellence in Nursing education practice and services, using the five Cs of best practice Nursing, which are Commitment, Conscience, Competence, Compassion, and Confidence.</p>
            <div className="mt-6 grid md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white/10 p-4 rounded-xl"><span className="font-bold text-[#ca8a04]">PROFESSIONALISM</span><p className="mt-1">We are committed to professionalism as a foundation to excellent and diversify practice which encompasses integrity, respect autonomy, inter-professional collaboration and ethical practice as well as standards.</p></div>
              <div className="bg-white/10 p-4 rounded-xl"><span className="font-bold text-[#ca8a04]">CARING</span><p className="mt-1">We are committed to providing innovative caring for the needs of all people with sensitivity and compassion in a holistic approach since caring is central to nursing practice.</p></div>
              <div className="bg-white/10 p-4 rounded-xl"><span className="font-bold text-[#ca8a04]">SERVICES</span><p className="mt-1">We are committed to providing high quality nursing programmes to promote holistic healthcare delivery.</p></div>
              <div className="bg-white/10 p-4 rounded-xl"><span className="font-bold text-[#ca8a04]">QUALITY</span><p className="mt-1">We are committed to improve health care quality and patient/client satisfaction and safety through excellent Nursing education and practice.</p></div>
              <div className="bg-white/10 p-4 rounded-xl"><span className="font-bold text-[#ca8a04]">LEARNING</span><p className="mt-1">We are committed to facilitating reflective, active and lifelong learning by providing engaging, dynamic and innovative educational environment and experiences.</p></div>
              <div className="bg-white/10 p-4 rounded-xl"><span className="font-bold text-[#ca8a04]">INDIVIDUALITY of care</span><p className="mt-1">Though we focus on holistic care, we will be committed to providing a process of individual care hence all human beings have unique needs with their actual and potential problems. These will be done with the focus of the National health policy at the back of our minds.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="philosophy" className="py-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase">Philosophy of the School</h2>
          <div className="mt-6 bg-white border-2 rounded-3xl p-8 space-y-4 text-sm leading-relaxed">
            <p>Health Care Education is a life-long process that begins with the basics, and progresses all through to core and advanced levels of learning, whereby professional developments could be achieved. Advancing the art and sciences of Nursing ultimately upgrades the health status of individuals, families, communities, nations and the world in general.</p>
            <p>A solid Nursing education, therefore, equips nurses to be evidence-based in their practice, to fully engage in their scholarly and research activities, and to translate knowledge in health care and sciences into health services improvements, for the benefit of all humanity. By embracing diversity and equity perspectives in raising the professional and social conscience of our students, they would always seek best practice standards, and become top notch health services leaders.</p>
            <h3 className="font-black uppercase mt-6">The school believes:</h3>
            <div className="space-y-3 text-xs">
              <p>i) That nursing is a human science vocation and a discipline that is focused on diagnosis and treatment of human responses to actual and potential health problems; and that the client is conceptualized as an individual, family, group or community. This is the focus of the nursing profession.</p>
              <p>ii) That each client and every member of the community is unique and holds values and beliefs reflective of their culture, sense of life experiences, and nurses must respect this fact.</p>
              <p>iii) That there are core competences that enable a nurse to provide safe passage for clients. These core competences which include but not limited are clinical judgments, advocacy, caring practice, systems thinking response to diversity, facilitation of learning, clinical inquiry/ collaboration and the like, are the basis of nurses ability to provide, design, manage and coordinate the caring practice process.</p>
              <p>iv) That together we serve students by being strong role models through commitment to excellence as teachers, students and clinicians. The faculty is committed to cultivating an organizational sense of professional empowerment, a desire for long-life learning and a passion for social justice and social cultural harmony as a way of belonging in our school and as an integral part of our school community. Therefore, the school uses an innovative curriculum based on the changing health and socioeconomic/ cultural needs of the population and the health caring delivery system, which is integral to the dedication of the faculty as well as the students learning and development.</p>
              <p>v) That we all learn best when actively engaged in the learning process. The faculty desires to work with students as a community of learners in which all function at a high level of accountability, flexibility and integrity.</p>
              <p>vi) That since we are in a system, we will collaborate with relevant cooperate organizations for effective teaching and learning process, be they local or international, government or non government.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about-college" className="py-16 bg-slate-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold bg-slate-900 text-white px-3 py-1 rounded-full uppercase">Historical Background</span>
          <h2 className="text-3xl font-black uppercase mt-3">College History</h2>
          <div className="mt-6 bg-white border-2 rounded-3xl p-8 text-sm leading-relaxed space-y-4">
            <p><strong>Introduction:</strong> The College is the brainchild of the Bishop, Catholic Diocese of Gboko, Most Rev. William A. Avenya, and is named after a humanitarian, late Pharmacist Ternenge Labe in a bid to immortalize him for the selfless services he rendered to people within Gboko Diocese, Benue state and beyond. The institution has an objective of training the teeming Nigerian youths with compassion and fear of God, on the best global nursing practices. The program will enhance their skills and widen their horizon to be the best nursing practitioners in the world, especially the indigent ones who cannot afford the cost of travelling outside the country for further studies.</p>
            <p>The College is situated opposite Sinai College of Education, Gboko Hills, Gboko Benue State. The College building comprises a one storey administrative block housing 1 large classroom, computer lab, library and nursing/midwifery laboratories and other offices. The Provosts office, Registrars office, Bursary, Staff common room, other staff offices with conveniences are housed in the extra two buildings. The hostel block is one storey buildings. The cafeteria houses the kitchen and its components. Adjacent to the hostel is the home Sisters or matrons offices and 2-bedroom flat for the live-in home sister/Matron; and a sick bay. There is also a large multi-purpose auditorium of over 1000 capacity while other buildings are still springing up. There is also an ICT centre as well as demonstration rooms for nursing and midwifery. Space is reserved for the sports centre which will house the volleyball court, Badminton, table tennis, football and track event fields with seat-outs.</p>
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 p-4 rounded-xl border"><h4 className="font-bold text-xs">College Address</h4><p className="text-xs mt-1">Labe College of Nursing Sciences<br/>Off Gboko Hill Road, Gboko<br/>PMB 1955, Gboko<br/>Benue State, Nigeria<br/>EMAIL ADDRESS - lcnsgboko@gmail.com</p></div>
              <div className="bg-slate-900 text-white p-4 rounded-xl"><CollegeLogo size="lg" /><p className="text-xs mt-3">College Logo - Learn, Serve & Save</p></div>
              <div className="bg-amber-50 p-4 rounded-xl border"><h4 className="font-bold text-xs">Motto</h4><p className="text-xs mt-1">LEARN, SERVE AND SAVE</p><p className="text-xs mt-2 font-bold">Vision, Mission, Core Value and Philosophy Statements included above</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="colours" className="py-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase">School Colors and Logo</h2>
          <p className="text-sm text-slate-600 mt-2">The logo for Labe College of Nursing Sciences, Gboko uses a combination of green, white, black, red, orange, and brown colours.</p>
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-green-50 border-2 border-green-200 p-6 rounded-2xl"><h4 className="font-black">Green - Healing, growth, care</h4><p className="text-xs mt-2">Green symbolizes health, healing, life, growth, and renewal. This represents the nurturing aspect of nursing at LCNS and the hope they will bring to patients. It further reflects the institutions role in training individuals to promote healing and well-being.</p></div>
            <div className="bg-slate-50 border-2 p-6 rounded-2xl"><h4 className="font-black">White - Purity, ethics, professionalism</h4><p className="text-xs mt-2">White symbolizes purity, cleanliness, peace, and integrity. White is traditionally associated with the nursing profession (e.g., white uniforms) to signify cleanliness, ethics, and professionalism. This highlights our colleges commitment to producing morally upright and disciplined healthcare workers.</p></div>
            <div className="bg-slate-100 border-2 p-6 rounded-2xl"><h4 className="font-black">Black - Medical seriousness, tradition</h4><p className="text-xs mt-2">Black symbolizes the rich culture of our Diocese, strength, seriousness and professionalism. This is used in the symbol, the Rod of Asclepius (as seen in the logo) and the tagline ribbon, which represents the rich culture of the diocese, medicine and healing. It reflects the seriousness and dedication expected of nurses we train.</p></div>
            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl"><h4 className="font-black">Red - Passion, service, urgency</h4><p className="text-xs mt-2">Red symbolizes passion, energy, urgency, and care and reflects the love, sacrifice, and lifesaving nature of the nursing profession we bequeath. The motto Learn, Serve & Save in red emphasizes the colleges mission with urgency and passion.</p></div>
            <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-2xl"><h4 className="font-black">Orange (Outline) - Motivation, optimism</h4><p className="text-xs mt-2">Orange symbolizes enthusiasm, creativity, and encouragement. It represents the motivation to inspire and educate the next generation of nurses with energy and positivity.</p></div>
            <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-2xl"><h4 className="font-black">Brown (Oil Lamp) - Wisdom, nursing tradition</h4><p className="text-xs mt-2">Brown symbolizes tradition, wisdom, and reliability. The oil lamp is a historic symbol of nursing, made famous by Florence Nightingale. The brown color reinforces its ancient, earthy, and foundational significance. This represents the enduring light of knowledge and service in the nursing profession.</p></div>
          </div>
          <div className="mt-8 bg-slate-900 text-white p-6 rounded-2xl">
            <h4 className="font-bold">In Summary:</h4>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div>Green - Healing, growth, care</div><div>White - Purity, ethics, professionalism</div><div>Black - Medical seriousness, tradition (Rod of Asclepius)</div><div>Red - Passion, service, urgency</div><div>Orange - Motivation, optimism</div><div>Brown - Wisdom, nursing tradition (oil lamp)</div>
            </div>
            <p className="text-xs text-slate-300 mt-4">These colors together tell the story of a college dedicated to producing compassionate, competent, and ethical nurses who are committed to Learn, Serve & Save.</p>
          </div>
        </div>
      </section>

      <section id="about" className="py-16 bg-slate-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold bg-emerald-100 px-3 py-1 rounded-full uppercase">Provost's Welcome</span>
          <div id="provost" className="mt-6 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5"><div className="rounded-3xl border-4 border-[#0a4d2e] bg-slate-900 text-white p-7 text-center"><div className="w-36 h-44 mx-auto rounded-2xl overflow-hidden border-4 border-[#ca8a04] mb-4 bg-[#06321e] flex items-center justify-center">{cmsConfig.provostPhotoUrl ? <img src={cmsConfig.provostPhotoUrl} alt="Provost" className="w-full h-full object-cover" /> : <CollegeLogo size="lg" />}</div><h3 className="font-bold">{cmsConfig.provostName || 'Mrs Terna Fiase'}</h3></div></div>
            <div className="lg:col-span-7"><h2 className="text-3xl font-black uppercase">Shaping the Future of Nursing</h2></div>
          </div>
        </div>
      </section>

      <section id="programmes" className="py-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold bg-emerald-100 px-3 py-1 rounded-full uppercase">10. Programmes</span>
          <h2 className="text-3xl font-black uppercase mt-3">ND/HND Nursing Science - Code: ND-NUR - Duration: 4Years</h2>
          <p className="text-sm text-slate-700 mt-3">Accredited ND/HND Nursing Science programme designed to produce compassionate, clinically proficient, and ethical nurses equipped for modern healthcare delivery.</p>
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border"><span className="font-bold text-xs uppercase">Entry Requirements</span><p className="text-xs mt-2">Minimum of 5 O-Level credit passes in English Language, Mathematics, Biology, Chemistry, Physics at not more than two sittings in WAEC/NECO/NABTEB, together with a valid JAMB UTME score.</p></div>
        </div>
      </section>

      <section id="departments" className="py-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border"><span className="text-xs font-bold bg-slate-900 text-white px-3 py-1 rounded-full uppercase">11. Departments</span><h3 className="text-2xl font-black uppercase mt-3">Department of Nursing Sciences</h3></div>
          <div id="facilities" className="bg-white p-8 rounded-3xl border"><span className="text-xs font-bold bg-[#0a4d2e] text-white px-3 py-1 rounded-full uppercase">12. Facilities</span><h3 className="text-2xl font-black uppercase mt-3">College Facilities</h3><div className="mt-4 grid grid-cols-1 gap-2 text-xs">{['Administrative block','Large classroom','Computer/ICT laboratory','Library','Nursing laboratory','Midwifery laboratory','Provost office','Registrar office','Bursary','Staff common room','Staff offices','Hostel','Cafeteria','Matron/Sister offices','Sick bay','Large multipurpose auditorium with capacity of over 1,000','ICT centre','Nursing demonstration rooms','Midwifery demonstration rooms','Reserved sports centre'].map((f) => (<div key={f} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"><CheckCircle2 className="w-3 h-3 text-[#22c55e]" />{f}</div>))}</div></div>
        </div>
      </section>

      <section id="hostel" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="grid md:grid-cols-2 gap-8 items-center">{hostelImage ? <img src={hostelImage} alt="LCNS Girls Hostel" className="w-full h-[400px] object-cover rounded-xl shadow-lg" /> : <div>No hostel image yet</div>}<div><h2 className="text-3xl font-bold uppercase">Girls Hostel Accommodation</h2></div></div></section>

      <section id="gallery" className="py-16 bg-slate-100/70 border-t"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex justify-between mb-8"><div><span className="text-xs font-bold bg-emerald-100 px-3 py-1 rounded-full uppercase">Visual Tour</span><h2 className="text-3xl font-black uppercase mt-2">Campus Media Gallery</h2></div><div className="flex gap-1 bg-white p-1 rounded-xl border text-xs font-bold">{['All','General','Events','Campus','Hostel','Students'].map((c) => (<button key={c} onClick={() => setGalleryFilter(c)} className={`px-3 py-1.5 rounded-lg ${galleryFilter === c ? 'bg-[#0a4d2e] text-white' : 'hover:bg-slate-100'}`}>{c}</button>))}</div></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{(() => { const filtered = galleryFilter === 'All' ? galleryList : galleryList.filter((g) => g.category === galleryFilter); const list = filtered.length > 0 ? filtered : galleryList; return list.map((item) => (<div key={item.id} onClick={() => setSelectedGalleryPhoto(item)} className="rounded-2xl overflow-hidden border bg-white group cursor-pointer"><div className="h-72 bg-slate-900 overflow-hidden"><img src={item.image_url} alt="LCNS" className="w-full h-full object-cover group-hover:scale-105 transition" /></div></div>)); })()}</div></div></section>

      {selectedGalleryPhoto && (<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedGalleryPhoto(null)}><div className="relative max-w-4xl w-full"><button onClick={() => setSelectedGalleryPhoto(null)} className="absolute -top-10 right-0 text-white bg-white/20 p-2 rounded-full"><X className="w-6 h-6" /></button><img src={selectedGalleryPhoto.image_url} alt="LCNS" className="w-full max-h-[80vh] object-contain rounded-xl" /></div></div>)}

      <section id="contact" className="py-16 bg-slate-900 text-white"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10"><div><span className="text-xs font-bold bg-[#ca8a04] text-slate-950 px-3 py-1 rounded-full uppercase">Contact</span><h2 className="text-3xl font-black uppercase mt-3">Labe College of Nursing Sciences, Gboko</h2><div className="mt-6 space-y-4 text-sm"><div className="flex gap-3"><MapPin className="w-5 h-5 text-[#ca8a04]" />Off Gboko Hill Road, Gboko, PMB 1955, Gboko, Benue State, Nigeria</div><div className="flex gap-3"><Mail className="w-5 h-5 text-[#ca8a04]" />lcnsgboko@gmail.com</div><div className="flex gap-3"><Phone className="w-5 h-5 text-[#ca8a04]" />ICT: 08126799565</div></div><div className="mt-8 flex flex-wrap gap-2 text-xs font-bold"><span className="bg-white/10 px-3 py-1 rounded-full">Home</span><span className="bg-white/10 px-3 py-1 rounded-full">About College</span><span className="bg-white/10 px-3 py-1 rounded-full">Provost Welcome</span><span className="bg-white/10 px-3 py-1 rounded-full">Facilities</span><span className="bg-white/10 px-3 py-1 rounded-full">Contact</span><span className="bg-white/10 px-3 py-1 rounded-full">Portal Login</span></div></div><div className="bg-white text-slate-900 p-8 rounded-3xl"><h3 className="font-black uppercase">Send Enquiry</h3></div></div></section>
    </div>
  );
};
