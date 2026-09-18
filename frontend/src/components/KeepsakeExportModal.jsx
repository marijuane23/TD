import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileText,
  Image as ImageIcon,
  Download,
  Loader2,
  Heart,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  VideoOff,
  Sparkles,
} from 'lucide-react';
import { renderCollage, COLLAGE_TEMPLATES } from '../utils/collageGenerator.js';
import { generateKeepsakePdf } from '../utils/pdfGenerator.js';

export function KeepsakeExportModal({ isOpen, onClose, teacher, messages = [] }) {
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' | 'collage'
  const [selectedTemplate, setSelectedTemplate] = useState('template3'); // 'template3' (Heart) | 'template2' (Cluster)

  // Loading & Progress states
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState({ percent: 0, status: '' });

  const [isGeneratingCollage, setIsGeneratingCollage] = useState(false);
  const [collagePreviewUrl, setCollagePreviewUrl] = useState('');
  const [isRenderingPreview, setIsRenderingPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Extract ONLY posted images from the teacher's timeline (excluding teacher's portrait)
  const timelinePhotos = useMemo(() => {
    return messages
      .filter((m) => {
        const isImage = m.media_type === 'image' || (m.media_mime && m.media_mime.startsWith('image/'));
        return isImage && m.media_url;
      })
      .map((m) => m.media_url);
  }, [messages]);

  // Video count (excluded from static keepsake)
  const videoCount = useMemo(() => {
    return messages.filter(
      (m) => m.media_type === 'video' || (m.media_mime && m.media_mime.startsWith('video/'))
    ).length;
  }, [messages]);

  // Render collage preview whenever template changes or tab is switched to collage
  useEffect(() => {
    if (!isOpen || activeTab !== 'collage' || timelinePhotos.length === 0) return;

    let isMounted = true;
    setIsRenderingPreview(true);
    setErrorMsg(null);

    renderCollage({
      templateId: selectedTemplate,
      photoUrls: timelinePhotos,
      teacherName: teacher?.name || '',
      collegeName: teacher?.college_name || teacher?.department || '',
      includeBanner: true,
      theme: 'light',
    })
      .then(({ dataUrl }) => {
        if (isMounted) {
          setCollagePreviewUrl(dataUrl);
          setIsRenderingPreview(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Collage preview render error:', err);
          setErrorMsg(err.message || 'Failed to render collage preview.');
          setIsRenderingPreview(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeTab, selectedTemplate, timelinePhotos, teacher]);

  if (!isOpen) return null;

  // Handle PDF Download
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setErrorMsg(null);
    setPdfProgress({ percent: 0, status: 'Initializing PDF export...' });

    try {
      await generateKeepsakePdf({
        teacher,
        messages,
        onProgress: ({ percent, status }) => {
          setPdfProgress({ percent, status });
        },
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      setErrorMsg(err.message || 'Failed to generate PDF keepsake album.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle Collage Download
  const handleDownloadCollage = async () => {
    if (timelinePhotos.length === 0) return;
    setIsGeneratingCollage(true);
    setErrorMsg(null);

    try {
      const { dataUrl } = await renderCollage({
        templateId: selectedTemplate,
        photoUrls: timelinePhotos,
        teacherName: teacher?.name || '',
        collegeName: teacher?.college_name || teacher?.department || '',
        includeBanner: true,
        theme: 'light',
      });

      const cleanName = (teacher?.name || 'Teacher').replace(/[^a-zA-Z0-9_-]/g, '_');
      const templateName = selectedTemplate === 'template3' ? 'Heart_Collage' : 'Cluster_Collage';
      const filename = `${cleanName}_${templateName}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Collage export error:', err);
      setErrorMsg(err.message || 'Failed to download collage.');
    } finally {
      setIsGeneratingCollage(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl glass-card rounded-3xl border border-slate-300/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-bisu-gold/20 text-bisu-gold border border-bisu-gold/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bulk Keepsake Export</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Export Keepsake for {teacher?.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Download all tributes and memories as a single keepsake album or photo collage
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Summary Banner */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-bisu-blue-600 dark:text-bisu-gold" />
              <strong className="text-slate-900 dark:text-white">{messages.length}</strong> Tributes
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <strong className="text-slate-900 dark:text-white">{timelinePhotos.length}</strong> Photos
            </span>
          </div>

          {videoCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              <VideoOff className="w-3 h-3 text-amber-500" />
              <span>{videoCount} video(s) excluded from static keepsake</span>
            </span>
          )}
        </div>

        {/* Format Selector Tabs */}
        <div className="p-5 sm:p-6 pb-2 shrink-0">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('pdf')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'pdf'
                  ? 'bg-bisu-blue-700 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>PDF Keepsake Album</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('collage')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'collage'
                  ? 'bg-bisu-blue-700 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Photo Collage (.PNG)</span>
            </button>
          </div>
        </div>

        {/* Tab Body: Scrollable */}
        <div className="px-5 sm:px-6 py-3 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: PDF TRIBUTE ALBUM */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-bisu-blue-100 dark:bg-bisu-blue-900/40 text-bisu-blue-700 dark:text-bisu-gold flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Commemorative Tribute Album
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Standard A4 portrait document ready to print, bind, or read on mobile and desktop
                    </p>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Branded BISU Bilar cover page with teacher profile, title, and ceremony details</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Formatted tribute cards with student names, timestamps, and full written messages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>High-resolution embedded tribute photos placed alongside their dedicated messages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Automatic pagination with clean page breaks and running university header</span>
                  </li>
                </ul>
              </div>

              {/* Progress Bar (during PDF export) */}
              {isGeneratingPdf && (
                <div className="space-y-2 p-4 rounded-2xl bg-bisu-blue-50 dark:bg-bisu-blue-950/40 border border-bisu-blue-200 dark:border-bisu-blue-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-bisu-blue-800 dark:text-bisu-gold">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{pdfProgress.status || 'Generating PDF album...'}</span>
                    </span>
                    <span>{pdfProgress.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-bisu-blue-600 to-bisu-gold transition-all duration-300"
                      style={{ width: `${pdfProgress.percent}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf || messages.length === 0}
                className="w-full py-3 px-4 rounded-2xl bg-bisu-gold hover:bg-yellow-400 active:scale-[0.99] text-slate-950 text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>
                  {isGeneratingPdf ? 'Compiling PDF Album...' : 'Download PDF Keepsake Album (.pdf)'}
                </span>
              </button>
            </div>
          )}

          {/* TAB 2: PHOTO COLLAGE */}
          {activeTab === 'collage' && (
            <div className="space-y-4">
              {timelinePhotos.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-center space-y-3">
                  <ImageIcon className="w-12 h-12 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No Timeline Photos Yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Students haven't uploaded any photos to this teacher's timeline yet. Once photos are posted, you can generate a heart or mosaic collage keepsake here!
                  </p>
                </div>
              ) : (
                <>
                  {/* Template Switcher Cards */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Choose Collage Layout:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Template 3: Heart Shape */}
                      <button
                        type="button"
                        onClick={() => setSelectedTemplate('template3')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          selectedTemplate === 'template3'
                            ? 'border-bisu-gold bg-bisu-gold/10 dark:bg-bisu-gold/15 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            selectedTemplate === 'template3'
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <Heart className="w-5 h-5 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                            Heart Shape Keepsake
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            29 slots • Heartfelt Heart Mosaic
                          </p>
                        </div>
                      </button>

                      {/* Template 2: Dynamic Cluster */}
                      <button
                        type="button"
                        onClick={() => setSelectedTemplate('template2')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          selectedTemplate === 'template2'
                            ? 'border-bisu-gold bg-bisu-gold/10 dark:bg-bisu-gold/15 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            selectedTemplate === 'template2'
                              ? 'bg-bisu-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <LayoutGrid className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                            Dynamic Cluster (16:9)
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            25 slots • Modern Widescreen Mosaic
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Collage Live Preview Container */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Collage Preview:
                      </span>
                      <span>
                        Using {timelinePhotos.length} unique photo(s){' '}
                        {timelinePhotos.length < (COLLAGE_TEMPLATES[selectedTemplate]?.slots.length || 25)
                          ? '(cycled to fill all slots)'
                          : ''}
                      </span>
                    </div>

                    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden p-2">
                      {isRenderingPreview ? (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Loader2 className="w-8 h-8 animate-spin text-bisu-gold" />
                          <span className="text-xs font-semibold">Composing collage layout...</span>
                        </div>
                      ) : collagePreviewUrl ? (
                        <img
                          src={collagePreviewUrl}
                          alt="Collage Keepsake Preview"
                          className="max-w-full max-h-full object-contain rounded-xl shadow-lg transition-transform duration-300 hover:scale-[1.01]"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">Preview will appear here</span>
                      )}
                    </div>
                  </div>

                  {/* Download Collage Button */}
                  <button
                    type="button"
                    onClick={handleDownloadCollage}
                    disabled={isGeneratingCollage || isRenderingPreview || timelinePhotos.length === 0}
                    className="w-full py-3 px-4 rounded-2xl bg-bisu-gold hover:bg-yellow-400 active:scale-[0.99] text-slate-950 text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingCollage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>
                      {isGeneratingCollage
                        ? 'Exporting High-Res PNG...'
                        : `Download ${
                            selectedTemplate === 'template3' ? 'Heart Collage' : 'Cluster Collage'
                          } (.png)`}
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <span>Honoring our mentors with gratitude • Bohol Island State University (Bilar Campus)</span>
        </div>
      </div>
    </div>
  );
}

export default KeepsakeExportModal;
