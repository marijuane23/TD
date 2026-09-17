import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import CelebrationBackground from '../components/CelebrationBackground.jsx';
import ConfettiCanvas from '../components/ConfettiCanvas.jsx';
import { Heart } from 'lucide-react';

export function PublicLayout() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden selection:bg-celebrate-gold/30 selection:text-celebrate-gold">
      {/* Fixed celebration background: 4 drifting sine blobs, SVG noise, ambient glowing particles */}
      <CelebrationBackground />

      {/* Global canvas confetti layer: load 3-point burst, click-to-burst, header button bursts */}
      <ConfettiCanvas />

      {/* Navigation Header */}
      <Header />

      {/* Main Content View */}
      <main className="relative z-10 flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Frosted Glass Footer */}
      <footer className="relative z-10 frosted-footer py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center flex-wrap justify-center sm:justify-start gap-2">
            <span>Bohol Island State University — Bilar Campus</span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="font-bold text-celebrate-gold">October 7, 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Honoring our mentors with gratitude</span>
            <Heart className="w-4 h-4 text-celebrate-rose fill-celebrate-rose heartbeat-icon" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
