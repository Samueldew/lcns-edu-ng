import React, { useState, useEffect } from 'react';
import {
  getManagementMembers,
  saveManagementMember,
  deleteManagementMember,
  uploadPermanent,
} from '../../lib/uploadPermanent';
import { SupabaseManagementMember } from '../../lib/supabase';
import {
  UserPlus,
  Users,
  Upload,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Sparkles,
  ShieldCheck,
  Search,
  Award,
} from 'lucide-react';

const TITLE_OPTIONS = [
  'Provost, Labe College of Nursing Sciences',
  'Deputy Provost (Academic)',
  'Deputy Provost (Administration)',
  'Registrar & Secretary to the Academic Board',
  'College Bursar & Chief Financial Officer',
  'Dean of Nursing & Clinical Studies',
  'Head of Department (Nursing Sciences)',
  'Head of Department (Midwifery & Neonatology)',
  'Director of Academic Planning & Quality Assurance',
  'Chief Medical Director / Clinical Coordinator',
  'College Librarian',
  'Custom Title...',
];

export const AdminManagement: React.FC = () => {
  const [members, setMembers] = useState<SupabaseManagementMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formTitleSelect, setFormTitleSelect] = useState(TITLE_OPTIONS[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Delete Confirm
  const [memberToDelete, setMemberToDelete] = useState<SupabaseManagementMember | null>(null);

  useEffect(() => {
    loadMembers();
    const handleUpdate = () => loadMembers();
    window.addEventListener('lcns_management_update', handleUpdate);
    return () => window.removeEventListener('lcns_management_update', handleUpdate);
  }, []);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await getManagementMembers();
      setMembers(data);
    } catch (err) {
      console.warn('Failed to load management:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormName('');
    setFormTitleSelect(TITLE_OPTIONS[0]);
    setCustomTitle('');
    setFormBio('');
    setFormPhotoUrl('');
    setFormDisplayOrder(members.length + 1);
    setFormIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (m: SupabaseManagementMember) => {
    setEditingId(m.id);
    setFormName(m.name);
    if (TITLE_OPTIONS.includes(m.title)) {
      setFormTitleSelect(m.title);
      setCustomTitle('');
    } else {
      setFormTitleSelect('Custom Title...');
      setCustomTitle(m.title);
    }
    setFormBio(m.description);
    setFormPhotoUrl(m.photo_url);
    setFormDisplayOrder(m.display_order);
    setFormIsActive(m.is_active);
    setShowModal(true);
  };

  // Picture Upload directly to "management-photos" bucket
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `member-${Date.now()}.${ext}`;

      const publicUrl = await uploadPermanent(file, 'management-photos', path);
      setFormPhotoUrl(publicUrl);
      showStatus('Picture uploaded to Supabase Storage!');
    } catch (err: any) {
      showStatus(err?.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showStatus('Please enter leadership member name', 'error');
      return;
    }

    const finalTitle =
      formTitleSelect === 'Custom Title...'
        ? customTitle.trim() || 'Principal Officer'
        : formTitleSelect;

    const newMember: SupabaseManagementMember = {
      id: editingId || 'mgmt-' + Date.now(),
      name: formName.trim(),
      title: finalTitle,
      description: formBio.trim(),
      photo_url:
        formPhotoUrl.trim() ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
      display_order: Number(formDisplayOrder) || 1,
      is_active: formIsActive,
      created_at: new Date().toISOString(),
    };

    try {
      await saveManagementMember(newMember);
      setShowModal(false);
      showStatus(
        editingId
          ? `Updated leadership profile for ${newMember.name}`
          : `Added new leadership member ${newMember.name} to database!`
      );
      loadMembers();
    } catch (err: any) {
      showStatus(err?.message || 'Failed to save member', 'error');
    }
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    try {
      await deleteManagementMember(memberToDelete.id);
      showStatus(`Deleted leadership profile for ${memberToDelete.name}`);
      setMemberToDelete(null);
      loadMembers();
    } catch (err: any) {
      showStatus(err?.message || 'Failed to delete member', 'error');
    }
  };

  const toggleActive = async (m: SupabaseManagementMember) => {
    const updated = { ...m, is_active: !m.is_active };
    await saveManagementMember(updated);
    loadMembers();
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <span>Page: /admin/management &bull; Permanent Database</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest">
            College Leadership &amp; Management Team
          </h1>
          <p className="text-xs text-emerald-200 mt-1">
            Manage Provost, Rector, Registrar, Bursar, and Deans. Photos upload to Supabase bucket <code className="text-[#ca8a04] font-mono">management-photos</code> and save to <code className="text-[#ca8a04] font-mono">management</code> table.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#ca8a04] hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
        >
          <UserPlus className="w-4 h-4 text-slate-950" />
          <span>Add Principal Officer</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, title, bio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a4d2e]"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
          <span>Total Officers: <strong className="text-[#0a4d2e]">{members.length}</strong></span>
          <span>Active on Website: <strong className="text-[#22c55e]">{members.filter(m => m.is_active).length}</strong></span>
        </div>
      </div>

      {/* Leadership Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-slate-600 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Order</th>
                <th className="px-5 py-3.5">Photo</th>
                <th className="px-5 py-3.5">Name &amp; Qualifications</th>
                <th className="px-5 py-3.5">Office / Title</th>
                <th className="px-5 py-3.5">Bio / Description</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4 font-mono font-black text-slate-500">
                    #{m.display_order}
                  </td>
                  <td className="px-5 py-4">
                    <div className="w-12 h-14 rounded-xl overflow-hidden border-2 border-emerald-600 shadow-xs bg-slate-100 shrink-0">
                      <img
                        src={m.photo_url}
                        alt={m.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-900 max-w-xs">
                    {m.name}
                  </td>
                  <td className="px-5 py-4 font-medium text-[#0a4d2e] max-w-xs">
                    <span className="inline-block bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
                      {m.title}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 max-w-sm line-clamp-2">
                    {m.description || 'No description provided.'}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleActive(m)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${
                        m.is_active
                          ? 'bg-emerald-100 text-[#0a4d2e] hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {m.is_active ? <Eye className="w-3 h-3 text-[#22c55e]" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                      <span>{m.is_active ? 'Active' : 'Hidden'}</span>
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(m)}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Officer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setMemberToDelete(m)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Officer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No management officers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-[#0a4d2e] rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-serif-crest uppercase text-slate-900">
                    {editingId ? 'Edit Principal Officer' : 'Add Principal Officer'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saves directly to Supabase Storage &amp; Database
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-800 text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload & Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Official Portrait Picture *
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-24 rounded-2xl overflow-hidden border-2 border-emerald-600 bg-slate-100 flex items-center justify-center shrink-0 shadow-inner">
                    {formPhotoUrl ? (
                      <img
                        src={formPhotoUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a4d2e] hover:bg-[#073922] text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                        className="hidden"
                      />
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingPhoto ? 'Uploading to Supabase...' : 'Upload Picture'}</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Upload original portrait photo. Uploads to Supabase bucket <code className="font-mono text-[#0a4d2e]">management-photos</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name &amp; Academic Qualifications *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mrs Terna Fiase Msc, Bnsc, Dip Nursing Education, RNE,RM,RN"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a4d2e]"
                  required
                />
              </div>

              {/* Title Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Title / Designation *
                </label>
                <select
                  value={formTitleSelect}
                  onChange={(e) => setFormTitleSelect(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a4d2e]"
                >
                  {TITLE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                {formTitleSelect === 'Custom Title...' && (
                  <input
                    type="text"
                    placeholder="Enter custom leadership title..."
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="mt-2 w-full px-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a4d2e]"
                    required
                  />
                )}
              </div>

              {/* Bio / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Biography / Institutional Leadership Message
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of portfolio, qualifications, leadership vision..."
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a4d2e]"
                />
              </div>

              {/* Order & Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a4d2e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Visibility
                  </label>
                  <label className="flex items-center gap-2 pt-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#0a4d2e] rounded border-slate-300 focus:ring-[#0a4d2e]"
                    />
                    <span className="text-xs font-bold text-slate-700">Display on Homepage</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0a4d2e] hover:bg-[#073922] text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                  <span>{editingId ? 'Save Changes' : 'Add to Management'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black uppercase font-serif-crest text-slate-900">
                Delete Principal Officer?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <strong>{memberToDelete.name}</strong> ({memberToDelete.title}) from the permanent management records?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setMemberToDelete(null)}
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
