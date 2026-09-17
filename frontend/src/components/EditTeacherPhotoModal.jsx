import React, { useState, useRef, useEffect } from 'react';
import api from '../api/client.js';
import { Camera, UploadCloud, Link as LinkIcon, X, AlertCircle, CheckCircle2, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';

export function EditTeacherPhotoModal({ isOpen, onClose, teacher, onPhotoUpdated }) {
  const [activeMode, setActiveMode] = useState('upload'); // 'upload' | 'url'
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [urlResolvedPreview, setUrlResolvedPreview] = useState(null);
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const resolveTimerRef = useRef(null);

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

  // Automatically resolve pasted / typed URL in real time for circular preview
  useEffect(() => {
    if (activeMode !== 'url') return;
    if (resolveTimerRef.current) clearTimeout(resolveTimerRef.current);

    const trimmed = photoUrl.trim();
    if (!trimmed || (!trimmed.startsWith('http://') && !trimmed.startsWith('https://'))) {
      setUrlResolvedPreview(null);
      setIsResolvingUrl(false);
      return;
    }

    setIsResolvingUrl(true);
    setError(null);

    resolveTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.resolvePhotoPreview(trimmed);
        if (res.success && res.previewUrl) {
          setUrlResolvedPreview(res.previewUrl);
        } else {
          setUrlResolvedPreview(null);
        }
      } catch (err) {
        setUrlResolvedPreview(null);
        setError('Could not preview image from this link. Make sure the URL is public.');
      } finally {
        setIsResolvingUrl(false);
      }
    }, 600);

    return () => {
      if (resolveTimerRef.current) clearTimeout(resolveTimerRef.current);
    };
  }, [photoUrl, activeMode]);

  if (!isOpen || !teacher) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError(null);
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(selected.type)) {
      setError('Please select a valid image (JPG, PNG, or WEBP).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError('Image size exceeds 10MB. Please choose a smaller photo.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(selected);
    setPhotoPreview(URL.createObjectURL(selected));
    setPhotoUrl('');
    setUrlResolvedPreview(null);
  };

  const removeSelectedFile = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    removeSelectedFile();
    setPhotoUrl('');
    setUrlResolvedPreview(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (activeMode === 'upload' && !photoFile) {
      setError('Please select an image file to upload.');
      return;
    }
    if (activeMode === 'url' && !photoUrl.trim()) {
      setError('Please enter a valid image URL or Pinterest link.');
      return;
    }

    setSubmitting(true);

    try {
      let payload;
      if (activeMode === 'upload' && photoFile) {
        payload = new FormData();
        payload.append('photo', photoFile);
      } else {
        payload = { photo_url: photoUrl.trim() };
      }

      const res = await api.updateTeacherPhoto(teacher.slug, payload);

      if (res.success && res.teacher) {
        onPhotoUpdated(res.teacher);
        handleClose();
      } else {
        throw new Error(res.error || 'Failed to update photo.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update photo. Please verify the file or link.');
    } finally {
      setSubmitting(false);
    }
  };

  // Determine current preview avatar to show inside circular gold frame
  const currentDisplaySrc =
    activeMode === 'upload'
      ? photoPreview || teacher.photo_url
      : urlResolvedPreview || (photoUrl.trim().startsWith('http') && !photoUrl.includes('pin.it') ? photoUrl.trim() : teacher.photo_url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8">
        <button
          onClick={handleClose}
          disabled={submitting}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-bisu-blue-100 dark:bg-bisu-blue-900/60 text-bisu-blue-700 dark:text-bisu-gold flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {teacher.photo_url ? 'Change Profile Picture' : 'Add Profile Picture'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
              For {teacher.name}
            </p>
          </div>
        </div>

        {/* Circular Avatar Preview Frame with Gold Border Ring */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-bisu-gold shadow-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {isResolvingUrl ? (
              <div className="flex flex-col items-center justify-center p-2 text-center text-bisu-gold">
                <Loader2 className="w-6 h-6 animate-spin mb-1" />
                <span className="text-[9px] font-bold">Resolving...</span>
              </div>
            ) : currentDisplaySrc ? (
              <img
                src={currentDisplaySrc}
                alt={teacher.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-2xl font-black text-slate-400">
                {teacher.name?.slice(0, 2).toUpperCase()}
              </span>
            )}

            {/* Badge when photo is ready */}
            {!isResolvingUrl && (photoPreview || urlResolvedPreview) && (
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow border-2 border-white dark:border-slate-900">
                ✓
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 mt-2 text-center">
            {isResolvingUrl
              ? 'Fetching image from web link...'
              : urlResolvedPreview
              ? '✓ Web photo resolved & ready to save to database!'
              : photoPreview
              ? '✓ Image file ready to upload to database!'
              : 'Saved directly to MySQL database & reflected everywhere in real time.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-4">
          <button
            type="button"
            onClick={() => {
              setActiveMode('upload');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'upload'
                ? 'bg-white dark:bg-slate-900 text-bisu-blue-700 dark:text-bisu-gold shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('url');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'url'
                ? 'bg-white dark:bg-slate-900 text-bisu-blue-700 dark:text-bisu-gold shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Paste Web / Pinterest Link</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeMode === 'upload' ? (
            <div>
              {!photoFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-bisu-gold/70 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/40 group"
                >
                  <UploadCloud className="w-8 h-8 mx-auto text-slate-400 group-hover:text-bisu-gold transition-colors mb-1.5" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Click to select photo file
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
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
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {photoFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {(photoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    disabled={submitting}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Image URL or Pinterest Link
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="e.g. https://pin.it/... or https://example.com/photo.jpg"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  disabled={submitting}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-bisu-gold/50 pr-10"
                />
                {isResolvingUrl && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-bisu-gold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Paste any link (Pinterest pins, direct image links, etc.). The circular preview above will resolve the photo immediately.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isResolvingUrl}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-bisu-blue-700 hover:bg-bisu-blue-800 shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Photo...</span>
                </>
              ) : (
                <span>Save Profile Photo</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTeacherPhotoModal;
