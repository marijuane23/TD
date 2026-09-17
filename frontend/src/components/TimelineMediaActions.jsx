import React from 'react';
import { API_BASE_URL } from '../api/client.js';
import { Download, Share2 } from 'lucide-react';

export function TimelineMediaActions({ mediaId }) {
  if (!mediaId) return null;

  const downloadUrl = `${API_BASE_URL}/media/${mediaId}?download=1`;
  const shareBridgeUrl = `${API_BASE_URL}/share/media/${mediaId}`;

  const handleFacebookShare = (e) => {
    e.preventDefault();
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareBridgeUrl)}`;
    window.open(fbUrl, 'fbShareWindow', 'height=500,width=650,top=150,left=150,toolbar=no,menubar=no');
  };

  return (
    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
      {/* Download Button */}
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        download
        aria-label="Download media"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-bisu-blue-50 dark:hover:bg-bisu-blue-950/60 hover:text-bisu-blue-700 dark:hover:text-bisu-gold transition-colors focus:outline-none focus:ring-2 focus:ring-bisu-gold/50"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Download</span>
      </a>

      {/* Share to Facebook Button */}
      <button
        type="button"
        onClick={handleFacebookShare}
        aria-label="Share to Facebook"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1877F2] hover:bg-[#166fe5] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>Share to Facebook</span>
      </button>
    </div>
  );
}

export default TimelineMediaActions;
