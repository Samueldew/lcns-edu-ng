import React, { useState, useEffect } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { COLLEGE_CONFIG, Notice, CMSConfig, GalleryItem } from '../../types';
import { StorageService } from '../../services/storage';
import {
  GraduationCap,
  ShieldCheck,
  Award,
  CheckCircle2,
  Calendar,
  FileText,
  Building2,
  Users,
  BookOpen,
  ArrowRight,
  Stethoscope,
  HeartPulse,
  Baby,
  Activity,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  Church,
  Image as ImageIcon,
  X,
  Maximize2,
} from 'lucide-react';

interface CollegeWebsiteProps {
  onOpenLogin: () => void;
  onOpenApplication: () => void;
  onOpenAdmissionChecker: () => void;
}

export const CollegeWebsite: React.FC<CollegeWebsiteProps> = ({
  onOpenLogin,
  onOpenApplication,
  onOpenAdmissionChecker,
}) => {
  const [currentUser, setCurrentUser] = useState(StorageService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'all' | 'nd' | 'rn' | 'rm'>('all');
  const [cmsConfig, setCmsConfig] = useState<CMSConfig>(StorageService.getCMSConfig());
  const [galleryFilter, setGalleryFilter] = useState<string>('All');
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const handleStorageUpdate = () => {
      setCmsConfig(StorageService.getCMSConfig());
      setCurrentUser(StorageService.getCurrentUser());
    };
    window.addEventListener('lcns_storage_update', handleStorageUpdate);
    window.addEventListener('lcns_auth_update', handleStorageUpdate);
    return () => {
      window.removeEventListener('lcns_storage_update', handleStorageUpdate);
      window.removeEventListener('lcns_auth_update', handleStorageUpdate);
    };
  }, []);

  const programmes = [
    {
      id: 'nd-stage',
      title: 'ND Nursing Sciences (Years 1 & 2)',
      duration: '2 Years (Foundation & Clinical Pre-requisites)',
      icon: Stethoscope,
      desc: 'First phase of the 4-year collegiate nursing system accredited by NBTE & NMCN. Covers Foundational Nursing, Gross Anatomy, Physiology, Medical Biochemistry, Microbiology, and Clinical Skills Simulation. Students must achieve a minimum CGPA of 2.50 (Lower Credit) to proceed directly into the HND stage.',
      entry: 'JAMB UTME minimum score of 150+ with Use of English, Biology, Chemistry, Physics + 5 O\'Level credits in WAEC/NECO/NABTEB.',
      tag: 'Years 1 & 2 &bull; ND Phase',
      color: 'emerald',
    },
    {
      id: 'hnd-stage',
      title: 'HND Nursing Sciences (Years 3 & 4)',
      duration: '2 Years (Advanced Clinical & Public Health)',
      icon: Activity,
      desc: 'Second phase of the uninterrupted 4-year collegiate track. Focuses on Advanced Medical-Surgical Nursing, Maternal & Child Healthcare, Intensive Care, Pediatric Nursing, and Community Public Health Nursing with intensive hospital clinical rotations.',
      entry: 'Automatic uninterrupted progression upon completion of ND Nursing Sciences with minimum CGPA of 2.50 (Lower Credit).',
      tag: 'Years 3 & 4 &bull; HND Phase',
      color: 'amber',
    },
    {
      id: 'licensing',
      title: 'Professional Licensing & Dual Council Certifications',
      duration: 'NMCN & NBTE Collegiate Awards',
      icon: HeartPulse,
      desc: 'Graduates receive the National Diploma (ND) & Higher National Diploma (HND) in Nursing Sciences, Registered Nurse (RN) license from the Nursing and Midwifery Council of Nigeria (NMCN), and Registered Public Health Nurse (RPHN) license.',
      entry: 'Awarded upon passing the mandatory Nursing and Midwifery Council of Nigeria Professional Qualifying Examinations.',
      tag: 'RN & RPHN Licenses',
      color: 'blue',
    },
    {
      id: 'nysc',
      title: 'NYSC Mobilization & Global Career Pathways',
      duration: 'National Service & Global Practice',
      icon: Award,
      desc: 'Unlike traditional basic nursing hospital schools, the 4-year NBTE collegiate ND/HND nursing qualification qualifies LCNS graduates for immediate call-up for the National Youth Service Corps (NYSC) and direct admission into postgraduate degrees (M.Sc / Ph.D).',
      entry: 'Fully eligible for NYSC mobilization across Nigeria upon completion of the 4-year HND programme.',
      tag: 'NYSC Qualified',
      color: 'rose',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a4d2e] via-[#06321e] to-[#042114] text-white pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle patterned background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#06321e] border border-[#22c55e]/30 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#ca8a04]" />
                <span>2026/2027 Admissions Now Open &bull; Apply Today</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black uppercase font-serif-crest leading-tight tracking-tight">
                Labe College of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#facc15] via-[#ca8a04] to-[#fef08a]">
                  Nursing Sciences, Gboko
                </span>
              </h1>

              <p className="text-emerald-100 text-base sm:text-lg max-w-2xl leading-relaxed">
                Pioneering excellence in collegiate nursing education in Benue State through our comprehensive <strong>4-Year Uninterrupted ND/HND in Nursing Sciences</strong>. Established by Benue State Law under the Catholic Diocese of Gboko, accredited by NMCN and NBTE.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={onOpenApplication}
                  className="px-6 py-3.5 bg-[#ca8a04] hover:bg-[#a16207] text-slate-950 font-black rounded-xl text-sm shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <GraduationCap className="w-5 h-5 text-[#0a4d2e]" />
                  <span>Apply for 4-Year ND/HND Nursing</span>
                </button>

                <button
                  onClick={onOpenAdmissionChecker}
                  className="px-5 py-3.5 bg-[#0a4d2e] hover:bg-[#073822] border border-[#22c55e]/40 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-[#22c55e]" />
                  <span>Check Admission Status</span>
                </button>

                <button
                  onClick={onOpenLogin}
                  className="px-4 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-emerald-100 font-semibold rounded-xl text-sm transition-all"
                >
                  <span>Student &amp; Staff Portal &rarr;</span>
                </button>
              </div>

              {/* Motto Ribbon Badge */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-emerald-300 font-semibold">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#ca8a04]" />
                  <span>NMCN &amp; NBTE Approved</span>
                </div>
                <div>&bull;</div>
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#ca8a04] font-serif">
                  <span>"Learn, Serve &amp; Save"</span>
                </div>
                <div>&bull;</div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#22c55e]" />
                  <span>Diocese of Gboko, Benue State</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card with Crest & Institutional Badge */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-gradient-to-br from-[#0a4d2e]/90 to-[#042114]/90 p-8 rounded-3xl border border-[#22c55e]/30 shadow-2xl backdrop-blur-xl text-center">
                {/* Glowing aura */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#ca8a04]/20 to-[#22c55e]/20 blur-xl opacity-50 -z-10"></div>

                <div className="flex justify-center mb-4">
                  <CollegeLogo size="xl" />
                </div>

                <h3 className="text-xl font-black text-white uppercase font-serif-crest tracking-wider">
                  LCNS Gboko
                </h3>
                <p className="text-xs text-[#ca8a04] font-bold uppercase tracking-widest mt-1">
                  Motto: Learn, Serve &amp; Save
                </p>

                <div className="mt-6 pt-6 border-t border-[#0a4d2e]/80 grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 bg-[#06321e]/80 rounded-xl border border-[#22c55e]/30">
                    <div className="text-lg font-black text-[#ca8a04]">4 Years</div>
                    <div className="text-[10px] text-emerald-200 uppercase font-semibold">ND/HND Nursing</div>
                  </div>
                  <div className="p-2 bg-[#06321e]/80 rounded-xl border border-[#22c55e]/30">
                    <div className="text-lg font-black text-[#ca8a04]">150+</div>
                    <div className="text-[10px] text-emerald-200 uppercase font-semibold">JAMB Cut-Off</div>
                  </div>
                  <div className="p-2 bg-[#06321e]/80 rounded-xl border border-[#22c55e]/30">
                    <div className="text-lg font-black text-[#ca8a04]">NYSC</div>
                    <div className="text-[10px] text-emerald-200 uppercase font-semibold">Mobilization</div>
                  </div>
                </div>

                <div className="mt-5 text-[11px] text-emerald-300/90 flex items-center justify-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#ca8a04]" />
                  <span>Off Gboko Hill, Along Agbile Road, Gboko, Benue State</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK SERVICES & ACTIONS BAR */}
      <section className="bg-white border-y border-slate-200 shadow-xs relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={onOpenApplication}
              className="p-4 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 rounded-2xl text-left transition-all group flex items-start gap-3.5"
            >
              <div className="p-2.5 bg-[#0a4d2e] text-white rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-[#ca8a04]" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#0a4d2e]">
                  Online Admission Form
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Complete 2026/2027 application for 4-Year ND/HND Nursing Sciences.
                </p>
              </div>
            </button>

            <button
              onClick={onOpenAdmissionChecker}
              className="p-4 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 rounded-2xl text-left transition-all group flex items-start gap-3.5"
            >
              <div className="p-2.5 bg-[#ca8a04] text-slate-950 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-[#0a4d2e]" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#ca8a04]">
                  Check Admission Status
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Verify merit list, print admission letter &amp; pay acceptance fee.
                </p>
              </div>
            </button>

            <button
              onClick={onOpenLogin}
              className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all group flex items-start gap-3.5"
            >
              <div className="p-2.5 bg-[#0a4d2e] text-white rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#0a4d2e]">
                  Student ERP Portal
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Course registration, exam result slip, tuition receipts &amp; ID card.
                </p>
              </div>
            </button>

            <a
              href="#contact"
              className="p-4 bg-emerald-50/50 hover:bg-emerald-100/50 border border-emerald-200 rounded-2xl text-left transition-all group flex items-start gap-3.5"
            >
              <div className="p-2.5 bg-[#0a4d2e] text-white rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5 text-[#ca8a04]" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#0a4d2e]">
                  ICT Support Desk
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Direct helpline: 08126799565 or info@lcns.edu.ng.
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT THE COLLEGE & PROVOST'S WELCOME */}
      <section id="about" className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Provost's Profile Card (CMS Dynamic) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative rounded-3xl overflow-hidden border-4 border-[#0a4d2e] shadow-xl bg-slate-900 text-white p-7 text-center">
                <div className="w-36 h-44 mx-auto rounded-2xl overflow-hidden border-4 border-[#ca8a04] mb-4 shadow-lg bg-[#06321e] flex items-center justify-center">
                  {cmsConfig.provostPhotoUrl ? (
                    <img
                      src={cmsConfig.provostPhotoUrl}
                      alt={cmsConfig.provostName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CollegeLogo size="lg" />
                  )}
                </div>
                <h3 className="text-lg font-bold font-serif-crest text-white">
                  {cmsConfig.provostName}
                </h3>
                <p className="text-xs font-semibold text-[#ca8a04] uppercase tracking-widest mt-0.5">
                  {cmsConfig.provostTitle}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-300 italic leading-relaxed">
                  "{cmsConfig.provostMessage}"
                </div>
                <div className="mt-4 inline-block bg-[#06321e] px-3 py-1 rounded-full text-[10px] font-bold text-[#22c55e] border border-[#22c55e]/40">
                  Office of the College Provost &bull; LCNS Gboko
                </div>
              </div>
            </div>

            {/* About Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 text-[#0a4d2e] font-bold text-xs uppercase tracking-wider">
                <Award className="w-4 h-4 text-[#22c55e]" />
                <span>About Our Institution</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-slate-950 font-serif-crest uppercase leading-tight">
                Shaping the Future of Nursing &amp; Healthcare in Nigeria
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                <strong>Labe College of Nursing Sciences (LCNS), Gboko</strong> was established by Benue State Law signed by His Excellency, Rev. Fr. Dr. Hyacinth Iormem Alia, Governor of Benue State, under the apostolic guidance of the Catholic Diocese of Gboko. Approved and fully accredited for five (5) years by the <strong>Nursing and Midwifery Council of Nigeria (NMCN)</strong> and the <strong>National Board for Technical Education (NBTE)</strong>, LCNS offers <strong>exclusively the 4-Year Uninterrupted ND/HND in Nursing Sciences</strong> collegiate program.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-xs">
                  <h4 className="font-bold text-[#0a4d2e] text-sm mb-2 flex items-center gap-1.5 uppercase font-serif-crest tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e]" /> Vision Statement
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Labe College of Nursing Sciences (LCNS) is committed to be an outstanding College of Nursing Sciences, recognized for excellence in healthcare training and practice, with a commitment to improving health care delivery, promoting social justice, and advancing the medical profession.
                  </p>
                </div>

                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 shadow-xs">
                  <h4 className="font-bold text-[#ca8a04] text-sm mb-2 flex items-center gap-1.5 uppercase font-serif-crest tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-[#ca8a04]" /> Mission Statement
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Our mission is to provide high-quality nursing training and service that fosters compassionate, competent, and innovative healthcare professionals who improve healthcare outcomes and promote wellness with the fear of God, within the Diocese and beyond.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-6 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                  <span>Licensed by NMCN &amp; NBTE</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                  <span>4-Year Collegiate Track Only</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                  <span>NYSC Mobilization Eligible</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATE & EPISCOPAL PATRONAGE: GOVERNOR HYACINTH ALIA & BISHOP WILLIAM AVENYA */}
      <section className="py-16 bg-gradient-to-b from-amber-50/60 via-slate-50 to-white border-t border-[#ca8a04]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#0a4d2e] uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
              Leadership &amp; Institutional Heritage
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase font-serif-crest">
              State &amp; Episcopal Patronage
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Anchored on statutory governance, Christian compassion, and medical excellence for Benue State and Nigeria.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. Bishop William Avenya Card */}
            <div className="bg-gradient-to-br from-[#06321e] via-[#0a4d2e] to-slate-900 rounded-3xl p-7 text-white shadow-xl border border-[#ca8a04]/40 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative shrink-0">
                <div className="w-36 h-44 rounded-2xl overflow-hidden border-4 border-[#ca8a04] shadow-lg bg-slate-800">
                  {cmsConfig.bishopPhotoUrl ? (
                    <img
                      src={cmsConfig.bishopPhotoUrl}
                      alt={cmsConfig.bishopName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-amber-200 bg-amber-900/40">
                      <Church className="w-12 h-12 mb-1" />
                      <span className="text-[10px] font-bold uppercase">Proprietor</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#ca8a04] text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow whitespace-nowrap">
                  Episcopal Patron
                </div>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#ca8a04] text-[10px] font-bold uppercase tracking-wider">
                  <Church className="w-3 h-3 text-[#ca8a04]" />
                  <span>Catholic Diocese of Gboko</span>
                </div>
                <h3 className="text-lg font-bold font-serif-crest text-white">
                  {cmsConfig.bishopName}
                </h3>
                <p className="text-xs font-semibold text-[#ca8a04]">
                  {cmsConfig.bishopTitle}
                </p>
                <p className="text-xs text-slate-300 italic leading-relaxed line-clamp-3">
                  "{cmsConfig.bishopMessage}"
                </p>
              </div>
            </div>

            {/* 2. Governor Hyacinth Alia Card */}
            <div className="bg-gradient-to-br from-slate-900 via-[#0a4d2e] to-[#06321e] rounded-3xl p-7 text-white shadow-xl border border-[#ca8a04]/40 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative shrink-0">
                <div className="w-36 h-44 rounded-2xl overflow-hidden border-4 border-[#ca8a04] shadow-lg bg-slate-800">
                  {cmsConfig.governorPhotoUrl ? (
                    <img
                      src={cmsConfig.governorPhotoUrl}
                      alt={cmsConfig.governorName || "Governor H.E. Rev. Fr. Dr. Hyacinth Iormem Alia"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src="https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=600"
                      alt="Governor H.E. Rev. Fr. Dr. Hyacinth Iormem Alia"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#ca8a04] text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow whitespace-nowrap">
                  Executive Governor
                </div>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#22c55e] text-[10px] font-bold uppercase tracking-wider">
                  <Award className="w-3 h-3 text-[#22c55e]" />
                  <span>Benue State Government</span>
                </div>
                <h3 className="text-lg font-bold font-serif-crest text-white">
                  {cmsConfig.governorName || 'H.E. Rev. Fr. Dr. Hyacinth Iormem Alia'}
                </h3>
                <p className="text-xs font-semibold text-[#22c55e]">
                  {cmsConfig.governorTitle || 'Executive Governor of Benue State'}
                </p>
                <p className="text-xs text-slate-300 italic leading-relaxed line-clamp-3">
                  "{cmsConfig.governorMessage || 'Establishing Labe College of Nursing Sciences by Benue State Law is our covenant to transform healthcare delivery, empower youth with collegiate qualifications, and position Gboko as a beacon of medical training in Nigeria.'}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMMES SECTION */}
      <section id="programmes" className="py-16 lg:py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
              Collegiate Curricula (4 Years Only)
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase font-serif-crest">
              4-Year ND/HND in Nursing Sciences
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
              In accordance with national educational policy, LCNS Gboko offers exclusively the uninterrupted four-year collegiate nursing track (2 Years ND + 2 Years HND) combining National Board for Technical Education (NBTE) academic qualifications with Nursing &amp; Midwifery Council of Nigeria (NMCN) dual professional licensing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programmes.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-emerald-600"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-emerald-50 group-hover:bg-emerald-800 text-emerald-800 group-hover:text-white rounded-2xl transition-colors">
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                        {p.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-950 transition-colors font-serif-crest uppercase">
                        {p.title}
                      </h3>
                      <p className="text-xs font-bold text-emerald-700 mt-0.5">
                        Duration: {p.duration}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {p.desc}
                    </p>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 block uppercase text-[10px] tracking-wider">
                        Admission Requirement:
                      </span>
                      <p className="text-[11px] text-slate-600 leading-normal">{p.entry}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={onOpenApplication}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 group-hover:translate-x-1 transition-all"
                    >
                      <span>Apply For This Programme</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={onOpenAdmissionChecker}
                      className="text-xs text-slate-500 hover:text-slate-800 underline"
                    >
                      Check Cut-off
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* VISION, MISSION, CORE VALUES & PHILOSOPHY OF THE SCHOOL */}
      <section id="values-philosophy" className="py-16 lg:py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#0a4d2e] uppercase tracking-widest bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
              Institutional Core &amp; Ethos
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase font-serif-crest tracking-tight">
              Vision, Mission, Core Values &amp; Philosophy
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Fostering compassionate, competent, and innovative healthcare professionals who improve healthcare outcomes and promote wellness with the fear of God, within the Diocese and beyond.
            </p>
          </div>

          {/* 1. VISION & MISSION STATEMENTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vision Statement */}
            <div className="bg-gradient-to-br from-[#0a4d2e] via-[#073922] to-[#042114] rounded-3xl p-8 text-white shadow-xl border border-[#22c55e]/40 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#22c55e] text-xs font-black uppercase tracking-wider border border-white/10">
                  <Sparkles className="w-4 h-4 text-[#ca8a04]" />
                  <span>Vision Statement</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif-crest text-white leading-snug">
                  Excellence in Healthcare Training, Social Justice &amp; Practice
                </h3>
                <p className="text-emerald-100 text-sm sm:text-base leading-relaxed pt-1">
                  &ldquo;Labe College of Nursing Sciences (LCNS) is committed to be an outstanding College of Nursing Sciences, recognized for excellence in healthcare training and practice, with a commitment to improving health care delivery, promoting social justice, and advancing the medical profession.&rdquo;
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-emerald-800/80 flex items-center justify-between text-xs text-emerald-300">
                <span className="font-semibold uppercase tracking-wider">LCNS Gboko Vision</span>
                <span className="text-[#ca8a04] font-bold">Excellence &bull; Justice &bull; Advancement</span>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="bg-gradient-to-br from-[#122b1c] via-[#0a4d2e] to-slate-900 rounded-3xl p-8 text-white shadow-xl border border-[#ca8a04]/40 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#ca8a04]/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ca8a04] text-xs font-black uppercase tracking-wider border border-white/10">
                  <Award className="w-4 h-4 text-[#ca8a04]" />
                  <span>Mission Statement</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif-crest text-white leading-snug">
                  Compassionate, Competent &amp; God-Fearing Healthcare
                </h3>
                <p className="text-emerald-100 text-sm sm:text-base leading-relaxed pt-1">
                  &ldquo;Our mission is to provide high-quality nursing training and service that fosters compassionate, competent, and innovative healthcare professionals who improve healthcare outcomes and promote wellness with the fear of God, within the Diocese and beyond.&rdquo;
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-emerald-800/80 flex items-center justify-between text-xs text-emerald-300">
                <span className="font-semibold uppercase tracking-wider">LCNS Gboko Mission</span>
                <span className="text-[#22c55e] font-bold">Compassion &bull; Innovation &bull; Fear of God</span>
              </div>
            </div>
          </div>

          {/* 2. OUR CORE VALUES */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#0a4d2e] via-[#083c24] to-[#0a4d2e] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-[#22c55e]/30">
              <div className="text-center max-w-3xl mx-auto space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-[#ca8a04]">
                  Best Practice Nursing Standards
                </span>
                <h3 className="text-xl sm:text-3xl font-black uppercase font-serif-crest">
                  Our Core Values &bull; The Five Cs of Nursing
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed pt-1">
                  Our values are through commitment to the under mentioned to promote excellence in Nursing education practice and services, using the five Cs of best practice Nursing, which are:
                </p>
                <div className="pt-3 flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-xs sm:text-sm font-black">
                  {['Commitment', 'Conscience', 'Competence', 'Compassion', 'Confidence'].map((c, idx) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-amber-300 border border-amber-300/30 tracking-wider uppercase font-serif-crest"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
                      <span>{idx + 1}. {c}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 6 Value Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Professionalism */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all space-y-3 group hover:border-[#0a4d2e]">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-[#0a4d2e] group-hover:bg-[#0a4d2e] group-hover:text-white rounded-xl transition-colors">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Pillar 1</span>
                    <h4 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
                      Professionalism
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  We are committed to professionalism as a foundation to excellent and diversify practice which encompasses integrity, respect autonomy, inter-professional collaboration and ethical practice as well as standards.
                </p>
              </div>

              {/* Caring */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all space-y-3 group hover:border-[#0a4d2e]">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-50 text-rose-700 group-hover:bg-rose-700 group-hover:text-white rounded-xl transition-colors">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-700">Pillar 2</span>
                    <h4 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
                      Caring
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  We are committed to providing innovative caring for the needs of all people with sensitivity and compassion in a holistic approach since caring is central to nursing practice.
                </p>
              </div>

              {/* Services */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all space-y-3 group hover:border-[#0a4d2e]">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-50 text-[#ca8a04] group-hover:bg-[#ca8a04] group-hover:text-slate-950 rounded-xl transition-colors">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">Pillar 3</span>
                    <h4 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
                      Services
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  We are committed to providing high quality nursing programmes to promote holistic healthcare delivery.
                </p>
              </div>

              {/* Quality */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all space-y-3 group hover:border-[#0a4d2e]">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white rounded-xl transition-colors">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">Pillar 4</span>
                    <h4 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
                      Quality
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  We are committed to improve health care quality and patient/ client satisfaction and safety through excellent Nursing education and practice.
                </p>
              </div>

              {/* Learning */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all space-y-3 group hover:border-[#0a4d2e]">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-50 text-purple-700 group-hover:bg-purple-700 group-hover:text-white rounded-xl transition-colors">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">Pillar 5</span>
                    <h4 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
                      Learning
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  We are committed to facilitating reflective, active and lifelong learning by providing engaging, dynamic and innovative educational environment and experiences.
                </p>
              </div>

              {/* Individuality of Care */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all space-y-3 group hover:border-[#0a4d2e]">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-50 text-teal-700 group-hover:bg-teal-700 group-hover:text-white rounded-xl transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">Pillar 6</span>
                    <h4 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
                      Individuality of Care
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  Though we focus on holistic care, we will be committed to providing a process of individual care hence all human beings have unique needs with their actual and potential problems. These will be done with the focus of the National health policy at the back of our minds.
                </p>
              </div>
            </div>
          </div>

          {/* 3. PHILOSOPHY OF THE SCHOOL */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-md space-y-8">
            <div className="border-b border-slate-200 pb-6">
              <span className="text-xs font-bold text-[#ca8a04] uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Academic &amp; Moral Foundation
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase font-serif-crest mt-2">
                Philosophy of the School
              </h3>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-[#0a4d2e] uppercase text-xs tracking-wider">
                    Life-Long Professional Progression
                  </h5>
                  <p className="text-justify leading-relaxed">
                    Health Care Education is a life-long process that begins with the basics, and progresses all through to core and advanced levels of learning, whereby professional developments could be achieved. Advancing the art and sciences of Nursing ultimately upgrades the health status of individuals, families, communities, nations and the world in general.
                  </p>
                </div>

                <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                  <h5 className="font-bold text-[#0a4d2e] uppercase text-xs tracking-wider">
                    Evidence-Based Clinical Leadership
                  </h5>
                  <p className="text-justify leading-relaxed">
                    A solid Nursing education, therefore, equips nurses to be evidence-based in their practice, to fully engage in their scholarly and research activities, and to translate knowledge in health care and sciences into health services improvements, for the benefit of all humanity. By embracing diversity and equity perspectives in raising the professional and social conscience of our students, they would always seek best practice standards, and become top notch health services leaders.
                  </p>
                </div>
              </div>
            </div>

            {/* The School Believes (6 Core Affirmations) */}
            <div className="space-y-4">
              <h4 className="font-black text-[#0a4d2e] uppercase font-serif-crest text-base sm:text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                <span>The School Believes:</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="p-4 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl border border-slate-200 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0a4d2e] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    1
                  </span>
                  <p className="leading-relaxed text-justify">
                    <strong>Human Science Vocation:</strong> That nursing is a human science vocation and a discipline that is focused on diagnosis and treatment of human responses to actual and potential health problems; and that the client is conceptualized as an individual, family, group or community. This is the focus of the nursing profession.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl border border-slate-200 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0a4d2e] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    2
                  </span>
                  <p className="leading-relaxed text-justify">
                    <strong>Uniqueness &amp; Cultural Respect:</strong> That each client and every member of the community is unique and holds values and beliefs reflective of their culture, sense of life experiences, and nurses must respect this fact.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl border border-slate-200 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0a4d2e] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    3
                  </span>
                  <p className="leading-relaxed text-justify">
                    <strong>Core Competences for Safe Passage:</strong> That there are core competences that enable a nurse to provide &ldquo;safe passage&rdquo; for clients. These core competences which include but not limited are clinical judgments, advocacy, caring practice, systems thinking response to diversity, facilitation of learning, clinical inquiry/ collaboration and the like, are the basis of nurses ability to provide, design, manage and coordinate the caring practice process.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl border border-slate-200 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0a4d2e] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    4
                  </span>
                  <p className="leading-relaxed text-justify">
                    <strong>Faculty Mentorship &amp; Dynamic Curriculum:</strong> That together we serve students by being strong role models through commitment to excellence as teachers, students and clinicians. The faculty is committed to cultivating an organizational sense of professional empowerment, a desire for long-life learning and a passion for social justice and social cultural harmony as a way of belonging in our school and as an integral part of our school community. Therefore, the school uses an innovative curriculum based on the changing health and socioeconomic/ cultural needs of the population and the health caring delivery system, which is integral to the dedication of the faculty as well as the student’s learning and development.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl border border-slate-200 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0a4d2e] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    5
                  </span>
                  <p className="leading-relaxed text-justify">
                    <strong>Community of Active Learners:</strong> That we all learn best when actively engaged in the learning process. The faculty desires to work with students as a community of learners in which all function at a high level of accountability, flexibility and integrity.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl border border-slate-200 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0a4d2e] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    6
                  </span>
                  <p className="leading-relaxed text-justify">
                    <strong>Global &amp; Corporate Collaboration:</strong> That since we are in a system, we will collaborate with relevant cooperate organizations for effective teaching and learning process, be they local or international, government or non government.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAMPUS MEDIA GALLERY (CMS Dynamic) */}
      <section id="gallery" className="py-16 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
                Visual Tour
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase font-serif-crest mt-2">
                Campus &amp; Clinical Media Gallery
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Explore our world-class simulation wards, modern laboratories, lecture halls, and academic activities.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold">
              {['All', 'Clinical Simulation', 'Campus & Facilities', 'Ceremonies & Events', 'Classrooms & Labs'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGalleryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    galleryFilter === cat
                      ? 'bg-emerald-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(galleryFilter === 'All'
              ? cmsConfig.gallery
              : cmsConfig.gallery.filter((g) => g.category === galleryFilter)
            ).map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedGalleryPhoto(item)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between hover:border-emerald-600"
              >
                <div className="relative h-56 overflow-hidden bg-slate-900">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  
                  <span className="absolute top-3 left-3 bg-emerald-950/90 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs border border-emerald-700/50">
                    {item.category}
                  </span>

                  <div className="absolute bottom-3 right-3 p-2 bg-white/20 text-white rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-5 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-emerald-900 transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{item.date}</span>
                    <span className="text-emerald-700 font-semibold text-[10px] uppercase">LCNS Gboko</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {cmsConfig.gallery.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold">No photos currently uploaded in this category.</p>
              <p className="text-xs">College ICT Administrators can add campus photos from the Admin CMS.</p>
            </div>
          )}
        </div>
      </section>

      {/* CONTACT & ICT DESK SECTION */}
      <section id="contact" className="py-16 bg-slate-900 text-white border-t border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Get in Touch With Admissions &amp; ICT
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase font-serif-crest leading-tight">
                Have Enquiries or Need Technical Help?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Our central ICT support desk and admissions officers are available to assist prospective applicants, admitted students, and parents with online applications, screening guidelines, and portal logins.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <Phone className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">ICT Helpdesk Hotline:</span>
                    <span className="font-bold text-white text-sm">{COLLEGE_CONFIG.SUPPORT_PHONE}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <Mail className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Official Email:</span>
                    <a href={`mailto:${COLLEGE_CONFIG.OFFICIAL_EMAIL}`} className="font-bold text-white text-sm hover:underline">
                      {COLLEGE_CONFIG.OFFICIAL_EMAIL}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Campus Location:</span>
                    <span className="font-bold text-white text-sm">Gboko, Benue State, Nigeria</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Enquiry / Contact Form */}
            <div className="lg:col-span-6 bg-white text-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-200">
              <h3 className="font-black text-slate-950 font-serif-crest text-lg uppercase mb-1">
                Send an Instant Enquiry
              </h3>
              <p className="text-xs text-slate-600 mb-5">
                Leave a message and our Admissions Officer or ICT Support will respond promptly.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you! Your enquiry has been received by LCNS ICT Support Desk (08126799565). We will contact you shortly.');
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Tyover"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 08123456789"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject / Question</label>
                  <select className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold">
                    <option>2026/2027 Admissions &amp; JAMB Cut-Off</option>
                    <option>Acceptance Fee &amp; Remita Payment</option>
                    <option>Student Portal Course Registration</option>
                    <option>Physical Screening Dates &amp; Requirements</option>
                    <option>Other General Enquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Type your message here..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  Send Enquiry to LCNS ICT Desk
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY LIGHTBOX MODAL */}
      {selectedGalleryPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedGalleryPhoto(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl text-white relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedGalleryPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={selectedGalleryPhoto.imageUrl}
                alt={selectedGalleryPhoto.title}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-6 bg-slate-900 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-800 text-amber-300 font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {selectedGalleryPhoto.category}
                  </span>
                  <span className="text-xs text-slate-400">{selectedGalleryPhoto.date}</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white font-serif-crest uppercase">
                {selectedGalleryPhoto.title}
              </h3>
              {selectedGalleryPhoto.description && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedGalleryPhoto.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
