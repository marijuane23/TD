import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import api, { API_BASE_URL, resolveMediaUrl } from '../api/client.js';
import TimelineEntryList from '../components/TimelineEntryList.jsx';
import TimelineSubmissionForm from '../components/TimelineSubmissionForm.jsx';
import EditTeacherPhotoModal from '../components/EditTeacherPhotoModal.jsx';
import KeepsakeExportModal from '../components/KeepsakeExportModal.jsx';
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
  QrCode,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

export function TeacherTimeline() {
  const { slug } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Profile picture modal state
  const [isEditPhotoOpen, setIsEditPhotoOpen] = useState(false);

  // QR Code States
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Bulk Keepsake Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Timeline filtering & sorting states
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'messages' | 'photos' | 'videos'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'photos_first' | 'videos_first' | 'messages_first'

  // Generate QR Code data URL whenever teacher slug is available
  useEffect(() => {
    if (!teacher?.slug) return;
    const timelineUrl = `${window.location.origin}/teachers/${teacher.slug}`;
    QRCode.toDataURL(timelineUrl, {
      width: 600,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [teacher?.slug]);

  // Generate a commemorative keepsake card on an offscreen canvas
  const generateKeepsakeCard = async (teacherObj, qrImgSrc) => {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        // Deep Navy / Midnight Gradient Background
        const bgGrad = ctx.createLinearGradient(0, 0, 800, 1000);
        bgGrad.addColorStop(0, '#060d1f');
        bgGrad.addColorStop(0.5, '#0b1633');
        bgGrad.addColorStop(1, '#070f24');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 800, 1000);

        // Gold outer border frame
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 4;
        ctx.strokeRect(24, 24, 752, 952);

        // Subtle inner border
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(34, 34, 732, 932);

        // Corner accents
        const cSize = 22;
        ctx.fillStyle = '#eab308';
        // TL
        ctx.fillRect(24, 24, cSize, 4);
        ctx.fillRect(24, 24, 4, cSize);
        // TR
        ctx.fillRect(800 - 24 - cSize, 24, cSize, 4);
        ctx.fillRect(800 - 24 - 4, 24, 4, cSize);
        // BL
        ctx.fillRect(24, 1000 - 24 - 4, cSize, 4);
        ctx.fillRect(24, 1000 - 24 - cSize, 4, cSize);
        // BR
        ctx.fillRect(800 - 24 - cSize, 1000 - 24 - 4, cSize, 4);
        ctx.fillRect(800 - 24 - 4, 1000 - 24 - cSize, 4, cSize);

        // University Header
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px "Segoe UI", Roboto, system-ui, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('BOHOL ISLAND STATE UNIVERSITY — BILAR CAMPUS', 400, 80);

        // Event Ribbon
        ctx.font = 'bold 15px "Segoe UI", Roboto, system-ui, sans-serif';
        ctx.fillStyle = '#eab308';
        ctx.fillText("TEACHER'S DAY CELEBRATION 2026", 400, 112);

        // Subtle divider
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(160, 135);
        ctx.lineTo(640, 135);
        ctx.stroke();

        // Teacher's Name
        ctx.fillStyle = '#ffffff';
        const name = teacherObj.name || 'Honored Teacher';
        if (name.length > 28) {
          ctx.font = 'bold 30px "Segoe UI", Roboto, system-ui, sans-serif';
        } else {
          ctx.font = 'bold 36px "Segoe UI", Roboto, system-ui, sans-serif';
        }
        ctx.fillText(name, 400, 190);

        // College & Department
        ctx.font = '600 17px "Segoe UI", Roboto, system-ui, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        let dept = '';
        if (teacherObj.college_name && teacherObj.department) {
          dept = `${teacherObj.college_name} • ${teacherObj.department}`;
        } else {
          dept = teacherObj.college_name || teacherObj.department || 'Faculty Mentor';
        }
        ctx.fillText(dept, 400, 224);

        // Load QR Code Image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // White card background for high-contrast QR
          const qrBoxSize = 510;
          const qrBoxX = (800 - qrBoxSize) / 2;
          const qrBoxY = 260;
          const radius = 24;

          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 24;
          ctx.shadowOffsetY = 10;

          // Draw rounded rect
          ctx.beginPath();
          ctx.moveTo(qrBoxX + radius, qrBoxY);
          ctx.lineTo(qrBoxX + qrBoxSize - radius, qrBoxY);
          ctx.quadraticCurveTo(qrBoxX + qrBoxSize, qrBoxY, qrBoxX + qrBoxSize, qrBoxY + radius);
          ctx.lineTo(qrBoxX + qrBoxSize, qrBoxY + qrBoxSize - radius);
          ctx.quadraticCurveTo(qrBoxX + qrBoxSize, qrBoxY + qrBoxSize, qrBoxX + qrBoxSize - radius, qrBoxY + qrBoxSize);
          ctx.lineTo(qrBoxX + radius, qrBoxY + qrBoxSize);
          ctx.quadraticCurveTo(qrBoxX, qrBoxY + qrBoxSize, qrBoxX, qrBoxY + qrBoxSize - radius);
          ctx.lineTo(qrBoxX, qrBoxY + radius);
          ctx.quadraticCurveTo(qrBoxX, qrBoxY, qrBoxX + radius, qrBoxY);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // Draw QR Image
          const pad = 24;
          ctx.drawImage(img, qrBoxX + pad, qrBoxY + pad, qrBoxSize - pad * 2, qrBoxSize - pad * 2);

          // Prompt text
          ctx.font = 'bold 22px "Segoe UI", Roboto, system-ui, sans-serif';
          ctx.fillStyle = '#fbbf24';
          ctx.fillText('Scan with camera to view your timeline tributes', 400, 830);

          ctx.font = '15px "Segoe UI", Roboto, system-ui, sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('Expressing our deepest gratitude for inspiring and mentoring us.', 400, 865);

          // Footer
          ctx.font = '600 13px "Segoe UI", Roboto, system-ui, sans-serif';
          ctx.fillStyle = '#64748b';
          ctx.fillText('Honoring our mentors with gratitude • Computing Society x SaPaSu', 400, 940);

          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = qrImgSrc;
      } catch (err) {
        console.error('Error drawing keepsake card:', err);
        resolve(null);
      }
    });
  };

  const handleDownloadQr = async (pureQrOnly = false) => {
    if (!qrDataUrl || !teacher) return;
    setIsDownloading(true);
    try {
      const cleanName = (teacher.name || 'Teacher').replace(/[^a-zA-Z0-9_-]/g, '_');
      let finalDataUrl = qrDataUrl;
      let filename = `${cleanName}_Timeline_QR.png`;

      if (!pureQrOnly) {
        const keepsakeUrl = await generateKeepsakeCard(teacher, qrDataUrl);
        if (keepsakeUrl) {
          finalDataUrl = keepsakeUrl;
          filename = `${cleanName}_Timeline_Keepsake_QR.png`;
        }
      }

      const link = document.createElement('a');
      link.download = filename;
      link.href = finalDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download QR failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    if (!teacher?.slug) return;
    const url = `${window.location.origin}/teachers/${teacher.slug}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

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
        resolveMediaUrl(newMessage.media_url) ||
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
      <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-center justify-between gap-6 relative overflow-hidden border border-slate-300/60 dark:border-slate-700/60">
        {/* Left Side: Teacher Photo & Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1 min-w-0 w-full">
          {/* Interactive Avatar with Edit/Add Photo Button */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-bisu-blue-800 to-bisu-blue-600 text-bisu-gold flex items-center justify-center text-3xl font-black border-2 border-bisu-gold/60 shadow-lg overflow-hidden relative">
              {teacher.photo_url ? (
                <img
                  src={resolveMediaUrl(teacher.photo_url)}
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

          <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words">
                {teacher.name}
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-bisu-gold/20 text-bisu-gold border border-bisu-gold/30 shrink-0">
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
                className="inline-flex items-center gap-1.5 text-bisu-blue-600 dark:text-bisu-gold hover:underline font-bold transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{teacher.photo_url ? 'Edit Profile Photo' : 'Attach Profile Photo'}</span>
              </button>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <Heart className="w-4 h-4 fill-rose-500" />
                <span>Happy Teacher's Day!</span>
              </span>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-bisu-blue-100 dark:bg-bisu-blue-900/40 text-bisu-blue-700 dark:text-bisu-gold hover:bg-bisu-blue-200 dark:hover:bg-bisu-blue-800/60 font-bold transition-all border border-bisu-blue-200 dark:border-bisu-blue-800 cursor-pointer shadow-sm hover:scale-[1.02]"
                title="Export all messages and photos as a single PDF album or collage keepsake"
              >
                <Sparkles className="w-3.5 h-3.5 text-bisu-gold" />
                <span>Export Keepsake (PDF / Collage)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Downloadable QR Code Card */}
        <div className="shrink-0 flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl border border-slate-300/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-sm w-full md:w-auto text-center mt-2 md:mt-0 transition-all hover:border-bisu-gold/40">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
            <QrCode className="w-3.5 h-3.5 text-bisu-gold" />
            <span>Timeline QR Code</span>
          </div>

          <div
            onClick={() => setIsQrModalOpen(true)}
            className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 cursor-pointer relative group/qr transition-transform hover:scale-105"
            title="Click to expand QR Code"
          >
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code for ${teacher.name}'s timeline`}
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center bg-slate-100 rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-bisu-blue-900/70 rounded-xl opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold backdrop-blur-[1px]">
              <span>Click to view</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleDownloadQr(false)}
            disabled={!qrDataUrl || isDownloading}
            className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-bisu-gold hover:bg-yellow-400 active:scale-95 text-slate-950 text-xs font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Download QR code as PNG"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Download PNG</span>
          </button>

          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Scan to view timeline
          </span>
        </div>
      </div>

      {/* Main Grid: Sticky Submission Form on Left, Scrollable Tributes on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Submission Form (5 columns) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto custom-scrollbar">
          <TimelineSubmissionForm
            teacherSlug={teacher.slug}
            teacherName={teacher.name}
            onMessageAdded={handleMessageAdded}
          />
        </div>

        {/* Student & Peer Tributes (7 columns) - Dedicated Outlined Container with Scrollable Tributes */}
        <div className="lg:col-span-7 flex flex-col glass-card rounded-2xl border border-slate-300/60 dark:border-slate-700/60 p-4 sm:p-6 lg:sticky lg:top-20 self-start lg:max-h-[calc(100vh-6rem)]">
          {/* Timeline Header & Filter / Sort Controls */}
          <div className="space-y-4 pb-4 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

              {/* Actions & Sort Selector */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bisu-blue-700 hover:bg-bisu-blue-800 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
                  title="Bulk download all tributes as PDF album or photo collage"
                >
                  <Download className="w-3.5 h-3.5 text-bisu-gold" />
                  <span>Export Keepsake</span>
                </button>

                <div className="flex items-center gap-1.5">
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

          {/* Scrollable Timeline Entries */}
          <div className="overflow-y-auto pr-1 sm:pr-2 pt-4 flex-1 space-y-4 custom-scrollbar min-h-[300px]">
            <TimelineEntryList messages={displayedMessages} activeFilter={activeFilter} />
          </div>
        </div>
      </div>

      {/* Edit Teacher Photo Modal */}
      <EditTeacherPhotoModal
        isOpen={isEditPhotoOpen}
        onClose={() => setIsEditPhotoOpen(false)}
        teacher={teacher}
        onPhotoUpdated={handlePhotoUpdated}
      />

      {/* Expanded QR Code Modal */}
      {isQrModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsQrModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-md glass-card rounded-3xl p-6 sm:p-7 border border-slate-300/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 shadow-2xl space-y-5 text-center">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-bisu-gold/20 text-bisu-gold border border-bisu-gold/30 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Special Keepsake QR</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {teacher.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Scan with any smartphone camera to view and scroll this teacher's tribute timeline!
              </p>
            </div>

            {/* High-Contrast QR Display */}
            <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-200 inline-block mx-auto">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${teacher.name}`}
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
                />
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-bisu-gold" />
                </div>
              )}
            </div>

            {/* Link Preview & Copy */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 text-xs">
              <span className="flex-1 truncate text-left text-slate-600 dark:text-slate-300 font-mono text-[11px] px-2">
                {`${window.location.origin}/teachers/${teacher.slug}`}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm transition-all cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Download Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleDownloadQr(false)}
                disabled={!qrDataUrl || isDownloading}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-bisu-gold hover:bg-yellow-400 active:scale-98 text-slate-950 text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Download Commemorative Card (PNG)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadQr(true)}
                disabled={!qrDataUrl || isDownloading}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Download QR Only (PNG)</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
              Share this QR code with {teacher.name} so they can scan and celebrate their special day!
            </p>
          </div>
        </div>
      )}

      {/* Bulk Keepsake Export Modal (PDF Album & Image Collage) */}
      <KeepsakeExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        teacher={teacher}
        messages={messages}
      />
    </div>
  );
}

export default TeacherTimeline;
