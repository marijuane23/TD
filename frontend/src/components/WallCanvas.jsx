import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../api/client.js';
import WallSubmissionPanel from './WallSubmissionPanel.jsx';
import { Loader2, Search, Shuffle, X } from 'lucide-react';

const SEED_DATA = [
  { id: 'seed-1', to: "Sir Cuadra", msg: "Happy Teacher's Day Sir Cuadra, salamat sa tanan!", from: "Anonymous" },
  { id: 'seed-2', to: "Ma'am Gumanoy", msg: "Happy Teacher's Day Ma'am Gumanoy — your patience never runs out.", from: "BSCS-4B" },
  { id: 'seed-3', to: "Sir Joel Piollo", msg: "Happy Teachers Day Sir Joel Piollo, thank you for pushing us.", from: "BSCS-4B" },
  { id: 'seed-4', to: "Sir Max", msg: "Happy Teachers Day Sir Max. You made stats bearable, promise.", from: "Anonymous" },
  { id: 'seed-5', to: "Everyone", msg: "Happy Teachers Day everyone — BISU Bilar loves you!", from: "Anonymous" },
  { id: 'seed-6', to: "Sir Darrel Abuyabor Cardona", msg: "Happy Teachers Day to our beloved Sir Darrel. God bless sir.", from: "James Ronald" },
  { id: 'seed-7', to: "Ma'am", msg: "Happy Teachers Day sa akong maam. I love you hehe.", from: "Anonymous" },
  { id: 'seed-8', to: "Sir Cuadra", msg: "Happy Teachers Day Sir Cuadra, best adviser ever.", from: "Kentoyyy" },
  { id: 'seed-9', to: "Sir Rex Tejada", msg: "Happy Teachers Day Sir Rex Tejada. Kinaidalan sa tanan among permi sir, mwaaa.", from: "Anonymous" },
  { id: 'seed-10', to: "Sir Cuadra", msg: "Happy Teachers Day Sir Cuadra.", from: "Top 1 BSCS-4A" },
  { id: 'seed-11', to: "All", msg: "HAPPY TEACHERS DAY ALL", from: "Anonymous" },
  { id: 'seed-12', to: "Faculty", msg: "LET'S GOOOOO", from: "Anonymous" },
  { id: 'seed-13', to: "Faculty", msg: "Hooray! Hooray! Hooray! Hooray!", from: "Anonymous" },
  { id: 'seed-14', to: "Sir Digamon", msg: "Happy Teachers Day Sir Digamon. Bahala usab2 imo instructions para we love you mwa.", from: "Anonymous" },
  { id: 'seed-15', to: "Ma'am Auza", msg: "You explained the same lesson four ways until it clicked. Thank you.", from: "Kyle, BSED-3" },
  { id: 'seed-16', to: "Sir Balatero", msg: "Salamat sa pagtudlo nga dili lang code ang importante.", from: "Anonymous" },
  { id: 'seed-17', to: "Ma'am Lumayag", msg: "Field work days were long, but we looked forward to them.", from: "Section 2-B" },
  { id: 'seed-18', to: "Sir Tagalog", msg: "You read my whole capstone draft at 11pm and still replied by morning.", from: "Danica, BSIT-4" },
  { id: 'seed-19', to: "Ma'am Paran", msg: "Thank you for asking if I was okay when nobody else did.", from: "Anonymous" },
  { id: 'seed-20', to: "Sir Ompad", msg: "Your 7am class taught me to wake up early. Worth it.", from: "Mark, BSIT-2" }
];

const PALETTE = [
  { c: 'linear-gradient(135deg,#ffe08a,#ffb020)', glow: '#ffb020', bg: 'rgba(255,176,32,.14)' },
  { c: 'linear-gradient(135deg,#9db8ff,#2f6bff)', glow: '#2f6bff', bg: 'rgba(47,107,255,.14)' },
  { c: 'linear-gradient(135deg,#ffb0c8,#ff5f8f)', glow: '#ff5f8f', bg: 'rgba(255,95,143,.14)' },
  { c: 'linear-gradient(135deg,#9ff0e2,#39e0c4)', glow: '#39e0c4', bg: 'rgba(57,224,196,.14)' },
  { c: 'linear-gradient(135deg,#d3bdff,#b28dff)', glow: '#b28dff', bg: 'rgba(178,141,255,.14)' },
  { c: 'linear-gradient(135deg,#ffc7a3,#ff9f6b)', glow: '#ff9f6b', bg: 'rgba(255,159,107,.14)' }
];

function getInitials(name) {
  if (!name) return '🎓';
  const parts = name.replace(/^(Sir|Ma'am|Maam|Prof\.|Dr\.|Dean|Instructor|Everyone|Faculty|All)\s*/i, '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '🎓';
  return (((parts[0] || '')[0] || '') + ((parts[1] || '')[0] || '')).toUpperCase();
}

function extractRecipient(msg) {
  if (!msg) return 'Faculty';
  const match = msg.match(/(?:to|para\s+kang|para\s+ni)\s+((?:Sir|Ma'am|Maam|Prof\.|Dr\.)\s+[A-Za-z0-9\s'.]+?)(?:[,.!?—]|\s+(?:thank|salamat|happy|you|we))/i);
  if (match && match[1]) return match[1].trim();
  const directMatch = msg.match(/((?:Sir|Ma'am|Maam|Prof\.|Dr\.)\s+[A-Za-z0-9\s'.]+?)(?:[,.!?—]|\s+(?:thank|salamat|happy|you|we))/i);
  if (directMatch && directMatch[1]) return directMatch[1].trim();
  return 'Faculty';
}

export function WallCanvas() {
  const [greetings, setGreetings] = useState(SEED_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [shuffleOffset, setShuffleOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const stageWrapRef = useRef(null);
  const stageRef = useRef(null);
  const cardElementsRef = useRef(new Map());

  // Interactive 3D Sphere Variables
  const stateRef = useRef({
    rx: -0.15,
    ry: 0.0,
    vrx: 0,
    vry: 0,
    draggingStage: false,
    lastX: 0,
    lastY: 0,
    idleT: 0,
    R: 240,
    zoom: 1,
    FOCAL: 900,
  });

  // Individual Card Drag-and-Drop Tracking
  const activeCardDragRef = useRef(null);

  // Fetch greetings from API, merging with seed data
  useEffect(() => {
    let isMounted = true;
    const fetchWallGreetings = async () => {
      try {
        const res = await api.getWallGreetings({ limit: 60 });
        if (isMounted && res.items && res.items.length > 0) {
          const apiFormatted = res.items.map((item, idx) => ({
            id: item.id || `api-${idx}`,
            to: item.to || extractRecipient(item.message_text),
            msg: item.message_text || '',
            from: item.sender_name || 'Anonymous',
          }));
          const combined = [...apiFormatted];
          for (const seed of SEED_DATA) {
            if (combined.length >= 40) break;
            if (!combined.some(c => c.msg === seed.msg)) {
              combined.push(seed);
            }
          }
          setGreetings(combined);
        }
      } catch (err) {
        console.warn('Notice: using seeded campus greetings for globe wall:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWallGreetings();
    return () => { isMounted = false; };
  }, []);

  const handleGreetingSubmitted = (newGreeting) => {
    const formatted = {
      id: newGreeting.id || `custom-${Date.now()}`,
      to: newGreeting.to || extractRecipient(newGreeting.message_text) || 'Faculty',
      msg: newGreeting.message_text || '',
      from: newGreeting.sender_name || 'Anonymous',
    };
    setGreetings(prev => [formatted, ...prev]);
  };

  // Filter greetings if search is active
  const filteredGreetings = useMemo(() => {
    if (!searchQuery.trim()) return greetings;
    const query = searchQuery.toLowerCase();
    return greetings.filter(
      g =>
        g.to.toLowerCase().includes(query) ||
        g.msg.toLowerCase().includes(query) ||
        g.from.toLowerCase().includes(query)
    );
  }, [greetings, searchQuery]);

  // Dynamic capacity & density management:
  // Scale sphere radius R dynamically based on dataset size N
  const totalCount = filteredGreetings.length;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const pointsRef = useRef([]);

  useEffect(() => {
    pointsRef.current = filteredGreetings.map((d, i) => {
      // Apply shuffle offset so users can randomize viewing distribution
      const orderIdx = (i + shuffleOffset) % Math.max(1, totalCount);
      const y = 1 - (orderIdx / Math.max(1, totalCount - 1)) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * orderIdx;
      return {
        id: d.id,
        x: Math.cos(theta) * rad,
        y: y,
        z: Math.sin(theta) * rad,
        data: d,
        pal: PALETTE[i % PALETTE.length]
      };
    });
  }, [filteredGreetings, totalCount, golden, shuffleOffset]);

  // Dynamic radius fitting based on stage wrap dimensions and capacity N
  useEffect(() => {
    const fitRadius = () => {
      if (!stageWrapRef.current) return;
      const rect = stageWrapRef.current.getBoundingClientRect();
      const baseR = Math.min(rect.width, rect.height) * 0.28;
      // Expand radius smoothly as data density grows
      const densityBonus = Math.min(1.4, 1 + Math.sqrt(Math.max(0, totalCount - 20)) * 0.035);
      stateRef.current.R = baseR * densityBonus;
    };

    fitRadius();
    window.addEventListener('resize', fitRadius);
    return () => window.removeEventListener('resize', fitRadius);
  }, [totalCount]);

  // Main 3D Render Loop via requestAnimationFrame
  useEffect(() => {
    let animId;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      const stageWrap = stageWrapRef.current;
      if (!stageWrap) return;
      const rect = stageWrap.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      const { rx, ry, R, zoom, FOCAL } = stateRef.current;
      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const activeDrag = activeCardDragRef.current;

      const rendered = pointsRef.current.map(p => {
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y1 = p.y;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;
        const x2 = x1;

        const rad = R * zoom;
        const X = x2 * rad;
        const Y = y2 * rad;
        const Z = z2 * rad;
        const scale = FOCAL / (FOCAL + Z);
        return { p, X, Y, Z, scale, rad };
      });

      rendered.sort((a, b) => a.Z - b.Z);

      const highDensity = totalCount > 35;

      rendered.forEach((r, order) => {
        const el = cardElementsRef.current.get(r.p.id);
        if (!el) return;

        // If this card is actively being dragged by the user, keep it locked under cursor!
        if (activeDrag && activeDrag.id === r.p.id && activeDrag.isMoved) {
          const cardX = activeDrag.currentX - rect.left;
          const cardY = activeDrag.currentY - rect.top;
          el.style.transform = `translate3d(${cardX}px, ${cardY}px, 0) translate(-50%,-50%) scale(1.15)`;
          el.style.opacity = '1';
          el.style.zIndex = '10000';
          el.style.display = 'block';
          return;
        }

        // High data volume optimization: smooth back-hemisphere occlusion
        // Culled cards prevent overlapping clutter and guarantee 60 FPS
        if (highDensity && r.Z < -0.45 * r.rad) {
          el.style.display = 'none';
          return;
        }
        el.style.display = 'block';

        const s = Math.max(0.25, Math.min(1.12, r.scale));
        // Opacity smoothly drops as card swings to the back
        const op = Math.max(0.18, Math.min(1, (r.Z + r.rad) / (2 * r.rad) + 0.16));

        el.style.transform = `translate3d(${cx + r.X}px, ${cy + r.Y}px, 0) translate(-50%,-50%) scale(${s})`;
        el.style.opacity = op;
        el.style.zIndex = order;
      });
    };

    const loop = () => {
      const state = stateRef.current;
      // Globe keeps rotating smoothly even while a message is being dragged!
      if (!state.draggingStage) {
        if (Math.abs(state.vrx) > 0.0001 || Math.abs(state.vry) > 0.0001) {
          state.rx += state.vrx;
          state.ry += state.vry;
          state.vrx *= 0.94;
          state.vry *= 0.94;
        } else if (!reduce) {
          state.idleT++;
          if (state.idleT > 18) state.ry += 0.0016;
        }
      }
      render();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [totalCount]);

  // Pointer position helper
  const pointerPos = (e) => {
    if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  };

  // Pointer Down on Stage or Cards
  const handlePointerDown = (e) => {
    const p = pointerPos(e);
    const cardEl = e.target.closest('.gcard');

    if (cardEl) {
      // Find which card ID is being targeted
      let cardId = null;
      for (const [id, el] of cardElementsRef.current.entries()) {
        if (el === cardEl) {
          cardId = id;
          break;
        }
      }

      if (cardId) {
        activeCardDragRef.current = {
          id: cardId,
          el: cardEl,
          startX: p.x,
          startY: p.y,
          currentX: p.x,
          currentY: p.y,
          isMoved: false,
        };
        stateRef.current.draggingStage = false;
        stateRef.current.idleT = 0;
        return;
      }
    }

    // Stage Background Drag (Spins globe with momentum)
    const state = stateRef.current;
    state.draggingStage = true;
    state.idleT = 0;
    state.vrx = 0;
    state.vry = 0;
    stageWrapRef.current?.classList.add('dragging');
    state.lastX = p.x;
    state.lastY = p.y;
  };

  // Pointer Move (Handles card dragging OR globe rotation)
  const handlePointerMove = (e) => {
    const p = pointerPos(e);
    const activeDrag = activeCardDragRef.current;

    // 1. Moving an individual message card
    if (activeDrag) {
      activeDrag.currentX = p.x;
      activeDrag.currentY = p.y;
      const dist = Math.hypot(p.x - activeDrag.startX, p.y - activeDrag.startY);

      if (dist > 5) {
        activeDrag.isMoved = true;
        activeDrag.el.classList.add('dragging');
      }
      return;
    }

    // 2. Rotating the entire 3D globe
    const state = stateRef.current;
    if (!state.draggingStage) return;

    const dx = p.x - state.lastX;
    const dy = p.y - state.lastY;
    state.lastX = p.x;
    state.lastY = p.y;

    state.ry += dx * 0.006;
    state.rx += dy * 0.006;
    state.rx = Math.max(-1.35, Math.min(1.35, state.rx));
    state.vry = dx * 0.006;
    state.vrx = dy * 0.006;
  };

  // Pointer Up (Releasing card drop OR ending globe rotation)
  const handlePointerUp = () => {
    const activeDrag = activeCardDragRef.current;

    // If a card was being interacted with
    if (activeDrag) {
      if (!activeDrag.isMoved) {
        // Simple click: trigger spotlight pop animation!
        handleCardClick(activeDrag.id);
      } else {
        // Drag and drop: Project the drop position back onto the 3D rotating sphere!
        const stageWrap = stageWrapRef.current;
        if (stageWrap) {
          const rect = stageWrap.getBoundingClientRect();
          const cx = rect.width / 2;
          const cy = rect.height / 2;
          const dropX = activeDrag.currentX - rect.left;
          const dropY = activeDrag.currentY - rect.top;

          const { rx, ry, R, zoom } = stateRef.current;
          const rad = R * zoom;

          // Compute normalized coordinates relative to center
          const dx = (dropX - cx) / rad;
          const dy = (dropY - cy) / rad;
          const distSq = dx * dx + dy * dy;

          let x2 = dx;
          let y2 = dy;
          let z2 = 0;

          if (distSq < 1) {
            z2 = Math.sqrt(1 - distSq);
          } else {
            const len = Math.sqrt(distSq);
            x2 = dx / len;
            y2 = dy / len;
            z2 = 0;
          }

          // Inverse rotation by pitch (rx) around X-axis
          const cosX = Math.cos(rx), sinX = Math.sin(rx);
          const y1 = y2 * cosX + z2 * sinX;
          const z1 = -y2 * sinX + z2 * cosX;
          const x1 = x2;

          // Inverse rotation by yaw (ry) around Y-axis
          const cosY = Math.cos(ry), sinY = Math.sin(ry);
          const newX = x1 * cosY - z1 * sinY;
          const newZ = x1 * sinY + z1 * cosY;
          const newY = y1;

          // Update the card's 3D point on the sphere to stay locked at its new drop location!
          const targetPoint = pointsRef.current.find(p => p.id === activeDrag.id);
          if (targetPoint) {
            targetPoint.x = newX;
            targetPoint.y = newY;
            targetPoint.z = newZ;
          }
        }
      }

      activeDrag.el.classList.remove('dragging');
      activeCardDragRef.current = null;
    }

    // End stage rotation drag
    const state = stateRef.current;
    state.draggingStage = false;
    state.idleT = 0;
    stageWrapRef.current?.classList.remove('dragging');
  };

  // Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const state = stateRef.current;
    state.idleT = 0;
    state.zoom = Math.max(0.55, Math.min(1.8, state.zoom - e.deltaY * 0.0009));
  };

  const handleZoomIn = () => {
    const state = stateRef.current;
    state.idleT = 0;
    state.zoom = Math.min(1.8, state.zoom + 0.15);
  };

  const handleZoomOut = () => {
    const state = stateRef.current;
    state.idleT = 0;
    state.zoom = Math.max(0.55, state.zoom - 0.15);
  };

  const handleReset = () => {
    const state = stateRef.current;
    state.idleT = 0;
    state.zoom = 1;
    state.rx = -0.15;
    state.ry = 0;
    state.vrx = 0;
    state.vry = 0;
  };

  const handleShuffle = () => {
    setShuffleOffset(prev => prev + 5);
  };

  const handleCardClick = (id) => {
    const el = cardElementsRef.current.get(id);
    if (!el) return;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  };

  return (
    <div className="w-full select-none">
      {/* Globe Top Toolbar: Pill Counter, Search Filter, Shuffle, & Zoom Controls */}
      <div className="globe-toolbar">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="globe-pill">
            <span>🌐 Living wall —</span>
            <b id="ctext">{totalCount}</b>
            <span>{searchQuery ? `of ${greetings.length} greetings` : 'greetings orbiting'}</span>
          </span>

          {/* Quick Search Filter for Large Datasets */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-7 py-1.5 rounded-full text-xs bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-celebrate-gold w-36 sm:w-48 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-white text-xs"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="globe-zoomctl">
          <button
            onClick={handleShuffle}
            className="globe-zbtn"
            aria-label="Shuffle view"
            title="Shuffle Orbiting View"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleZoomIn} className="globe-zbtn" aria-label="Zoom in" title="Zoom In">
            +
          </button>
          <button onClick={handleZoomOut} className="globe-zbtn" aria-label="Zoom out" title="Zoom Out">
            −
          </button>
          <button onClick={handleReset} className="globe-zbtn" aria-label="Reset view" title="Reset Center">
            ↺
          </button>
        </div>
      </div>

      {/* 3D Globe Stage Canvas */}
      <div
        ref={stageWrapRef}
        className="stage-wrap"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onWheel={handleWheel}
      >
        {/* Glowing Center Core */}
        <div id="core" />

        {/* BISU Bilar Background Watermark (Bold, High Contrast, Centered) */}
        <div className="watermark">
          <span className="l1 font-extrabold tracking-tight">BISU BILAR</span>
          <span className="l2 font-bold">TEACHER'S DAY PUBLIC WALL</span>
        </div>

        {/* Floating 3D Greeting Cards Stage */}
        <div id="stage" ref={stageRef}>
          {filteredGreetings.map((g, i) => {
            const pal = PALETTE[i % PALETTE.length];
            return (
              <div
                key={g.id}
                ref={(el) => {
                  if (el) cardElementsRef.current.set(g.id, el);
                  else cardElementsRef.current.delete(g.id);
                }}
                className="gcard"
                style={{
                  '--card-glow': pal.glow,
                  background: pal.bg,
                  borderColor: 'rgba(255,255,255,0.16)',
                }}
              >
                <div className="gc-top pointer-events-none">
                  <div className="gc-av" style={{ background: pal.c }}>
                    {getInitials(g.to)}
                  </div>
                  <div className="gc-name">To {g.to}</div>
                </div>
                <div className="gc-msg pointer-events-none">{g.msg}</div>
                <div className="gc-bot pointer-events-none">
                  <span>{g.from}</span>
                  <span>Public Wall</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 shadow-2xl text-white text-xs font-semibold z-30 pointer-events-none">
            <Loader2 className="w-4 h-4 animate-spin text-celebrate-gold" />
            <span>Loading Orbiting Greetings...</span>
          </div>
        )}

        {/* Floating Wall Submission Panel ("Post a Greeting" modal) */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <WallSubmissionPanel onGreetingSubmitted={handleGreetingSubmitted} />
        </div>
      </div>
    </div>
  );
}

export default WallCanvas;
