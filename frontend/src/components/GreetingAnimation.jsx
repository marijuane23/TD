import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Users } from 'lucide-react';
import { createRipple } from '../utils/ripple.js';

export function GreetingAnimation() {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // 3D desktop cursor tilt (perspective 1200px, rotateX/Y up to ±5deg)
  const handleMouseMove = (e) => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = Math.max(-5, Math.min(5, ((centerY - y) / centerY) * 5));
    const rotateY = Math.max(-5, Math.min(5, ((x - centerX) / centerX) * 5));

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const line1 = 'Happy';
  const line2 = "Teacher's Day!";

  return (
    <section className="relative min-h-[calc(100vh-8rem)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Open Floating Hero Container with Subtle 3D Tilt */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)`,
          transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
        }}
        className="max-w-4xl w-full mx-auto flex flex-col items-center text-center z-10"
      >
        {/* Celebration Badge with Pulsing Gold Dot (Expanding Ring Shadow) */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-celebrate-gold/30 bg-celebrate-gold/10 text-xs sm:text-sm font-semibold tracking-wide text-amber-300 dark:text-amber-200 mb-8 shadow-sm">
          <span className="pulsing-gold-dot" aria-hidden="true" />
          <span>BISU Bilar Celebration — October 7, 2026</span>
        </div>

        {/* Hero Title: Split into two lines, each line split into individual character spans */}
        <h1
          aria-label="Happy Teacher's Day!"
          className="font-headline tracking-tight text-slate-900 dark:text-white mb-6 select-none"
        >
          {/* Line 1: "Happy" */}
          <span className="headline-line block overflow-hidden" aria-hidden="true">
            {line1.split('').map((char, index) => (
              <span
                key={`line1-${index}`}
                className="headline-char"
                style={{
                  '--char-index': index,
                  '--char-offset': `${index * -20}px`,
                }}
              >
                {char}
              </span>
            ))}
          </span>

          {/* Line 2: "Teacher's Day!" */}
          <span className="headline-line block overflow-hidden" aria-hidden="true">
            {line2.split('').map((char, index) => {
              const globalIndex = line1.length + index;
              return (
                <span
                  key={`line2-${index}`}
                  className="headline-char"
                  style={{
                    '--char-index': globalIndex,
                    '--char-offset': `${globalIndex * -20}px`,
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </span>
        </h1>

        {/* Subheading with Staggered Fade Up */}
        <p className="fade-up-subheading text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-light leading-relaxed mb-10">
          To the inspiring mentors, professors, and instructors of Bohol Island State University (Bilar Campus) — thank you for shaping our minds, guiding our paths, and nurturing our futures.
        </p>

        {/* Two CTAs: Primary & Secondary with Lift, Scale & Ripple Motion */}
        <div className="fade-up-cta flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            to="/wall"
            onClick={createRipple}
            className="btn-primary-celebrate flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base w-full sm:w-auto"
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
            <span>Open Public Wall</span>
          </Link>

          <Link
            to="/teachers"
            onClick={createRipple}
            className="btn-secondary-glass flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base w-full sm:w-auto"
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-celebrate-blue pointer-events-none" />
            <span>Browse Teachers</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default GreetingAnimation;
