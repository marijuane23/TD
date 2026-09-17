import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { Sparkles } from 'lucide-react';

export function GreetingAnimation() {
  const containerRef = useRef(null);
  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);
  const badgeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(badgeRef.current, { opacity: 0, y: -20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 })
        .fromTo(headlineRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, '-=0.4')
        .fromTo(subtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5');

      // Trigger light opening confetti burst
      setTimeout(() => {
        triggerConfetti();
      }, 500);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1E3A8A', '#F59E0B', '#059669', '#3B82F6', '#EF4444'],
    });
  };

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden min-h-[58vh] sm:min-h-[68vh] lg:min-h-[72vh] flex flex-col justify-center items-center pt-20 pb-24 sm:pt-28 sm:pb-36 lg:pt-32 lg:pb-40 px-4 sm:px-6 lg:px-8 text-center"
    >
      {/* Background Decorative Ambient Blurs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 sm:w-[680px] h-72 sm:h-[420px] bg-gradient-to-tr from-bisu-blue-600/20 via-bisu-gold/15 to-bisu-green/15 blur-3xl pointer-events-none rounded-full -z-10" />

      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Celebration Badge */}
        <div
          ref={badgeRef}
          onClick={triggerConfetti}
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-bisu-blue-50 to-bisu-gold/10 dark:from-bisu-blue-950/60 dark:to-bisu-gold/10 border border-bisu-gold/30 text-bisu-blue-900 dark:text-bisu-gold text-xs sm:text-sm font-semibold tracking-wide shadow-sm hover:scale-105 transition-transform duration-200 mb-6"
        >
          <Sparkles className="w-4 h-4 text-bisu-gold animate-pulse" />
          <span>BISU Bilar Celebration — October 7, 2026</span>
          <span className="text-[10px] bg-bisu-gold text-slate-900 font-bold px-1.5 py-0.5 rounded">Celebrate!</span>
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
          className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed"
        >
          To the inspiring mentors, professors, and instructors of Bohol Island State University (Bilar Campus) — thank you for shaping our minds, guiding our paths, and nurturing our futures.
        </p>
      </div>
    </section>
  );
}

export default GreetingAnimation;
