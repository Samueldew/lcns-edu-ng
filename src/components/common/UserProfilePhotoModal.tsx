import React, { useState, useRef } from 'react';
import { User } from '../../types';
import { StorageService } from '../../services/storage';
import { compressImage } from '../../utils/imageCompressor';
import { getSupabase, SUPABASE_BUCKET } from '../../lib/supabase';
import {
  X,
  Upload,
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface UserProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onPhotoUpdated?: (newPhotoUrl: string) => void;
}

export const UserProfilePhotoModal: React.FC<UserProfilePhotoModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPhotoUpdated,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(currentUser.photoUrl || '');
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedRawFile, setSelectedRawFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedRawFile(file);
    setErrorMsg(null);
    setSuccessMsg(null);
    setCompressing(true);

    try {
      // Compress to crisp 500x500 max passport format with quality 0.85
      const compressed = await compressImage(file, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.85,
        mimeType: 'image/jpeg',
      });
      setPreviewUrl(compressed);
    } catch (err: any) {
      setErrorMsg('Failed to process image: ' + (err.message || 'Unknown error'));
    } finally {
      setCompressing(false);
    }
  };

  const handleSavePhoto = async () => {
    if (!previewUrl) {
      setErrorMsg('Please select or upload a photograph first.');
      return;
    }

    setSaving(true);
    let finalUrl = previewUrl;

    try {
      const sb = getSupabase();
      if (sb && selectedRawFile) {
        const cleanName = selectedRawFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `passports/${Date.now()}-${cleanName}`;
        const { error: uploadError } = await sb.storage
          .from(SUPABASE_BUCKET)
          .upload(fileName, selectedRawFile, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = sb.storage.from(SUPABASE_BUCKET).getPublicUrl(fileName);
          if (urlData?.publicUrl) {
            finalUrl = urlData.publicUrl;
          }
        }
      }

      StorageService.updateUserProfilePhoto(currentUser.id, finalUrl);
      if (onPhotoUpdated) {
        onPhotoUpdated(finalUrl);
      }
      setSuccessMsg('Passport photograph saved permanently to your official record!');
      setTimeout(() => {
        setSaving(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setSaving(false);
      setErrorMsg('Error saving photo: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a4d2e] to-[#042114] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Camera className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold uppercase font-serif-crest text-sm sm:text-base leading-tight">
                Profile Photo &amp; Passport Upload
              </h3>
              <p className="text-[11px] text-emerald-300">
                {currentUser.fullName} ({currentUser.role.replace('_', ' ')})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white rounded-xl hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#22c55e]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Photo Preview Canvas */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative w-40 h-44 rounded-2xl border-4 border-emerald-700 overflow-hidden shadow-lg bg-slate-100 flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Passport Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-slate-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-1 text-slate-300" />
                  <span className="text-[11px] font-bold uppercase tracking-wider block">No Photo</span>
                </div>
              )}

              {compressing && (
                <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white text-xs gap-1">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                  <span>Compressing...</span>
                </div>
              )}
            </div>

            <span className="text-[11px] text-slate-500 text-center max-w-xs">
              This photo will be displayed on your <strong>Student/Staff ID Card</strong>, <strong>Navbar</strong>, <strong>Examination Result Slip</strong>, <strong>Admission Letter</strong>, and <strong>CBT Screen</strong>.
            </span>
          </div>

          {/* Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-dashed border-[#0a4d2e]/40 hover:border-[#0a4d2e] text-[#0a4d2e] rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs"
            >
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Upload Photo from Gallery / Device</span>
            </button>

            <button
              type="button"
              onClick={handleSavePhoto}
              disabled={!previewUrl || saving || compressing}
              className="w-full py-3 px-4 bg-[#0a4d2e] hover:bg-[#06321e] text-white rounded-2xl text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Saving to Official Record...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                  <span>Save Photo Permanently</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
