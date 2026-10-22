import React, { useState, useEffect } from 'react';
import { 
  Cross, 
  ShieldCheck, MapPin, Mail, Phone, Menu, X,
  ChevronRight, Target, Eye, Library, Monitor, BedDouble, Building2
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
          // LOGO
          const logoKeys = ['lcns_logo','college_logo','school_logo','lcns_settings','college_settings'];
          for(const k of logoKeys){
            try{
              const v = JSON.parse(localStorage.getItem(k)||'null') || localStorage.getItem(k);
              if(typeof v === 'string' && v.startsWith('data:image')) { setLogo(v); break; }
              if(v?.logo || v?.college_logo || v?.school_logo) { setLogo(v.logo || v.college_logo || v.school_logo); break; }
            }catch{ const raw=localStorage.getItem(k); if(raw?.startsWith('data:image')) setLogo(raw); }
          }

          // BISHOP
          try{
            let bImg = null;
            let bName = 'Most Rev. William A. Avenya';
            let bTitle = 'Catholic Bishop of Gboko Diocese • Proprietor, LCNS';
            let bDesc = 'As proprietor and pastoral guide, His Lordship supports growth of professional nursing education rooted in faith, discipline, compassion and service.';
            const b1 = JSON.parse(localStorage.getItem('lcns_bishop')||'null');
            const b2 = JSON.parse(localStorage.getItem('lcns_proprietor')||'null');
            const s1 = JSON.parse(localStorage.getItem('lcns_settings')||'{}');
            const s2 = JSON.parse(localStorage.getItem('college_settings')||'{}');
            const m = JSON.parse(localStorage.getItem('lcns_management')||'[]');
            const mBishop = m.find((x:any)=>x.role==='Proprietor' || x.role==='Bishop');
            if(b1?.image) { bImg=b1.image; bName=b1.name||bName; bTitle=b1.title||bTitle; bDesc=b1.description||bDesc; }
            else if(b2?.image) { bImg=b2.image; bName=b2.name||bName; }
            else if(s1?.proprietor_image || s1?.bishop_image) { bImg=s1.proprietor_image||s1.bishop_image; bName=s1.bishop_name||bName; }
            else if(s2?.proprietor_image) { bImg=s2.proprietor_image; }
            else if(localStorage.getItem('proprietor_image')) { bImg=localStorage.getItem('proprietor_image'); }
            else if(localStorage.getItem('lcns_proprietor_image')) { bImg=localStorage.getItem('lcns_proprietor_image'); }
            else if(mBishop?.image) { bImg=mBishop.image; bName=mBishop.name||bName; }
            if(bImg){ setProprietorImg(bImg); setBishopData({name:bName, title:bTitle, description:bDesc, image:bImg}); }

            // PROVOST
            let pImg = null;
            let pName = 'Mrs Terna Fiase';
            let pTitle = 'MSc, BNSc, Dip Nursing Education, RNE, RM, RN • Provost';
            let pDesc = 'On behalf of Catholic Diocese of Gboko and Governing Council, I warmly welcome you to LCNS. Founded upon Catholic ethos of sanctity of human life and selfless service, our college stands as beacon of academic rigor and moral rectitude.';
            const p1 = JSON.parse(localStorage.getItem('lcns_provost')||'null');
            const pMgmt = m.find((x:any)=>x.role==='Provost');
            if(p1?.image) { pImg=p1.image; pName=p1.name||pName; pTitle=p1.title||pTitle; pDesc=p1.description||pDesc; }
            else if(s1?.provost_image) { pImg=s1.provost_image; pName=s1.provost_name||pName; }
            else if(localStorage.getItem('provost_image')) { pImg=localStorage.getItem('provost_image'); }
            else if(pMgmt?.image) { pImg=pMgmt.image; pName=pMgmt.name||pName; }
            if(pImg){ setProvostImg(pImg); setProvostData({name:pName, title:pTitle, description:pDesc, image:pImg}); }
            else { setProvostData({name:pName, title:pTitle, description:pDesc}); }

            // GALLERY - LINKED
            const gKeys = ['lcns_gallery','college_gallery','gallery','lcns_photos','official_gallery','lcns_official_gallery'];
            let allGallery:any[] = [];
            for(const gk of gKeys){
              try{ const gv=JSON.parse(localStorage.getItem(gk)||'[]'); if(Array.isArray(gv) && gv.length){ allGallery=[...allGallery, ...gv]; } }catch{}
            }
            if(allGallery.length) setGallery(prev=> [...allGallery, ...prev].slice(0,20));

            // FACILITIES - LINKED - Load from Admin CMS
            const fKeys = ['lcns_facilities','college_facilities','facilities','lcns_lab_facilities'];
            let allFac:any[] = [];
            for(const fk of fKeys){
              try{ const fv=JSON.parse(localStorage.getItem(fk)||'[]'); if(Array.isArray(fv) && fv.length){ allFac=[...allFac, ...fv]; } }catch{}
            }
            if(allFac.length) setFacilities(allFac);
          } catch {}
        };
        loadAll();
        const h = () => loadAll();
        window.addEventListener('storage', h);
        window.addEventListener('focus', h);
        window.addEventListener('lcns_update', h as any);
        return ()=>{ window.removeEventListener('storage', h); window.removeEventListener('focus', h); window.removeEventListener('lcns_update', h as any); };
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

      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0f4c2e] to-[#2e8b57] rounded-xl flex items-center justify-center text-white font-black overflow-hidden">
              {logo ? <img src={logo} className="w-full h-full object-contain p-1 bg-white rounded-xl"/> : 'L'}
            </div>
            <div>
              <h1 className="font-black text-[#0f4c2e] leading-none text-[17px]">LABE COLLEGE</h1>
              <p className="text-[10px] font-bold tracking-widest text-[#2e8b57]">OF NURSING SCIENCE, GBOKO</p>
            </div>
          </div>
          <div className="hidden lg:flex gap-6 text-sm font-semibold text-[#0f4c2e]">
            <button onClick={()=>scrollTo('home')} className="hover:text-yellow-600">Home</button>
            <button onClick={()=>scrollTo('about')} className="hover:text-yellow-600">About & History</button>
            <button onClick={()=>scrollTo('mission')} className="hover:text-yellow-600">Mission/Vision</button>
            <button onClick={()=>scrollTo('programmes')} className="hover:text-yellow-600">ND/HND</button>
            <button onClick={()=>scrollTo('facilities')} className="hover:text-yellow-600">Facilities</button>
            <button onClick={()=>scrollTo('gallery')} className="hover:text-yellow-600">Gallery</button>
            <button onClick={()=>scrollTo('contact')} className="hover:text-yellow-600">Contact</button>
            <button onClick={()=>scrollTo('admission')} className="bg-[#0f4c2e] text-white px-6 py-2.5 rounded-full hover:bg-[#1a5c32]">Apply 2026/2027</button>
          </div>
          <button className="lg:hidden" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X/>:<Menu/>}</button>
        </div>
        {menuOpen && (
          <div className="lg:hidden bg-white p-4 flex flex-col gap-3 border-t">
            <button onClick={()=>scrollTo('home')} className="text-left py-2 border-b">Home</button>
            <button onClick={()=>scrollTo('about')} className="text-left py-2 border-b">About & History</button>
            <button onClick={()=>scrollTo('mission')} className="text-left py-2 border-b">Mission/Vision</button>
            <button onClick={()=>scrollTo('programmes')} className="text-left py-2 border-b">ND/HND</button>
            <button onClick={()=>scrollTo('facilities')} className="text-left py-2 border-b font-bold text-[#0f4c2e]">Facilities</button>
            <button onClick={()=>scrollTo('gallery')} className="text-left py-2 border-b font-bold text-[#0f4c2e]">Gallery</button>
            <button onClick={()=>scrollTo('contact')} className="text-left py-2 border-b">Contact</button>
            <button onClick={()=>scrollTo('admission')} className="text-left py-2 bg-[#0f4c2e] text-white rounded-full px-4">Apply 2026/2027</button>
          </div>
        )}
      </nav>

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
              Labe College of Nursing Sciences, Gboko — Established by Catholic Diocese of Gboko, named after late Pharmacist Ternenge Labe.
            </p>
            <div className="flex gap-4">
              <button onClick={()=>scrollTo('admission')} className="bg-yellow-400 text-[#0f2e1f] px-8 py-3.5 rounded-full font-black">Apply Now <ChevronRight className="inline ml-1"/></button>
              <button onClick={()=>scrollTo('about')} className="bg-white/10 border border-white/20 px-8 py-3.5 rounded-full">Our History</button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-[2rem] p-2 shadow-2xl">
              <img src={gallery[0]?.image || gallery[0]?.image_url || "https://images.unsplash.com/photo-1580281657527-47f24907b016?auto=format&fit=crop&q=80&w=800"} className="rounded-[1.6rem] h-[460px] w-full object-cover" alt="Campus"/>
              <div className="absolute -bottom-4 -left-4 bg-white text-[#0f4c2e] p-4 rounded-2xl shadow-xl">
                <p className="font-black flex items-center gap-2"><MapPin size={16}/> Off Gboko Hill Road, Gboko</p>
                <p className="text-xs text-slate-500">Opposite Sinai College, Gboko Hills</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-16 bg-[#f8fdf8]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-black text-[#0f4c2e] mb-4">About & History</h2>
          <p className="text-slate-600 leading-relaxed">Labe College of Nursing Sciences, Gboko (LCNS) was established by the Catholic Diocese of Gboko, inspired by the vision of late Pharmacist Ternenge Labe, to address critical shortage of qualified nurses in Benue State and Nigeria.</p>
        </div>
      </section>

      {/* PROPRIETOR & PROVOST - REMOVED THE 2 TEXTS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10">
          <div className="bg-[#f0faf0] border border-green-100 rounded-[2rem] p-8">
            <p className="text-xs font-bold tracking-widest text-[#2e8b57] mb-3">PROPRIETOR</p>
            <div className="flex gap-5 items-start">
              <div className="w-28 h-28 rounded-2xl bg-[#0f4c2e] overflow-hidden shrink-0 border-2 border-yellow-400">
                {proprietorImg ? <img src={proprietorImg} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-black text-center p-1">BISHOP</div>}
              </div>
              <div>
                <h3 className="font-black text-xl text-[#0f4c2e]">{bishopData?.name || 'Most Rev. William A. Avenya'}</h3>
                <p className="text-sm text-[#2e8b57] font-semibold mb-3">{bishopData?.title || 'Catholic Bishop of Gboko Diocese • Proprietor, LCNS'}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{bishopData?.description || 'As proprietor and pastoral guide, His Lordship supports growth of professional nursing education rooted in faith, discipline, compassion and service.'}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0f4c2e] text-white rounded-[2rem] p-8 relative overflow-hidden">
            <p className="text-xs font-bold tracking-widest text-yellow-300 mb-3">PROVOST MESSAGE</p>
            <div className="flex gap-5 items-start">
              <div className="w-28 h-28 rounded-2xl bg-white overflow-hidden shrink-0 border-2 border-yellow-400">
                {provostImg ? <img src={provostImg} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-[#0f4c2e] font-black text-[10px] text-center">PROVOST</div>}
              </div>
              <div>
                <h3 className="font-black text-xl">{provostData?.name || 'Mrs Terna Fiase'}</h3>
                <p className="text-xs text-yellow-200 mb-2">{provostData?.title || 'MSc, BNSc, Dip Nursing Education, RNE, RM, RN • Provost'}</p>
                <p className="text-sm text-green-100 leading-relaxed">{provostData?.description || 'On behalf of Catholic Diocese of Gboko and Governing Council, I warmly welcome you to LCNS.'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="mission" className="py-20 bg-[#f0faf0]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 mb-16">
            <div className="bg-white p-8 rounded-[1.8rem] shadow-sm border-l-8 border-[#0f4c2e]">
              <h3 className="font-black text-2xl text-[#0f4c2e] flex items-center gap-2 mb-4"><Target className="text-yellow-500"/> Mission Statement</h3>
              <p className="text-slate-700 leading-relaxed">Our mission is to provide high-quality nursing training and service that fosters compassionate, competent, and innovative healthcare professionals.</p>
            </div>
            <div className="bg-[#0f4c2e] text-white p-8 rounded-[1.8rem] shadow-sm border-l-8 border-yellow-400">
              <h3 className="font-black text-2xl flex items-center gap-2 mb-4"><Eye className="text-yellow-300"/> Vision Statement</h3>
              <p className="text-green-100 leading-relaxed">Labe College of Nursing Sciences is committed to be an outstanding College of Nursing Sciences, recognized for excellence in healthcare training and practice.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="programmes" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-[#0f4c2e]">ND/HND Nursing Science</h2>
          <p className="text-slate-500 mt-2">4 Years Full-Time • NMCN Accredited • Admission Open 2026/2027</p>
        </div>
      </section>

      {/* FACILITIES - LINKED! ID=facilities */}
      <section id="facilities" className="py-16 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-black text-[#0f4c2e]">Our Facilities</h2>
          <p className="text-sm text-slate-500 mb-6">E-Library • ICT Centre • Girls Hostels • Skills Lab • Classrooms • Upload from Admin CMS</p>
          {facilities.length ? (
            <div className="grid md:grid-cols-3 gap-4">
              {facilities.map((f:any,i:number)=>(
                <div key={i} className="bg-[#f0faf0] border rounded-2xl overflow-hidden">
                  <img src={f.image || f.image_url} className="h-48 w-full object-cover"/>
                  <div className="p-4"><p className="font-bold text-[#0f4c2e]">{f.name || f.title}</p><p className="text-xs text-slate-500">{f.description}</p></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              {[
                {icon: Library, name: 'E-Library'},
                {icon: Monitor, name: 'ICT Centre'},
                {icon: BedDouble, name: 'Girls Hostels'},
                {icon: Building2, name: 'Skills Lab'},
              ].map(f=>(
                <div key={f.name} className="bg-[#f0faf0] border p-5 rounded-2xl text-center hover:shadow-lg transition">
                  <f.icon className="mx-auto text-[#0f4c2e] mb-2"/><p className="font-bold text-sm">{f.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* GALLERY - LINKED! ID=gallery */}
      <section id="gallery" className="py-16 bg-[#f8fdf8] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-black text-[#0f4c2e]">Official Campus Gallery</h2>
          <p className="text-sm text-slate-500 mb-6">Girls Hostels • Governor Signing Law • Classrooms • School Environment • ICT Centre</p>
          {gallery.length ? (
            <div className="grid md:grid-cols-3 gap-4">
              {gallery.map((g:any,i:number)=>(
                <div key={i} className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition">
                  <img src={g.image || g.image_url || g.url} alt={g.title||'Campus'} className="h-56 w-full object-cover"/>
                  <div className="p-3"><p className="font-bold text-sm text-[#0f4c2e]">{g.title||g.caption||'Campus Photo'}</p><p className="text-[11px] text-slate-500">{g.category||'Gallery'}</p></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed rounded-2xl p-10 text-center text-slate-400 text-sm">No gallery photos yet — Upload from Admin CMS → Official Gallery</div>
          )}
        </div>
      </section>

      <section id="admission" className="py-16 bg-yellow-400 text-[#0f2e1f]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black">Admission Open 2026/2027</h2>
          <p className="mt-2">ND/HND Nursing Science • Apply Online</p>
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

export const CollegeWebsite = LCNSWebsite;
export { LCNSWebsite };
export default LCNSWebsite;
