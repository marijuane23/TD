import React from 'react';
import WallCanvas from '../components/WallCanvas.jsx';
import { Sparkles, MousePointerClick } from 'lucide-react';

export function OpenWall() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col pt-6 sm:pt-8 pb-10">
      {/* Centered & Balanced Header */}
      <div className="text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-bisu-gold/15 text-bisu-gold text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Campus Greeting Wall</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Community Greetings Wall
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Explore public greetings for our beloved faculty members. Drag cards to organize, pan, zoom, or post your tribute!
        </p>
        <div className="pt-1 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <MousePointerClick className="w-3.5 h-3.5 text-bisu-blue-600 dark:text-bisu-gold" />
            <span>Drag to rotate sphere • Tap card to highlight • Use + / − to zoom</span>
          </div>
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
