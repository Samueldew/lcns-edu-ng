import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';

interface CollegeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  overrideLogoUrl?: string;
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  overrideLogoUrl,
}) => {
  const [logoUrl, setLogoUrl] = useState<string | undefined>(
    overrideLogoUrl || StorageService.getCMSConfig().logoUrl || '/assets/lcns-logo-original.jpg'
  );
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (overrideLogoUrl !== undefined) {
      setLogoUrl(overrideLogoUrl);
      setImgError(false);
    } else {
      const handleStorageUpdate = () => {
        setLogoUrl(StorageService.getCMSConfig().logoUrl || '/assets/lcns-logo-original.jpg');
        setImgError(false);
      };
      window.addEventListener('lcns_storage_update', handleStorageUpdate);
      return () => window.removeEventListener('lcns_storage_update', handleStorageUpdate);
    }
  }, [overrideLogoUrl]);

  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
    '2xl': 'w-48 h-48',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeMap[size]} shrink-0 transition-transform duration-300 hover:scale-105 drop-shadow-sm`}>
        {logoUrl && !imgError ? (
          <img
            src={logoUrl}
            alt="Labe College of Nursing Sciences Emblem"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain rounded-full"
          />
        ) : (
          <svg viewBox="0 0 400 460" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <path id="crestTopArc" d="M 65 200 A 135 135 0 0 1 335 200" fill="none" />
              <path id="crestBottomArc" d="M 100 240 A 120 120 0 0 0 300 240" fill="none" />
              
              <linearGradient id="crestGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#facc15" />
                <stop offset="50%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>

              <linearGradient id="crestGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="50%" stopColor="#0a4d2e" />
                <stop offset="100%" stopColor="#06321e" />
              </linearGradient>

              <linearGradient id="lampFlameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              
              <filter id="flameGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* Outer Deep Yellow Rim */}
            <circle cx="200" cy="190" r="185" fill="#ca8a04" stroke="#a16207" strokeWidth="3" />
            <circle cx="200" cy="190" r="177" fill="#ffffff" />

            {/* Deep Green Wide Ring */}
            <circle cx="200" cy="190" r="172" fill="url(#crestGreenGrad)" stroke="#06321e" strokeWidth="2" />

            {/* Text Along Arcs */}
            <text fill="#ffffff" fontSize="23" fontWeight="900" letterSpacing="2.5" fontFamily="Cinzel, Arial, sans-serif">
              <textPath href="#crestTopArc" startOffset="50%" textAnchor="middle">
                LABE COLLEGE OF NURSING SCIENCES
              </textPath>
            </text>

            <text fill="#ffffff" fontSize="30" fontWeight="900" letterSpacing="4" fontFamily="Arial, sans-serif">
              <textPath href="#crestBottomArc" startOffset="50%" textAnchor="middle">
                ★ GBOKO ★
              </textPath>
            </text>

            {/* Inner Medallion Border */}
            <circle cx="200" cy="190" r="116" fill="#f8fafc" stroke="#ea580c" strokeWidth="3.5" />
            <circle cx="200" cy="190" r="111" fill="#ffffff" stroke="#15803d" strokeWidth="2" />

            {/* FLORENCE NIGHTINGALE LAMP (Top of Medallion) */}
            <g transform="translate(145, 95)">
              {/* Lamp Base and Spout */}
              <path
                d="M 25 35 C 10 35 0 25 0 18 C 0 14 12 10 35 8 C 65 6 95 10 105 16 C 110 20 100 30 80 34 C 65 37 40 37 25 35 Z"
                fill="#92400e"
                stroke="#451a03"
                strokeWidth="2.5"
              />
              {/* Lamp Handle */}
              <path
                d="M 85 14 C 105 10 115 22 95 28 C 88 30 84 25 85 14 Z"
                fill="none"
                stroke="#78350f"
                strokeWidth="4"
              />
              {/* Lamp Center Pot Hole */}
              <ellipse cx="60" cy="18" rx="14" ry="5.5" fill="#451a03" stroke="#b45309" strokeWidth="1.5" />
              
              {/* Flame on left spout */}
              <path
                d="M 12 12 C 10 5 15 -3 13 -10 C 11 -3 3 4 5 10 C 7 13 10 14 12 12 Z"
                fill="url(#lampFlameGrad)"
                filter="url(#flameGlow)"
              />
              <circle cx="12" cy="0" r="3" fill="#ffffff" opacity="0.8" />
            </g>

            {/* STAFF OF ASCLEPIUS / ROD & COILED SERPENT */}
            <g transform="translate(192, 130)">
              {/* Center Rod / Staff */}
              <rect x="6" y="0" width="5" height="155" rx="2.5" fill="#1e293b" />
              <circle cx="8.5" cy="-2" r="7" fill="#0f172a" />
              {/* Pointed bottom tip */}
              <polygon points="6,155 11,155 8.5,168" fill="#1e293b" />

              {/* Coiled Serpent */}
              <path
                d="M 9 12 C 28 20 38 40 18 55 C -6 68 -8 90 14 105 C 32 118 24 135 9 146"
                fill="none"
                stroke="#0f172a"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 9 12 C 28 20 38 40 18 55 C -6 68 -8 90 14 105 C 32 118 24 135 9 146"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* Snake Head */}
              <ellipse cx="8" cy="14" rx="5" ry="3.5" fill="#0f172a" />
              <circle cx="9.5" cy="13" r="1.2" fill="#ffffff" />
            </g>

            {/* LOWER SCROLL RIBBON: "LEARN, SERVE & SAVE" */}
            <g transform="translate(0, 315)">
              {/* Ribbon Background Left Tail */}
              <path
                d="M 25 70 L 65 35 L 75 75 L 25 70 Z"
                fill="#f1f5f9"
                stroke="#0f172a"
                strokeWidth="3"
              />
              <path d="M 65 35 L 50 15 L 20 45 L 25 70" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2.5" />
              
              {/* Ribbon Background Right Tail */}
              <path
                d="M 375 70 L 335 35 L 325 75 L 375 70 Z"
                fill="#f1f5f9"
                stroke="#0f172a"
                strokeWidth="3"
              />
              <path d="M 335 35 L 350 15 L 380 45 L 375 70" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2.5" />

              {/* Center Flowing Ribbon */}
              <path
                d="M 45 60 C 110 32 290 32 355 60 C 340 102 290 115 200 112 C 110 115 60 102 45 60 Z"
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="4"
              />
              
              {/* Inner Creases */}
              <path d="M 70 56 C 120 40 280 40 330 56" fill="none" stroke="#cbd5e1" strokeWidth="2" />
              <path d="M 70 94 C 120 106 280 106 330 94" fill="none" stroke="#cbd5e1" strokeWidth="2" />

              {/* Banner Motto Text */}
              <text
                x="200"
                y="85"
                fill="#dc2626"
                fontSize="24"
                fontWeight="900"
                letterSpacing="2.5"
                textAnchor="middle"
                fontFamily="Impact, 'Plus Jakarta Sans', Arial, sans-serif"
              >
                LEARN, SERVE &amp; SAVE
              </text>
            </g>
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-[#0a4d2e] tracking-tight leading-tight text-lg uppercase font-serif-crest">
            Labe College of Nursing Sciences
          </span>
          <span className="text-xs font-semibold text-[#0a4d2e] tracking-wider uppercase">
            Gboko, Benue State &bull; Learn, Serve &amp; Save
          </span>
        </div>
      )}
    </div>
  );
};
