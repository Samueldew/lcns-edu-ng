import React, { useState, useEffect } from 'react';
import { getSupabase, SupabaseGalleryItem, SUPABASE_BUCKET } from '../../lib/supabase';
import {
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Camera,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  Tag,
  ExternalLink,
  X,
} from 'lucide-react';

const CATEGORIES = [
  'General',
  'Events',
  'Provost',
  'Rector',
  'Students',
  'Campus',
  'hostel',
];

export const AdminGallery: React.FC = () => {
  const [items, setItems] = useState<SupabaseGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<string>('Campus');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Lightbox preview
  const [activePreviewItem, setActivePreviewItem] = useState<SupabaseGalleryItem | null>(null);
  // Delete confirm
  const [itemToDelete, setItemToDelete] = useState<SupabaseGalleryItem | null>(null);

  useEffect(() => {
    loadGallery();
    const handleUpdate = () => loadGallery();
    window.addEventListener('lcns_gallery_update', handleUpdate);
    return () => window.removeEventListener('lcns_gallery_update', handleUpdate);
  }, []);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const loadGallery = async () => {
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error loading gallery from Supabase:', error);
      } else if (data) {
        setItems(data);
      }
    } catch (err: any) {
      console.warn('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSelectedFiles(files);
    const previews: string[] = [];
    for (let i = 0; i < files.length; i++) {
      previews.push(URL.createObjectURL(files[i]));
    }
    setPreviewUrls(previews);
  };

  /**
   * Admin Upload - Exactly as required:
   * Upload to Supabase Storage bucket 'lcns-files', get publicUrl, insert into 'gallery' table
   */
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) {
      showStatus('Supabase is not configured. Please add URL & Key in Settings.', 'error');
      return;
    }

    if (!selectedFiles || selectedFiles.length === 0) {
      showStatus('Please select one or more photos to upload', 'error');
      return;
    }

    try {
      setUploading(true);
      let successCount = 0;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const isHostel = formCategory.toLowerCase() === 'hostel';
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = isHostel
          ? 'real-school/girls-hostel-accommodation.jpg'
          : `gallery/${Date.now()}-${cleanName}`;

        // 1. Upload to storage bucket 'lcns-files'
        const { error: uploadError } = await supabase.storage
          .from(SUPABASE_BUCKET)
          .upload(fileName, file, { upsert: true, cacheControl: '3600' });

        if (uploadError) throw uploadError;

        // 2. Get public URL
        const { data: urlData } = supabase.storage
          .from(SUPABASE_BUCKET)
          .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;

        // 3. Save to 'gallery' table
        const itemTitle = isHostel && !formTitle.trim()
          ? 'Girls Hostel Accommodation'
          : formTitle.trim()
          ? selectedFiles.length > 1
            ? `${formTitle.trim()} (${i + 1})`
            : formTitle.trim()
          : fileName;

        const itemDesc = isHostel && !formDescription.trim()
          ? 'Safe and comfortable hostel for female students'
          : formDescription.trim();

        const { error: insertError } = await supabase.from('gallery').insert([
          {
            image_url: publicUrl,
            title: itemTitle,
            description: itemDesc,
            category: isHostel ? 'hostel' : formCategory,
            created_at: new Date().toISOString(),
          },
        ]);

        if (insertError) throw insertError;
        successCount++;
      }

      setShowUploadModal(false);
      setSelectedFiles(null);
      setPreviewUrls([]);
      setFormTitle('');
      setFormDescription('');
      showStatus(
        `Successfully uploaded ${successCount} photo(s) to Supabase Storage & Gallery table!`
      );
      window.dispatchEvent(new CustomEvent('lcns_gallery_update'));
      loadGallery();
    } catch (err: any) {
      console.error('Upload error:', err);
      showStatus(err?.message || 'Failed to upload photo(s) to Supabase', 'error');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Admin Delete - Exactly as required:
   * Keep delete button in admin area only.
   * Remove from storage bucket 'lcns-files' AND delete from 'gallery' table.
   */
  const handleDelete = async (id: string, image_url: string) => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      let path = '';
      if (image_url.includes('/lcns-files/')) {
        path = image_url.split('/lcns-files/')[1].split('?')[0];
      } else {
        path = image_url.split('/').slice(-2).join('/').split('?')[0];
      }

      if (path) {
        await supabase.storage.from(SUPABASE_BUCKET).remove([path]);
      }
      await supabase.from('gallery').delete().eq('id', id);

      showStatus('Photo deleted permanently from Supabase Storage and table');
      setItemToDelete(null);
      window.dispatchEvent(new CustomEvent('lcns_gallery_update'));
      loadGallery();
    } catch (err: any) {
      showStatus(err?.message || 'Failed to delete photo', 'error');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Alert banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 border shadow-md animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-[#0a4d2e]'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{statusMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0a4d2e] via-[#06321e] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-700/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-white/10">
            <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
            <span>Permanent Supabase Storage &bull; lcns-files</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif-crest uppercase">
            Campus &amp; Clinical Media Gallery
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl leading-relaxed">
            Upload original college photos with real descriptions. All files are uploaded directly to the 
            public Supabase Storage bucket <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300 font-mono">lcns-files</code> and saved to the <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300 font-mono">gallery</code> database table.
            Pictures never disappear on Git pull or Netlify rebuilds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setFormCategory('hostel');
              setFormTitle('Girls Hostel Accommodation');
              setFormDescription('Safe and comfortable hostel for female students');
              setShowUploadModal(true);
            }}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center gap-2 hover:scale-105 active:scale-95 border border-emerald-400/30"
          >
            <Upload className="w-4 h-4 text-emerald-200" />
            <span>Upload Girls' Hostel Photo</span>
          </button>

          <button
            onClick={() => {
              setFormCategory('Campus');
              setFormTitle('');
              setFormDescription('');
              setShowUploadModal(true);
            }}
            className="px-5 py-3 bg-gradient-to-r from-[#ca8a04] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Photos</span>
          </button>
        </div>
      </div>

      {/* Controls Bar: Search & Category Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'All'
                ? 'bg-[#0a4d2e] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({items.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#0a4d2e] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search photos by title / note..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white"
          />
        </div>
      </div>

      {/* Photos Masonry / Grid */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-8 h-8 border-4 border-[#0a4d2e] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Loading photos from Supabase Database...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No photos found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? 'No photos matched your search term.'
              : 'No college photos have been uploaded yet. Click below to add original pictures.'}
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold hover:bg-[#073822] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Photo Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="relative h-56 bg-slate-900 overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title || 'College photo'}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'bg-gray-200 h-56 flex items-center justify-center text-slate-500 font-bold text-xs';
                        fallback.innerText = 'No Image';
                        parent.appendChild(fallback);
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="bg-gray-200 h-56 flex items-center justify-center text-slate-500 font-bold text-xs">
                    No Image
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                {item.category && (
                  <span className="absolute top-3 left-3 bg-[#0a4d2e] text-[#22c55e] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#22c55e]/30">
                    {item.category}
                  </span>
                )}

                {/* Lightbox Trigger */}
                <button
                  type="button"
                  onClick={() => setActivePreviewItem(item)}
                  className="absolute bottom-3 right-3 p-2 bg-white/20 hover:bg-white/40 text-white rounded-xl backdrop-blur-md transition-all"
                  title="View full picture"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-[#0a4d2e] transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Permanent'}
                  </span>

                  {/* ADMIN DELETE BUTTON ONLY IN ADMIN AREA */}
                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg font-bold text-xs transition-colors"
                    title="Delete permanently from Supabase"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in no-print"
          onClick={() => {
            if (!uploading) setShowUploadModal(false);
          }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 border border-slate-200 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-950 font-serif-crest text-base uppercase">
                  Upload Original College Photos
                </h3>
                <p className="text-xs text-slate-500">
                  Target bucket: <code className="font-bold text-[#0a4d2e]">lcns-files/gallery/</code>
                </p>
              </div>
              <button
                disabled={uploading}
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Original Image Files * (PNG, JPG, WEBP)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFilesSelect}
                  required
                  disabled={uploading}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-[#0a4d2e] hover:file:bg-emerald-200 file:cursor-pointer"
                />
              </div>

              {/* Previews */}
              {previewUrls.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">
                    Selected Files ({previewUrls.length}):
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {previewUrls.map((url, i) => (
                      url ? (
                        <img
                          key={i}
                          src={url}
                          alt="Upload preview"
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-300"
                        />
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Photo Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Clinical Nursing Simulation Lab Session"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Context (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide clinical details, faculty names, or events shown in the photo..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white"
                ></textarea>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 bg-[#0a4d2e] hover:bg-[#073822] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload &amp; Save Permanently</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Admin Area Only) */}
      {itemToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in no-print"
          onClick={() => setItemToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-2xl">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
                  Delete Photo Permanently?
                </h3>
                <p className="text-xs text-slate-500">
                  Removes from Supabase Storage bucket <code className="font-mono">lcns-files</code> and table <code className="font-mono">gallery</code>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              {itemToDelete.image_url ? (
                <img
                  src={itemToDelete.image_url}
                  alt={itemToDelete.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-300"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center text-[10px] text-slate-500 font-bold shrink-0">
                  No Image
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-slate-900 truncate">
                  {itemToDelete.title}
                </h4>
                <span className="inline-block mt-1 text-[10px] text-[#0a4d2e] bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                  {itemToDelete.category}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action cannot be undone. Are you sure you want to proceed?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(itemToDelete.id, itemToDelete.image_url)}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete from Storage &amp; DB</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {activePreviewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in no-print"
          onClick={() => setActivePreviewItem(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl text-white relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePreviewItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              {activePreviewItem.image_url ? (
                <img
                  src={activePreviewItem.image_url}
                  alt={activePreviewItem.title}
                  className="max-h-[70vh] w-auto max-w-full object-contain"
                />
              ) : null}
            </div>

            <div className="p-6 bg-slate-900 space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#0a4d2e] text-[#22c55e] font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#22c55e]/30">
                  {activePreviewItem.category}
                </span>
                <span className="text-xs text-slate-400">
                  {activePreviewItem.created_at
                    ? new Date(activePreviewItem.created_at).toLocaleDateString()
                    : 'Active'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white font-serif-crest uppercase">
                {activePreviewItem.title}
              </h3>
              {activePreviewItem.description && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activePreviewItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
