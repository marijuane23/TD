import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { API_BASE_URL } from '../api/client.js';
import TimelineEntryList from '../components/TimelineEntryList.jsx';
import TimelineSubmissionForm from '../components/TimelineSubmissionForm.jsx';
import EditTeacherPhotoModal from '../components/EditTeacherPhotoModal.jsx';
import {
  ArrowLeft,
  Award,
  Heart,
  MessageSquare,
  Loader2,
  AlertCircle,
  Camera,
  Image as ImageIcon,
  Film,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

export function TeacherTimeline() {
  const { slug } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Profile picture modal state
  const [isEditPhotoOpen, setIsEditPhotoOpen] = useState(false);

  // Timeline filtering & sorting states
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'messages' | 'photos' | 'videos'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'photos_first' | 'videos_first' | 'messages_first'

  useEffect(() => {
    let isMounted = true;
    const fetchTimeline = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getTeacherBySlug(slug);
        if (isMounted) {
          setTeacher(data.teacher);
          setMessages(data.messages || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Teacher not found.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTimeline();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleMessageAdded = (newMessage) => {
    // Construct local timeline message with immediate real-time media_url
    const formatted = {
      ...newMessage,
      media_url:
        newMessage.media_url ||
        (newMessage.media_id ? `${API_BASE_URL}/media/${newMessage.media_id}` : null),
      created_at: newMessage.created_at || new Date().toISOString(),
    };
    setMessages((prev) => [formatted, ...prev]);
  };

  const handlePhotoUpdated = (updatedTeacher) => {
    setTeacher(updatedTeacher);
  };

  const getInitials = (name = '') => {
    return name
      .replace(/(Dr\.|Prof\.|Engr\.)/gi, '')
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Counts breakdown for filter tabs
  const counts = useMemo(() => {
    let photos = 0;
    let videos = 0;
    let textOnly = 0;

    for (const m of messages) {
      const isImage = m.media_type === 'image' || (m.media_mime && m.media_mime.startsWith('image/'));
      const isVideo = m.media_type === 'video' || (m.media_mime && m.media_mime.startsWith('video/'));
      if (isImage) photos++;
      else if (isVideo) videos++;
      else textOnly++;
    }

    return {
      all: messages.length,
      photos,
      videos,
      messages: textOnly,
    };
  }, [messages]);

  // Filter and sort computation
  const displayedMessages = useMemo(() => {
    // 1. Filter
    const filtered = messages.filter((m) => {
      const isImage = m.media_type === 'image' || (m.media_mime && m.media_mime.startsWith('image/'));
      const isVideo = m.media_type === 'video' || (m.media_mime && m.media_mime.startsWith('video/'));
      const isTextOnly = !m.media_id && !m.media_url;

      if (activeFilter === 'photos') return isImage;
      if (activeFilter === 'videos') return isVideo;
      if (activeFilter === 'messages') return isTextOnly;
      return true; // 'all'
    });

    // 2. Sort
    return [...filtered].sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();

      const isImageA = a.media_type === 'image' || (a.media_mime && a.media_mime.startsWith('image/'));
      const isImageB = b.media_type === 'image' || (b.media_mime && b.media_mime.startsWith('image/'));

      const isVideoA = a.media_type === 'video' || (a.media_mime && a.media_mime.startsWith('video/'));
      const isVideoB = b.media_type === 'video' || (b.media_mime && b.media_mime.startsWith('video/'));

      const isTextA = !a.media_id && !a.media_url;
      const isTextB = !b.media_id && !b.media_url;

      if (sortBy === 'oldest') {
        return timeA - timeB;
      }
      if (sortBy === 'photos_first') {
        if (isImageA && !isImageB) return -1;
        if (!isImageA && isImageB) return 1;
        return timeB - timeA;
      }
      if (sortBy === 'videos_first') {
        if (isVideoA && !isVideoB) return -1;
        if (!isVideoA && isVideoB) return 1;
        return timeB - timeA;
      }
      if (sortBy === 'messages_first') {
        if (isTextA && !isTextB) return -1;
        if (!isTextA && isTextB) return 1;
        return timeB - timeA;
      }
      // default: newest first
      return timeB - timeA;
    });
  }, [messages, activeFilter, sortBy]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-bisu-gold mb-3" />
        <p className="text-sm font-semibold">Loading teacher timeline...</p>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 glass-card rounded-2xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Teacher Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'This teacher profile does not exist.'}</p>
        <Link
          to="/teachers"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-bisu-blue-700 hover:bg-bisu-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Faculty Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back Link */}
      <Link
        to="/teachers"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-bisu-blue-600 dark:hover:text-bisu-gold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Teachers Directory</span>
      </Link>

      {/* Teacher Profile Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        {/* Interactive Avatar with Edit/Add Photo Button */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-bisu-blue-800 to-bisu-blue-600 text-bisu-gold flex items-center justify-center text-3xl font-black border-2 border-bisu-gold/60 shadow-lg overflow-hidden relative">
            {teacher.photo_url ? (
              <img
                src={teacher.photo_url}
                alt={teacher.name}
                className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              getInitials(teacher.name)
            )}

            {/* Hover overlay indicator */}
            <div
              onClick={() => setIsEditPhotoOpen(true)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer backdrop-blur-[1px]"
            >
              <Camera className="w-5 h-5 mb-0.5 text-bisu-gold" />
              <span>{teacher.photo_url ? 'Change' : 'Add Photo'}</span>
            </div>
          </div>

          {/* Persistent Floating Camera Badge */}
          <button
            type="button"
            onClick={() => setIsEditPhotoOpen(true)}
            title={teacher.photo_url ? 'Change profile picture' : 'Add profile picture'}
            className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-bisu-gold text-slate-950 hover:bg-yellow-400 font-bold text-xs shadow-md border-2 border-white dark:border-slate-900 transition-all hover:scale-110 flex items-center justify-center cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {teacher.name}
            </h1>
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-bisu-gold/20 text-bisu-gold border border-bisu-gold/30">
              <Award className="w-3.5 h-3.5" />
              <span>BISU Faculty</span>
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
            {teacher.college_name ? (
              <>
                <span className="font-semibold text-bisu-blue-700 dark:text-bisu-gold">
                  {teacher.college_name}
                </span>
                {teacher.department ? ` • ${teacher.department}` : ''}
              </>
            ) : (
              teacher.department || 'Bohol Island State University — Bilar Campus'
            )}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-bisu-blue-600 dark:text-bisu-blue-400" />
              <span>{messages.length} Tributes</span>
            </span>
            <span>•</span>
            <button
              onClick={() => setIsEditPhotoOpen(true)}
              className="inline-flex items-center gap-1.5 text-bisu-blue-600 dark:text-bisu-gold hover:underline font-bold transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{teacher.photo_url ? 'Edit Profile Photo' : 'Attach Profile Photo'}</span>
            </button>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-rose-500">
              <Heart className="w-4 h-4 fill-rose-500" />
              <span>Happy Teacher's Day!</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Submission Form on Left, Timeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Submission Form (5 columns) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <TimelineSubmissionForm
            teacherSlug={teacher.slug}
            teacherName={teacher.name}
            onMessageAdded={handleMessageAdded}
          />
        </div>

        {/* Chronological Timeline Entries (7 columns) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Timeline Header & Filter / Sort Controls */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Student & Peer Tributes</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-bisu-blue-100 dark:bg-bisu-blue-900/60 text-bisu-blue-700 dark:text-bisu-gold">
                    {displayedMessages.length} of {messages.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Browse, filter by media type, or sort tributes
                </p>
              </div>

              {/* Sort Selector Dropdown */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Sort:</span>
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-bisu-gold/50 cursor-pointer shadow-sm"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="photos_first">Photos first</option>
                  <option value="videos_first">Videos first</option>
                  <option value="messages_first">Messages (Text) first</option>
                </select>
              </div>
            </div>

            {/* Filter Tabs: All, Messages, Photos, Videos */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeFilter === 'all'
                    ? 'bg-bisu-blue-700 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>All Tributes</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {counts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('messages')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeFilter === 'messages'
                    ? 'bg-bisu-blue-700 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Messages Only</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeFilter === 'messages' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {counts.messages}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('photos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeFilter === 'photos'
                    ? 'bg-bisu-blue-700 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Photos Only</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeFilter === 'photos' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {counts.photos}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('videos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeFilter === 'videos'
                    ? 'bg-bisu-blue-700 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Videos Only</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeFilter === 'videos' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {counts.videos}
                </span>
              </button>
            </div>
          </div>

          {/* Timeline Entry List */}
          <TimelineEntryList messages={displayedMessages} activeFilter={activeFilter} />
        </div>
      </div>

      {/* Edit Teacher Photo Modal */}
      <EditTeacherPhotoModal
        isOpen={isEditPhotoOpen}
        onClose={() => setIsEditPhotoOpen(false)}
        teacher={teacher}
        onPhotoUpdated={handlePhotoUpdated}
      />
    </div>
  );
}

export default TeacherTimeline;
