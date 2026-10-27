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
  const [gallerySlide, setGallerySlide] = useState(0);

  useEffect(() => {
    const loadCMS = async () => {
      try {
        const { data: galleryData, error } = await supabase
          .from('school_settings')
          .select('value')
          .eq('key', 'gallery')
          .single();
        
        if (error) console.log("Supabase gallery error:", error);
        
        if (galleryData?.value) {
          let parsed: any = galleryData.value;
          if (typeof parsed === 'string') {
            try { parsed = JSON.parse(parsed); } catch {}
          }
          if (typeof parsed === 'string') {
            try { parsed = JSON.parse(parsed); } catch {}
          }
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleaned = parsed.map((g:any) => {
              const img = g.image || g.image_base64 || g.image_url || g.url || "";
              return { ...g, image: img, image_url: img, image_base64: img, title: g.title || `Campus ${g.id}`, description: g.description || g.category || "Labe College of Nursing Sciences, Gboko" };
            }).filter((g:any) => g.image && g.image.length > 100);
            
            setGallery(cleaned);
            console.log(`✅ Gallery loaded: ${cleaned.length} photos - First: ${cleaned[0]?.title}`);
          }
        } else {
          const photos = await (StorageService as any).getGallery?.();
          if (photos?.length) setGallery(photos);
        }
      } catch (e) {
        console.error("Gallery load failed:", e);
        try {
          const photos = await (StorageService as any).getGallery?.();
          if (photos?.length) setGallery(photos);
        } catch {}
      }

      const loadAll = async () => {
        try{
          let bImg: string | null = null;
          let bName = 'Most Rev. William A. Avenya'; 
          let bTitle = 'Proprietor - Bishop of Catholic Diocese of Gboko'; 
          let bDesc = 'As proprietor and pastoral guide of the College, His Lordship supports the growth of professional nursing education rooted in faith, discipline, compassion and service.';

          let pImg: string | null = null; 
          let pName = 'Mrs Terna Fiase Msc, Bnsc, Dip Nursing Education, RNE,RM,RN'; 
          let pTitle = 'Provost, Labe College of Nursing Sciences'; 
          let pDesc = 'On behalf of the Catholic Diocese of Gboko and the Governing Council, I warmly welcome you to Labe College of Nursing Sciences, Gboko.';

          try {
            const { data: allSettings } = await supabase.from('school_settings').select('key, value');
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
              }
            }
          } catch {}

          try {
            const b1 = JSON.parse(localStorage.getItem('lcns_bishop')||'null'); 
            const s1 = JSON.parse(localStorage.getItem('lcns_settings')||'{}'); 
            if(b1?.image) { bImg=bImg||b1.image; }
            else if(s1?.proprietor_image) { bImg=bImg||s1.proprietor_image; }
          } catch {}
          try {
            const p1 = JSON.parse(localStorage.getItem('lcns_provost')||'null'); 
            const s1 = JSON.parse(localStorage.getItem('lcns_settings')||'{}');
            if(p1?.image) { pImg=pImg||p1.image; }
            else if(s1?.provost_image) { pImg=pImg||s1.provost_image; }
          } catch {}

          if(bImg) setProprietorImg(bImg);
          setBishopData({name:bName, title:bTitle, description:bDesc, image:bImg});
          if(pImg) setProvostImg(pImg);
          setProvostData({name:pName, title:pTitle, description:pDesc, image:pImg});
        } catch {}
      }; 
      await loadAll();
    }; 
    loadCMS();
  }, []);

  useEffect(() => {
    if(gallery.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % gallery.length);
    }, 3000);
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
          <h2 className="text-xl md:text-2xl font-black tracking-tight">ND/HND NURSING SCIENCE - 2026/2027 ADMISSION CLOSED</h2>
          <p className="text-sm md:text-[15px] font-bold mt-1">School Resumes November 2026 for First & New Academic Year • NMCN Accredited • NBTE Approved</p>
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
              <button onClick={()=>window.open('https://portal.lcns.edu.ng', '_blank')} className="bg-white/10 border border-white/20 px-8 py-3.5 rounded-full hover:bg-white hover:text-[#0f4c2e] font-black transition-all">Portal Login</button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-[2rem] p-2 shadow-2xl">
              <div className="relative rounded-[1.6rem] h-[460px] w-full overflow-hidden bg-slate-100">
                {gallery.length > 0 ? (
                  <>
                    <img 
                      src={gallery[currentSlide]?.image} 
                      className="h-full w-full object-cover transition-all duration-1000" 
                      alt={gallery[currentSlide]?.title || "Campus"}
                    />
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 px-3 py-1.5 rounded-full">
                      {gallery.map((_:any, idx:number)=>(
                        <button key={idx} onClick={()=>setCurrentSlide(idx)} className={`w-2 h-2 rounded-full transition-all ${idx===currentSlide ? 'bg-yellow-400 w-6' : 'bg-white/60'}`}/>
                      ))}
                    </div>
                    <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] px-3 py-1 rounded-full">{currentSlide+1}/{gallery.length} • Auto 3s • {gallery[currentSlide]?.title?.substring(0,20)}</div>
                  </>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">Loading 13 photos... {gallery.length}</div>
                )}
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-[#0f4c2e] p-4 rounded-2xl shadow-xl"><p className="font-black flex items-center gap-2"><MapPin size={16}/> Off Gboko Hill Road, Gboko</p></div>
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
                <button onClick={()=>window.open('https://portal.lcns.edu.ng', '_blank')} className="w-full bg-white text-[#0f4c2e] py-3.5 rounded-full font-black hover:bg-yellow-400 transition-all">Portal Login →</button>
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
        </div>
      </section>

      <section id="gallery" className="py-12 bg-[#f8fdf8] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-black text-[#0f4c2e]">Official Campus Gallery — {gallery.length} Photos — With Titles & Descriptions</h2>
          {gallery.length ? (
            <>
              <div className="mt-6 bg-white border-2 rounded-[2rem] p-2 shadow-xl">
                <div className="relative h-[420px] md:h-[520px] rounded-[1.6rem] overflow-hidden bg-slate-100">
                  <img src={gallery[gallerySlide]?.image} className="h-full w-full object-cover transition-all duration-500" alt={gallery[gallerySlide]?.title}/>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <p className="text-white font-black text-lg">{gallery[gallerySlide]?.title || `Campus Image ${gallerySlide+1}`}</p>
                    <p className="text-green-200 text-sm mt-1">{gallery[gallerySlide]?.description || 'Labe College of Nursing Sciences, Gboko'}</p>
                  </div>
                  <button onClick={()=>setGallerySlide((gallerySlide-1+gallery.length)%gallery.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 w-10 h-10 rounded-full flex items-center justify-center font-black">‹</button>
                  <button onClick={()=>setGallerySlide((gallerySlide+1)%gallery.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 w-10 h-10 rounded-full flex items-center justify-center font-black">›</button>
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 px-4 py-2 rounded-full">
                    {gallery.map((_:any, idx:number)=>(
                      <div key={idx} className={`h-2 rounded-full transition-all ${idx===gallerySlide ? 'w-8 bg-yellow-400' : 'w-2 bg-white/60'}`}/>
                    ))}
                  </div>
                  <div className="absolute top-4 right-4 bg-black/50 text-white text-[10px] px-3 py-1 rounded-full">{gallerySlide+1}/{gallery.length}</div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                {gallery.map((g:any,i:number)=>(
                  <button key={i} onClick={()=>setGallerySlide(i)} className={`border-2 rounded-xl overflow-hidden transition-all text-left ${i===gallerySlide ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-green-100'}`}>
                    <img src={g.image} className="h-32 w-full object-cover" loading="lazy" alt={g.title}/>
                    <div className="p-3 bg-white">
                      <p className="font-black text-sm text-[#0f4c2e] truncate">{g.title || `Campus ${i+1}`}</p>
                      <p className="text-xs text-slate-500 truncate">{g.description || 'LCNS Gboko'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : <div className="bg-white border-2 border-dashed rounded-2xl p-8 text-center text-sm text-slate-400 mt-6">Loading 13 photos... If not showing, check console log</div>}
        </div>
      </section>

      <section id="admission" className="py-16 bg-[#0f2e1f] text-white text-center scroll-mt-24 border-y-4 border-yellow-400">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex bg-red-600 text-white px-6 py-2 rounded-full font-black text-xs tracking-widest mb-4">2026/2027 ADMISSION CLOSED</div>
          <h2 className="text-3xl md:text-4xl font-black">Thank You for Your Interest!</h2>
          <p className="font-bold mt-3 text-yellow-300 text-lg">ND/HND Nursing Science 2026/2027 Admission is Now Closed</p>
          <p className="text-green-100 mt-4 text-[15px] leading-relaxed max-w-2xl mx-auto">
            Admission for the 2026/2027 Academic Session has been officially closed. 
            Our first and new academic year will resume in <span className="text-yellow-300 font-black">November, 2026</span>. 
            For enquiries, please contact us at <span className="font-bold">info@lcns.edu.ng</span> or <span className="font-bold">ict.lcns@lcns.edu.ng</span>
          </p>
          <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
            <button onClick={()=>window.open('https://portal.lcns.edu.ng', '_blank')} className="bg-yellow-400 text-[#0f2e1f] px-10 py-4 rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl">
              Check Admission Status / Student Portal →
            </button>
            <button onClick={()=>window.open('mailto:info@lcns.edu.ng', '_blank')} className="bg-white/10 border border-white/20 px-10 py-4 rounded-full font-black hover:bg-white hover:text-[#0f2e1f] transition-all">
              info@lcns.edu.ng | ict.lcns@lcns.edu.ng
            </button>
          </div>
          <p className="text-xs mt-6 text-green-300">Portal: portal.lcns.edu.ng | Official Emails: info@lcns.edu.ng | ict.lcns@lcns.edu.ng • Resumption: November 2026</p>
        </div>
      </section>

      <section id="contact" className="py-10 bg-[#0f2e1f] text-white text-center text-xs text-green-200 scroll-mt-24">
        © Labe College of Nursing Sciences, Gboko. Catholic Diocese of Gboko. Learn • Serve • Save<br/>
        info@lcns.edu.ng | ict.lcns@lcns.edu.ng | portal.lcns.edu.ng • Resumption: November 2026
      </section>
    </div>
  );
};

export const CollegeWebsite = LCNSWebsite;
export { LCNSWebsite };
export default LCNSWebsite;
