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
        const settings = await (StorageService as any).getSettings?.();
        if(settings?.provost_image) setProvostImg(settings.provost_image);
        if(settings?.proprietor_image) setProprietorImg(settings.proprietor_image);
        const photos = await (StorageService as any).getGallery?.();
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

      {/* MISSION VISION */}
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
        </div>
      </section>

      <section id="programmes" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-[#0f4c2e]">ND/HND Nursing Science</h2>
          <p className="text-slate-500 mt-2">4 Years Full-Time • NMCN Accredited • Admission Open 2026/2027</p>
          <button onClick={()=>scrollTo('contact')} className="mt-6 bg-[#0f4c2e] text-white px-8 py-4 rounded-full font-black">Apply for ND/HND Nursing 2026/2027</button>
        </div>
      </section>

      <section id="gallery" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-black text-[#0f4c2e]">Official Campus Gallery</h2>
          <p className="text-sm text-slate-500">Girls Hostels • Governor Signing Law • Classrooms • School Environment • ICT Centre</p>
        </div>
      </section>

      <section id="contact" className="py-16 bg-[#0f2e1f] text-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-green-200">
          © 2026 Labe College of Nursing Sciences, Gboko. Catholic Diocese of Gboko. Learn • Serve • Save
        </div>
      </section>
    </div>
  );
};

// ===== FIX FOR VERCEL BUILD - EXPORT BOTH NAMES - MAINTAINS EVERYTHING =====
export const CollegeWebsite = LCNSWebsite;
export { LCNSWebsite };
export default LCNSWebsite;
