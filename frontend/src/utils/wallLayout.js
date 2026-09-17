// Deterministic non-overlapping layout generator for Public Wall greeting cards
// Maps each greeting id to a dedicated cellular spiral coordinate { x, y, rotation, theme }

export const COLOR_THEMES = [
  {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/60',
    accent: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300',
  },
  {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800/60',
    accent: 'text-blue-700 dark:text-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
  },
  {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    accent: 'text-emerald-700 dark:text-emerald-400',
    badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300',
  },
  {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800/60',
    accent: 'text-rose-700 dark:text-rose-400',
    badge: 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300',
  },
  {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800/60',
    accent: 'text-purple-700 dark:text-purple-400',
    badge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
  },
];

// Simple pseudo-random hash generator based on integer ID
function pseudoRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Maps non-negative integer k to discrete spiral coordinates (col, row)
function getSpiralCell(k) {
  if (k <= 0) return { col: 0, row: 0 };
  let r = 1;
  while (1 + 4 * r * (r + 1) < k + 1) {
    r++;
  }
  const prevMax = 1 + 4 * (r - 1) * r;
  const posInRing = k - prevMax;
  const sideLength = 2 * r;
  const side = Math.floor(posInRing / sideLength);
  const offset = posInRing % sideLength;

  let col = 0;
  let row = 0;
  if (side === 0) {
    // Top edge: moving from (-r, -r) to (r, -r)
    col = -r + offset;
    row = -r;
  } else if (side === 1) {
    // Right edge: moving from (r, -r) to (r, r)
    col = r;
    row = -r + offset;
  } else if (side === 2) {
    // Bottom edge: moving from (r, r) to (-r, r)
    col = r - offset;
    row = r;
  } else {
    // Left edge: moving from (-r, r) to (-r, -r)
    col = -r;
    row = r - offset;
  }
  return { col, row };
}

export function getCardPosition(id, totalCanvasWidth = 4200, totalCanvasHeight = 3000) {
  const cardId = parseInt(id, 10) || 1;
  const k = Math.max(0, cardId - 1);

  const centerX = totalCanvasWidth / 2;
  const centerY = totalCanvasHeight / 2;

  // Dedicated cell dimensions (ensures ample space between adjacent cards)
  const CELL_WIDTH = 350;
  const CELL_HEIGHT = 270;

  const { col, row } = getSpiralCell(k);

  // Card size is 280px wide. Center in cell:
  const baseX = centerX + col * CELL_WIDTH - 140;
  const baseY = centerY + row * CELL_HEIGHT - 90;

  // Subtle organic jitter within the cell (will not collide with neighbors)
  const jitterX = Math.round((pseudoRandom(cardId * 13) * 30 - 15));
  const jitterY = Math.round((pseudoRandom(cardId * 17) * 20 - 10));

  // Subtle tilt between -3.5° and +3.5°
  const rotation = Math.round((pseudoRandom(cardId * 23) * 7 - 3.5) * 10) / 10;

  // Pick color theme
  const themeIndex = Math.abs(cardId) % COLOR_THEMES.length;
  const theme = COLOR_THEMES[themeIndex];

  return {
    x: Math.max(60, Math.min(totalCanvasWidth - 360, baseX + jitterX)),
    y: Math.max(60, Math.min(totalCanvasHeight - 320, baseY + jitterY)),
    rotation,
    theme,
  };
}

export default { getCardPosition, COLOR_THEMES };
