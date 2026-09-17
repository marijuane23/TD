import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { Sparkles, MessageSquare, Users } from 'lucide-react';

export function GreetingAnimation() {
  const containerRef = useRef(null);
  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);
  const badgeRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered entrance animation
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(badgeRef.current, {
        y: -25,
        opacity: 0,
        duration: 0.8,
      })
      .from(
        headlineRef.current,
        {
          y: 35,
          opacity: 0,
          duration: 1,
          scale: 0.98,
        },
        '-=0.5'
      )
      .from(
        subtitleRef.current,
        {
          y: 20,
          opacity: 0,
          duration: 0.8,
        },
        '-=0.6'
      )
      .from(
        ctaRef.current,
        {
          y: 20,
          opacity: 0,
          duration: 0.8,
        },
        '-=0.5'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#0d234d', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'],
    });
  };

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-center"
    >
      {/* Background Decorative Ambient Blurs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 sm:w-[680px] h-72 sm:h-[420px] bg-gradient-to-tr from-bisu-blue-600/20 via-bisu-gold/15 to-bisu-green/15 blur-3xl pointer-events-none rounded-full -z-10" />

      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Celebration Badge */}
        <div
          ref={badgeRef}
          onClick={triggerConfetti}
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-bisu-blue-50 to-bisu-gold/10 dark:from-bisu-blue-950/60 dark:to-bisu-gold/10 border border-bisu-gold/30 text-bisu-blue-900 dark:text-bisu-gold text-xs sm:text-sm font-semibold tracking-wide shadow-sm hover:scale-105 transition-transform duration-200 mb-6"
          title="Click for celebration confetti!"
        >
          <Sparkles className="w-4 h-4 text-bisu-gold animate-pulse" />
          <span>BISU Bilar Celebration — October 7, 2026</span>
        </div>

        {/* Hero Title */}
        <h1
          ref={headlineRef}
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6"
        >
          Happy{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-bisu-blue-700 via-bisu-blue-500 to-bisu-gold dark:from-bisu-blue-400 dark:via-bisu-gold dark:to-emerald-400">
            Teacher's Day!
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed mb-8"
        >
          To the inspiring mentors, professors, and instructors of Bohol Island State University (Bilar Campus) — thank you for shaping our minds, guiding our paths, and nurturing our futures.
        </p>

        {/* Primary Action Buttons */}
        <div ref={ctaRef} className="flex flex-wrap items-center justify-center gap-3.5">
          <Link
            to="/wall"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-slate-950 bg-gradient-to-r from-bisu-gold to-amber-400 hover:from-amber-400 hover:to-bisu-gold shadow-lg shadow-bisu-gold/25 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open Public Wall</span>
          </Link>

          <Link
            to="/teachers"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Users className="w-4 h-4 text-bisu-blue-600 dark:text-bisu-blue-400" />
            <span>Browse Teachers</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default GreetingAnimation;
