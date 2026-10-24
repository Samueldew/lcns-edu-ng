import React, { useState, useEffect } from 'react';
import { 
  Cross, ShieldCheck, MapPin,
  ChevronRight, Target, Eye, Library, Monitor, BedDouble, Building2,
  GraduationCap, BookOpen, Award, CheckCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { StorageService } from '../../services/storage';

const LCNSWebsite = () => {
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
        // ===== FIXED: GALLERY FROM school_settings (13 loved) =====
        try {
          const { data: galleryData } = await supabase
            .from('school_settings')
            .select('value')
            .eq('key', 'gallery')
            .single();
          
          if (galleryData?.value) {
            let parsed = typeof galleryData.value === 'string' ? JSON.parse(galleryData.value) : galleryData.value;
            if (Array.isArray(parsed) && parsed.length > 0) {
              const seen = new Set();
              const unique = parsed.filter((g: any) => {
                const url = g.image || g.image_base64 || g.image_url || g.url;
                if (!url || seen.has(url)) return false;
                seen.add(url);
                return true;
              });
              setGallery(unique); // Shows all 13, not slice(0,12)
              console.log(`✅ Gallery loaded: ${unique.length} from school_settings`);
            }
          } else {
            // Fallback to StorageService if school_settings empty
            const photos = await (StorageService as any).getGallery?.();
            if (photos && photos.length) {
              const seen = new Set();
              const unique = photos.filter((g: any) => {
                const url = g.image || g.image_url || g.url;
                if (!url || seen.has(url)) return false;
                seen.add(url);
                return true;
              });
              setGallery(unique);
            }
          }
        } catch (e) {
          console.log("Gallery fallback to StorageService", e);
          try {
            const photos = await (StorageService as any).getGallery?.();
            if (photos && photos.length) setGallery(photos);
          } catch {}
        }

        // ===== FIXED: BISHOP & PROVOST FROM school_settings (90k image) =====
        const loadAll = async () => {
          // LOGO
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
            // TRY SUPABASE FIRST FOR BISHOP/PROVOST - THIS FIXES BISHOP DISPLAY
            let bImg: string | null = null;
            let bName = 'Most Rev. William A. Avenya'; 
            let bTitle = 'Proprietor - Bishop of Catholic Diocese of Gboko'; 
            let bDesc = 'As proprietor and pastoral guide of the College, His Lordship supports the growth of professional nursing education rooted in faith, discipline, compassion and service. Labe College of Nursing Sciences is called to form competent nurses who learn with excellence, serve with compassion and save lives with integrity.';

            let pImg: string | null = null; 
            let pName = 'Mrs Terna Fiase Msc, Bnsc, Dip Nursing Education, RNE,RM,RN'; 
            let pTitle = 'Provost, Labe College of Nursing Sciences'; 
            let pDesc = 'On behalf of the Catholic Diocese of Gboko and the Governing Council, I warmly welcome you to Labe College of Nursing Sciences, Gboko. Founded upon the steadfast Catholic ethos of sanctity of human life and selfless service, our college stands as a beacon of academic rigor and moral rectitude in Benue State and across Nigeria. Offering the accredited ND/HND Nursing Science programme, nursing here is a sacred vocation dedicated to compassionate, competent care. We invite you to embark on this noble journey with us.';

            // 1. Try Supabase school_settings for Bishop & Provost
            try {
              const { data: allSettings } = await supabase
                .from('school_settings')
                .select('key, value');
              
              if (allSettings) {
                for (const row of allSettings) {
                  let val: any = row.value;
                  try { if (typeof val === 'string') val = JSON.parse(val); } catch {}
                  
                  if (row.key === 'bishop' || row.key === 'lcns_bishop' || row.key === 'proprietor') {
                    if (val?.image || val?.image_base64) bImg = val.image || val.image_base64;
                    if (val?.name) bName = val.name;
                    if (val?.title) bTitle = val.title;
                    if (val?.description || val?.message) bDesc = val.description || val.message;
                  }
                  if (row.key === 'provost' || row.key === 'lcns_provost') {
                    if (val?.image || val?.image_base64) pImg = val.image || val.image_base64;
                    if (val?.name) pName = val.name;
                    if (val?.title) pTitle = val.title;
                    if (val?.description || val?.message) pDesc = val.description || val.message;
                  }
                  // Management array may contain bishop/provost
                  if (row.key === 'management' || row.key === 'lcns_management') {
                    const arr = Array.isArray(val) ? val : [];
                    const mBishop = arr.find((x:any)=>x.role==='Proprietor' || x.role==='Bishop');
                    const mProvost = arr.find((x:any)=>x.role==='Provost');
                    if (mBishop?.image) { bImg = bImg || mBishop.image; if(mBishop.description) bDesc = mBishop.description; }
                    if (mProvost?.image) { pImg = pImg || mProvost.image; if(mProvost.description) pDesc = mProvost.description; }
                  }
                }
              }
            } catch (e) { console.log("Supabase bishop/provost fetch failed, fallback to localStorage", e); }

            // 2. Fallback to localStorage (your old logic)
            try {
              const b1 = JSON.parse(localStorage.getItem('lcns_bishop')||'null'); 
              const s1 = JSON.parse(localStorage.getItem('lcns_settings')||'{}'); 
              const m = JSON.parse(localStorage.getItem('lcns_management')||'[]'); 
              const mBishop = m.find((x:any)=>x.role==='Proprietor' || x.role==='Bishop');
              if(b1?.image) { bImg=bImg||b1.image; bName=b1.name||bName; bTitle=b1.title||bTitle; bDesc=b1.description||bDesc; } 
              else if(s1?.proprietor_image) { bImg=bImg||s1.proprietor_image; bDesc=s1.proprietor_message||bDesc; } 
              else if(localStorage.getItem('proprietor_image')) { bImg=bImg||localStorage.getItem('proprietor_image'); } 
              else if(mBishop?.image) { bImg=bImg||mBishop.image; bDesc=mBishop.description||bDesc; }
            } catch {}

            try {
              const p1 = JSON.parse(localStorage.getItem('lcns_provost')||'null'); 
              const m = JSON.parse(localStorage.getItem('lcns_management')||'[]');
              const pMgmt = m.find((x:any)=>x.role==='Provost');
              const s1 = JSON.parse(localStorage.getItem('lcns_settings')||'{}');
              if(p1?.image) { pImg=pImg||p1.image; pName=p1.name||pName; pTitle=p1.title||pTitle; pDesc=p1.message||p1.description||pDesc; } 
              else if(s1?.provost_image) { pImg=pImg||s1.provost_image; pDesc=s1.provost_message||pDesc; } 
              else if(pMgmt?.image) { pImg=pImg||pMgmt.image; pDesc=pMgmt.message||pMgmt.description||pDesc; }
            } catch {}

            // SET STATE - BISHOP DISPLAY FIX
            if(bImg) setProprietorImg(bImg);
            setBishopData({name:bName, title:bTitle, description:bDesc, image:bImg});
            if(pImg) setProvostImg(pImg);
            setProvostData({name:pName, title:pTitle, description:pDesc, image:pImg});

            const fKeys = ['lcns_facilities','college_facilities']; 
            let allFac:any[] = []; 
            for(const fk of fKeys){ 
              try{ const fv=JSON.parse(localStorage.getItem(fk)||'[]'); if(Array.isArray(fv) && fv.length) allFac=[...allFac, ...fv]; }catch{} 
            } 
            if(allFac.length) setFacilities(allFac);
          } catch (err) { console.log("loadAll error", err); }
        }; 

        await loadAll(); 
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
  };

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
              <button onClick={()=>scrollTo('programmes')} className="bg-yellow-400 text-[#0f2e1f] px-8 py-3.5 rounded-full font-black">View Program <ChevronRight className="inline ml-1"/></button>
              <button onClick={()=>scrollTo('admission')} className="bg-white/10 border border-white/20 px-8 py-3.5 rounded-full">Apply Now</button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-[2rem] p-2 shadow-2xl">
              <div className="relative rounded-[1.6rem] h-[460px] w-full overflow-hidden">
                {gallery.length > 0 ? (
                  <>
                    <img src={gallery[currentSlide]?.image || gallery[currentSlide]?.image_base64 || gallery[currentSlide]?.image_url || gallery[0]?.image || gallery[0]?.image_base64} className="h-full w-full object-cover transition-all duration-1000" alt="Campus"/>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 px-3 py-1.5 rounded-full">
                      {gallery.map((_:any, idx:number)=>(
                        <button key={idx} onClick={()=>setCurrentSlide(idx)} className={`w-2 h-2 rounded-full transition-all ${idx===currentSlide ? 'bg-yellow-400 w-6' : 'bg-white/60'}`}/>
                      ))}
                    </div>
                    <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] px-3 py-1 rounded-full">{currentSlide+1}/{gallery.length} • Auto changes every 15s</div>
                  </>
                ) : (
                  <img src="https://images.unsplash.com/photo-1580281657527-47f24907b016?auto=format&fit=crop&q=80&w=800" className="rounded-[1.6rem] h-full w-full object-cover" alt="Campus"/>
                )}
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-[#0f4c2e] p-4 rounded-2xl shadow-xl"><p className="font-black flex items-center gap-2"><MapPin size={16}/> Off Gboko Hill Road, Gboko</p><p className="text-xs text-slate-500">Opposite Sinai College, Gboko Hills</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="programmes" className="py-16 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex bg-[#0f4c2e] text-white px-6 py-2 rounded-full font-black text-xs tracking-widest">OFFICIAL ACADEMIC OFFERING</div>
            <h2 className="text-4xl md:text-5xl font-black text-[#0f4c2e] mt-4">ND HND Nursing Science</h2>
            <p className="text-lg font-bold text-slate-700 mt-2">Four Years Full-Time National Diploma Higher National Diploma • NMCN Accredited • NBTE Approved</p>
            <button onClick={()=>scrollTo('about-college')} className="mt-4 text-sm font-bold text-[#0f4c2e] underline">← Learn About Our History and Philosophy</button>
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

      <section id="about-college" className="py-16 bg-[#f8fdf8] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-[#0f4c2e] mb-6">About and History</h2>
          <div className="bg-white border-2 border-green-100 rounded-[2rem] p-8 leading-relaxed text-slate-700">
            <p className="text-[15px]">The College is the brainchild of the Bishop, Catholic Diocese of Gboko, Most Rev. William A. Avenya, and is named after a humanitarian, late Pharmacist Ternenge Labe in a bid to immortalize him for the selfless services he rendered to people within Gboko Diocese, Benue state and beyond. The institution has an objective of training the teeming Nigerian youths with compassion and fear of God, on the best global nursing practices. The program will enhance their skills and widen their horizon to be the best nursing practitioners in the world, especially the indigent ones who cannot afford the cost of travelling outside the country for further studies.</p>
            <p className="mt-4 text-sm">Established by Catholic Diocese of Gboko, located off Gboko Hill Road opposite Sinai College, Gboko Hills.</p>
            <button onClick={()=>scrollTo('programmes')} className="mt-6 bg-[#0f4c2e] text-white px-6 py-3 rounded-full font-black">View Our ND/HND Program →</button>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <div className="bg-[#f0faf0] border border-green-100 rounded-[2rem] p-6">
              <p className="text-xs font-bold tracking-widest text-[#2e8b57] mb-3">PROPRIETOR - BISHOP OF CATHOLIC DIOCESE OF GBOKO</p>
              <div className="flex gap-4 items-start">
                <div className="w-28 h-28 rounded-2xl bg-[#0f4c2e] overflow-hidden shrink-0 border-2 border-yellow-400">
                  {proprietorImg || bishopData?.image ? <img src={proprietorImg || bishopData?.image} className="w-full h-full object-cover" alt={bishopData?.name}/> : <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-black">BISHOP</div>}
                </div>
                <div>
                  <h3 className="font-black text-[18px] text-[#0f4c2e] leading-tight">{bishopData?.name || 'Most Rev. William A. Avenya'}</h3>
                  <p className="text-xs text-[#2e8b57] font-bold mb-2 mt-1">{bishopData?.title || 'Proprietor - Bishop of Catholic Diocese of Gboko'} • Catholic Bishop of Gboko Diocese • Proprietor, Labe College of Nursing Sciences</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{bishopData?.description}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#0f4c2e] text-white rounded-[2rem] p-6">
              <p className="text-xs font-bold tracking-widest text-yellow-300 mb-3">WELCOME FROM THE PROVOST DESK</p>
              <div className="flex gap-4 items-start">
                <div className="w-28 h-28 rounded-2xl bg-white overflow-hidden shrink-0 border-2 border-yellow-400">
                  {provostImg || provostData?.image ? <img src={provostImg || provostData?.image} className="w-full h-full object-cover" alt={provostData?.name}/> : <div className="w-full h-full flex items-center justify-center text-[#0f4c2e] font-black text-[10px]">PROVOST</div>}
                </div>
                <div>
                  <h3 className="font-black text-[16px] leading-tight">{provostData?.name || 'Mrs Terna Fiase Msc, Bnsc, Dip Nursing Education, RNE,RM,RN'}</h3>
                  <p className="text-xs text-yellow-200 font-bold mb-2 mt-1">{provostData?.title || 'Provost, Labe College of Nursing Sciences'}</p>
                  <p className="text-[13px] text-green-100 leading-relaxed">{provostData?.description}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 grid gap-8">
            <div className="bg-white border-2 border-[#0f4c2e] rounded-[2rem] p-8">
              <h3 className="text-2xl font-black text-[#0f4c2e] flex items-center gap-2"><Target className="text-yellow-600"/> PHILOSOPHY OF THE SCHOOL</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">Health Care Education is a life-long process that begins with the basics, and progresses all through to core and advanced levels of learning, whereby professional developments could be achieved. Advancing the art and sciences of Nursing ultimately upgrades the health status of individuals, families, communities, nations and the world in general.</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">A solid Nursing education, therefore, equips nurses to be evidence-based in their practice, to fully engage in their scholarly and research activities, and to translate knowledge in health care and sciences into health services improvements, for the benefit of all humanity. By embracing diversity and equity perspectives in raising the professional and social conscience of our students, they would always seek best practice standards, and become top notch health services leaders.</p>
              <div className="mt-6 space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <p>That nursing is a human science vocation and a discipline that is focused on diagnosis and treatment of human responses to actual and potential health problems and that the client is conceptualized as an individual, family, group or community. This is the focus of the nursing profession.</p>
                <p>That each client and every member of the community is unique and holds values and beliefs reflective of their culture, sense of life experiences, and nurses must respect this fact.</p>
                <p>That there are core competences that enable a nurse to provide safe passage for clients. These core competences which include but not limited are clinical judgments, advocacy, caring practice, systems thinking response to diversity, facilitation of learning, clinical inquiry collaboration and the like, are the basis of nurses ability to provide, design, manage and coordinate the caring practice process.</p>
                <p>That together we serve students by being strong role models through commitment to excellence as teachers, students and clinicians. The faculty is committed to cultivating an organizational sense of professional empowerment, a desire for long-life learning and a passion for social justice and social cultural harmony as a way of belonging in our school and as an integral part of our school community. Therefore, the school uses an innovative curriculum based on the changing health and socioeconomic cultural needs of the population and the health caring delivery system, which is integral to the dedication of the faculty as well as the student learning and development.</p>
                <p>That we all learn best when actively engaged in the learning process. The faculty desires to work with students as a community of learners in which all function at a high level of accountability, flexibility and integrity.</p>
                <p>That since we are in a system, we will collaborate with relevant cooperate organizations for effective teaching and learning process, be they local or international, government or non government.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#0f4c2e] text-white rounded-[2rem] p-8">
                <h3 className="font-black text-xl flex items-center gap-2"><Target className="text-yellow-300"/> Mission</h3>
                <p className="mt-3 text-sm leading-relaxed text-green-100">Our mission is to provide high-quality nursing training and service that fosters compassionate, competent, and innovative healthcare professionals who improve healthcare outcomes and promote wellness with the fear of God, within the Diocese and beyond.</p>
              </div>
              <div className="bg-yellow-400 text-[#0f2e1f] rounded-[2rem] p-8">
                <h3 className="font-black text-xl flex items-center gap-2"><Eye className="text-[#0f4c2e]"/> Vision</h3>
                <p className="mt-3 text-sm leading-relaxed font-medium">Labe College of Nursing Sciences (LCNS) is committed to be an outstanding College of Nursing Sciences, recognized for excellence in healthcare training and practice, with a commitment to improving health care delivery, promoting social justice, and advancing the medical profession.</p>
              </div>
            </div>
            <div className="bg-white border rounded-[2rem] p-8">
              <h3 className="text-xl font-black text-[#0f4c2e]">Our Core Values</h3>
              <p className="mt-2 text-sm text-slate-600">Our values are through commitment to the under mentioned to promote excellence in Nursing education practice and services, using the five Cs of best practice Nursing, which are Commitment, Conscience, Competence, Compassion, and Confidence.</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                {['Commitment','Conscience','Competence','Compassion','Confidence'].map(v=>(
                  <div key={v} className="bg-[#f0faf0] border border-green-200 rounded-xl p-3 text-center font-black text-[#0f4c2e] text-sm">{v}</div>
                ))}
              </div>
            </div>
            <div className="bg-white border rounded-[2rem] p-8">
              <h3 className="text-xl font-black text-[#0f4c2e]">School Colors and Logo</h3>
              <p className="mt-2 text-sm text-slate-600">The logo for Labe College of Nursing Sciences, Gboko uses a combination of green, white, black, red, orange, and brown colours.</p>
              <div className="grid md:grid-cols-2 gap-4 mt-4 text-[13px] leading-relaxed">
                <div className="flex gap-2"><span className="w-6 h-6 rounded-full bg-green-700 shrink-0"></span><span><b>Green</b> symbolizes health, healing, life, growth, and renewal. This represents the nurturing aspect of nursing at LCNS and the hope they will bring to patients.</span></div>
                <div className="flex gap-2"><span className="w-6 h-6 rounded-full bg-white border shrink-0"></span><span><b>White</b> symbolizes purity, cleanliness, peace, and integrity. White is traditionally associated with nursing profession to signify cleanliness, ethics, and professionalism.</span></div>
                <div className="flex gap-2"><span className="w-6 h-6 rounded-full bg-black shrink-0"></span><span><b>Black</b> symbolizes the rich culture of our Diocese, strength, seriousness and professionalism. Used in Rod of Asclepius and tagline ribbon.</span></div>
                <div className="flex gap-2"><span className="w-6 h-6 rounded-full bg-red-600 shrink-0"></span><span><b>Red</b> symbolizes passion, energy, urgency, and care and reflects love, sacrifice, lifesaving nature. Motto Learn, Serve and Save in red.</span></div>
                <div className="flex gap-2"><span className="w-6 h-6 rounded-full bg-orange-400 shrink-0"></span><span><b>Orange</b> symbolizes enthusiasm, creativity, and encouragement. Represents motivation to inspire next generation.</span></div>
                <div className="flex gap-2"><span className="w-6 h-6 rounded-full bg-amber-800 shrink-0"></span><span><b>Brown</b> symbolizes tradition, wisdom, reliability. Oil lamp historic symbol of nursing, made famous by Florence Nightingale.</span></div>
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
          <h2 className="text-3xl font-black text-[#0f4c2e]">Official Campus Gallery — Auto Changes Every 15 Seconds — {gallery.length} Photos</h2>
          {gallery.length ? (
            <>
              <div className="mt-6 bg-white border-2 rounded-[2rem] p-2 shadow-xl">
                <div className="relative h-[420px] md:h-[520px] rounded-[1.6rem] overflow-hidden">
                  <img src={gallery[currentSlide]?.image || gallery[currentSlide]?.image_base64 || gallery[currentSlide]?.image_url} className="h-full w-full object-cover transition-all duration-1000" alt={gallery[currentSlide]?.title}/>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <p className="text-white font-black text-lg">{gallery[currentSlide]?.title || `Campus Image ${currentSlide+1}`}</p>
                    <p className="text-green-200 text-xs">{gallery[currentSlide]?.description || gallery[currentSlide]?.category || 'Labe College of Nursing Sciences, Gboko'}</p>
                  </div>
                  <button onClick={()=>setCurrentSlide((currentSlide-1+gallery.length)%gallery.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 w-10 h-10 rounded-full flex items-center justify-center font-black">‹</button>
                  <button onClick={()=>setCurrentSlide((currentSlide+1)%gallery.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 w-10 h-10 rounded-full flex items-center justify-center font-black">›</button>
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 px-4 py-2 rounded-full">
                    {gallery.map((_:any, idx:number)=>(
                      <div key={idx} className={`h-2 rounded-full transition-all ${idx===currentSlide ? 'w-8 bg-yellow-400' : 'w-2 bg-white/60'}`}/>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-6 gap-3 mt-4">
                {gallery.map((g:any,i:number)=>(
                  <button key={i} onClick={()=>setCurrentSlide(i)} className={`border-2 rounded-xl overflow-hidden transition-all ${i===currentSlide ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-green-100'}`}>
                    <img src={g.image || g.image_base64 || g.image_url} className="h-24 w-full object-cover" loading="lazy" alt={g.title}/>
                  </button>
                ))}
              </div>
            </>
          ) : <div className="bg-white border-2 border-dashed rounded-2xl p-8 text-center text-sm text-slate-400 mt-6">Upload from Admin CMS Gallery — Will auto-change every 15 seconds — Currently 0 photos, upload 13 loved photos in Admin</div>}
        </div>
      </section>

      <section id="admission" className="py-16 bg-yellow-400 text-[#0f2e1f] text-center scroll-mt-24"><div className="max-w-7xl mx-auto px-4"><h2 className="text-3xl font-black">ND HND Nursing Science — Admission Open</h2><p className="font-bold mt-2">Four Years Full-Time National Diploma Higher National Diploma • NMCN Accredited • Five O-Level Credits including English, Maths, Biology, Chemistry, Physics plus Valid JAMB UTME</p></div></section>

      <section id="contact" className="py-10 bg-[#0f2e1f] text-white text-center text-xs text-green-200 scroll-mt-24">© Labe College of Nursing Sciences, Gboko. Catholic Diocese of Gboko. Learn • Serve • Save</section>
    </div>
  );
};

export const CollegeWebsite = LCNSWebsite;
export { LCNSWebsite };
export default LCNSWebsite;
