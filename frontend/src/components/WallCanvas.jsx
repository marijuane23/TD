import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../api/client.js';
import { useTheme } from '../context/ThemeContext.jsx';
import WallSubmissionPanel from './WallSubmissionPanel.jsx';
import {
  Loader2,
  Search,
  Shuffle,
  X,
  Globe,
  Plus,
  Minus,
  RotateCcw,
  GraduationCap,
} from 'lucide-react';

const PALETTE = [
  { c: 'linear-gradient(135deg,#ffe08a,#ffb020)', glow: '#f59e0b', bgDark: 'rgba(255,176,32,.15)', bgLight: 'rgba(255, 251, 235, 0.96)', borderLight: 'rgba(245, 158, 11, 0.45)' },
  { c: 'linear-gradient(135deg,#9db8ff,#2f6bff)', glow: '#3b82f6', bgDark: 'rgba(47,107,255,.15)', bgLight: 'rgba(239, 246, 255, 0.96)', borderLight: 'rgba(59, 130, 246, 0.45)' },
  { c: 'linear-gradient(135deg,#ffb0c8,#ff5f8f)', glow: '#ec4899', bgDark: 'rgba(255,95,143,.15)', bgLight: 'rgba(253, 242, 248, 0.96)', borderLight: 'rgba(236, 72, 153, 0.45)' },
  { c: 'linear-gradient(135deg,#9ff0e2,#39e0c4)', glow: '#10b981', bgDark: 'rgba(57,224,196,.15)', bgLight: 'rgba(236, 253, 245, 0.96)', borderLight: 'rgba(16, 185, 129, 0.45)' },
  { c: 'linear-gradient(135deg,#d3bdff,#b28dff)', glow: '#8b5cf6', bgDark: 'rgba(178,141,255,.15)', bgLight: 'rgba(245, 243, 255, 0.96)', borderLight: 'rgba(139, 92, 246, 0.45)' },
  { c: 'linear-gradient(135deg,#ffc7a3,#ff9f6b)', glow: '#f97316', bgDark: 'rgba(255,159,107,.15)', bgLight: 'rgba(255, 247, 237, 0.96)', borderLight: 'rgba(249, 115, 22, 0.45)' }
];

function getInitials(name) {
  if (!name) return null;
  const parts = name.replace(/^(Sir|Ma'am|Maam|Prof\.|Dr\.|Dean|Instructor|Everyone|Faculty|All)\s*/i, '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return null;
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

function truncateGreeting(msg, maxChars = 90) {
  if (!msg) return '';
  if (msg.length <= maxChars) return msg;
  return msg.slice(0, maxChars).trim() + '...';
}

export function WallCanvas() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [greetings, setGreetings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [focusedCard, setFocusedCard] = useState(null);
  const focusedCardRef = useRef(null);

  const [shuffleOffset, setShuffleOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const searchInputRef = useRef(null);
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

  // Sync focusedCardRef with state so loop knows when to pause auto-rotate
  useEffect(() => {
    focusedCardRef.current = focusedCard;
  }, [focusedCard]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Escape key handler to close focused card or search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (focusedCard) setFocusedCard(null);
        if (isSearchOpen && !searchQuery) setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedCard, isSearchOpen, searchQuery]);

  // Fetch greetings directly from database via API
  useEffect(() => {
    let isMounted = true;
    const fetchWallGreetings = async () => {
      try {
        const res = await api.getWallGreetings({ limit: 150 });
        if (isMounted && res.items) {
          const apiFormatted = res.items.map((item, idx) => ({
            id: item.id || `api-${idx}`,
            to: item.teacher_name || item.to || extractRecipient(item.message_text),
            msg: item.message_text || '',
            from: item.sender_name || 'Anonymous',
            image_url: item.image_url || null,
            teacher_id: item.teacher_id || null,
            teacher_name: item.teacher_name || null,
            teacher_slug: item.teacher_slug || null,
            created_at: item.created_at || null,
          }));
          setGreetings(apiFormatted);
        }
      } catch (err) {
        console.error('Failed to load wall greetings from API:', err);
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
      to: newGreeting.teacher_name || newGreeting.to || extractRecipient(newGreeting.message_text) || 'Faculty',
      msg: newGreeting.message_text || '',
      from: newGreeting.sender_name || 'Anonymous',
      image_url: newGreeting.image_url || null,
      teacher_id: newGreeting.teacher_id || null,
      teacher_name: newGreeting.teacher_name || null,
      teacher_slug: newGreeting.teacher_slug || null,
      created_at: newGreeting.created_at || new Date().toISOString(),
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
      // Constrain vertical pole compression (0.82) so cards don't bunch at top/bottom poles
      const y = totalCount <= 1 ? 0 : (1 - (orderIdx / Math.max(1, totalCount - 1)) * 2) * 0.82;
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

  // Dynamic radius fitting with generous spacing to avoid overlapping cards
  useEffect(() => {
    const fitRadius = () => {
      if (!stageWrapRef.current) return;
      const rect = stageWrapRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;

      // Ample radius so cards have breathing room and don't clump together
      const widthFactor = isMobile ? 0.38 : 0.35;
      const heightFactor = isMobile ? 0.42 : 0.44;
      const computedR = Math.min(rect.width * widthFactor, rect.height * heightFactor);

      const minR = isMobile ? 165 : 300;
      const maxR = isMobile ? 230 : 440;

      // Slight density bonus for larger pools so they stay spread out
      const countSpacing = Math.min(1.25, 1 + Math.max(0, totalCount - 6) * 0.015);
      stateRef.current.R = Math.max(minR, Math.min(maxR, computedR * countSpacing));
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
      // Globe keeps rotating smoothly unless being dragged OR when focused on a card
      if (!state.draggingStage && !focusedCardRef.current) {
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
    // Slight 3D inclination so circular arrangement displays with pleasing space between cards
    state.rx = -0.16;
    state.ry = 0.22;
    state.vrx = 0;
    state.vry = 0;
  };

  const handleShuffle = () => {
    setShuffleOffset(prev => prev + 5);
  };

  const handleCardClick = (id) => {
    const el = cardElementsRef.current.get(id);
    if (el) {
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('pop');
    }
    const idx = greetings.findIndex(g => g.id === id);
    if (idx !== -1) {
      const cardData = greetings[idx];
      const pal = PALETTE[idx % PALETTE.length];
      setFocusedCard({ ...cardData, pal });
    }
  };

  return (
    <div className="w-full select-none">
      {/* Globe Top Toolbar: Count Number Only, Expanding Search Icon, & Zoom Controls */}
      <div className="globe-toolbar">
        <div className="flex items-center gap-2">
          {/* Pill Counter: Number Only with Globe Icon */}
          <span className="globe-pill shrink-0" title={`${totalCount} Total Greetings`}>
            <Globe className="w-4 h-4 text-bisu-gold shrink-0" />
            <b id="ctext" className="font-extrabold text-sm text-slate-900 dark:text-white leading-none">
              {totalCount}
            </b>
          </span>

          {/* Quick Search: Icon Only until clicked */}
          {!isSearchOpen && !searchQuery ? (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="globe-zbtn"
              aria-label="Search greetings"
              title="Search greetings"
            >
              <Search className="w-4 h-4" />
            </button>
          ) : (
            <div className="relative flex items-center animate-in fade-in zoom-in-95 duration-150">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 sm:w-52 pl-8 pr-7 py-2 rounded-full text-xs bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-celebrate-gold/50 shadow-sm transition-all"
              />
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1"
                title="Close search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="globe-zoomctl shrink-0 ml-auto sm:ml-0">
          <button
            onClick={handleShuffle}
            className="globe-zbtn"
            aria-label="Shuffle view"
            title="Shuffle Orbiting View"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleZoomIn} className="globe-zbtn" aria-label="Zoom in" title="Zoom In (+)">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={handleZoomOut} className="globe-zbtn" aria-label="Zoom out" title="Zoom Out (−)">
            <Minus className="w-4 h-4" />
          </button>
          <button onClick={handleReset} className="globe-zbtn" aria-label="Reset view" title="Reset Center (↺)">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Globe Stage Canvas (Natural page scrolling preserved, no wheel hijack) */}
      <div
        ref={stageWrapRef}
        className="stage-wrap"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
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
            const hasImage = Boolean(g.image_url);
            return (
              <div
                key={g.id}
                ref={(el) => {
                  if (el) cardElementsRef.current.set(g.id, el);
                  else cardElementsRef.current.delete(g.id);
                }}
                className={`gcard ${hasImage ? 'gcard-has-image' : ''}`}
                style={{
                  '--card-glow': pal.glow,
                  background: isDark ? pal.bgDark : pal.bgLight,
                  borderColor: isDark ? 'rgba(255,255,255,0.18)' : pal.borderLight,
                }}
              >
                {hasImage ? (
                  <div className="gc-split pointer-events-none">
                    <div className="gc-img-side">
                      <img
                        src={g.image_url}
                        alt="Tribute photo"
                        className="gc-img-thumb"
                        loading="lazy"
                      />
                    </div>
                    <div className="gc-text-side">
                      <div className="gc-top">
                        <div className="gc-av" style={{ background: pal.c }}>
                          {getInitials(g.to) || <GraduationCap className="w-3.5 h-3.5 text-slate-900" />}
                        </div>
                        <div className="gc-name">To {g.to}</div>
                      </div>
                      <div className="gc-msg">
                        {truncateGreeting(g.msg, 90)}
                      </div>
                      <div className="gc-bot">
                        <span className="truncate max-w-[80px]">{g.from}</span>
                        <span>Wall</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="gc-top pointer-events-none">
                      <div className="gc-av" style={{ background: pal.c }}>
                        {getInitials(g.to) || <GraduationCap className="w-3.5 h-3.5 text-slate-900" />}
                      </div>
                      <div className="gc-name">To {g.to}</div>
                    </div>
                    <div className="gc-msg pointer-events-none">{g.msg}</div>
                    <div className="gc-bot pointer-events-none">
                      <span>{g.from}</span>
                      <span>Public Wall</span>
                    </div>
                  </>
                )}
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

        {/* Empty State when no greetings are present or match search */}
        {!loading && filteredGreetings.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-30 pointer-events-none p-6 rounded-3xl bg-slate-900/70 backdrop-blur-md border border-slate-800 shadow-2xl max-w-sm">
            <p className="text-base font-bold text-white mb-1">
              {searchQuery ? 'No Matching Greetings' : 'No Wall Greetings Yet'}
            </p>
            <p className="text-xs text-slate-400">
              {searchQuery
                ? `No greetings found matching "${searchQuery}"`
                : 'Be the first to post a tribute on the living wall!'}
            </p>
          </div>
        )}

        {/* Floating Wall Submission Panel ("Post a Greeting" modal) */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
          <WallSubmissionPanel onGreetingSubmitted={handleGreetingSubmitted} />
        </div>
      </div>

      {/* Focused Greeting Spotlight Modal (Brought to front, pauses rotation) */}
      {focusedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setFocusedCard(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border transition-all animate-in zoom-in-95 duration-200"
            style={{
              background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.12)',
              boxShadow: isDark
                ? `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 45px -10px ${focusedCard.pal?.glow || '#3b82f6'}`
                : '0 25px 50px -12px rgba(15, 23, 42, 0.2), 0 0 35px -10px rgba(59, 130, 246, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setFocusedCard(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close and resume orbiting"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Recipient & Avatar */}
            <div className="flex items-center gap-3 mb-4 pr-8">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm text-slate-900 shadow-md shrink-0"
                style={{ background: focusedCard.pal?.c || 'linear-gradient(135deg,#ffe08a,#ffb020)' }}
              >
                {getInitials(focusedCard.to) || <GraduationCap className="w-4 h-4 text-slate-900" />}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Greeting Tribute
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight truncate">
                  To {focusedCard.to}
                </h3>
              </div>
            </div>

            {/* Attached Photo Display if present */}
            {focusedCard.image_url && (
              <div className="mb-4 rounded-2xl overflow-hidden max-h-[300px] border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center shadow-inner">
                <img
                  src={focusedCard.image_url}
                  alt="Greeting Tribute Photo"
                  className="w-full max-h-[300px] object-contain rounded-2xl"
                />
              </div>
            )}

            {/* Full Greeting Message */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 mb-4 max-h-[38vh] overflow-y-auto">
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap select-text font-normal">
                {focusedCard.msg}
              </p>
            </div>

            {/* Teacher Timeline Link if dedicated to a specific teacher */}
            {focusedCard.teacher_slug && (
              <a
                href={`/teachers/${focusedCard.teacher_slug}`}
                className="mb-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-bisu-gold/15 hover:bg-bisu-gold/25 border border-bisu-gold/30 text-amber-900 dark:text-bisu-gold text-xs font-bold transition-all shadow-sm group"
              >
                <GraduationCap className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Visit {focusedCard.to}'s Personal Timeline →</span>
              </a>
            )}

            {/* Sender & Footer */}
            <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 min-w-0">
                <span>From:</span>
                <strong className="text-slate-900 dark:text-white font-bold truncate">
                  {focusedCard.from}
                </strong>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                Public Wall
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WallCanvas;
