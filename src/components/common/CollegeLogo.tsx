import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { getSchoolSetting, getLocalSettings } from '../../lib/uploadPermanent';

interface CollegeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  overrideLogoUrl?: string;
  variant?: 'main' | 'white';
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  overrideLogoUrl,
  variant = 'main',
}) => {
  const settingKey = variant === 'white' ? 'school_logo_white' : 'school_logo';
  // REMOVED AI PICTURE FALLBACK - now only uses Supabase
  const initialLogo = overrideLogoUrl || getLocalSettings()[settingKey] || StorageService.getCMSConfig().logoUrl;
  const [logoUrl, setLogoUrl] = useState<string | undefined>(initialLogo);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (overrideLogoUrl !== undefined) {
      setLogoUrl(overrideLogoUrl);
      setImgError(false);
      return;
    }
    const loadFromDb = async () => {
      const url = await getSchoolSetting(settingKey);
      if (url) {
        setLogoUrl(url);
        setImgError(false);
      }
    };
    loadFromDb();

    const handleSettingsUpdate = (e: any) => {
      if (!e.detail || e.detail.key === settingKey) {
        loadFromDb();
      }
    };
    const handleStorageUpdate = () => {
      loadFromDb();
    };

    window.addEventListener('lcns_school_settings_update', handleSettingsUpdate);
    window.addEventListener('lcns_storage_update', handleStorageUpdate);

    return () => {
      window.removeEventListener('lcns_school_settings_update', handleSettingsUpdate);
      window.removeEventListener('lcns_storage_update', handleStorageUpdate);
    };
  }, [overrideLogoUrl, settingKey]);

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
        ) : null}
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
