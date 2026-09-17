import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import CelebrationBackground from '../components/CelebrationBackground.jsx';
import ConfettiCanvas from '../components/ConfettiCanvas.jsx';
import { Heart } from 'lucide-react';

export function PublicLayout() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-clip selection:bg-celebrate-gold/30 selection:text-celebrate-gold">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:grid md:grid-cols-3 items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          {/* Left: Computing Society x SaPaSu */}
          <div className="text-center md:text-left font-semibold text-slate-700 dark:text-slate-300">
            Computing Society x SaPaSu
          </div>

          {/* Center: Bohol Island State University — Bilar Campus */}
          <div className="text-center">
            Bohol Island State University — Bilar Campus
          </div>

          {/* Right: Honoring our mentors with gratitude */}
          <div className="flex items-center justify-center md:justify-end gap-2 text-center md:text-right">
            <span>Honoring our mentors with gratitude</span>
            <Heart className="w-4 h-4 text-celebrate-rose fill-celebrate-rose heartbeat-icon shrink-0" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
