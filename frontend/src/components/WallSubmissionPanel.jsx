import React, { useState } from 'react';
import api from '../api/client.js';
import confetti from 'canvas-confetti';
import { Plus, Send, X, Sparkles, AlertCircle } from 'lucide-react';

export function WallSubmissionPanel({ onGreetingSubmitted }) {
  const [isOpen, setIsOpen] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) {
      setError('Please write a greeting message.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.postWallGreeting({
        sender_name: senderName.trim() || 'Anonymous',
        message_text: messageText.trim(),
        website: websiteHoneypot,
      });

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8">
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Your greeting appears immediately on the interactive map for everyone to see!
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
                  rows={4}
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
