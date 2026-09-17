import React, { useState } from 'react';
import api from '../api/client.js';
import ConfirmDialog from './ConfirmDialog.jsx';
import { Trash2, X, Film, Image as ImageIcon, User, Calendar, AlertCircle, MessageSquare, ShieldAlert } from 'lucide-react';

export function AdminTimelineEntryList({ teacher, messages = [], onMessageDeleted, onMediaDeleted }) {
  const [activeDialog, setActiveDialog] = useState(null); // { type: 'message'|'media', id: number, messageId?: number }
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirmDelete = async () => {
    if (!activeDialog) return;
    setActionLoading(true);
    setError(null);

    try {
      if (activeDialog.type === 'message') {
        await api.deleteAdminMessage(activeDialog.id);
        onMessageDeleted(activeDialog.id);
      } else if (activeDialog.type === 'media') {
        await api.deleteAdminMedia(activeDialog.id);
        onMediaDeleted(activeDialog.messageId);
      }
      setActiveDialog(null);
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Messages Posted Yet</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          No tribute greetings have been submitted for {teacher.name} yet. When students or alumni post, they will appear here live.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Balanced Responsive Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {messages.map((item) => {
          const formattedDate = item.created_at
            ? new Date(item.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Oct 7, 2026';

          const hasMedia = !!(item.media_id && item.media_url);

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between h-full rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* Card Top Section: Header & Text */}
              <div className="p-5 space-y-3 flex-grow flex flex-col">
                {/* Header Row */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                        {item.sender_name || 'Anonymous'}
                      </div>
                      <span className="text-[10px] text-slate-400">ID #{item.id}</span>
                    </div>
                  </div>

                  {/* Delete Entire Message Action */}
                  <button
                    onClick={() => setActiveDialog({ type: 'message', id: item.id })}
                    disabled={actionLoading}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors"
                    title="Delete whole tribute"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>

                {/* Message Body Content - Centered */}
                <div className="flex-grow flex items-center justify-center py-4 px-2 text-center">
                  <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap break-words text-center">
                    {item.message_text}
                  </p>
                </div>

                {/* Attached Media Box with Remove Media Overlay Button */}
                {hasMedia && (
                  <div className="relative mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 aspect-video flex items-center justify-center">
                    {item.media_type === 'video' ? (
                      <video
                        controls
                        playsInline
                        src={item.media_url}
                        className="w-full h-full object-contain bg-black"
                      />
                    ) : (
                      <img
                        src={item.media_url}
                        alt="Tribute Attachment"
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Floating Remove Media Only Button */}
                    <button
                      onClick={() =>
                        setActiveDialog({
                          type: 'media',
                          id: item.media_id,
                          messageId: item.id,
                        })
                      }
                      disabled={actionLoading}
                      className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/90 hover:bg-red-700 text-white text-[11px] font-bold shadow-lg backdrop-blur-sm transition-all"
                      title="Remove only this photo/video while keeping message text"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Card Footer: Metadata info */}
              <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{formattedDate}</span>
                </span>

                {hasMedia ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-bisu-blue-50 dark:bg-bisu-blue-950/60 text-bisu-blue-700 dark:text-bisu-blue-300 font-semibold text-[10px]">
                    {item.media_type === 'video' ? (
                      <>
                        <Film className="w-3 h-3 text-bisu-blue-600" />
                        <span>Video</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3 h-3 text-bisu-blue-600" />
                        <span>Photo</span>
                      </>
                    )}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">Text Tribute</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!activeDialog}
        title={activeDialog?.type === 'message' ? 'Delete Message?' : 'Remove Attached Media?'}
        message={
          activeDialog?.type === 'message'
            ? `Are you sure you want to delete this message from ${teacher.name}'s timeline? Any attached photo/video will also be removed permanently.`
            : 'Are you sure you want to remove this photo/video attachment? The message text will remain safely on the timeline.'
        }
        confirmText={activeDialog?.type === 'message' ? 'Delete Message' : 'Remove Media'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setActiveDialog(null)}
      />
    </div>
  );
}

export default AdminTimelineEntryList;
