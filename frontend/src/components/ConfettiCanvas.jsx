import React, { useEffect, useRef } from 'react';

// Palette: gold, pale gold, blue, pale blue, rose, mint, white
const CONFETTI_COLORS = [
  '#ffb020', // gold
  '#ffe08a', // pale gold
  '#2f6bff', // blue
  '#9bc0ff', // pale blue
  '#ff5f8f', // rose
  '#39e0c4', // mint
  '#ffffff', // white
];

export function triggerCelebration(originX, originY) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.dispatchEvent(
    new CustomEvent('td-confetti-celebration', {
      detail: {
        originX: originX ?? window.innerWidth / 2,
        originY: originY ?? 70,
      },
    })
  );
}

export function triggerConfettiBurst(options = {}) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const y = options.y ?? window.innerHeight / 2;
  const defaultAngle = y < 140 ? 90 : -90; // shoot downward into viewport if near header

  window.dispatchEvent(
    new CustomEvent('td-confetti-burst', {
      detail: {
        x: options.x ?? window.innerWidth / 2,
        y: y,
        count: options.count ?? 55,
        spread: options.spread ?? 90,
        velocity: options.velocity ?? 16,
        angle: options.angle ?? defaultAngle,
      },
    })
  );
}

export function ConfettiCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let particles = [];
    let animId = null;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const spawnParticles = (x, y, count = 40, spread = 70, baseVelocity = 14, baseAngle = -90) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const angleRad = (baseAngle * Math.PI) / 180;
      const spreadRad = (spread * Math.PI) / 180;

      for (let i = 0; i < count; i++) {
        // Random angle within spread
        const angle = angleRad + (Math.random() - 0.5) * spreadRad;
        const speed = baseVelocity * (0.55 + Math.random() * 0.7);

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          w: Math.random() * 7 + 6,
          h: Math.random() * 9 + 6,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.25,
          tiltAngle: Math.random() * Math.PI,
          tiltSpeed: Math.random() * 0.12 + 0.05,
          gravity: Math.random() * 0.18 + 0.32,
          drag: 0.965,
          opacity: 1,
          decay: Math.random() * 0.007 + 0.006,
          life: 0,
          maxLife: Math.random() * 80 + 120,
        });
      }

      if (!animId) {
        animId = requestAnimationFrame(render);
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        // Physics: drag, gravity, rotation, 3D tilt
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;

        p.rotation += p.rotationSpeed;
        p.tiltAngle += p.tiltSpeed;

        if (p.life > p.maxLife * 0.6) {
          p.opacity -= p.decay * 2.2;
        }

        if (p.opacity <= 0 || p.y > height + 40) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        // 3D paper fluttering effect by compressing height
        const scaleY = Math.cos(p.tiltAngle);
        ctx.scale(1, Math.max(0.1, Math.abs(scaleY)));
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (particles.length > 0) {
        animId = requestAnimationFrame(render);
      } else {
        animId = null;
      }
    };

    // Celebration Cannon sequence: button fountain, left/right cannons & center blast
    const fireCelebration = (originX, originY) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const x = originX ?? window.innerWidth / 2;
      const y = originY ?? 70;

      // 1. Shower directly from the button downwards into the viewport
      spawnParticles(x, y, 65, 140, 16, 90);

      // 2. Left Cannon shooting up & towards the center
      spawnParticles(window.innerWidth * 0.15, window.innerHeight * 0.65, 60, 65, 19, -60);

      // 3. Right Cannon shooting up & towards the center
      spawnParticles(window.innerWidth * 0.85, window.innerHeight * 0.65, 60, 65, 19, -120);

      // 4. Staggered Center Cannon explosion (~160ms later)
      setTimeout(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        spawnParticles(window.innerWidth * 0.5, window.innerHeight * 0.45, 80, 360, 18, 0);
      }, 160);
    };

    // Custom Event Listener for programmatic bursts (e.g. Header Celebrate button)
    const handleCustomBurst = (e) => {
      const { x, y, count, spread, velocity, angle } = e.detail || {};
      spawnParticles(x, y, count, spread, velocity, angle);
    };

    const handleCelebrationEvent = (e) => {
      const { originX, originY } = e.detail || {};
      fireCelebration(originX, originY);
    };

    window.addEventListener('td-confetti-burst', handleCustomBurst);
    window.addEventListener('td-confetti-celebration', handleCelebrationEvent);

    // Three-point burst on page load (~900ms in): left, right, then centre
    const timeout1 = setTimeout(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // Burst 1: Left
      spawnParticles(window.innerWidth * 0.2, window.innerHeight * 0.55, 55, 65, 17, -65);
    }, 900);

    const timeout2 = setTimeout(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // Burst 2: Right
      spawnParticles(window.innerWidth * 0.8, window.innerHeight * 0.55, 55, 65, 17, -115);
    }, 1050);

    const timeout3 = setTimeout(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // Burst 3: Centre
      spawnParticles(window.innerWidth * 0.5, window.innerHeight * 0.45, 75, 120, 18, -90);
    }, 1250);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('td-confetti-burst', handleCustomBurst);
      window.removeEventListener('td-confetti-celebration', handleCelebrationEvent);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-50 select-none"
    />
  );
}

export default ConfettiCanvas;
