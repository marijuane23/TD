import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../api/client.js';
import confetti from 'canvas-confetti';
import {
  Plus,
  Send,
  X,
  Sparkles,
  AlertCircle,
  GraduationCap,
  Image as ImageIcon,
  UploadCloud,
  ChevronDown,
  Search,
  Check,
  Globe,
} from 'lucide-react';

export function WallSubmissionPanel({ onGreetingSubmitted }) {
  const [isOpen, setIsOpen] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load teachers for dropdown on component mount
  useEffect(() => {
    let isMounted = true;
    const loadTeachers = async () => {
      try {
        const list = await api.getTeachersDropdown();
        if (isMounted && Array.isArray(list)) {
          setTeachers(list);
        }
      } catch (err) {
        console.error('Failed to load teachers for dropdown:', err);
      }
    };
    loadTeachers();
    return () => { isMounted = false; };
  }, []);

  // Click outside listener for custom teacher dropdown
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [isDropdownOpen]);

  // Filter teachers list by search query
  const filteredTeachers = useMemo(() => {
    if (!teacherSearch.trim()) return teachers;
    const q = teacherSearch.toLowerCase();
    return teachers.filter(
      (t) =>
        (t.name || '').toLowerCase().includes(q) ||
        (t.department || '').toLowerCase().includes(q) ||
        (t.college_code || '').toLowerCase().includes(q)
    );
  }, [teachers, teacherSearch]);

  // Currently selected teacher object
  const currentTeacher = useMemo(() => {
    if (!selectedTeacherId) return null;
    return teachers.find((t) => String(t.id) === String(selectedTeacherId)) || null;
  }, [teachers, selectedTeacherId]);


  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG, and WEBP images are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }

    setError(null);
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) {
      setError('Please write a greeting message.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('sender_name', senderName.trim() || 'Anonymous');
      formData.append('message_text', messageText.trim());
      if (websiteHoneypot) formData.append('website', websiteHoneypot);
      if (selectedTeacherId && selectedTeacherId !== 'none') {
        formData.append('teacher_id', selectedTeacherId);
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.postWallGreeting(formData);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8 },
      });

      if (res.data) {
        onGreetingSubmitted(res.data);
      }

      setMessageText('');
      setSenderName('');
      setSelectedTeacherId('');
      removeImage();
      setIsOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to post greeting');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button over Canvas */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm text-slate-900 bg-gradient-to-r from-bisu-gold to-amber-400 hover:from-amber-400 hover:to-bisu-gold shadow-lg shadow-bisu-gold/30 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span>Post a Greeting</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 my-8 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-bisu-gold/20 text-bisu-gold flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Post on the Public Wall
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Your greeting appears immediately on the interactive wall for everyone to see!
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot hidden input for bots */}
              <input
                type="text"
                name="website"
                value={websiteHoneypot}
                onChange={(e) => setWebsiteHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex="-1"
                autoComplete="off"
              />

              {/* Dedicate to Specific Teacher Custom Combobox */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-bisu-gold" />
                  <span>Dedicate to a Specific Teacher (Optional)</span>
                </label>

                {/* Custom Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  disabled={submitting}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-left text-sm flex items-center justify-between transition-all bg-slate-50 dark:bg-slate-950 cursor-pointer ${
                    isDropdownOpen
                      ? 'border-bisu-gold ring-2 ring-bisu-gold/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    {currentTeacher ? (
                      <>
                        <div className="w-6 h-6 rounded-lg bg-bisu-gold/20 text-bisu-gold flex items-center justify-center shrink-0">
                          <GraduationCap className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-slate-900 dark:text-white block leading-tight truncate">
                            {currentTeacher.name}
                          </span>
                          {currentTeacher.department && (
                            <span className="text-[10px] text-slate-400 block leading-none truncate">
                              {currentTeacher.department}
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                          <Globe className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                          Campus-wide Greeting (No specific teacher)
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {currentTeacher && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTeacherId('');
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="Clear selection"
                      >
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180 text-bisu-gold' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Floating Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
                    {/* Search Bar inside dropdown */}
                    <div className="relative mb-2 px-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={teacherSearch}
                        onChange={(e) => setTeacherSearch(e.target.value)}
                        placeholder="Type to filter teachers..."
                        className="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-bisu-gold"
                      />
                      {teacherSearch && (
                        <button
                          type="button"
                          onClick={() => setTeacherSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Scrollable list with fixed max height */}
                    <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-0.5 pr-0.5">
                      {/* Option 1: Campus-wide */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTeacherId('');
                          setIsDropdownOpen(false);
                          setTeacherSearch('');
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          !selectedTeacherId
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-bisu-gold font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">Campus-wide Greeting (General)</span>
                        </div>
                        {!selectedTeacherId && <Check className="w-4 h-4 text-bisu-gold shrink-0" />}
                      </button>

                      {/* Filtered Teachers */}
                      {filteredTeachers.map((t) => {
                        const isSelected = String(t.id) === String(selectedTeacherId);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setSelectedTeacherId(t.id);
                              setIsDropdownOpen(false);
                              setTeacherSearch('');
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-bisu-gold font-bold'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-semibold truncate text-slate-900 dark:text-white">
                                {t.name}
                              </p>
                              {t.department && (
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                  {t.department}
                                </p>
                              )}
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-bisu-gold shrink-0" />}
                          </button>
                        );
                      })}

                      {filteredTeachers.length === 0 && (
                        <div className="py-4 text-center text-xs text-slate-400">
                          No teachers matching "{teacherSearch}"
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedTeacherId && currentTeacher && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
                    <span>✨</span>
                    <span>Will be posted to Open Wall and {currentTeacher.name}'s timeline!</span>
                  </p>
                )}
              </div>


              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Anonymous (e.g. BSIT 4-A Student)"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-bisu-gold/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Greeting Message *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share your appreciation, funny memories, or heartfelt wishes..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  maxLength={1000}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-bisu-gold/50 resize-none"
                />
                <div className="flex justify-end text-[11px] text-slate-400 mt-1">
                  {messageText.length} / 1,000 characters
                </div>
              </div>

              {/* Photo Attachment Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-bisu-gold" />
                  <span>Attach Photo (Optional, max 10MB)</span>
                </label>

                {!imageFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-bisu-gold/60 rounded-2xl p-3.5 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-center gap-3"
                  >
                    <UploadCloud className="w-5 h-5 text-slate-400 shrink-0" />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Click to attach photo
                      </p>
                      <p className="text-[10px] text-slate-400">
                        JPG, PNG, or WEBP (up to 10MB)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-11 h-11 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {imageFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {(imageFile.size / (1024 * 1024)).toFixed(2)} MB • Photo
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={submitting}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-bisu-blue-700 hover:bg-bisu-blue-800 shadow-md shadow-bisu-blue/20 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'Posting...' : 'Post Greeting'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default WallSubmissionPanel;

