import React from 'react';
import { CollegeLogo } from './CollegeLogo';
import { COLLEGE_CONFIG } from '../../types';
import { MapPin, Phone, Mail, Globe, CheckCircle } from 'lucide-react';

interface FooterProps {
  onOpenLogin: () => void;
  onOpenApplication: () => void;
  onOpenAdmissionChecker: () => void;
  setActiveView: (view: 'website' | 'portal') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLogin,
  onOpenApplication,
  onOpenAdmissionChecker,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer className="bg-[#021a0e] text-emerald-100 pt-16 pb-12 border-t-4 border-[#ca8a04] no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Crest */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CollegeLogo size="lg" />
              <div>
                <h3 className="text-white font-extrabold text-base uppercase leading-snug">
                  Labe College of Nursing Sciences
                </h3>
                <p className="text-[11px] text-[#ca8a04] font-bold uppercase">Catholic Diocese of Gboko</p>
                <p className="text-xs text-[#22c55e] font-semibold uppercase">Gboko, Benue State • Nigeria</p>
                <p className="text-[11px] text-[#ca8a04] italic">Learn, Serve & Save</p>
              </div>
            </div>
            <p className="text-xs text-emerald-200 leading-relaxed">
              A faith-based institution of the Catholic Diocese of Gboko, committed to training compassionate, highly competent nursing professionals.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 bg-[#0a4d2e] border border-[#22c55e]/40 text-[#22c55e] text-[10px] font-bold px-2 py-1 rounded">
                <CheckCircle className="w-3 h-3" /> NMCN Approved
              </span>
              <span className="inline-flex items-center gap-1 bg-[#0a4d2e] border border-[#22c55e]/40 text-[#22c55e] text-[10px] font-bold px-2 py-1 rounded">
                <CheckCircle className="w-3 h-3" /> NBTE Accredited
              </span>
            </div>
          </div>

          {/* Col 2: About + Program - LINKED */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-[#0a4d2e] pb-2">
              About & Academics
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200">
              <li><button onClick={() => scrollTo('about-college')} className="hover:text-[#ca8a04] text-left">• About the College</button></li>
              <li><button onClick={() => scrollTo('history')} className="hover:text-[#ca8a04] text-left">• Historical Background</button></li>
              <li><button onClick={() => scrollTo('leadership')} className="hover:text-[#ca8a04] text-left">• Bishop & Provost Messages</button></li>
              <li><button onClick={() => scrollTo('vision')} className="hover:text-[#ca8a04] text-left">• Vision & Mission</button></li>
              <li><button onClick={() => scrollTo('programmes')} className="hover:text-[#ca8a04] text-left font-bold text-white">• ND/HND Nursing Science 4 Years</button></li>
              <li><button onClick={() => scrollTo('facilities')} className="hover:text-[#ca8a04] text-left">• College Facilities</button></li>
            </ul>
          </div>

          {/* Col 3: Portal Links - LINKED */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-[#0a4d2e] pb-2">
              Quick Portal
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200">
              <li><button onClick={onOpenApplication} className="hover:text-[#ca8a04] text-left">• 2026/2027 Online Application Form</button></li>
              <li><button onClick={onOpenAdmissionChecker} className="hover:text-[#ca8a04] text-left">• Check Admission Status</button></li>
              <li><button onClick={onOpenLogin} className="hover:text-[#ca8a04] text-left">• Login (Student & Staff)</button></li>
              <li><button onClick={() => scrollTo('hostel')} className="hover:text-[#ca8a04] text-left">• Girls Hostel Accommodation</button></li>
              <li><button onClick={() => scrollTo('gallery')} className="hover:text-[#ca8a04] text-left">• Campus Photo Gallery</button></li>
              <li><button onClick={() => scrollTo('motto')} className="hover:text-[#ca8a04] text-left">• Our Motto Learn Serve Save</button></li>
            </ul>
          </div>

          {/* Col 4: Contacts - FIXED EMAILS */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-[#0a4d2e] pb-2">
              College Contacts
            </h4>
            <div className="space-y-2.5 text-xs text-emerald-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#ca8a04] shrink-0 mt-0.5" />
                <span>Off Gboko Hill, Along Agbile Road, Gboko, Benue State, Nigeria<br/><span className="text-[#ca8a04] font-semibold">Catholic Diocese of Gboko</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#22c55e] shrink-0" />
                <div className="flex flex-col">
                  <a href="mailto:info@lcns.edu.ng" className="hover:text-[#ca8a04]">info@lcns.edu.ng</a>
                  <a href="mailto:ict.lcns@lcns.edu.ng" className="hover:text-[#ca8a04]">ict.lcns@lcns.edu.ng</a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#22c55e] shrink-0" />
                <span>08126799565 (ICT)</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#22c55e] shrink-0" />
                <span>lcns.edu.ng | portal.lcns.edu.ng</span>
              </div>
              <div className="mt-2 p-2 bg-[#0a4d2e] rounded border border-[#22c55e]/20">
                <p className="text-[10px] font-bold text-[#ca8a04]">2026/2027 ADMISSION CLOSED</p>
                <p className="text-[10px] text-emerald-200">Resumption: November 2026</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#0a4d2e] flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300 gap-3">
          <p>© {new Date().getFullYear()} Labe College of Nursing Sciences, Catholic Diocese of Gboko. All Rights Reserved. | info@lcns.edu.ng | ict.lcns@lcns.edu.ng</p>
          <p className="flex items-center gap-2">
            <span>Powered by LCNS ICT Directorate</span>
            <span>•</span>
            <span className="text-[#ca8a04]">Learn, Serve & Save</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
