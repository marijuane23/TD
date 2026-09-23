import React, { useState, useRef, useEffect } from 'react';
import api from '../api/client.js';
import { UserPlus, Briefcase, X, AlertCircle, UploadCloud, Image as ImageIcon, Camera, Trash2, Loader2 } from 'lucide-react';

export function AddTeacherForm({ isOpen, onClose, onTeacherAdded, role = 'faculty' }) {
  const isStaff = role === 'staff';
  const [name, setName] = useState('');
  const [colleges, setColleges] = useState([]);
  const [collegeId, setCollegeId] = useState('');
  const [department, setDepartment] = useState('');
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [urlResolvedPreview, setUrlResolvedPreview] = useState(null);
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const resolveTimerRef = useRef(null);

  // Fetch colleges list from normalized table whenever modal opens
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const fetchColleges = async () => {
      setLoadingColleges(true);
      try {
        const res = await api.getColleges();
        if (isMounted) {
          const list = Array.isArray(res) ? res : (res.data || []);
          setColleges(list);
        }
      } catch (err) {
        console.error('Failed to load colleges:', err);
      } finally {
        if (isMounted) setLoadingColleges(false);
      }
    };
    fetchColleges();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Clean up object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      if (resolveTimerRef.current) {
        clearTimeout(resolveTimerRef.current);
      }
    };
  }, [photoPreview]);

  // Resolve external / Pinterest image URL in real time for avatar preview
  useEffect(() => {
    if (resolveTimerRef.current) clearTimeout(resolveTimerRef.current);

    const trimmed = photoUrl.trim();
    if (!trimmed || (!trimmed.startsWith('http://') && !trimmed.startsWith('https://'))) {
      setUrlResolvedPreview(null);
      setIsResolvingUrl(false);
      return;
    }

    setIsResolvingUrl(true);

    resolveTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.resolvePhotoPreview(trimmed);
        if (res.success && res.previewUrl) {
          setUrlResolvedPreview(res.previewUrl);
        } else {
          setUrlResolvedPreview(null);
        }
      } catch {
        setUrlResolvedPreview(null);
      } finally {
        setIsResolvingUrl(false);
      }
    }, 600);

    return () => {
      if (resolveTimerRef.current) clearTimeout(resolveTimerRef.current);
    };
  }, [photoUrl]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError(null);

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(selected.mimetype) && !allowedMimes.includes(selected.type)) {
      setError('Please select a valid image file (JPG, PNG, or WEBP).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 10MB max limit
    if (selected.size > 10 * 1024 * 1024) {
      setError('Photo size exceeds 10MB limit. Please choose a smaller image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(selected);
    setPhotoPreview(URL.createObjectURL(selected));
  };

  const removePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    removePhoto();
    setName('');
    setCollegeId('');
    setDepartment('');
    setPhotoUrl('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(`${isStaff ? 'Staff' : 'Teacher'} name is required.`);
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('role', role);
      if (collegeId) {
        formData.append('college_id', collegeId);
      }
      if (department.trim()) {
        formData.append('department', department.trim());
      }
      if (photoFile) {
        formData.append('photo', photoFile);
      } else if (photoUrl.trim()) {
        formData.append('photo_url', photoUrl.trim());
      }

      const res = await api.addAdminTeacher(formData);

      handleClose();
      if (onTeacherAdded) {
        onTeacherAdded(res.data);
      }
    } catch (err) {
      setError(err.message || `Failed to add ${isStaff ? 'staff member' : 'faculty member'}.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isStaff
              ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300'
              : 'bg-bisu-blue-100 dark:bg-bisu-blue-900/60 text-bisu-blue-700 dark:text-bisu-gold'
          }`}>
            {isStaff ? <Briefcase className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isStaff ? 'Add New Staff Member' : 'Add New Faculty Member'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          {isStaff
            ? 'The staff member will immediately appear in the Directory with their profile photo stored securely in the database.'
            : 'The teacher will immediately appear in the Faculty Directory with their profile photo stored securely in the database.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Attachment Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {isStaff ? 'Staff Portrait Photo (Stored in Database)' : 'Teacher Photo (Stored in Database)'}
            </label>

            {!photoFile && !urlResolvedPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/40 group ${
                  isStaff ? 'hover:border-teal-500/70' : 'hover:border-bisu-gold/70'
                }`}
              >
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2 group-hover:scale-105 transition-transform ${
                  isStaff ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'bg-bisu-gold/10 text-bisu-gold'
                }`}>
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Click to select or drop {isStaff ? 'staff' : 'teacher'} portrait
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  JPG, PNG, or WEBP (up to 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={photoPreview || urlResolvedPreview}
                      alt="Teacher preview"
                      className="w-14 h-14 rounded-full object-cover border-2 border-bisu-gold shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[240px]">
                      {photoFile ? photoFile.name : 'Web Photo Resolved'}
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {photoFile ? `${(photoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to save` : '✓ Resolved from link • Ready to save'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    removePhoto();
                    setUrlResolvedPreview(null);
                    setPhotoUrl('');
                  }}
                  disabled={submitting}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name with Title *
            </label>
            <input
              type="text"
              required
              placeholder={isStaff ? 'e.g. Engr. Roberto Cruz, Ms. Carmela Bautista' : 'e.g. Dr. Maria Elena Santos'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-bisu-gold/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              College / Unit (Optional)
            </label>
            <select
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              disabled={loadingColleges}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-bisu-gold/50 cursor-pointer disabled:opacity-60"
            >
              <option value="">
                {loadingColleges ? 'Loading colleges roster...' : 'None / Not Affiliated (Optional)'}
              </option>
              {colleges.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name} ({col.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {isStaff ? 'Department / Office (Optional)' : 'Department (Optional)'}
            </label>
            <input
              type="text"
              placeholder={
                isStaff
                  ? 'e.g. Registrar Office, Administrative Services, Accounting'
                  : 'e.g. Department of Computer Studies, Secondary Education'
              }
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-bisu-gold/50"
            />
          </div>

          {/* Secondary / Optional Photo URL toggle */}
          {!photoFile && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowUrlFallback(!showUrlFallback)}
                className="text-[11px] font-semibold text-slate-500 hover:text-bisu-blue-600 dark:hover:text-bisu-gold transition-colors"
              >
                {showUrlFallback ? '– Hide photo URL option' : '+ Or provide an external image URL instead'}
              </button>

              {showUrlFallback && (
                <div className="mt-2 animate-in fade-in duration-100">
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://pin.it/... or https://example.com/photo.jpg"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-bisu-gold/50 pr-10"
                    />
                    {isResolvingUrl && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-bisu-gold">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Paste Pinterest or web links. The circular avatar above will preview it immediately once resolved.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all disabled:opacity-50 ${
                isStaff
                  ? 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/20'
                  : 'bg-bisu-blue-700 hover:bg-bisu-blue-800 shadow-bisu-blue/20'
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isStaff ? 'Saving Staff...' : 'Saving Faculty...'}</span>
                </>
              ) : (
                <span>{isStaff ? 'Add Staff Member' : 'Add Faculty Member'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTeacherForm;
