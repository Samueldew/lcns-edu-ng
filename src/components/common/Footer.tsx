import React from 'react';
import { CollegeLogo } from './CollegeLogo';
import { COLLEGE_CONFIG } from '../../types';
import { MapPin, Phone, Mail, Globe, Shield, Award, CheckCircle } from 'lucide-react';

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
  setActiveView,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t-4 border-[#ca8a04] no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Crest & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CollegeLogo size="lg" />
              <div>
                <h3 className="text-white font-extrabold text-base uppercase font-serif-crest leading-snug">
                  Labe College of Nursing Sciences
                </h3>
                <p className="text-xs text-[#22c55e] font-semibold tracking-wider uppercase">
                  Gboko, Benue State &bull; Nigeria
                </p>
                <p className="text-[11px] text-[#ca8a04] italic font-serif">"Learn, Serve &amp; Save"</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Committed to training compassionate, highly competent, globally competitive nursing professionals and midwives equipped with modern clinical simulation skills and medical ethics.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 bg-[#0a4d2e] border border-[#22c55e]/40 text-[#22c55e] text-[10px] font-bold px-2 py-1 rounded">
                <CheckCircle className="w-3 h-3 text-[#22c55e]" /> NMCN Approved
              </span>
              <span className="inline-flex items-center gap-1 bg-[#0a4d2e] border border-[#22c55e]/40 text-[#22c55e] text-[10px] font-bold px-2 py-1 rounded">
                <CheckCircle className="w-3 h-3 text-[#22c55e]" /> NBTE Accredited
              </span>
            </div>
          </div>

          {/* Col 2: Academic Programmes */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-emerald-800 pb-2">
              Academic Curricula (4 Years)
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="text-emerald-300 font-bold flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">&bull;</span>
                <strong className="text-white font-black">ND/HND Nursing Science 4years</strong>
              </li>
              <li className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 pl-2">
                <span className="text-emerald-500 font-bold">&bull;</span>
                Registered Nurse (RN) Licensing (NMCN)
              </li>
              <li className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 pl-2">
                <span className="text-emerald-500 font-bold">&bull;</span>
                Registered Public Health Nurse (RPHN)
              </li>
              <li className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 pl-2">
                <span className="text-emerald-500 font-bold">&bull;</span>
                Clinical Skills Simulation &amp; Laboratory Excellence
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-emerald-800 pb-2">
              Quick ERP &amp; Portal
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={onOpenApplication}
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <span className="text-emerald-500 font-bold">&bull;</span>
                  2026/2027 Online Application Form
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmissionChecker}
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <span className="text-emerald-500 font-bold">&bull;</span>
                  Check Admission Status &amp; Print Letter
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenLogin}
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <span className="text-emerald-500 font-bold">&bull;</span>
                  Login (Student &amp; Staff)
                </button>
              </li>

              <li>
                <a
                  href="#gallery"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-emerald-500 font-bold">&bull;</span>
                  Campus &amp; Clinical Photo Gallery
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-emerald-500 font-bold">&bull;</span>
                  ICT Support &amp; Help Desk
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Contacts */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-emerald-800 pb-2">
              College Contacts
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#ca8a04] shrink-0 mt-0.5" />
                <span>
                  Off Gboko Hill, Along Agbile Road, Gboko, Benue State, Nigeria
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#22c55e] shrink-0" />
                <a href={`mailto:${COLLEGE_CONFIG.OFFICIAL_EMAIL}`} className="hover:text-[#22c55e]">
                  {COLLEGE_CONFIG.OFFICIAL_EMAIL}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#22c55e] shrink-0" />
                <span>{COLLEGE_CONFIG.SUPPORT_PHONE}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>lcns.edu.ng</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
              Office Hours: Monday - Friday: 8:00 AM - 4:00 PM
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>&copy; {new Date().getFullYear()} Labe College of Nursing Sciences, Gboko (LCNS). All Rights Reserved.</p>
          <p className="flex items-center gap-2">
            <span>Powered by LCNS ICT Directorate</span>
            <span>&bull;</span>
            <span className="text-emerald-400">Learn, Serve &amp; Save</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
