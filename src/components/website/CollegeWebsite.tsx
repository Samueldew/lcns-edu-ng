import React, { useState, useEffect } from 'react';
import { 
  Heart, Award, Cross, BookOpen, Users, Building2, GraduationCap, 
  ShieldCheck, Eye, Target, Sparkles, MapPin, Mail, Phone, Menu, X,
  ChevronRight, FileText, Camera, Library, Monitor, BedDouble
} from 'lucide-react';
import CollegeLogo from '../common/CollegeLogo';
import { StorageService } from '../../services/storage';

const LCNSWebsite = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [provostImg, setProvostImg] = useState<string | null>(null);
  const [proprietorImg, setProprietorImg] = useState<string | null>(null);
  const [gallery, setGallery] = useState<any[]>([]);

  useEffect(() => {
    const loadCMS = async () => {
      try {
        // These will auto-load from your Admin CMS > Media Library
        const settings = await StorageService.getSettings?.();
        if(settings?.provost_image) setProvostImg(settings.provost_image);
        if(settings?.proprietor_image) setProprietorImg(settings.proprietor_image);
        const photos = await StorageService.getGallery?.();
        if(photos) setGallery(photos);
      } catch {}
    };
    loadCMS();
  }, []);

  const scrollTo = (id:string) => {
    document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fdf8] text-slate-800">
      {/* TOP DIOCESE BAR */}
      <div className="bg-[#0f2e1f] text-white text-[11px] md:text-xs py-2 px-4 tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <span className="flex items-center gap-2"><Cross size={12} className="text-yellow-400"/> Catholic Diocese of Gboko • Learn • Serve • Save</span>
          <div className="flex items-center gap-3">
            <span className="bg-[#1a5c32] px-3 py-1 rounded-full flex items-center gap-1"><ShieldCheck size={12}/> NMCN Accredited</span>
            <span className="bg-[#1a5c32] px-3 py-1 rounded-full">NBTE Approved</span>
            <span className="bg-yellow-400 text-[#0f2e1f] px-3 py-1 rounded-full font-black">ND/HND Nursing Science</span>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0f4c2e] to-[#2e8b57] rounded-xl flex items-center justify-center text-white font-black">L</div>
            <div>
              <h1 className="font-black text-[#0f4c2e] leading-none text-[17px]">LABE COLLEGE</h1>
              <p className="text-[10px] font-bold tracking-widest text-[#2e8b57]">OF NURSING SCIENCE, GBOKO</p>
            </div>
          </div>
          <div className="hidden lg:flex gap-6 text-sm font-semibold text-[#0f4c2e]">
            {[
              {id:'home',label:'Home'},
              {id:'about',label:'About & History'},
              {id:'mission',label:'Mission/Vision'},
              {id:'programmes',label:'ND/HND'},
              {id:'facilities',label:'Facilities'},
              {id:'gallery',label:'Gallery'},
              {id:'contact',label:'Contact'},
            ].map(m=>(
              <button key={m.id} onClick={()=>scrollTo(m.id)} className="hover:text-yellow-600">{m.label}</button>
            ))}
            <button onClick={()=>scrollTo('admission')} className="bg-[#0f4c2e] text-white px-6 py-2.5 rounded-full hover:bg-[#1a5c32]">Apply 2026/2027</button>
          </div>
          <button className="lg:hidden" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X/>:<Menu/>}</button>
        </div>
        {menuOpen && (
          <div className="lg:hidden bg-white p-4 flex flex-col gap-3 border-t">
            {['home','about','mission','programmes','facilities','gallery','contact'].map(id=>(
              <button key={id} onClick={()=>scrollTo(id)} className="text-left py-2 border-b capitalize">{id}</button>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" className="relative bg-gradient-to-br from-[#0f4c2e] via-[#184f2e] to-[#2e8b57] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-yellow-400/30 rounded-full px-4 py-1.5 text-xs mb-5">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span> Offering ND/HND Nursing Science • Admission Open
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-[1.05] mb-6">
              Learn with <span className="text-yellow-300">Distinction</span>, Serve with Compassion
            </h1>
            <p className="text-green-100 text-lg leading-relaxed mb-8">
              Labe College of Nursing Sciences, Gboko — Established by Catholic Diocese of Gboko, named after late Pharmacist Ternenge Labe. Training compassionate, competent, God-fearing nurses.
            </p>
            <div className="flex gap-4">
              <button onClick={()=>scrollTo('admission')} className="bg-yellow-400 text-[#0f2e1f] px-8 py-3.5 rounded-full font-black">Apply Now <ChevronRight className="inline ml-1"/></button>
              <button onClick={()=>scrollTo('about')} className="bg-white/10 border border-white/20 px-8 py-3.5 rounded-full">Our History</button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-[2rem] p-2 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1580281657527-47f24907b016?auto=format&fit=crop&q=80&w=800" className="rounded-[1.6rem] h-[460px] w-full object-cover" alt="Campus"/>
              <div className="absolute -bottom-4 -left-4 bg-white text-[#0f4c2e] p-4 rounded-2xl shadow-xl">
                <p className="font-black flex items-center gap-2"><MapPin size={16}/> Off Gboko Hill Road, Gboko</p>
                <p className="text-xs text-slate-500">Opposite Sinai College, Gboko Hills</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROPRIETOR & PROVOST */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10">
          {/* Proprietor */}
          <div className="bg-[#f0faf0] border border-green-100 rounded-[2rem] p-8">
            <p className="text-xs font-bold tracking-widest text-[#2e8b57] mb-3">PROPRIETOR</p>
            <div className="flex gap-5 items-start">
              <div className="w-28 h-28 rounded-2xl bg-[#0f4c2e] overflow-hidden shrink-0">
                {proprietorImg ? <img src={proprietorImg} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-white">BISHOP</div>}
              </div>
              <div>
                <h3 className="font-black text-xl text-[#0f4c2e]">Most Rev. William A. Avenya</h3>
                <p className="text-sm text-[#2e8b57] font-semibold mb-3">Catholic Bishop of Gboko Diocese • Proprietor, LCNS</p>
                <p className="text-sm text-slate-600 leading-relaxed">As proprietor and pastoral guide, His Lordship supports growth of professional nursing education rooted in faith, discipline, compassion and service. Called to form competent nurses who learn with excellence, serve with compassion and save lives with integrity.</p>
              </div>
            </div>
          </div>
          {/* Provost */}
          <div className="bg-[#0f4c2e] text-white rounded-[2rem] p-8 relative overflow-hidden">
            <p className="text-xs font-bold tracking-widest text-yellow-300 mb-3">PROVOST MESSAGE</p>
            <div className="flex gap-5 items-start">
              <div className="w-28 h-28 rounded-2xl bg-white overflow-hidden shrink-0">
                {provostImg ? <img src={provostImg} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-[#0f4c2e] font-black">PROVOST</div>}
              </div>
              <div>
                <h3 className="font-black text-xl">Mrs Terna Fiase</h3>
                <p className="text-xs text-yellow-200 mb-2">MSc, BNSc, Dip Nursing Education, RNE, RM, RN • Provost</p>
                <p className="text-sm text-green-100 leading-relaxed">"On behalf of Catholic Diocese of Gboko and Governing Council, I warmly welcome you to LCNS. Founded upon Catholic ethos of sanctity of human life and selfless service, our college stands as beacon of academic rigor and moral rectitude. Nursing here is a sacred vocation."</p>
                <button className="mt-3 text-yellow-300 text-sm font-bold">Read Full Address →</button>
                <p className="mt-2 text-[10px] text-green-300">Upload provost picture from Admin CMS → Settings → Media</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION VISION CORE VALUES */}
      <section id="mission" className="py-20 bg-[#f0faf0]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 mb-16">
            <div className="bg-white p-8 rounded-[1.8rem] shadow-sm border-l-8 border-[#0f4c2e]">
              <h3 className="font-black text-2xl text-[#0f4c2e] flex items-center gap-2 mb-4"><Target className="text-yellow-500"/> Mission Statement</h3>
              <p className="text-slate-700 leading-relaxed">Our mission is to provide high-quality nursing training and service that fosters compassionate, competent, and innovative healthcare professionals who improve healthcare outcomes and promote wellness with the fear of God, within the Diocese and beyond.</p>
            </div>
            <div className="bg-[#0f4c2e] text-white p-8 rounded-[1.8rem] shadow-sm border-l-8 border-yellow-400">
              <h3 className="font-black text-2xl flex items-center gap-2 mb-4"><Eye className="text-yellow-300"/> Vision Statement</h3>
              <p className="text-green-100 leading-relaxed">Labe College of Nursing Sciences is committed to be an outstanding College of Nursing Sciences, recognized for excellence in healthcare training and practice, with commitment to improving health care delivery, promoting social justice, and advancing the medical profession.</p>
            </div>
          </div>

          <h3 className="text-center font-black text-3xl text-[#0f4c2e] mb-10">Our Core Values — The 5 Cs of Nursing</h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {c:"Commitment",d:"Commitment to excellence"},
              {c:"Conscience",d:"Ethical practice"},
              {c:"Competence",d:"Clinical excellence"},
              {c:"Compassion",d:"Holistic caring"},
              {c:"Confidence",d:"Professional boldness"},
              {c:"Professionalism",d:"Integrity & respect"},
            ].map(v=>(
              <div key={v.c} className="bg-white border border-green-100 rounded-2xl p-5 text-center hover:shadow-lg transition">
                <div className="w-12 h-12 mx-auto bg-yellow-100 text-[#0f4c2e] rounded-full flex items-center justify-center font-black mb-3">{v.c[0]}</div>
                <p className="font-bold text-[#0f4c2e]">{v.c}</p><p className="text-xs text-slate-500">{v.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-6 text-sm">
            <div className="bg-white p-6 rounded-2xl border"><p className="font-bold text-[#0f4c2e] mb-2">CARING</p><p className="text-slate-600">We are committed to providing innovative caring for needs of all people with sensitivity and compassion in holistic approach since caring is central to nursing practice.</p></div>
            <div className="bg-white p-6 rounded-2xl border"><p className="font-bold text-[#0f4c2e] mb-2">QUALITY & LEARNING</p><p className="text-slate-600">Committed to improve health care quality and patient satisfaction and facilitating reflective, active and lifelong learning by providing engaging, dynamic educational environment.</p></div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-black text-[#0f4c2e] mb-8 text-center">Philosophy of The School</h2>
          <div className="bg-[#f8fdf8] border border-green-100 rounded-3xl p-8 md:p-10 leading-relaxed text-slate-700">
            <p className="mb-6 font-medium">Health Care Education is a life-long process that begins with basics, and progresses all through to core and advanced levels whereby professional developments could be achieved. Advancing art and sciences of Nursing ultimately upgrades health status of individuals, families, communities, nations and world.</p>
            <p className="mb-6">A solid Nursing education equips nurses to be evidence-based in practice, to fully engage in scholarly and research activities, and to translate knowledge into health services improvements. By embracing diversity and equity, they seek best practice standards and become top notch health services leaders.</p>
            <ul className="space-y-4 list-decimal pl-5">
              <li>That nursing is a human science vocation focused on diagnosis and treatment of human responses to actual and potential health problems; client is individual, family, group or community.</li>
              <li>That each client and community member is unique and holds values reflective of culture, and nurses must respect this fact.</li>
              <li>That core competences enable nurse to provide safe passage: clinical judgments, advocacy, caring practice, systems thinking, facilitation of learning, clinical inquiry/collaboration.</li>
              <li>That together we serve students by being strong role models through commitment to excellence as teachers and clinicians, cultivating professional empowerment, desire for lifelong learning and passion for social justice.</li>
              <li>That we all learn best when actively engaged; faculty works with students as community of learners with accountability, flexibility and integrity.</li>
              <li>That since we are in a system, we collaborate with relevant corporate organizations for effective teaching and learning, local or international, government or non government.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* HISTORICAL BACKGROUND */}
      <section id="about" className="py-16 bg-[#0f4c2e] text-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl font-black mb-6 text-yellow-300">Historical Background</h2>
            <p className="text-green-100 leading-relaxed mb-4">The College is brainchild of Bishop, Catholic Diocese of Gboko, Most Rev. William A. Avenya, and is named after humanitarian, late Pharmacist Ternenge Labe in bid to immortalize him for selfless services he rendered to people within Gboko Diocese, Benue state and beyond.</p>
            <p className="text-green-100 leading-relaxed mb-4">Institution has objective of training teeming Nigerian youths with compassion and fear of God, on best global nursing practices. Program will enhance their skills and widen horizon to be best nursing practitioners in world, especially indigent ones who cannot afford cost of travelling outside country.</p>
            <p className="text-yellow-200 text-sm">College is situated opposite Sinai College of Education, Gboko Hills, Gboko Benue State.</p>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/10 p-4 rounded-xl"><Building2 size={20} className="mb-2 text-yellow-300"/> Administrative block: 1 large classroom, computer lab, library, nursing/midwifery labs</div>
              <div className="bg-white/10 p-4 rounded-xl"><BedDouble size={20} className="mb-2 text-yellow-300"/> Hostel block: One storey buildings, cafeteria, Matron flat, sick bay</div>
              <div className="bg-white/10 p-4 rounded-xl"><Users size={20} className="mb-2 text-yellow-300"/> 1000+ capacity multi-purpose auditorium</div>
              <div className="bg-white/10 p-4 rounded-xl"><Monitor size={20} className="mb-2 text-yellow-300"/> ICT centre + demonstration rooms + sports centre reserved</div>
            </div>
          </div>
          <div className="bg-white text-[#0f4c2e] rounded-3xl p-6">
            <h3 className="font-black text-xl mb-4">School Colors & Logo Meaning</h3>
            <div className="space-y-3 text-sm">
              <p><span className="w-3 h-3 bg-green-700 inline-block rounded-full mr-2"></span><b>Green:</b> Health, healing, life, growth, renewal — nurturing aspect of nursing.</p>
              <p><span className="w-3 h-3 bg-white border inline-block rounded-full mr-2"></span><b>White:</b> Purity, cleanliness, peace, integrity — nursing ethics.</p>
              <p><span className="w-3 h-3 bg-black inline-block rounded-full mr-2"></span><b>Black:</b> Rich culture, strength, Rod of Asclepius — medicine and healing.</p>
              <p><span className="w-3 h-3 bg-red-600 inline-block rounded-full mr-2"></span><b>Red:</b> Passion, energy, care — Learn, Serve & Save.</p>
              <p><span className="w-3 h-3 bg-orange-400 inline-block rounded-full mr-2"></span><b>Orange:</b> Enthusiasm, creativity, encouragement.</p>
              <p><span className="w-3 h-3 bg-amber-800 inline-block rounded-full mr-2"></span><b>Brown (Oil Lamp):</b> Tradition, wisdom, Florence Nightingale — light of knowledge.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMME ND/HND */}
      <section id="programmes" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#2e8b57] font-bold tracking-widest text-sm">OFFICIAL ACADEMIC OFFERING</p>
            <h2 className="text-4xl font-black text-[#0f4c2e]">ND/HND Nursing Science</h2>
            <p className="text-slate-500 mt-2">Programme Code: ND-NUR • 4 Years Full-Time • NMCN Accredited • Admission Open 2026/2027</p>
          </div>
          <div className="max-w-4xl mx-auto bg-[#f0faf0] border-2 border-[#0f4c2e] rounded-[2rem] p-8 md:p-10">
            <h3 className="font-black text-2xl text-[#0f4c2e] mb-4">Programme Description & Rigor</h3>
            <p className="text-slate-700 leading-relaxed mb-6">A rigorous, full-time collegiate programme designed to prepare students with comprehensive foundations in medical sciences, clinical simulations, bedside nursing procedures, and patient-centered empathy in strict compliance with Nursing and Midwifery Council of Nigeria (NMCN) standards.</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl border"><p className="font-bold text-[#0f4c2e]">Admission Requirements</p><ul className="text-sm text-slate-600 mt-2 list-disc pl-4 space-y-1"><li>5 O-Level credits in WAEC/NECO/NABTEB (English, Maths, Biology, Chemistry, Physics) not more than two sittings</li><li>Valid JAMB UTME score</li><li>16 years and above + Medical fitness</li></ul></div>
              <div className="bg-[#0f4c2e] text-white p-5 rounded-xl"><p className="font-bold text-yellow-300">Why LCNS Gboko?</p><p className="text-sm text-green-100 mt-2">Catholic ethos, NMCN accredited, Federal Medical Centre clinical posting, hostel, ICT centre, moral discipline, Learn Serve Save.</p></div>
            </div>
            <button onClick={()=>scrollTo('admission')} className="mt-8 w-full bg-[#0f4c2e] text-white py-4 rounded-full font-black">Apply for ND/HND Nursing 2026/2027</button>
          </div>
        </div>
      </section>

      {/* FACILITIES */}
      <section id="facilities" className="py-16 bg-[#f8fdf8]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-black text-[#0f4c2e] text-center mb-10">Modern Campus & Clinical Facilities</h2>
          <p className="text-center text-slate-500 mb-8 text-sm">Admin can upload pictures and descriptions from CMS → Facilities Manager</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {icon:<Library/>,title:"Library & Computer Lab",desc:"E-library and physical resources"},
              {icon:<BedDouble/>,title:"Nursing/Midwifery Labs",desc:"Demonstration rooms with manikins"},
              {icon:<Monitor/>,title:"ICT Centre",desc:"CBT Exams and e-learning"},
            ].map((f,i)=>(
              <div key={i} className="bg-white p-6 rounded-2xl border border-green-100 hover:shadow-lg transition text-center">
                <div className="w-12 h-12 bg-green-50 text-[#0f4c2e] rounded-xl flex items-center justify-center mx-auto mb-3">{f.icon}</div>
                <p className="font-bold text-[#0f4c2e]">{f.title}</p><p className="text-xs text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div><h2 className="text-3xl font-black text-[#0f4c2e]">Official Campus & Milestone Photo Gallery</h2><p className="text-slate-500 text-sm">Girls Hostels • Governor Signing Law • Classrooms • School Environment • ICT Centre</p></div>
            <button className="hidden md:flex items-center gap-2 bg-[#0f4c2e] text-white px-5 py-2.5 rounded-full text-sm">View Full Gallery <Camera size={16}/></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              "Girls Hostels",
              "Governor Signing Law",
              "Classrooms",
              "School Environment",
              "ICT Centre"
            ].map((label,idx)=>(
              <div key={idx} className="group relative h-48 rounded-2xl overflow-hidden bg-slate-100">
                <img src={`https://images.unsplash.com/photo-1586776802477-368eaa0b5eaa?auto=format&fit=crop&q=80&w=400&sig=${idx+10}`} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition duration-700"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <p className="absolute bottom-2 left-2 text-white text-xs font-bold">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-4">Link to Admin CMS to upload real pictures: Admin → Gallery Manager → Upload</p>
        </div>
      </section>

      {/* CONTACT & FOOTER */}
      <section id="contact" className="py-16 bg-[#0f2e1f] text-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-10">
          <div>
            <h4 className="font-black text-yellow-300 mb-4">LABE COLLEGE OF NURSING SCIENCE, GBOKO</h4>
            <p className="text-sm text-green-100 leading-relaxed">Catholic Diocese of Gboko • Established under apostolic direction to deliver world-class clinical nursing education, moral discipline, and compassionate Christian healthcare.</p>
            <div className="mt-4 flex gap-2"><span className="bg-white/10 px-2 py-1 rounded text-xs">NMCN Accredited</span><span className="bg-white/10 px-2 py-1 rounded text-xs">NBTE Approved</span></div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-green-100">
              <li>About & History</li><li>Provost's Welcome</li><li>Simulation Labs & Campus</li><li>Photo Gallery</li><li>Latest College News</li><li>Academic Calendar</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Academic Programme</h4>
            <p className="bg-yellow-400 text-[#0f2e1f] p-3 rounded-xl font-bold text-sm">ND/HND Nursing Science<br/><span className="font-normal text-xs">4 Years Full-Time</span></p>
            <p className="mt-4 text-sm"><span className="text-yellow-300">Post-UTME Requirements:</span> 5 Credits including English, Maths, Biology, Chemistry, Physics</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <p className="text-sm flex gap-2 mb-2"><MapPin size={16} className="text-yellow-300"/> Off Gboko Hill, Along Agbile road, Gboko Benue State • PMB 1955</p>
            <p className="text-sm flex gap-2 mb-2"><Mail size={16} className="text-yellow-300"/> lcnsgboko@gmail.com</p>
            <p className="text-sm flex gap-2"><Phone size={16} className="text-yellow-300"/> ICT Support: 08126799565</p>
            <button onClick={()=>scrollTo('admission')} className="mt-4 bg-yellow-400 text-[#0f2e1f] w-full py-3 rounded-full font-black">Apply 2026/2027</button>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-6 text-center text-xs text-green-200">
          © 2026 Labe College of Nursing Sciences, Gboko. Catholic Diocese of Gboko. All Rights Reserved. Built by ICT Unit LCNS • Learn • Serve • Save
        </div>
      </section>
    </div>
  );
};

export default LCNSWebsite;
