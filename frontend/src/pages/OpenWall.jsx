import React from 'react';
import WallCanvas from '../components/WallCanvas.jsx';
import { Sparkles, MousePointerClick } from 'lucide-react';

export function OpenWall() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col pt-4 sm:pt-6 pb-12">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bisu-gold/15 text-bisu-gold text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Campus Greeting Wall</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Community Greetings Wall
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore public greetings for our beloved faculty members. Drag cards to organize, pan, zoom, or post your tribute!
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <MousePointerClick className="w-4 h-4 text-bisu-blue-600 dark:text-bisu-gold" />
          <span>Click & drag cards to move • Scroll to zoom</span>
        </div>
      </div>

      {/* Interactive Infinite Canvas */}
      <div className="flex-1 w-full">
        <WallCanvas />
      </div>
    </div>
  );
}

export default OpenWall;
