import React, { useState } from 'react';
import TimelineMediaActions from './TimelineMediaActions.jsx';
import { User, Calendar, MessageSquare, Play, X } from 'lucide-react';
import { resolveMediaUrl } from '../api/client.js';

export function TimelineEntryList({ messages = [], activeFilter = 'all' }) {
  const [lightboxImage, setLightboxImage] = useState(null);

  if (!messages || messages.length === 0) {
    let emptyTitle = 'No tributes posted yet';
    let emptyDesc = 'Be the first student or colleague to write a heartfelt message, upload a picture, or post a video tribute!';

    if (activeFilter === 'photos') {
      emptyTitle = 'No photo tributes found';
      emptyDesc = 'There are no tributes with attached photos yet. Post one using the form on the left!';
    } else if (activeFilter === 'videos') {
      emptyTitle = 'No video tributes found';
      emptyDesc = 'There are no tributes with short video clips yet. Post a 20s–120s video tribute!';
    } else if (activeFilter === 'messages') {
      emptyTitle = 'No text tributes found';
      emptyDesc = 'There are no text-only tributes yet under this filter.';
    }

    return (
      <div className="glass-card rounded-2xl p-12 text-center border border-slate-300/60 dark:border-slate-700/60">
        <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
          {emptyTitle}
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {emptyDesc}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((item) => {
        const dateStr = item.created_at
          ? new Date(item.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '';

        return (
          <article
            key={item.id}
            className="glass-card rounded-2xl p-5 sm:p-6 transition-all hover:shadow-lg space-y-4 border border-slate-300/60 dark:border-slate-700/60"
          >
            {/* Header: Sender & Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-bisu-blue-100 dark:bg-bisu-blue-900/60 text-bisu-blue-700 dark:text-bisu-gold flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.sender_name || 'Anonymous Student'}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{dateStr}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Message Body */}
            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
              {item.message_text}
            </p>

            {/* Attached Media */}
            {item.media_id && item.media_url && (
              <div className="rounded-xl overflow-hidden bg-slate-950/5 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
                {item.media_type === 'video' ? (
                  <div className="relative aspect-video max-h-[420px] w-full bg-black">
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      src={resolveMediaUrl(item.media_url)}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => setLightboxImage(resolveMediaUrl(item.media_url))}
                    className="relative cursor-pointer group overflow-hidden max-h-[420px] flex items-center justify-center bg-slate-100 dark:bg-slate-950"
                  >
                    <img
                      src={resolveMediaUrl(item.media_url)}
                      alt="Tribute attachment"
                      loading="lazy"
                      className="max-h-[420px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold backdrop-blur-[2px]">
                      Click to expand photo
                    </div>
                  </div>
                )}

                {/* Download & Share Actions */}
                <div className="p-3 bg-white/70 dark:bg-slate-900/70">
                  <TimelineMediaActions mediaId={item.media_id} />
                </div>
              </div>
            )}
          </article>
        );
      })}

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Expanded tribute"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

export default TimelineEntryList;
