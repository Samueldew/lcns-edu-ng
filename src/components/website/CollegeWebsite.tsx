import React, { useState, useEffect } from 'react';
import { 
  Cross, ShieldCheck, MapPin, Phone, Mail, Clock, Menu, X,
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
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const loadCMS = async () => {
      try {
        const photos = await (StorageService as any).getGallery?.();
        if(photos && photos.length) {
          const seen = new Set();
          const unique = photos.filter((g:any) => {
            const url = g.image || g.image_url || g.url;
            if(!url || seen.has(url) || url.startsWith('data:')) return false;
            seen.add(url);
            return true;
          });
          setGallery(unique.slice(0, 12));
        }
        const loadAll = () => {
          const logoKeys = ['lcns_logo','college_logo','school_logo','lcns_settings','college_settings'];
          for(const k of logoKeys){
            try{
              const raw = localStorage.getItem(k);
              if(!raw) continue;
              if(raw.startsWith('data:image')) { setLogo(raw); break; }
              const parsed = JSON.parse(raw);
              if(typeof parsed === 'string' && parsed.startsWith('data:image')) { setLogo(parsed); break; }
              if(parsed?.logo) { setLogo(parsed.logo); break; }
              if(parsed?.logo_url) { setLogo(parsed.logo_url); break; }
            }catch{
              const raw=localStorage.getItem(k); 
              if(raw?.startsWith('data:image') || raw?.startsWith('https')) setLogo(raw);
            }
          }
          try{
            let bImg = null; 
            let bName = 'Most Rev. William A. Avenya'; 
            let bTitle = 'Proprietor - Bishop of Catholic Diocese of Gboko'; 
            let bDesc = 'As proprietor and pastoral guide of the College, His Lordship supports the growth of professional nursing education rooted in faith, discipline, compassion and service. Labe College of Nursing Sciences is called to form competent nurses who learn with excellence, serve with compassion and save lives with integrity.';
            const b1 = JSON.parse(localStorage.getItem('lcns_bishop')||'null'); const s1 = JSON.parse(localStorage.getItem('lcns_settings')||'{}'); const m = JSON.parse(localStorage.getItem('lcns_management')||'[]'); const mBishop = m.find((x:any)=>x.role==='Proprietor' || x.role==='Bishop');
            if(b1?.image) { bImg=b1.image; bName=b1.name||bName; bTitle=b1.title||bTitle; bDesc=b1.description||bDesc; } else if(s1?.proprietor_image) { bImg=s1.proprietor_image; bDesc=s1.proprietor_message||bDesc; } else if(localStorage.getItem('proprietor_image')) { bImg=localStorage.getItem('proprietor_image'); } else if(mBishop?.image) { bImg=mBishop.image; bDesc=mBishop.description||bDesc; }
            if(bImg || true){ if(bImg) setProprietorImg(bImg); setBishopData({name:bName, title:bTitle, description:bDesc, image:bImg}); }
            let pImg = null; 
            let pName = 'Mrs Terna Fiase Msc, Bnsc, Dip Nursing Education, RNE,RM,RN'; 
            let pTitle = 'Provost, Labe College of Nursing Sciences'; 
            let pDesc = 'On behalf of the Catholic Diocese of Gboko and the Governing Council, I warmly welcome you to Labe College of Nursing Sciences, Gboko. Founded upon the steadfast Catholic ethos of sanctity of human life and selfless service, our college stands as a beacon of academic rigor and moral rectitude in Benue State and across Nigeria. Offering the accredited ND/HND Nursing Science programme, nursing here is a sacred vocation dedicated to compassionate, competent care. We invite you to embark on this noble journey with us.';
            const p1 = JSON.parse(localStorage.getItem('lcns_provost')||'null'); const pMgmt = m.find((x:any)=>x.role==='Provost');
            if(p1?.image) { pImg=p1.image; pName=p1.name||pName; pTitle=p1.title||pTitle; pDesc=p1.message||p1.description||pDesc; } else if(s1?.provost_image) { pImg=s1.provost_image; pDesc=s1.provost_message||pDesc; } else if(pMgmt?.image) { pImg=pMgmt.image; pDesc=pMgmt.message||pMgmt.description||pDesc; }
            if(pImg){ setProvostImg(pImg); } setProvostData({name:pName, title:pTitle, description:pDesc, image:pImg});
            const fKeys = ['lcns_facilities','college_facilities']; let allFac:any[] = []; for(const fk of fKeys){ try{ const fv=JSON.parse(localStorage.getItem(fk)||'[]'); if(Array.isArray(fv) && fv.length) allFac=[...allFac, ...fv]; }catch{} } if(allFac.length) setFacilities(allFac);
          } catch {}
        }; 
        loadAll(); 
        const h = () => loadAll(); 
        window.addEventListener('storage', h); 
        window.addEventListener('focus', h); 
        return ()=>{ window.removeEventListener('storage', h); window.removeEventListener('focus', h); };
      } catch {}
    }; 
    loadCMS();
  }, []);

  useEffect(() => {
    if(gallery.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % gallery.length);
    }, 15000);
    return () => clearInterval(timer);
  }, [gallery.length]);

  const scrollTo = (id:string) => { 
    const el = document.getElementById(id);
    if(el){
      const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({top: y, behavior:'smooth'});
    }
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fdf8] text-slate-800">
      {/* TOP BAR WITH NEW EMAIL + ADDRESS */}
      <div className="bg-[#0f2e1f] text-white text-[11px] md:text-xs py-2 px-4 tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <span className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2"><Cross size={12} className="text-yellow-400"/> Catholic Diocese of Gboko • Learn • Serve • Save</span>
            <span className="hidden md:flex items-center gap-1.5"><Mail size={12} className="text-yellow-400"/> lcnsgboko@gmail.com</span>
            <span className="hidden md:flex items-center gap-1.5"><MapPin size={12} className="text-yellow-400"/> Off Gboko Hill, Along Agbile road, Gboko</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><Phone size={12}/> @ICT 08126799565</span>
            <span className="bg-[#1a5c32] px-3 py-1 rounded-full flex items-center gap-1"><ShieldCheck size={12}/> NMCN Accredited • NBTE Approved</span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-400 text-[#0f2e1f] py-3 px-4 text-center border-b-4 border-[#0f4c2e]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl font-black tracking-tight">ND/HND NURSING SCIENCE</h2>
          <p className="text-sm md:text-[15px] font-bold mt-1">Four Years Full-Time National Diploma Higher National Diploma • NMCN Accredited • NBTE Approved • Admission Open</p>
          <p className="text-[11px] font-bold mt-1">Established under the apostolic direction of the Catholic Diocese of Gboko to deliver world-class clinical nursing education</p>
        </div>
      </div>

      {/* ONE HEADER ONLY - WITH CONTACT LINKED */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0f4c2e] to-[#2e8b57] rounded-xl flex items-center justify-center text-white font-black overflow-hidden">
              {logo ? <img src={logo} className="w-full h-full object-contain p-1 bg-white rounded-xl"/> : 'L'}
            </div>
            <div><h1 className="font-black text-[#0f4c2e] leading-none text-[15px]">LABE COLLEGE</h1><p className="text-[9px] font-bold tracking-widest text-[#2e8b57]">OF NURSING SCIENCE, GBOKO</p><p className="text-[8px] text-slate-500">Catholic Diocese of Gboko</p></div>
          </div>
          <div className="hidden lg:flex gap-5 text-sm font-semibold text-[#0f4c2e] items-center">
            <button onClick={()=>scrollTo('home')} className="hover:text-yellow-600 font-bold">Home</button>
            <button onClick={()=>scrollTo('about-college')} className="hover:text-yellow-600 font-bold">About</button>
            <button onClick={()=>scrollTo('programmes')} className="hover:text-yellow-600 font-black bg-yellow-100 px-3 py-1 rounded-full">Programmes</button>
            <button onClick={()=>scrollTo('facilities')} className="hover:text-yellow-600">Facilities</button>
            <button onClick={()=>scrollTo('gallery')} className="hover:text-yellow-600">Gallery</button>
            <button onClick={()=>scrollTo('contact')} className="hover:text-yellow-600 font-black text-[#0f4c2e] border border-[#0f4c2e] px-4 py-1.5 rounded-full">Contact</button>
            <button onClick={()=>scrollTo('admission')} className="bg-[#0f4c2e] text-white px-6 py-2.5 rounded-full hover:bg-[#1a5c32]">Apply</button>
          </div>
          <button className="lg:hidden" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X/>:<Menu/>}</button>
        </div>
        {menuOpen && (
          <div className="lg:hidden bg-white p-4 flex flex-col gap-3 border-t shadow-lg">
            <button onClick={()=>scrollTo('home')} className="text-left py-3 border-b font-bold">🏠 Home</button>
            <button onClick={()=>scrollTo('about-college')} className="text-left py-3 border-b font-bold">📖 About and History</button>
            <button onClick={()=>scrollTo('programmes')} className="text-left py-3 border-b font-black bg-yellow-50 px-3 rounded">🎓 Programmes - ND HND Nursing Science</button>
            <button onClick={()=>scrollTo('facilities')} className="text-left py-3 border-b font-bold">🏢 Facilities</button>
            <button onClick={()=>scrollTo('gallery')} className="text-left py-3 border-b font-bold">🖼️ Gallery</button>
            <button onClick={()=>scrollTo('contact')} className="text-left py-3 border-b font-black bg-[#0f4c2e] text-white px-4 rounded-full">📞 Portals & Contact - lcnsgboko@gmail.com</button>
            <button onClick={()=>scrollTo('admission')} className="text-left py-3 bg-yellow-400 text-[#0f2e1f] rounded-full px-6 font-black text-center">Apply Now</button>
            <div className="bg-[#f0faf0] p-3 rounded-xl text-xs">
              <p className="font-bold text-[#0f4c2e]">Portals & Contact</p>
              <p className="flex gap-1 mt-1"><MapPin size={12}/> Off Gboko Hill, Along Agbile road, Gboko Benue state</p>
              <p className="flex gap-1 mt-1"><Phone size={12}/> For technical assistance call @ICT 08126799565</p>
              <p className="flex gap-1 mt-1"><Mail size={12}/> lcnsgboko@gmail.com</p>
            </div>
          </div>
        )}
      </nav>

      <section id="home" className="relative bg-gradient-to-br from-[#0f4c2e] via-[#184f2e] to-[#2e8b57] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-[#0f2e1f] rounded-full px-5 py-2 text-sm font-black mb-5">
              <GraduationCap size={18}/> ND HND Nursing Science • 4 Years Full-Time • NMCN Accredited • NBTE Approved
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-[1.05] mb-3">LABE COLLEGE OF NURSING SCIENCE, GBOKO</h1>
            <p className="text-yellow-200 font-bold text-sm mb-2">Catholic Diocese of Gboko • Catholic Ethos</p>
            <p className="text-green-100 text-[13px] leading-relaxed mb-6">Established under the apostolic direction of the Catholic Diocese of Gboko to deliver world-class clinical nursing education, moral discipline, and compassionate Christian healthcare to save human lives.</p>
            <h2 className="text-2xl md:text-3xl font-black leading-[1.05] mb-6">Learn with <span className="text-yellow-300">Distinction</span>, Serve with Compassion</h2>
            <div className="bg-white/10 border border-yellow-400/30 rounded-2xl p-4 mb-8">
              <p className="text-yellow-300 font-black text-sm">Official Academic Offering: ND HND Nursing Science</p>
              <p className="text-xs text-green-100 mt-1">4 Years Full-Time National Diploma/Higher National Diploma • Post-UTME Requirements: Minimum of Five O-Level credit passes in WAEC NECO NABTEB at not more than two sittings, including English Language, Mathematics, Biology, Chemistry, and Physics. Valid JAMB UTME score.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button onClick={()=>scrollTo('programmes')} className="bg-yellow-400 text-[#0f2e1f] px-8 py-3.5 rounded-full font-black">View Programmes <ChevronRight className="inline ml-1"/></button>
              <button onClick={()=>scrollTo('contact')} className="bg-white/10 border border-white/20 px-8 py-3.5 rounded-full">Contact Us</button>
              <button onClick={()=>scrollTo('admission')} className="bg-white text-[#0f4c2e] px-8 py-3.5 rounded-full font-black">Apply Now</button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-[2rem] p-2 shadow-2xl">
              <div className="relative rounded-[1.6rem] h-[460px] w-full overflow-hidden">
                {gallery.length > 0 ? (
                  <>
                    <img src={gallery[currentSlide]?.image || gallery[currentSlide]?.image_url || gallery[0]?.image} className="h-full w-full object-cover transition-all duration-1000" alt="Campus"/>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 px-3 py-1.5 rounded-full">
                      {gallery.map((_:any, idx:number)=>(
                        <button key={idx} onClick={()=>setCurrentSlide(idx)} className={`w-2 h-2 rounded-full transition-all ${idx===currentSlide ? 'bg-yellow-400 w-6' : 'bg-white/60'}`}/>
                      ))}
                    </div>
                  </>
                ) : (
                  <img src="https://images.unsplash.com/photo-1580281657527-47f24907b016?auto=format&fit=crop&q=80&w=800" className="rounded-[1.6rem] h-full w-full object-cover" alt="Campus"/>
                )}
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-[#0f4c2e] p-4 rounded-2xl shadow-xl"><p className="font-black flex items-center gap-2"><MapPin size={16}/> Off Gboko Hill, Along Agbile road</p><p className="text-xs text-slate-500">Gboko Benue state • lcnsgboko@gmail.com • @ICT 08126799565</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="programmes" className="py-16 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex bg-[#0f4c2e] text-white px-6 py-2 rounded-full font-black text-xs tracking-widest">CATHOLIC ETHOS ACADEMIC PROGRAMME</div>
            <h2 className="text-4xl md:text-5xl font-black text-[#0f4c2e] mt-4">ND/HND Nursing Science</h2>
            <p className="text-lg font-bold text-slate-700 mt-2">4 Years Full-Time National Diploma/Higher National Diploma • NMCN Accredited • NBTE Approved</p>
            <p className="text-sm font-bold text-[#2e8b57] mt-1">Post-UTME Requirements • Catholic Diocese of Gboko</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#f0faf0] border-2 border-[#0f4c2e] rounded-[2rem] p-8">
              <h3 className="font-black text-xl text-[#0f4c2e] flex items-center gap-2"><BookOpen className="text-yellow-600"/> Labe College of Nursing Sciences offers ND HND Nursing Science</h3>
              <div className="mt-6 space-y-4">
                <div className="flex gap-3"><div className="w-10 h-10 bg-[#0f4c2e] text-white rounded-full flex items-center justify-center shrink-0"><GraduationCap size={18}/></div><div><p className="font-bold text-[#0f4c2e]">National Diploma Nursing Science</p><p className="text-sm text-slate-600">Two Years • Foundation in Nursing Science, Basic Medical Sciences, Community Health</p></div></div>
                <div className="flex gap-3"><div className="w-10 h-10 bg-yellow-400 text-[#0f2e1f] rounded-full flex items-center justify-center shrink-0"><Award size={18}/></div><div><p className="font-bold text-[#0f4c2e]">Higher National Diploma Nursing Science</p><p className="text-sm text-slate-600">Two Years • Advanced Clinical Practice, Research, Leadership, Specialization</p></div></div>
              </div>
            </div>
            <div className="bg-[#0f4c2e] text-white rounded-[2rem] p-8">
              <h3 className="font-black text-xl flex items-center gap-2"><CheckCircle className="text-yellow-300"/> Post-UTME Requirements</h3>
              <div className="mt-6 space-y-4">
                <div className="bg-white/10 border border-white/10 rounded-xl p-4">
                  <p className="font-bold text-yellow-300 text-sm">O-Level Requirements</p>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <span className="bg-yellow-400 text-[#0f2e1f] px-3 py-1.5 rounded-full text-xs font-black text-center">English Language</span>
                    <span className="bg-yellow-400 text-[#0f2e1f] px-3 py-1.5 rounded-full text-xs font-black text-center">Mathematics</span>
                    <span className="bg-white text-[#0f4c2e] px-3 py-1.5 rounded-full text-xs font-black text-center">Biology</span>
                    <span className="bg-white text-[#0f4c2e] px-3 py-1.5 rounded-full text-xs font-black text-center">Chemistry</span>
                    <span className="bg-white text-[#0f4c2e] px-3 py-1.5 rounded-full text-xs font-black text-center col-span-2">Physics</span>
                  </div>
                </div>
                <div className="bg-yellow-400 text-[#0f2e1f] rounded-xl p-4">
                  <p className="font-black text-sm">JAMB UTME Requirement</p>
                  <p className="text-sm font-bold mt-1">Valid JAMB UTME score • First Choice Labe College of Nursing Sciences, Gboko</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about-college" className="py-16 bg-[#f8fdf8] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-[#0f4c2e] mb-6">About and History</h2>
          <div className="bg-white border-2 border-green-100 rounded-[2rem] p-8 leading-relaxed text-slate-700">
            <p className="text-[15px]">The College is the brainchild of the Bishop, Catholic Diocese of Gboko, Most Rev. William A. Avenya, and is named after a humanitarian, late Pharmacist Ternenge Labe in a bid to immortalize him for the selfless services he rendered to people within Gboko Diocese, Benue state and beyond. The institution has an objective of training the teeming Nigerian youths with compassion and fear of God, on the best global nursing practices. The program will enhance their skills and widen their horizon to be the best nursing practitioners in the world, especially the indigent ones who cannot afford the cost of travelling outside the country for further studies.</p>
            <p className="mt-4 text-sm">Established by Catholic Diocese of Gboko, located Off Gboko Hill, Along Agbile road, Gboko Benue state.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <div className="bg-[#f0faf0] border border-green-100 rounded-[2rem] p-6">
              <p className="text-xs font-bold tracking-widest text-[#2e8b57] mb-3">PROPRIETOR - BISHOP OF CATHOLIC DIOCESE OF GBOKO</p>
              <div className="flex gap-4 items-start">
                <div className="w-28 h-28 rounded-2xl bg-[#0f4c2e] overflow-hidden shrink-0 border-2 border-yellow-400">
                  {proprietorImg || bishopData?.image ? <img src={proprietorImg || bishopData?.image} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-black">BISHOP</div>}
                </div>
                <div>
                  <h3 className="font-black text-[18px] text-[#0f4c2e] leading-tight">{bishopData?.name || 'Most Rev. William A. Avenya'}</h3>
                  <p className="text-xs text-[#2e8b57] font-bold mb-2 mt-1">{bishopData?.title || 'Proprietor - Bishop of Catholic Diocese of Gboko'}</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{bishopData?.description}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#0f4c2e] text-white rounded-[2rem] p-6">
              <p className="text-xs font-bold tracking-widest text-yellow-300 mb-3">WELCOME FROM THE PROVOST DESK</p>
              <div className="flex gap-4 items-start">
                <div className="w-28 h-28 rounded-2xl bg-white overflow-hidden shrink-0 border-2 border-yellow-400">
                  {provostImg || provostData?.image ? <img src={provostImg || provostData?.image} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-[#0f4c2e] font-black text-[10px]">PROVOST</div>}
                </div>
                <div>
                  <h3 className="font-black text-[16px] leading-tight">{provostData?.name || 'Mrs Terna Fiase Msc, Bnsc, Dip Nursing Education, RNE,RM,RN'}</h3>
                  <p className="text-xs text-yellow-200 font-bold mb-2 mt-1">{provostData?.title || 'Provost, Labe College of Nursing Sciences'}</p>
                  <p className="text-[13px] text-green-100 leading-relaxed">{provostData?.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="facilities" className="py-12 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4"><h2 className="text-3xl font-black text-[#0f4c2e]">Our Facilities</h2><div className="grid md:grid-cols-4 gap-4 mt-6">{[{icon:Library,name:'E-Library'},{icon:Monitor,name:'ICT Centre'},{icon:BedDouble,name:'Girls Hostels'},{icon:Building2,name:'Skills Lab'}].map(f=>(<div key={f.name} className="bg-[#f0faf0] border p-5 rounded-2xl text-center"><f.icon className="mx-auto text-[#0f4c2e] mb-2"/><p className="font-bold text-sm">{f.name}</p></div>))}</div></div>
      </section>

      <section id="gallery" className="py-12 bg-[#f8fdf8] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-black text-[#0f4c2e]">Official Campus Gallery — Auto Changes Every 15 Seconds</h2>
          {gallery.length ? (
            <div className="mt-6 bg-white border-2 rounded-[2rem] p-2 shadow-xl">
              <div className="relative h-[420px] md:h-[520px] rounded-[1.6rem] overflow-hidden">
                <img src={gallery[currentSlide]?.image || gallery[currentSlide]?.image_url} className="h-full w-full object-cover transition-all duration-1000" alt={gallery[currentSlide]?.title}/>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <p className="text-white font-black text-lg">{gallery[currentSlide]?.title || `Campus Image ${currentSlide+1}`}</p>
                  <p className="text-green-200 text-xs">{gallery[currentSlide]?.description || 'Labe College of Nursing Sciences, Gboko'}</p>
                </div>
              </div>
            </div>
          ) : <div className="bg-white border-2 border-dashed rounded-2xl p-8 text-center text-sm text-slate-400 mt-6">Upload from Admin CMS Gallery</div>}
        </div>
      </section>

      <section id="admission" className="py-16 bg-yellow-400 text-[#0f2e1f] text-center scroll-mt-24"><div className="max-w-7xl mx-auto px-4"><h2 className="text-3xl font-black">ND HND Nursing Science — Admission Open</h2><p className="font-bold mt-2">4 Years Full-Time ND/HND • NMCN Accredited • NBTE Approved • lcnsgboko@gmail.com • Off Gboko Hill, Along Agbile road, Gboko</p></div></section>

      {/* FULL FOOTER WITH NEW ADDRESS + EMAIL + CONTACT LINKED */}
      <footer id="contact" className="bg-[#0a2e1f] text-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {logo ? <img src={logo} className="w-12 h-12 bg-white rounded-xl p-1 object-contain"/> : <div className="w-12 h-12 bg-white text-[#0a4d2e] rounded-xl flex items-center justify-center font-black">L</div>}
              <div><p className="font-black leading-none text-[14px]">LABE COLLEGE</p><p className="text-[10px] text-yellow-300 font-bold">OF NURSING SCIENCE, GBOKO</p><p className="text-[8px] text-green-200">Catholic Diocese of Gboko</p></div>
            </div>
            <p className="text-sm text-green-100 leading-relaxed">Established under the apostolic direction of the Catholic Diocese of Gboko to deliver world-class clinical nursing education, moral discipline, and compassionate Christian healthcare to save human lives.</p>
            <div className="mt-3 flex flex-wrap gap-2"><span className="bg-[#1a5c32] px-2 py-1 rounded-full text-[10px]">NMCN Accredited</span><span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-[10px] font-black">NBTE Approved</span></div>
          </div>

          <div>
            <h3 className="font-black text-yellow-300 text-sm tracking-widest mb-4">QUICK LINKS</h3>
            <div className="space-y-2 text-sm text-green-100">
              <button onClick={()=>scrollTo('home')} className="block hover:text-yellow-300 text-left">Home</button>
              <button onClick={()=>scrollTo('about-college')} className="block hover:text-yellow-300 text-left">About and History</button>
              <button onClick={()=>scrollTo('programmes')} className="block hover:text-yellow-300 font-bold text-left">Programmes - ND/HND Nursing Science</button>
              <button onClick={()=>scrollTo('facilities')} className="block hover:text-yellow-300 text-left">Facilities</button>
              <button onClick={()=>scrollTo('gallery')} className="block hover:text-yellow-300 text-left">Gallery</button>
              <button onClick={()=>scrollTo('admission')} className="block hover:text-yellow-300 text-left">Admission - Apply Now</button>
              <button onClick={()=>scrollTo('contact')} className="block hover:text-yellow-300 font-black text-yellow-300 text-left">Portals & Contact</button>
            </div>
          </div>

          <div>
            <h3 className="font-black text-yellow-300 text-sm tracking-widest mb-4">PORTALS & CONTACT</h3>
            <div className="space-y-3 text-sm text-green-100">
              <p className="flex gap-2"><MapPin size={16} className="text-yellow-300 shrink-0 mt-0.5"/> Off Gboko Hill, Along Agbile road, Gboko Benue state</p>
              <p className="flex gap-2"><Mail size={16} className="text-yellow-300 shrink-0 mt-0.5"/> lcnsgboko@gmail.com<br/>info@lcns.edu.ng<br/>admission@lcns.edu.ng</p>
              <p className="flex gap-2"><Phone size={16} className="text-yellow-300 shrink-0 mt-0.5"/> For technical assistance call @ICT 08126799565<br/>08126799565</p>
              <p className="flex gap-2"><Clock size={16} className="text-yellow-300 shrink-0 mt-0.5"/> Mon - Fri: 8am - 4pm</p>
            </div>
          </div>

          <div>
            <h3 className="font-black text-yellow-300 text-sm tracking-widest mb-4">ADMISSION 2026/2027</h3>
            <div className="bg-[#0f4c2e] border border-yellow-400/30 rounded-2xl p-4">
              <p className="text-yellow-300 font-black text-sm">ND/HND Nursing Science</p>
              <p className="text-xs text-green-100 mt-1">Catholic Ethos Academic Programme</p>
              <p className="text-xs text-green-100 mt-2">4 Years Full-Time • Post-UTME Requirements: English, Maths, Biology, Chemistry, Physics + JAMB</p>
              <button onClick={()=>scrollTo('admission')} className="mt-4 w-full bg-yellow-400 text-[#0f2e1f] py-2.5 rounded-full font-black text-sm">Apply Now</button>
              <p className="text-[10px] text-green-200 mt-3 text-center">lcnsgboko@gmail.com • Off Gboko Hill, Along Agbile road</p>
            </div>
          </div>
        </div>

        <div className="border-t border-green-900 py-4 px-4 text-center">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-green-200">
            <span>© {new Date().getFullYear()} Labe College of Nursing Sciences, Gboko. Catholic Diocese of Gboko. All rights reserved.</span>
            <span className="flex items-center gap-2">Learn • Serve • Save • lcnsgboko@gmail.com • @ICT 08126799565</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const CollegeWebsite = LCNSWebsite;
export { LCNSWebsite };
export default LCNSWebsite;
