import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { Heart, Sparkles } from 'lucide-react';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-8 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Bohol Island State University — Bilar Campus</span>
            <span>•</span>
            <span className="font-semibold text-bisu-gold">October 7, 2026</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Honoring our mentors with gratitude</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
