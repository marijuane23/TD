import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import GreetingAnimation from '../components/GreetingAnimation.jsx';
import WallCanvas from '../components/WallCanvas.jsx';
import { Sparkles, MapPin, MousePointerClick } from 'lucide-react';

export function Home() {
  const wallSectionRef = useRef(null);
  const location = useLocation();

  const scrollToWall = () => {
    wallSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (location.hash === '#public-wall' || window.location.hash === '#public-wall') {
      const timer = setTimeout(() => {
        wallSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Animated Hero Section */}
      <GreetingAnimation onScrollToWall={scrollToWall} />

      {/* Public Wall Interactive Section */}
      <section ref={wallSectionRef} id="public-wall" className="pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bisu-gold/15 text-bisu-gold text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Campus Greeting Wall</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Community Greetings Map
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Click and drag (or single-finger touch) to pan. Scroll or pinch to zoom.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MousePointerClick className="w-4 h-4 text-bisu-blue-600 dark:text-bisu-blue-400" />
            <span>Drag anywhere to explore greetings</span>
          </div>
        </div>

        {/* Pan/Zoom Canvas */}
        <WallCanvas />
      </section>
    </div>
  );
}

export default Home;
