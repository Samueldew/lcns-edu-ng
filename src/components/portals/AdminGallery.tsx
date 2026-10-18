import React, { useState, useEffect } from 'react';
import {
  getGalleryItems,
  addGalleryItem,
  deleteGalleryItem,
  uploadPermanent,
} from '../../lib/uploadPermanent';
import { SupabaseGalleryItem } from '../../lib/supabase';
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
} from 'lucide-react';

const CATEGORIES: SupabaseGalleryItem['category'][] = [
  'General',
  'Events',
  'Provost',
  'Rector',
  'Students',
  'Campus',
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
  const [formCategory, setFormCategory] = useState<SupabaseGalleryItem['category']>('Campus');
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
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const loadGallery = async () => {
    setLoading(true);
    try {
      const data = await getGalleryItems('All');
      setItems(data);
    } catch (err) {
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

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      showStatus('Please select one or more photos to upload', 'error');
      return;
    }
    if (!formTitle.trim()) {
      showStatus('Please enter a title for the photo(s)', 'error');
      return;
    }

    try {
      setUploading(true);
      let successCount = 0;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `photo-${Date.now()}-${i}.${ext}`;

        // 1. Upload to Supabase bucket "gallery"
        const publicUrl = await uploadPermanent(file, 'gallery', filename);

        // 2. Save to "gallery" table
        const itemTitle =
          selectedFiles.length > 1
            ? `${formTitle.trim()} (Photo ${i + 1})`
            : formTitle.trim();

        await addGalleryItem({
          title: itemTitle,
          description: formDescription.trim(),
          image_url: publicUrl,
          category: formCategory,
        });

        successCount++;
      }

      setShowUploadModal(false);
      setSelectedFiles(null);
      setPreviewUrls([]);
      setFormTitle('');
      setFormDescription('');
      showStatus(
        `Successfully uploaded ${successCount} original photo(s) to Supabase Storage & Gallery table!`
      );
      loadGallery();
    } catch (err: any) {
      showStatus(err?.message || 'Failed to upload photo(s)', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteGalleryItem(itemToDelete.id);
      showStatus(`Deleted "${itemToDelete.title}" from storage and database`);
      setItemToDelete(null);
      loadGallery();
    } catch (err: any) {
      showStatus(err?.message || 'Failed to delete photo', 'error');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
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
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-bold">{statusMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0a4d2e] via-[#083c24] to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#22c55e]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ca8a04] text-xs font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-[#ca8a04]" />
            <span>Page: /admin/gallery &bull; Permanent Database Storage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest">
            College Photo Gallery Management
          </h1>
          <p className="text-xs text-emerald-200 mt-1">
            Upload genuine, original college photos with custom descriptions. Stored in Supabase bucket <code className="text-[#ca8a04] font-mono">gallery</code> and table <code className="text-[#ca8a04] font-mono">gallery</code>. Never lost on git pull.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#ca8a04] hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
        >
          <Camera className="w-4 h-4 text-slate-950" />
          <span>Upload Multiple Pictures</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'All'
                  ? 'bg-[#0a4d2e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All Photos ({items.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#0a4d2e] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat} ({items.filter((i) => i.category === cat).length})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search gallery by title or text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a4d2e]"
            />
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-emerald-600"
          >
            <div>
              {/* Photo View Box */}
              <div
                onClick={() => setActivePreviewItem(item)}
                className="relative aspect-4/3 bg-slate-900 overflow-hidden cursor-pointer"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="p-2 bg-white/90 text-[#0a4d2e] rounded-full shadow-lg">
                    <Eye className="w-5 h-5" />
                  </span>
                </div>
                <div className="absolute top-3 left-3 bg-[#0a4d2e] text-[#22c55e] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md border border-[#22c55e]/30">
                  {item.category}
                </div>
              </div>

              {/* Text Info */}
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-[#0a4d2e] transition-colors">
                  {item.title}
                </h3>
                {item.description ? (
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">No description provided.</p>
                )}
              </div>
            </div>

            {/* Bottom Bar: Date & Delete */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Active'}</span>
              </span>

              <button
                onClick={() => setItemToDelete(item)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-bold transition-colors"
                title="Delete from Storage & Database"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500 space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">No Photos in this Category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click "Upload Multiple Pictures" above to add genuine college original pictures with titles and descriptions.
          </p>
        </div>
      )}

      {/* Upload Multiple Pictures Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-[#0a4d2e] rounded-xl">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-serif-crest uppercase text-slate-900">
                    Upload Multiple Pictures
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload original college photos &bull; Supabase Storage &amp; DB safe
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-800 text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File input (multiple supported) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Select Picture(s) from your computer *
                </label>
                <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-6 text-center cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilesSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                  <Upload className="w-8 h-8 text-[#0a4d2e] mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    {selectedFiles && selectedFiles.length > 0
                      ? `${selectedFiles.length} file(s) selected`
                      : 'Click or drag photos here (Multiple photos supported)'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Accepts PNG, JPG, JPEG, WEBP. Original photos preserved without edits.
                  </p>
                </div>

                {/* Previews */}
                {previewUrls.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 overflow-x-auto py-2">
                    {previewUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="w-16 h-16 rounded-xl overflow-hidden border border-emerald-600 shrink-0"
                      >
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pioneer Students Clinical Orientation in Skills Lab"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a4d2e]"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a4d2e]"
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
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description / Caption
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide clinical details, occasion, location, or milestone description..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a4d2e]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 bg-[#0a4d2e] hover:bg-[#073922] text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-[#22c55e]" />
                  <span>{uploading ? 'Uploading to Supabase...' : 'Save Permanently to Gallery'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {activePreviewItem && (
        <div
          onClick={() => setActivePreviewItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in no-print cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 text-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-700 cursor-default"
          >
            <div className="relative max-h-[65vh] bg-black flex items-center justify-center">
              <img
                src={activePreviewItem.image_url}
                alt={activePreviewItem.title}
                className="max-h-[65vh] w-auto object-contain"
              />
              <button
                onClick={() => setActivePreviewItem(null)}
                className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full border border-slate-700"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#ca8a04] text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {activePreviewItem.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {activePreviewItem.created_at ? new Date(activePreviewItem.created_at).toLocaleDateString() : ''}
                </span>
              </div>
              <h3 className="text-lg font-black font-serif-crest text-white">
                {activePreviewItem.title}
              </h3>
              {activePreviewItem.description && (
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {activePreviewItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black uppercase font-serif-crest text-slate-900">
                Delete Gallery Photo?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <strong>"{itemToDelete.title}"</strong>? This will permanently delete the file from Supabase storage and the database table.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
