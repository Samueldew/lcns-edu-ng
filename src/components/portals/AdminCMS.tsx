import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { CMSConfig, GalleryItem } from '../../types';
import { CollegeLogo } from '../common/CollegeLogo';
import {
  Upload,
  Image as ImageIcon,
  User,
  Church,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Eye,
  Camera,
  ExternalLink,
} from 'lucide-react';

export const AdminCMS: React.FC = () => {
  const [cmsConfig, setCmsConfig] = useState<CMSConfig>(StorageService.getCMSConfig());
  const [activeSubTab, setActiveSubTab] = useState<'logo' | 'provost' | 'bishop' | 'gallery'>('logo');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    const handleStorageUpdate = () => {
      const cfg = StorageService.getCMSConfig();
      setCmsConfig(cfg);
      setGallery(cfg.gallery || []);
    };
    window.addEventListener('lcns_storage_update', handleStorageUpdate);
    return () => window.removeEventListener('lcns_storage_update', handleStorageUpdate);
  }, []);

  // Logo state
  const [customLogoInput, setCustomLogoInput] = useState(cmsConfig.logoUrl || '');

  // Provost state
  const [provostName, setProvostName] = useState(cmsConfig.provostName);
  const [provostTitle, setProvostTitle] = useState(cmsConfig.provostTitle);
  const [provostMessage, setProvostMessage] = useState(cmsConfig.provostMessage);
  const [provostPhotoUrl, setProvostPhotoUrl] = useState(cmsConfig.provostPhotoUrl || '');

  // Bishop state
  const [bishopName, setBishopName] = useState(cmsConfig.bishopName);
  const [bishopTitle, setBishopTitle] = useState(cmsConfig.bishopTitle);
  const [bishopMessage, setBishopMessage] = useState(cmsConfig.bishopMessage);
  const [bishopPhotoUrl, setBishopPhotoUrl] = useState(cmsConfig.bishopPhotoUrl || '');

  // Gallery state
  const [gallery, setGallery] = useState<GalleryItem[]>(cmsConfig.gallery);
  const [showAddGalleryModal, setShowAddGalleryModal] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<GalleryItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalCategory, setNewGalCategory] = useState<GalleryItem['category']>('Clinical Simulation');
  const [newGalUrl, setNewGalUrl] = useState('');
  const [newGalDesc, setNewGalDesc] = useState('');

  const triggerSaveNotification = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  const triggerErrorNotification = (msg: string) => {
    setFormError(msg);
    setTimeout(() => setFormError(null), 4000);
  };

  // Helper to handle local file upload to Base64
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onComplete: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      triggerErrorNotification('File size exceeds 4MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onComplete(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // 1. SAVE LOGO
  const handleSaveLogo = (urlToSave: string) => {
    const updated = {
      ...cmsConfig,
      logoUrl: urlToSave,
    };
    StorageService.saveCMSConfig(updated);
    setCmsConfig(updated);
    setCustomLogoInput(urlToSave);
    StorageService.logAction('info@lcns.edu.ng', 'ADMIN', 'CMS_LOGO_UPDATE', 'Updated official college logo');
    triggerSaveNotification('College logo updated successfully across the entire website and portals!');
  };

  const handleResetLogo = () => {
    handleSaveLogo('');
    triggerSaveNotification('Restored to default official vector crest emblem.');
  };

  // 2. SAVE PROVOST
  const handleSaveProvost = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...cmsConfig,
      provostName,
      provostTitle,
      provostMessage,
      provostPhotoUrl,
    };
    StorageService.saveCMSConfig(updated);
    setCmsConfig(updated);
    StorageService.logAction('info@lcns.edu.ng', 'ADMIN', 'CMS_PROVOST_UPDATE', `Updated Provost profile: ${provostName}`);
    triggerSaveNotification('Provost profile and picture updated successfully!');
  };

  // 3. SAVE BISHOP
  const handleSaveBishop = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...cmsConfig,
      bishopName,
      bishopTitle,
      bishopMessage,
      bishopPhotoUrl,
    };
    StorageService.saveCMSConfig(updated);
    setCmsConfig(updated);
    StorageService.logAction('info@lcns.edu.ng', 'ADMIN', 'CMS_BISHOP_UPDATE', `Updated Bishop profile: ${bishopName}`);
    triggerSaveNotification('Bishop / Proprietor profile and picture updated successfully!');
  };

  // 4. GALLERY ACTIONS
  const handleAddGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalTitle || !newGalUrl) {
      triggerErrorNotification('Please provide both a title and an image file or URL.');
      return;
    }

    const newItem: GalleryItem = {
      id: 'gal-' + Date.now(),
      title: newGalTitle,
      imageUrl: newGalUrl,
      category: newGalCategory,
      date: new Date().toISOString().split('T')[0],
      description: newGalDesc,
    };

    const updatedGallery = [newItem, ...gallery];
    const updatedCMS = {
      ...cmsConfig,
      gallery: updatedGallery,
    };

    StorageService.saveCMSConfig(updatedCMS);
    setCmsConfig(updatedCMS);
    setGallery(updatedGallery);
    StorageService.logAction('info@lcns.edu.ng', 'ADMIN', 'CMS_GALLERY_ADD', `Added gallery image: ${newGalTitle}`);

    setNewGalTitle('');
    setNewGalUrl('');
    setNewGalDesc('');
    setShowAddGalleryModal(false);
    triggerSaveNotification('New gallery image published to website!');
  };

  const confirmDeleteGalleryItem = () => {
    if (!photoToDelete) return;
    const photoId = photoToDelete.id;
    const photoTitle = photoToDelete.title;
    const updatedCMS = StorageService.deleteGalleryItem(photoId);
    setCmsConfig(updatedCMS);
    setGallery(updatedCMS.gallery || []);
    StorageService.logAction('info@lcns.edu.ng', 'ADMIN', 'CMS_GALLERY_DELETE', `Removed gallery image: ${photoTitle} (${photoId})`);
    setPhotoToDelete(null);
    triggerSaveNotification('Gallery photo deleted permanently.');
  };

  return (
    <div className="space-y-6">
      {/* Top CMS Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
              <Camera className="w-3.5 h-3.5 text-emerald-700" />
              <span>Website Content Management System (CMS)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase font-serif-crest">
              Media &amp; Public Assets Manager
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Upload custom college crest, update Provost &amp; Bishop portraits, and manage the campus photo gallery.
            </p>
          </div>

          {/* Sub Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('logo')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSubTab === 'logo'
                  ? 'bg-emerald-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>College Logo</span>
            </button>

            <button
              onClick={() => setActiveSubTab('provost')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSubTab === 'provost'
                  ? 'bg-emerald-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Provost Picture</span>
            </button>

            <button
              onClick={() => setActiveSubTab('bishop')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSubTab === 'bishop'
                  ? 'bg-emerald-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Church className="w-3.5 h-3.5" />
              <span>Bishop Picture</span>
            </button>

            <button
              onClick={() => setActiveSubTab('gallery')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSubTab === 'gallery'
                  ? 'bg-emerald-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Campus Gallery ({gallery.length})</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {formError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-900 font-bold flex items-center gap-2 animate-fade-in">
            <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">!</span>
            <span>{formError}</span>
          </div>
        )}
      </div>

      {/* 1. LOGO UPLOAD & MANAGEMENT */}
      {activeSubTab === 'logo' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between border-b pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
                Official College Crest &amp; Logo Settings
              </h3>
              <p className="text-xs text-slate-500">
                Upload a custom high-resolution PNG or JPG logo. It will automatically update in the navigation bar, printable admission letters, examination result slips, payment receipts, and student ID cards.
              </p>
            </div>
            <button
              onClick={handleResetLogo}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default SVG Crest</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Logo Preview */}
            <div className="md:col-span-5 bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Live Emblem Preview
              </span>
              <div className="w-40 h-40 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
                <CollegeLogo size="xl" overrideLogoUrl={customLogoInput} />
              </div>
              <p className="text-[11px] text-slate-500">
                {customLogoInput ? 'Custom Uploaded Logo Active' : 'Official Vector SVG Crest Active'}
              </p>
            </div>

            {/* Upload Controls */}
            <div className="md:col-span-7 space-y-5">
              <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-6 rounded-2xl text-center space-y-3 hover:bg-emerald-50 transition-colors">
                <Upload className="w-8 h-8 text-emerald-700 mx-auto" />
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md transition-all">
                    <span>Browse &amp; Upload Logo File (PNG / JPG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (dataUrl) => handleSaveLogo(dataUrl))}
                    />
                  </label>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Recommended: Transparent PNG or crisp circular JPG (Max: 4MB)
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Or Paste Image URL Directly</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customLogoInput}
                    onChange={(e) => setCustomLogoInput(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono-code"
                  />
                  <button
                    onClick={() => handleSaveLogo(customLogoInput)}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                  >
                    Save URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROVOST PICTURE & PROFILE */}
      {activeSubTab === 'provost' && (
        <form onSubmit={handleSaveProvost} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b pb-4">
            <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
              Provost Profile &amp; Welcome Address
            </h3>
            <p className="text-xs text-slate-500">
              Update the Provost's photograph and welcome message displayed on the college homepage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Picture preview & upload */}
            <div className="md:col-span-4 bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center space-y-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Provost Photograph
              </span>
              <div className="w-40 h-48 mx-auto rounded-2xl overflow-hidden border-4 border-emerald-900 shadow-md bg-slate-200 flex items-center justify-center">
                {provostPhotoUrl ? (
                  <img
                    src={provostPhotoUrl}
                    alt="Provost"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-slate-400" />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Provost Picture</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, (dataUrl) => setProvostPhotoUrl(dataUrl))}
                  />
                </label>
                {provostPhotoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setProvostPhotoUrl('');
                      const updated = { ...cmsConfig, provostPhotoUrl: '' };
                      StorageService.saveCMSConfig(updated);
                      setCmsConfig(updated);
                      triggerSaveNotification('Provost picture removed.');
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Picture</span>
                  </button>
                )}
              </div>

              <div className="text-left space-y-1">
                <label className="block text-[10px] font-bold text-slate-600">Or Picture URL:</label>
                <input
                  type="url"
                  value={provostPhotoUrl}
                  onChange={(e) => setProvostPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-[11px] font-mono-code"
                />
              </div>
            </div>

            {/* Bio fields */}
            <div className="md:col-span-8 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Provost Full Name &amp; Titles *</label>
                <input
                  type="text"
                  required
                  value={provostName}
                  onChange={(e) => setProvostName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Institutional Designation *</label>
                <input
                  type="text"
                  required
                  value={provostTitle}
                  onChange={(e) => setProvostTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Welcome Address / Philosophy *</label>
                <textarea
                  rows={6}
                  required
                  value={provostMessage}
                  onChange={(e) => setProvostMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed text-slate-800"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Save Provost Profile</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* 3. BISHOP PICTURE & PROPRIETOR PROFILE */}
      {activeSubTab === 'bishop' && (
        <form onSubmit={handleSaveBishop} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b pb-4">
            <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
              Catholic Bishop of Gboko &amp; Proprietor Profile
            </h3>
            <p className="text-xs text-slate-500">
              Update the Bishop's episcopal blessing and official photograph displayed in the institutional heritage section.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Picture preview & upload */}
            <div className="md:col-span-4 bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center space-y-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Bishop's Portrait
              </span>
              <div className="w-40 h-48 mx-auto rounded-2xl overflow-hidden border-4 border-amber-600 shadow-md bg-slate-200 flex items-center justify-center">
                {bishopPhotoUrl ? (
                  <img
                    src={bishopPhotoUrl}
                    alt="Most Rev. William Avenya"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Church className="w-16 h-16 text-slate-400" />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Bishop Picture</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, (dataUrl) => setBishopPhotoUrl(dataUrl))}
                  />
                </label>
                {bishopPhotoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setBishopPhotoUrl('');
                      const updated = { ...cmsConfig, bishopPhotoUrl: '' };
                      StorageService.saveCMSConfig(updated);
                      setCmsConfig(updated);
                      triggerSaveNotification('Bishop picture removed.');
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Picture</span>
                  </button>
                )}
              </div>

              <div className="text-left space-y-1">
                <label className="block text-[10px] font-bold text-slate-600">Or Picture URL:</label>
                <input
                  type="url"
                  value={bishopPhotoUrl}
                  onChange={(e) => setBishopPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-[11px] font-mono-code"
                />
              </div>
            </div>

            {/* Bio fields */}
            <div className="md:col-span-8 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bishop Full Name &amp; Apostolic Title *</label>
                <input
                  type="text"
                  required
                  value={bishopName}
                  onChange={(e) => setBishopName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Diocese / Proprietorship *</label>
                <input
                  type="text"
                  required
                  value={bishopTitle}
                  onChange={(e) => setBishopTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-amber-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Episcopal Message &amp; Apostolic Blessing *</label>
                <textarea
                  rows={6}
                  required
                  value={bishopMessage}
                  onChange={(e) => setBishopMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed text-slate-800"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Bishop Profile</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* 4. CAMPUS MEDIA GALLERY */}
      {activeSubTab === 'gallery' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
                Campus Media Gallery ({gallery.length} Images)
              </h3>
              <p className="text-xs text-slate-500">
                Publish photographs of clinical simulation wards, matriculation ceremonies, lab equipment, and campus facilities.
              </p>
            </div>
            <button
              onClick={() => setShowAddGalleryModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="relative h-48 overflow-hidden bg-slate-200">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-slate-900/80 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                    {item.category}
                  </span>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px]">{item.date}</span>
                    <button
                      type="button"
                      onClick={() => setPhotoToDelete(item)}
                      className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-[11px] font-bold">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Gallery Photo Modal */}
          {showAddGalleryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
                <h3 className="text-base font-bold text-slate-900 uppercase font-serif-crest">
                  Upload &amp; Publish New Gallery Photo
                </h3>

                <form onSubmit={handleAddGalleryItem} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Photo Title *</label>
                    <input
                      type="text"
                      required
                      value={newGalTitle}
                      onChange={(e) => setNewGalTitle(e.target.value)}
                      placeholder="e.g. Clinical Simulation Laboratory"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      value={newGalCategory}
                      onChange={(e) => setNewGalCategory(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                    >
                      <option value="Clinical Simulation">Clinical Simulation</option>
                      <option value="Campus & Facilities">Campus &amp; Facilities</option>
                      <option value="Ceremonies & Events">Ceremonies &amp; Events</option>
                      <option value="Classrooms & Labs">Classrooms &amp; Labs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Upload Photo or Paste Image URL *</label>
                    <div className="flex gap-2 mb-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, (dataUrl) => setNewGalUrl(dataUrl))}
                        />
                      </label>
                      <input
                        type="url"
                        value={newGalUrl}
                        onChange={(e) => setNewGalUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono-code"
                      />
                    </div>
                    {newGalUrl && (
                      <div className="h-32 rounded-xl overflow-hidden border border-slate-200 mt-2">
                        <img src={newGalUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Description / Caption</label>
                    <textarea
                      rows={2}
                      value={newGalDesc}
                      onChange={(e) => setNewGalDesc(e.target.value)}
                      placeholder="Brief details about the facility or occasion..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    ></textarea>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddGalleryModal(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold shadow-md"
                    >
                      Publish Photo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Gallery Photo Confirmation Modal */}
          {photoToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
                <div className="flex items-center gap-3 text-red-600">
                  <div className="p-3 bg-red-100 rounded-2xl">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
                      Delete Gallery Photo?
                    </h3>
                    <p className="text-xs text-slate-500">
                      Permanently remove this image from the public college gallery.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <img
                    src={photoToDelete.imageUrl}
                    alt={photoToDelete.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-300"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {photoToDelete.title}
                    </h4>
                    <span className="inline-block mt-1 text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                      {photoToDelete.category}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1">
                      {photoToDelete.date}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to delete this picture? It will be removed immediately from the website.
                </p>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPhotoToDelete(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteGalleryItem}
                    className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Photo</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
