import React, { useEffect, useRef } from 'react';

export function CelebrationBackground() {
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);
  const blob4Ref = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let animId;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Ambient Particle Canvas ---
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const palette = ['#2f6bff', '#ffb020', '#ff5f8f', '#39e0c4', '#ffe08a', '#9bc0ff'];
    
    // Scale particle count to viewport width (~90 on desktop)
    const particleCount = Math.max(35, Math.min(105, Math.floor(width / 16)));
    
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 1.2,
      baseSpeedY: Math.random() * 0.45 + 0.25,
      wanderFreq: Math.random() * 0.002 + 0.001,
      wanderAmp: Math.random() * 0.8 + 0.4,
      phase: Math.random() * Math.PI * 2,
      color: palette[Math.floor(Math.random() * palette.length)],
      alpha: Math.random() * 0.45 + 0.35,
    }));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initial draw for static rendering if reduced motion
    const renderParticles = (time) => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.y -= p.baseSpeedY;
          p.x += Math.sin(time * p.wanderFreq + p.phase) * p.wanderAmp;

          // Wrap edges
          if (p.y < -15) {
            p.y = height + 15;
            p.x = Math.random() * width;
          }
          if (p.x < -15) p.x = width + 15;
          if (p.x > width + 15) p.x = -15;
        }

        ctx.save();
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 9;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    // --- Four Drifting Blurred Blobs on Sine Loop ---
    // Blue #2f6bff, Gold #ffb020, Rose #ff5f8f, Mint #39e0c4
    const start = performance.now();

    const loop = (now) => {
      const elapsed = (now - start) * 0.001; // seconds

      if (!prefersReducedMotion) {
        // Blob 1: Blue (#2f6bff)
        if (blob1Ref.current) {
          const x = Math.sin(elapsed * 0.35) * 80 + Math.cos(elapsed * 0.2) * 40;
          const y = Math.cos(elapsed * 0.28) * 70 + Math.sin(elapsed * 0.15) * 30;
          const s = 1 + Math.sin(elapsed * 0.3) * 0.18;
          blob1Ref.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
        }

        // Blob 2: Gold (#ffb020)
        if (blob2Ref.current) {
          const x = Math.cos(elapsed * 0.32 + 1.2) * 85 + Math.sin(elapsed * 0.18) * 45;
          const y = Math.sin(elapsed * 0.25 + 0.8) * 75 + Math.cos(elapsed * 0.12) * 35;
          const s = 1 + Math.cos(elapsed * 0.28) * 0.2;
          blob2Ref.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
        }

        // Blob 3: Rose (#ff5f8f)
        if (blob3Ref.current) {
          const x = Math.sin(elapsed * 0.26 + 2.5) * 75 + Math.cos(elapsed * 0.16) * 35;
          const y = Math.cos(elapsed * 0.34 + 2.1) * 80 + Math.sin(elapsed * 0.22) * 40;
          const s = 1 + Math.sin(elapsed * 0.25 + 1.5) * 0.18;
          blob3Ref.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
        }

        // Blob 4: Mint (#39e0c4)
        if (blob4Ref.current) {
          const x = Math.cos(elapsed * 0.38 + 3.8) * 80 + Math.sin(elapsed * 0.14) * 40;
          const y = Math.sin(elapsed * 0.31 + 4.2) * 70 + Math.cos(elapsed * 0.19) * 30;
          const s = 1 + Math.cos(elapsed * 0.32 + 2.0) * 0.18;
          blob4Ref.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
        }
      }

      renderParticles(now);

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(loop);
      }
    };

    if (prefersReducedMotion) {
      renderParticles(0);
    } else {
      animId = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
      style={{
        background:
          'radial-gradient(ellipse at 50% 15%, rgba(47, 107, 255, 0.08) 0%, transparent 65%), radial-gradient(ellipse at 80% 85%, rgba(255, 176, 32, 0.06) 0%, transparent 60%)',
      }}
    >
      {/* 4 Large Drifting Blurred Color Blobs (70-90px blur, on sine loop RAF) */}
      {/* Blob 1: Blue (#2f6bff) */}
      <div
        ref={blob1Ref}
        className="absolute -top-[12%] -left-[10%] w-[38rem] h-[38rem] rounded-full will-change-transform"
        style={{
          background: 'radial-gradient(circle, #2f6bff 0%, rgba(47, 107, 255, 0) 70%)',
          filter: 'blur(80px)',
          opacity: 0.42,
        }}
      />

      {/* Blob 2: Gold (#ffb020) */}
      <div
        ref={blob2Ref}
        className="absolute top-[8%] -right-[8%] w-[40rem] h-[40rem] rounded-full will-change-transform"
        style={{
          background: 'radial-gradient(circle, #ffb020 0%, rgba(255, 176, 32, 0) 70%)',
          filter: 'blur(85px)',
          opacity: 0.38,
        }}
      />

      {/* Blob 3: Rose (#ff5f8f) */}
      <div
        ref={blob3Ref}
        className="absolute -bottom-[15%] -left-[6%] w-[36rem] h-[36rem] rounded-full will-change-transform"
        style={{
          background: 'radial-gradient(circle, #ff5f8f 0%, rgba(255, 95, 143, 0) 70%)',
          filter: 'blur(80px)',
          opacity: 0.32,
        }}
      />

      {/* Blob 4: Mint (#39e0c4) */}
      <div
        ref={blob4Ref}
        className="absolute -bottom-[10%] right-[10%] w-[38rem] h-[38rem] rounded-full will-change-transform"
        style={{
          background: 'radial-gradient(circle, #39e0c4 0%, rgba(57, 224, 196, 0) 70%)',
          filter: 'blur(78px)',
          opacity: 0.34,
        }}
      />

      {/* Fine SVG feTurbulence Grain Overlay (~35% opacity, mix-blend-mode overlay) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          opacity: 0.35,
          mixBlendMode: 'overlay',
        }}
      >
        <filter id="celebrationNoise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#celebrationNoise)" />
      </svg>

      {/* Ambient Particle Canvas: ~90 small glowing dots */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
}

export default CelebrationBackground;
