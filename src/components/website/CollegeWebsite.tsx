import React, { useState, useEffect } from 'react';
import { 
  Cross, ShieldCheck, MapPin, Mail, Phone, Menu, X,
  ChevronRight, Target, Eye, Library, Monitor, BedDouble, Building2,
  GraduationCap, BookOpen, Award, CheckCircle
} from 'lucide-react';
import { StorageService } from '../../services/storage';

const LCNSWebsite = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [provostImg, setProvostImg] = useState<string | null>(null);
  const [proprietorImg, setProprietorImg] = useState<string | null>(null);
  const [bishopData, setBishopData] = useState<any>(null);
  const [provostData, setProvostData] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    const loadCMS = async () => {
      try {
        const settings = await (StorageService as any).getSettings?.();
        if(settings?.provost_image) setProvostImg(settings.provost_image);
        if(settings?.proprietor_image) setProprietorImg(settings.proprietor_image);
        const photos = await (StorageService as any).getGallery?.();
        if(photos) setGallery(photos);
        const loadAll = () => {
          const logoKeys = ['lcns_logo','college_logo','school_logo','lcns_settings','college_settings'];
          for(const k of logoKeys){
            try{
              const v = JSON.parse(localStorage.getItem(k)||'null') || localStorage.getItem(k);
              if(typeof v === 'string' && v.startsWith('data:image')) { setLogo(v); break; }
              if(v?.logo) { setLogo(v.logo); break; }
            }catch{ const raw=localStorage.getItem(k); if(raw?.startsWith('data:image')) setLogo(raw); }
          }
          try{
            let bImg = null; let bName = 'Most Rev. William A. Avenya'; let bTitle = 'Catholic Bishop of Gboko Diocese • Proprietor, LCNS'; let bDesc = 'As proprietor and pastoral guide, His Lordship supports growth of professional nursing education rooted in faith, discipline, compassion and service.';
            const b1 = JSON.parse(localStorage.getItem('lcns_bishop')||'null'); const s1 = JSON.parse(localStorage.getItem('lcns_settings')||'{}'); const m = JSON.parse(localStorage.getItem('lcns_management')||'[]'); const mBishop = m.find((x:any)=>x.role==='Proprietor' || x.role==='Bishop');
            if(b1?.image) { bImg=b1.image; bName=b1.name||bName; } else if(s1?.proprietor_image) { bImg=s1.proprietor_image; } else if(localStorage.getItem('proprietor_image')) { bImg=localStorage.getItem('proprietor_image'); } else if(mBishop?.image) { bImg=mBishop.image; }
            if(bImg){ setProprietorImg(bImg); setBishopData({name:bName, title:bTitle, description:bDesc, image:bImg}); }
            let pImg = null; let pName = 'Mrs Terna Fiase'; let pTitle = 'MSc, BNSc, Dip Nursing Education, RNE, RM, RN • Provost'; let pDesc = 'On behalf of Catholic Diocese of Gboko and Governing Council, I warmly welcome you to LCNS.';
            const p1 = JSON.parse(localStorage.getItem('lcns_provost')||'null'); const pMgmt = m.find((x:any)=>x.role==='Provost');
            if(p1?.image) { pImg=p1.image; pName=p1.name||pName; } else if(s1?.provost_image) { pImg=s1.provost_image; } else if(pMgmt?.image) { pImg=pMgmt.image; }
            if(pImg){ setProvostImg(pImg); setProvostData({name:pName, title:pTitle, description:pDesc, image:pImg}); } else { setProvostData({name:pName, title:pTitle, description:pDesc}); }
            const gKeys = ['lcns_gallery','college_gallery','gallery','official_gallery']; let allGallery:any[] = []; for(const gk of gKeys){ try{ const gv=JSON.parse(localStorage.getItem(gk)||'[]'); if(Array.isArray(gv) && gv.length) allGallery=[...allGallery, ...gv]; }catch{} } if(allGallery.length) setGallery(allGallery);
            const fKeys = ['lcns_facilities','college_facilities']; let allFac:any[] = []; for(const fk of fKeys){ try{ const fv=JSON.parse(localStorage.getItem(fk)||'[]'); if(Array.isArray(fv) && fv.length) allFac=[...allFac, ...fv]; }catch{} } if(allFac.length) setFacilities(allFac);
          } catch {}
        }; loadAll(); const h = () => loadAll(); window.addEventListener('storage', h); window.addEventListener('focus', h); return ()=>{ window.removeEventListener('storage', h); window.removeEventListener('focus', h); };
      } catch {}
    }; loadCMS();
  }, []);

  const scrollTo = (id:string) => { document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); setMenuOpen(false); };

  return (
    <div className="min-h-screen bg-[#f8fdf8] text-slate-800">
      <div className="bg-[#0f2e1f] text-white text-[11px] md:text-xs py-2 px-4 tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <span className="flex items-center gap-2"><Cross size={12} className="text-yellow-400"/> Catholic Diocese of Gboko • Learn • Serve • Save</span>
          <div className="flex items-center gap-2">
            <span className="bg-[#1a5c32] px-3 py-1 rounded-full flex items-center gap-1"><ShieldCheck size={12}/> NMCN Accredited • NBTE Approved</span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-400 text-[#0f2e1f] py-3 px-4 text-center border-b-4 border-[#0f4c2e]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl font-black tracking-tight">ND/HND NURSING SCIENCE</h2>
          <p className="text-sm md:text-[15px] font-bold mt-1">Four Years Full-Time National Diploma Higher National Diploma • NMCN Accredited • NBTE Approved • Admission Open</p>
        </div>
      </div>

      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0f4c2e] to-[#2e8b57] rounded-xl flex items-center justify-center text-white font-black overflow-hidden">
              {logo ? <img src={logo} className="w-full h-full object-contain p-1 bg-white rounded-xl"/> : 'L'}
            </div>
            <div><h1 className="font-black text-[#0f4c2e] leading-none text-[17px]">LABE COLLEGE</h1><p className="text-[10px] font-bold tracking-widest text-[#2e8b57]">OF NURSING SCIENCE, GBOKO</p></div>
          </div>
          <div className="hidden lg:flex gap-5 text-sm font-semibold text-[#0f4c2e]">
            <button onClick={()=>scrollTo('home')} className="hover:text-yellow-600">Home</button>
            <button onClick={()=>scrollTo('about')} className="hover:text-yellow-600">About</button>
            <button onClick={()=>scrollTo('offering')} className="hover:text-yellow-600 font-black bg-yellow-100 px-3 py-1 rounded-full">ND HND Offering</button>
            <button onClick={()=>scrollTo('facilities')} className="hover:text-yellow-600">Facilities</button>
            <button onClick={()=>scrollTo('gallery')} className="hover:text-yellow-600">Gallery</button>
            <button onClick={()=>scrollTo('contact')} className="hover:text-yellow-600">Contact</button>
            <button onClick={()=>scrollTo('admission')} className="bg-[#0f4c2e] text-white px-6 py-2.5 rounded-full hover:bg-[#1a5c32]">Apply</button>
          </div>
          <button className="lg:hidden" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X/>:<Menu/>}</button>
        </div>
        {menuOpen && (
          <div className="lg:hidden bg-white p-4 flex flex-col gap-3 border-t">
            <button onClick={()=>scrollTo('home')} className="text-left py-2 border-b">Home</button>
            <button onClick={()=>scrollTo('offering')} className="text-left py-2 border-b font-black bg-yellow-50 px-3 rounded">ND HND Nursing Science Official Offering</button>
            <button onClick={()=>scrollTo('about')} className="text-left py-2 border-b">About and History</button>
            <button onClick={()=>scrollTo('facilities')} className="text-left py-2 border-b font-bold">Facilities</button>
            <button onClick={()=>scrollTo('gallery')} className="text-left py-2 border-b font-bold">Gallery</button>
            <button onClick={()=>scrollTo('admission')} className="text-left py-2 bg-[#0f4c2e] text-white rounded-full px-4">Apply</button>
          </div>
        )}
      </nav>

      <section id="home" className="relative bg-gradient-to-br from-[#0f4c2e] via-[#184f2e] to-[#2e8b57] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-[#0f2e1f] rounded-full px-5 py-2 text-sm font-black mb-5">
              <GraduationCap size={18}/> ND HND Nursing Science • Four Years Full-Time • NMCN Accredited
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-[1.05] mb-6">Learn with <span className="text-yellow-300">Distinction</span>, Serve with Compassion</h1>
            <p className="text-green-100 text-lg leading-relaxed mb-6">Labe College of Nursing Sciences, Gboko — Offering ND HND Nursing Science — National Diploma Higher National Diploma — Catholic Diocese of Gboko.</p>
            <div className="bg-white/10 border border-yellow-400/30 rounded-2xl p-4 mb-8">
              <p className="text-yellow-300 font-black text-sm">Official Academic Offering: ND HND Nursing Science</p>
              <p className="text-xs text-green-100 mt-1">Labe College of Nursing Sciences offers ND HND Nursing Science. Minimum of Five O-Level credit passes in WAEC NECO NABTEB at not more than two sittings, including English Language, Mathematics, Biology, Chemistry, and Physics. Valid JAMB UTME score.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={()=>scrollTo('offering')} className="bg-yellow-400 text-[#0f2e1f] px-8 py-3.5 rounded-full font-black">View Requirements <ChevronRight className="inline ml-1"/></button>
              <button onClick={()=>scrollTo('admission')} className="bg-white/10 border border-white/20 px-8 py-3.5 rounded-full">Apply Now</button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-[2rem] p-2 shadow-2xl">
              <img src={gallery[0]?.image || "https://images.unsplash.com/photo-1580281657527-47f24907b016?auto=format&fit=crop&q=80&w=800"} className="rounded-[1.6rem] h-[460px] w-full object-cover" alt="Campus"/>
              <div className="absolute -bottom-4 -left-4 bg-white text-[#0f4c2e] p-4 rounded-2xl shadow-xl"><p className="font-black flex items-center gap-2"><MapPin size={16}/> Off Gboko Hill Road, Gboko</p><p className="text-xs text-slate-500">Opposite Sinai College, Gboko Hills</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="offering" className="py-16 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex bg-[#0f4c2e] text-white px-6 py-2 rounded-full font-black text-xs tracking-widest">OFFICIAL ACADEMIC OFFERING</div>
            <h2 className="text-4xl md:text-5xl font-black text-[#0f4c2e] mt-4">ND HND Nursing Science</h2>
            <p className="text-lg font-bold text-slate-700 mt-2">Four Years Full-Time National Diploma Higher National Diploma • NMCN Accredited • NBTE Approved</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#f0faf0] border-2 border-[#0f4c2e] rounded-[2rem] p-8">
              <h3 className="font-black text-xl text-[#0f4c2e] flex items-center gap-2"><BookOpen className="text-yellow-600"/> Labe College of Nursing Sciences offers ND HND Nursing Science</h3>
              <div className="mt-6 space-y-4">
                <div className="flex gap-3"><div className="w-10 h-10 bg-[#0f4c2e] text-white rounded-full flex items-center justify-center shrink-0"><GraduationCap size={18}/></div><div><p className="font-bold text-[#0f4c2e]">National Diploma Nursing Science</p><p className="text-sm text-slate-600">Two Years • Foundation in Nursing Science, Basic Medical Sciences, Community Health</p></div></div>
                <div className="flex gap-3"><div className="w-10 h-10 bg-yellow-400 text-[#0f2e1f] rounded-full flex items-center justify-center shrink-0"><Award size={18}/></div><div><p className="font-bold text-[#0f4c2e]">Higher National Diploma Nursing Science</p><p className="text-sm text-slate-600">Two Years • Advanced Clinical Practice, Research, Leadership, Specialization</p></div></div>
                <div className="bg-white border rounded-xl p-4 mt-4"><p className="text-xs font-bold text-[#0f4c2e] flex items-center gap-2"><Award size={16}/> Total Duration: Four Years Full-Time ND plus HND</p><p className="text-xs text-slate-600 mt-1">Graduates qualify for NMCN licensing examination and direct entry for further studies.</p></div>
              </div>
            </div>

            <div className="bg-[#0f4c2e] text-white rounded-[2rem] p-8">
              <h3 className="font-black text-xl flex items-center gap-2"><CheckCircle className="text-yellow-300"/> Admission Requirements</h3>
              <p className="text-yellow-200 text-xs font-bold mt-2 tracking-widest">MINIMUM REQUIREMENTS FOR ND HND NURSING SCIENCE</p>
              <div className="mt-6 space-y-4">
                <div className="bg-white/10 border border-white/10 rounded-xl p-4">
                  <p className="font-bold text-yellow-300 text-sm">O-Level Requirements</p>
                  <p className="text-sm text-green-100 mt-2 leading-relaxed">Minimum of Five O-Level credit passes in WAEC NECO NABTEB at not more than two sittings, including:</p>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <span className="bg-yellow-400 text-[#0f2e1f] px-3 py-1.5 rounded-full text-xs font-black text-center">English Language</span>
                    <span className="bg-yellow-400 text-[#0f2e1f] px-3 py-1.5 rounded-full text-xs font-black text-center">Mathematics</span>
                    <span className="bg-white text-[#0f4c2e] px-3 py-1.5 rounded-full text-xs font-black text-center">Biology</span>
                    <span className="bg-white text-[#0f4c2e] px-3 py-1.5 rounded-full text-xs font-black text-center">Chemistry</span>
                    <span className="bg-white text-[#0f4c2e] px-3 py-1.5 rounded-full text-xs font-black text-center col-span-2">Physics</span>
                  </div>
                  <p className="text-[11px] text-green-200 mt-3">At not more than two sittings (One Sitting or Two Sittings) — WACE NECO NABTEB</p>
                </div>
                <div className="bg-yellow-400 text-[#0f2e1f] rounded-xl p-4">
                  <p className="font-black text-sm">JAMB UTME Requirement</p>
                  <p className="text-sm font-bold mt-1">Valid JAMB UTME score • First Choice Labe College of Nursing Sciences, Gboko</p>
                  <p className="text-xs mt-1">JAMB Registration Number and Score required during application — ND HND Nursing Science</p>
                </div>
                <button onClick={()=>scrollTo('admission')} className="w-full bg-white text-[#0f4c2e] py-3.5 rounded-full font-black">Apply Now for ND HND</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-12 bg-[#f8fdf8]">
        <div className="max-w-7xl mx-auto px-4"><h2 className="text-3xl font-black text-[#0f4c2e] mb-3">About and History</h2><p className="text-slate-600 leading-relaxed">Established by Catholic Diocese of Gboko, named after late Pharmacist Ternenge Labe, to address shortage of qualified nurses. Located off Gboko Hill Road opposite Sinai College.</p></div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          <div className="bg-[#f0faf0] border border-green-100 rounded-[2rem] p-6">
            <p className="text-xs font-bold tracking-widest text-[#2e8b57] mb-3">PROPRIETOR</p>
            <div className="flex gap-4 items-start">
              <div className="w-24 h-24 rounded-2xl bg-[#0f4c2e] overflow-hidden shrink-0 border-2 border-yellow-400">{proprietorImg ? <img src={proprietorImg} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-black">BISHOP</div>}</div>
              <div><h3 className="font-black text-lg text-[#0f4c2e]">{bishopData?.name || 'Most Rev. William A. Avenya'}</h3><p className="text-xs text-[#2e8b57] font-semibold">{bishopData?.title || 'Catholic Bishop of Gboko Diocese • Proprietor'}</p></div>
            </div>
          </div>
          <div className="bg-[#0f4c2e] text-white rounded-[2rem] p-6">
            <p className="text-xs font-bold tracking-widest text-yellow-300 mb-3">PROVOST MESSAGE</p>
            <div className="flex gap-4 items-start">
              <div className="w-24 h-24 rounded-2xl bg-white overflow-hidden shrink-0 border-2 border-yellow-400">{provostImg ? <img src={provostImg} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-[#0f4c2e] font-black text-[10px]">PROVOST</div>}</div>
              <div><h3 className="font-black text-lg">{provostData?.name || 'Mrs Terna Fiase'}</h3><p className="text-xs text-yellow-200">{provostData?.title || 'Provost'}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="facilities" className="py-12 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4"><h2 className="text-3xl font-black text-[#0f4c2e]">Our Facilities</h2><div className="grid md:grid-cols-4 gap-4 mt-6">{[{icon:Library,name:'E-Library'},{icon:Monitor,name:'ICT Centre'},{icon:BedDouble,name:'Girls Hostels'},{icon:Building2,name:'Skills Lab'}].map(f=>(<div key={f.name} className="bg-[#f0faf0] border p-5 rounded-2xl text-center"><f.icon className="mx-auto text-[#0f4c2e] mb-2"/><p className="font-bold text-sm">{f.name}</p></div>))}</div></div>
      </section>

      <section id="gallery" className="py-12 bg-[#f8fdf8] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4"><h2 className="text-3xl font-black text-[#0f4c2e]">Official Campus Gallery</h2>{gallery.length ? <div className="grid md:grid-cols-3 gap-4 mt-6">{gallery.map((g:any,i:number)=>(<div key={i} className="bg-white border rounded-2xl overflow-hidden"><img src={g.image || g.image_url} className="h-56 w-full object-cover"/></div>))}</div> : <div className="bg-white border-2 border-dashed rounded-2xl p-8 text-center text-sm text-slate-400 mt-6">Upload from Admin CMS Gallery</div>}</div>
      </section>

      <section id="admission" className="py-16 bg-yellow-400 text-[#0f2e1f] text-center"><div className="max-w-7xl mx-auto px-4"><h2 className="text-3xl font-black">ND HND Nursing Science — Admission Open</h2><p className="font-bold mt-2">Four Years Full-Time National Diploma Higher National Diploma • NMCN Accredited • Five O-Level Credits including English, Maths, Biology, Chemistry, Physics plus Valid JAMB UTME</p></div></section>

      <section id="contact" className="py-10 bg-[#0f2e1f] text-white text-center text-xs text-green-200">© Labe College of Nursing Sciences, Gboko. Catholic Diocese of Gboko.</section>
    </div>
  );
};

export const CollegeWebsite = LCNSWebsite;
export { LCNSWebsite };
export default LCNSWebsite;
