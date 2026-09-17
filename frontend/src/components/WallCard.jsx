import React, { useState, useRef, useEffect } from 'react';
import { getCardPosition } from '../utils/wallLayout.js';
import { User, GripVertical } from 'lucide-react';

export function WallCard({ greeting, canvasWidth = 4200, canvasHeight = 3000 }) {
  const cardRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Compute deterministic initial position & theme
  const initial = getCardPosition(greeting.id, canvasWidth, canvasHeight);

  const [pos, setPos] = useState({ x: initial.x, y: initial.y });
  const [isDragging, setIsDragging] = useState(false);
  const [zIndex, setZIndex] = useState(10);

  // Synchronize position if greeting id or canvas dimensions change
  useEffect(() => {
    const next = getCardPosition(greeting.id, canvasWidth, canvasHeight);
    setPos({ x: next.x, y: next.y });
  }, [greeting.id, canvasWidth, canvasHeight]);

  const startDrag = (clientX, clientY) => {
    if (isDraggingRef.current) return;

    // Determine current canvas zoom scale from parent transform matrix
    let currentScale = 1;
    const transformEl = cardRef.current?.closest('.react-transform-component') || cardRef.current?.parentElement;
    if (transformEl) {
      const style = window.getComputedStyle(transformEl);
      const matrix = new DOMMatrixReadOnly(style.transform);
      if (matrix.a && matrix.a > 0) {
        currentScale = matrix.a;
      }
    }

    const startX = pos.x;
    const startY = pos.y;
    const startPointerX = clientX;
    const startPointerY = clientY;

    isDraggingRef.current = true;
    setIsDragging(true);
    setZIndex(100);

    const onMove = (moveEvent) => {
      if (!isDraggingRef.current) return;

      // Prevent native touch page scroll while dragging a card on mobile
      if (moveEvent.cancelable) {
        moveEvent.preventDefault();
      }
      moveEvent.stopPropagation();

      const currentClientX = moveEvent.clientX ?? moveEvent.touches?.[0]?.clientX;
      const currentClientY = moveEvent.clientY ?? moveEvent.touches?.[0]?.clientY;
      if (currentClientX === undefined || currentClientY === undefined) return;

      const dx = (currentClientX - startPointerX) / currentScale;
      const dy = (currentClientY - startPointerY) / currentScale;

      setPos({
        x: Math.round(startX + dx),
        y: Math.round(startY + dy),
      });
    };

    const onEnd = (endEvent) => {
      endEvent?.stopPropagation?.();
      isDraggingRef.current = false;
      setIsDragging(false);
      setZIndex(30);

      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
  };

  const handlePointerDown = (e) => {
    // Left mouse button or touch
    if (e.button !== undefined && e.button !== 0) return;
    e.stopPropagation();
    startDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    e.stopPropagation();
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };

  const formattedDate = greeting.created_at
    ? new Date(greeting.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : 'Oct 7';

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onTouchStart={handleTouchStart}
      style={{
        position: 'absolute',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: isDragging
          ? `rotate(${initial.rotation > 0 ? 2 : -2}deg) scale(1.05)`
          : `rotate(${initial.rotation}deg)`,
        zIndex,
        touchAction: 'none',
      }}
      className={`wall-card-draggable w-[265px] sm:w-[280px] p-3.5 sm:p-4 rounded-2xl border select-none transition-shadow duration-150 ${
        initial.theme.bg
      } ${initial.theme.border} ${
        isDragging
          ? 'cursor-grabbing shadow-2xl ring-2 ring-bisu-gold/80'
          : 'cursor-grab shadow-md hover:shadow-xl hover:scale-[1.01]'
      }`}
      title="Tap / click and drag to move greeting across the wall"
    >
      {/* Top Header: Sender Name, Drag Handle, Badge */}
      <div className="flex items-center justify-between mb-2 pointer-events-none">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 shrink-0" />
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate max-w-[120px] sm:max-w-[140px]">{greeting.sender_name || 'Anonymous'}</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${initial.theme.badge}`}>
          #{greeting.id}
        </span>
      </div>

      {/* Message Text */}
      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed mb-3 whitespace-pre-wrap break-words pointer-events-none">
        {greeting.message_text}
      </p>

      {/* Footer / Date */}
      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 pointer-events-none">
        <span className="flex items-center gap-1">
          <span>Public Wall</span>
          {isDragging && <span className="text-bisu-gold font-bold">• Moving</span>}
        </span>
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}

export default WallCard;
