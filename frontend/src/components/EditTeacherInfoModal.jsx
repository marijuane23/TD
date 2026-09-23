import React, { useState, useEffect } from 'react';
import api from '../api/client.js';
import { Pencil, X, AlertCircle, Loader2, Check } from 'lucide-react';

export function EditTeacherInfoModal({ isOpen, onClose, teacher, onInfoUpdated }) {
  const [name, setName] = useState('');
  const [colleges, setColleges] = useState([]);
  const [collegeId, setCollegeId] = useState('');
  const [department, setDepartment] = useState('');
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form state from current teacher object
  useEffect(() => {
    if (!isOpen || !teacher) return;
    setName(teacher.name || '');
    setCollegeId(teacher.college_id ? String(teacher.college_id) : '');
    setDepartment(teacher.department || '');
    setError(null);
  }, [isOpen, teacher]);

  // Fetch colleges list whenever modal is opened
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const fetchColleges = async () => {
      setLoadingColleges(true);
      try {
        const res = await api.getColleges();
        if (isMounted) {
          const list = Array.isArray(res) ? res : (res?.data || []);
          setColleges(list);
        }
      } catch (err) {
        console.error('Failed to load colleges roster:', err);
      } finally {
        if (isMounted) setLoadingColleges(false);
      }
    };
    fetchColleges();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen || !teacher) return null;

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Teacher name is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: trimmedName,
        college_id: collegeId ? parseInt(collegeId, 10) : null,
        department: department.trim() || null,
      };

      const res = await api.updateTeacherInfo(teacher.slug, payload);

      if (res.success && res.teacher) {
        onInfoUpdated(res.teacher);
        handleClose();
      } else {
        throw new Error(res.error || 'Failed to update teacher information.');
      }
    } catch (err) {
      setError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-bisu-blue-100 dark:bg-bisu-blue-900/60 text-bisu-blue-700 dark:text-bisu-gold flex items-center justify-center shrink-0">
            <Pencil className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Edit Faculty Information
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update faculty name, affiliated college, or academic department.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 my-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Teacher Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Teacher Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Maria Elena Santos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-bisu-gold/50"
            />
          </div>

          {/* College Dropdown (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              College / School (Optional)
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

          {/* Department (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Department (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Department of Computer Studies, Secondary Education"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-bisu-gold/50"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
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
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-bisu-gold hover:bg-yellow-400 active:scale-95 shadow-md shadow-bisu-gold/20 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Information</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTeacherInfoModal;
