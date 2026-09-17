import React, { useState, useRef } from 'react';
import api from '../api/client.js';
import { validateMediaFile } from '../utils/mediaValidators.js';
import confetti from 'canvas-confetti';
import { Send, UploadCloud, X, Film, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';

export function TimelineSubmissionForm({ teacherSlug, teacherName, onMessageAdded }) {
  const [senderName, setSenderName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [honeypot, setHoneypot] = useState('');

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef(null);
  const successTimerRef = useRef(null);

  React.useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setError(null);
    try {
      // Validate 50MB and strictly 20s-120s for video
      const validation = await validateMediaFile(selected);
      setFile(selected);
      setFileType(validation.type);

      if (validation.type === 'image') {
        const previewUrl = URL.createObjectURL(selected);
        setFilePreview(previewUrl);
      } else {
        setFilePreview(null);
      }
    } catch (err) {
      setError(err.message);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFile(null);
      setFilePreview(null);
      setFileType(null);
    }
  };

  const removeFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(null);
    setFilePreview(null);
    setFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) {
      setError('Please enter your message.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('sender_name', senderName.trim() || 'Anonymous');
      formData.append('message_text', messageText.trim());
      if (honeypot) formData.append('website', honeypot);
      if (file) formData.append('media', file);

      const res = await api.submitMessage(teacherSlug, formData, (percent) => {
        setProgress(percent);
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
      });

      setSuccessMsg('Thank you! Your tribute is now live on the timeline.');
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => {
        setSuccessMsg('');
      }, 3000);

      setMessageText('');
      setSenderName('');
      removeFile();

      if (res.data && onMessageAdded) {
        onMessageAdded(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit tribute.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        Post a Tribute for {teacherName}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        Express your gratitude with a message, photo, or short video clip (20–120s, up to 50MB). Posts appear immediately!
      </p>

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot for spam bots */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          style={{ display: 'none' }}
          tabIndex="-1"
          autoComplete="off"
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Your Name (Optional)
          </label>
          <input
            type="text"
            placeholder="Anonymous (or your name & section)"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            disabled={uploading}
            maxLength={100}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-bisu-gold/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Your Message *
          </label>
          <textarea
            rows={4}
            required
            placeholder="Write your personal tribute, thanks, or favorite memory..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={uploading}
            maxLength={5000}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-bisu-gold/50 resize-none"
          />
          <div className="flex justify-end text-[11px] text-slate-400 mt-1">
            {messageText.length} / 5,000 characters
          </div>
        </div>

        {/* Media Upload Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Attach Photo or Video (Optional, max 50MB)
          </label>

          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-bisu-gold/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/30"
            >
              <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Click to browse or drop photo / short video
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Images: JPG, PNG, WEBP (up to 50MB) • Videos: MP4, WEBM (20s–120s, up to 50MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3 overflow-hidden">
                {fileType === 'video' ? (
                  <div className="w-10 h-10 rounded-lg bg-bisu-blue-100 dark:bg-bisu-blue-900/60 text-bisu-blue-700 dark:text-bisu-gold flex items-center justify-center shrink-0">
                    <Film className="w-5 h-5" />
                  </div>
                ) : filePreview ? (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {fileType?.toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={removeFile}
                disabled={uploading}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>Uploading tribute...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-bisu-blue-600 to-bisu-gold transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-bisu-blue-700 hover:bg-bisu-blue-800 shadow-md shadow-bisu-blue/25 hover:shadow-lg disabled:opacity-50 transition-all"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{uploading ? 'Posting Tribute...' : 'Post Tribute'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default TimelineSubmissionForm;
