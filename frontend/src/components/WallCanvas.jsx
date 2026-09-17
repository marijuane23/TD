import React, { useState, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import api from '../api/client.js';
import WallCard from './WallCard.jsx';
import WallSubmissionPanel from './WallSubmissionPanel.jsx';
import { ZoomIn, ZoomOut, RotateCcw, Move, Loader2, Sparkles } from 'lucide-react';

const CANVAS_WIDTH = 4200;
const CANVAS_HEIGHT = 3000;

export function WallCanvas() {
  const [greetings, setGreetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const containerRef = useRef(null);
  const transformRef = useRef(null);

  // Dynamic scale limits based on container dimensions
  const [scaleBounds, setScaleBounds] = useState({ min: 0.35, initial: 0.85 });

  useEffect(() => {
    const calcScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      // Fit or cover so zooming all the way out never leaves an empty box
      const cover = Math.max(clientWidth / CANVAS_WIDTH, clientHeight / CANVAS_HEIGHT);
      const min = Math.max(0.25, Math.min(0.9, Number(cover.toFixed(2))));
      setScaleBounds({
        min,
        initial: Math.max(min, 0.85),
      });
    };

    calcScale();
    window.addEventListener('resize', calcScale);
    return () => window.removeEventListener('resize', calcScale);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchGreetings();
  }, []);

  const fetchGreetings = async () => {
    setLoading(true);
    try {
      const res = await api.getWallGreetings({ limit: 50 });
      setGreetings(res.items || []);
      setNextCursor(res.nextCursor);
    } catch (err) {
      console.error('Failed to load wall greetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreGreetings = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await api.getWallGreetings({ after_id: nextCursor, limit: 30 });
      if (res.items && res.items.length > 0) {
        setGreetings(prev => [...prev, ...res.items]);
        setNextCursor(res.nextCursor);
      } else {
        setNextCursor(null);
      }
    } catch (err) {
      console.error('Failed to load more greetings:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleGreetingSubmitted = (newGreeting) => {
    setGreetings(prev => [newGreeting, ...prev]);
  };

  // Shared infinite dotted grid style
  const dotGridStyle = {
    backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.28) 1.5px, transparent 1.5px)',
    backgroundSize: '28px 28px',
  };

  return (
    <div
      ref={containerRef}
      style={dotGridStyle}
      className="relative w-full h-[560px] sm:h-[680px] lg:h-[780px] bg-slate-900 dark:bg-slate-950 border-y border-slate-800 overflow-hidden select-none"
    >
      {/* Canvas Top Bar HUD */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-lg text-xs font-semibold text-slate-200">
          <Move className="w-3.5 h-3.5 text-bisu-gold" />
          <span className="hidden sm:inline">Infinite Public Wall ({greetings.length} greetings • Drag greetings to move)</span>
          <span className="sm:hidden font-bold">Wall ({greetings.length}) • Drag to move</span>
        </div>
      </div>

      {/* Floating Canvas Controls HUD */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-lg">
        <button
          onClick={() => transformRef.current?.zoomIn()}
          aria-label="Zoom in"
          className="p-1.5 sm:p-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-bisu-gold transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => transformRef.current?.zoomOut()}
          aria-label="Zoom out"
          className="p-1.5 sm:p-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-bisu-gold transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => transformRef.current?.resetTransform()}
          aria-label="Reset view"
          className="p-1.5 sm:p-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-bisu-gold transition-colors"
          title="Reset Center"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Controls: Submission Floating Panel & Load More */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex flex-wrap items-center gap-2 sm:gap-3">
        {nextCursor && (
          <button
            onClick={loadMoreGreetings}
            disabled={loadingMore}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold bg-slate-900/95 text-slate-200 border border-slate-700 shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {loadingMore ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>Load More</span>
          </button>
        )}
        <WallSubmissionPanel onGreetingSubmitted={handleGreetingSubmitted} />
      </div>

      {/* Interactive Transform Canvas */}
      <TransformWrapper
        ref={transformRef}
        initialScale={scaleBounds.initial}
        minScale={scaleBounds.min}
        maxScale={2.2}
        centerOnInit={true}
        limitToBounds={false}
        panning={{
          excluded: ['wall-card-draggable', 'wall-card-draggable *'],
        }}
        wheel={{ step: 0.08 }}
        pinch={{ step: 5 }}
        doubleClick={{ mode: 'reset' }}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px` }}
        >
          <div
            style={{
              width: `${CANVAS_WIDTH}px`,
              height: `${CANVAS_HEIGHT}px`,
              ...dotGridStyle,
            }}
            className="relative bg-transparent"
          >
            {/* Center Board Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-15">
              <h2 className="text-8xl sm:text-9xl font-black text-slate-400 tracking-tighter">
                BISU BILAR
              </h2>
              <p className="text-3xl font-extrabold uppercase tracking-widest text-slate-400 mt-2">
                Teacher's Day Public Wall
              </p>
            </div>

            {/* Render deterministic, movable greeting cards */}
            {greetings.map((greeting) => (
              <WallCard
                key={greeting.id}
                greeting={greeting}
                canvasWidth={CANVAS_WIDTH}
                canvasHeight={CANVAS_HEIGHT}
              />
            ))}

            {loading && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 p-4 rounded-xl bg-slate-900/90 border border-slate-700 shadow-2xl text-slate-200">
                <Loader2 className="w-5 h-5 animate-spin text-bisu-gold" />
                <span className="text-sm font-semibold">Loading Public Wall...</span>
              </div>
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

export default WallCanvas;
