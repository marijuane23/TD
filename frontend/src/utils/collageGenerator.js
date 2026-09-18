/**
 * collageGenerator.js
 * Generates custom photo collages based on collage templates:
 * - Template 3: Heart Shape Keepsake (29 photo slots, 1:1 square)
 * - Template 2: Dynamic Cluster Widescreen (25 photo slots, 16:9 mosaic)
 *
 * Rules:
 * - Only uses posted images from the teacher's timeline (excludes teacher portrait).
 * - Reuses/cycles images when there are fewer photos than slots so every slot is filled.
 * - Fits every photo cleanly using centered cover aspect-ratio (no squishing/stretching).
 */

export const COLLAGE_TEMPLATES = {
  template3: {
    id: 'template3',
    name: 'Heart Shape Keepsake',
    tagline: 'Heartfelt Tribute Heart',
    description: '29-slot heart collage expressing deep student appreciation',
    aspectRatio: '1:1',
    originalWidth: 736,
    originalHeight: 736,
    outputWidth: 2000,
    outputHeight: 2000,
    slots: [
      { x: 151, y: 77, width: 67, height: 104 },
      { x: 482, y: 77, width: 103, height: 104 },
      { x: 59, y: 114, width: 85, height: 67 },
      { x: 225, y: 114, width: 103, height: 67 },
      { x: 408, y: 114, width: 67, height: 67 },
      { x: 592, y: 114, width: 67, height: 30 },
      { x: 592, y: 151, width: 104, height: 67 },
      { x: 22, y: 187, width: 122, height: 67 },
      { x: 371, y: 187, width: 67, height: 104 },
      { x: 151, y: 188, width: 103, height: 177 },
      { x: 261, y: 188, width: 104, height: 103 },
      { x: 445, y: 188, width: 67, height: 29 },
      { x: 519, y: 188, width: 67, height: 104 },
      { x: 445, y: 224, width: 67, height: 67 },
      { x: 592, y: 224, width: 126, height: 67 },
      { x: 40, y: 261, width: 104, height: 104 },
      { x: 261, y: 298, width: 214, height: 177 }, // Hero center
      { x: 482, y: 298, width: 103, height: 104 },
      { x: 592, y: 298, width: 104, height: 67 },
      { x: 76, y: 370, width: 69, height: 69 },
      { x: 151, y: 371, width: 103, height: 104 },
      { x: 592, y: 371, width: 67, height: 67 },
      { x: 482, y: 408, width: 103, height: 104 },
      { x: 224, y: 481, width: 67, height: 68 },
      { x: 298, y: 482, width: 103, height: 67 },
      { x: 408, y: 482, width: 67, height: 67 },
      { x: 298, y: 555, width: 67, height: 67 },
      { x: 372, y: 556, width: 66, height: 67 },
      { x: 335, y: 629, width: 66, height: 30 },
    ],
  },
  template2: {
    id: 'template2',
    name: 'Dynamic Cluster Widescreen',
    tagline: '16:9 Mosaic Cluster',
    description: '25-slot modern widescreen photo mosaic',
    aspectRatio: '16:9',
    originalWidth: 641,
    originalHeight: 360,
    outputWidth: 2560,
    outputHeight: 1440,
    slots: [
      { x: 252, y: 28, width: 60, height: 74 },
      { x: 316, y: 50, width: 59, height: 69 },
      { x: 379, y: 65, width: 97, height: 54 },
      { x: 140, y: 77, width: 108, height: 82 },
      { x: 480, y: 96, width: 71, height: 69 },
      { x: 252, y: 106, width: 60, height: 53 },
      { x: 90, y: 120, width: 47, height: 39 },
      { x: 316, y: 123, width: 113, height: 81 },
      { x: 433, y: 123, width: 43, height: 42 },
      { x: 555, y: 154, width: 47, height: 41 },
      { x: 39, y: 162, width: 47, height: 67 },
      { x: 90, y: 162, width: 81, height: 51 },
      { x: 175, y: 162, width: 137, height: 94 },
      { x: 433, y: 169, width: 87, height: 69 },
      { x: 525, y: 169, width: 26, height: 26 },
      { x: 525, y: 199, width: 77, height: 39 },
      { x: 316, y: 208, width: 47, height: 48 },
      { x: 368, y: 208, width: 61, height: 79 },
      { x: 90, y: 217, width: 39, height: 39 },
      { x: 133, y: 217, width: 38, height: 39 },
      { x: 433, y: 242, width: 61, height: 62 },
      { x: 498, y: 242, width: 48, height: 48 },
      { x: 133, y: 259, width: 81, height: 49 },
      { x: 218, y: 259, width: 49, height: 49 },
      { x: 271, y: 259, width: 92, height: 73 },
    ],
  },
};

/**
 * Loads an image from URL safely with crossOrigin and blob fallback.
 */
export const loadImage = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback via fetch blob to avoid canvas tainting
      fetch(url, { mode: 'cors' })
        .then((res) => {
          if (!res.ok) throw new Error('Fetch failed');
          return res.blob();
        })
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            URL.revokeObjectURL(blobUrl);
            resolve(fallbackImg);
          };
          fallbackImg.onerror = () => {
            URL.revokeObjectURL(blobUrl);
            resolve(null);
          };
          fallbackImg.src = blobUrl;
        })
        .catch(() => resolve(null));
    };
    img.src = url;
  });
};

/**
 * Draws an image into a target rectangle with centered 'cover' crop.
 */
export const drawImageCover = (ctx, img, dx, dy, dw, dh, radius = 0) => {
  if (!img || !img.width || !img.height) return;

  const imgRatio = img.width / img.height;
  const targetRatio = dw / dh;
  let sx = 0;
  let sy = 0;
  let sWidth = img.width;
  let sHeight = img.height;

  if (imgRatio > targetRatio) {
    sWidth = img.height * targetRatio;
    sx = (img.width - sWidth) / 2;
  } else {
    sHeight = img.width / targetRatio;
    sy = (img.height - sHeight) / 2;
  }

  ctx.save();
  if (radius > 0) {
    ctx.beginPath();
    ctx.moveTo(dx + radius, dy);
    ctx.lineTo(dx + dw - radius, dy);
    ctx.quadraticCurveTo(dx + dw, dy, dx + dw, dy + radius);
    ctx.lineTo(dx + dw, dy + dh - radius);
    ctx.quadraticCurveTo(dx + dw, dy + dh, dx + dw - radius, dy + dh);
    ctx.lineTo(dx + radius, dy + dh);
    ctx.quadraticCurveTo(dx, dy + dh, dx, dy + dh - radius);
    ctx.lineTo(dx, dy + radius);
    ctx.quadraticCurveTo(dx, dy, dx + radius, dy);
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dw, dh);
  ctx.restore();
};

/**
 * Renders a complete photo collage onto a target canvas.
 *
 * @param {Object} params
 * @param {string} params.templateId - 'template3' (Heart) or 'template2' (Cluster)
 * @param {string[]} params.photoUrls - Array of photo URLs from timeline tributes
 * @param {HTMLCanvasElement} [params.canvas] - Optional canvas element (creates one if omitted)
 * @param {string} [params.teacherName] - Teacher name for bottom/top banner
 * @param {string} [params.collegeName] - Teacher's college/department
 * @param {boolean} [params.includeBanner] - Whether to render celebratory commemorative banner
 * @param {string} [params.theme] - 'light' (clean white) or 'dark' (navy)
 * @returns {Promise<{ canvas: HTMLCanvasElement, dataUrl: string }>}
 */
export const renderCollage = async ({
  templateId = 'template3',
  photoUrls = [],
  canvas = null,
  teacherName = '',
  collegeName = '',
  includeBanner = true,
  theme = 'light',
  onProgress = null,
}) => {
  const template = COLLAGE_TEMPLATES[templateId] || COLLAGE_TEMPLATES.template3;

  if (!photoUrls || photoUrls.length === 0) {
    throw new Error('No timeline photos available to generate a collage.');
  }

  // Pre-load all available unique photos
  if (onProgress) onProgress({ phase: 'loading', current: 0, total: photoUrls.length });

  const loadPromises = photoUrls.map((url, idx) =>
    loadImage(url).then((img) => {
      if (onProgress) onProgress({ phase: 'loading', current: idx + 1, total: photoUrls.length });
      return img;
    })
  );

  const loadedRaw = await Promise.all(loadPromises);
  const loadedImages = loadedRaw.filter((img) => img !== null);

  if (loadedImages.length === 0) {
    throw new Error('Unable to load timeline photos for collage generation.');
  }

  // Prepare canvas
  const cvs = canvas || document.createElement('canvas');
  cvs.width = template.outputWidth;
  cvs.height = template.outputHeight;
  const ctx = cvs.getContext('2d');

  // Background
  if (theme === 'dark') {
    const grad = ctx.createLinearGradient(0, 0, cvs.width, cvs.height);
    grad.addColorStop(0, '#060d1f');
    grad.addColorStop(0.5, '#0b193d');
    grad.addColorStop(1, '#071026');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = '#ffffff';
  }
  ctx.fillRect(0, 0, cvs.width, cvs.height);

  // Scale factors from template coordinate space to output canvas
  const scaleX = cvs.width / template.originalWidth;
  const scaleY = cvs.height / template.originalHeight;

  // Draw each slot
  const totalSlots = template.slots.length;
  for (let i = 0; i < totalSlots; i++) {
    const slot = template.slots[i];
    // Re-use timeline photos cycling evenly
    const img = loadedImages[i % loadedImages.length];

    const dx = slot.x * scaleX;
    const dy = slot.y * scaleY;
    const dw = slot.width * scaleX;
    const dh = slot.height * scaleY;

    // Subtle slot border / shadow
    ctx.save();
    ctx.fillStyle = theme === 'dark' ? '#1e293b' : '#f1f5f9';
    ctx.fillRect(dx, dy, dw, dh);
    ctx.restore();

    // Draw photo with cover crop
    drawImageCover(ctx, img, dx, dy, dw, dh, 4);

    // Optional slot border for crisp contrast
    ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.strokeRect(dx, dy, dw, dh);
  }

  // Commemorative Banner
  if (includeBanner && teacherName) {
    ctx.save();
    ctx.textAlign = 'center';

    if (templateId === 'template3') {
      // Template 3 (Square Heart): Top Header & Bottom Footer
      // Top header
      ctx.font = 'bold 36px "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = theme === 'dark' ? '#fbbf24' : '#1e3a8a';
      ctx.fillText("TEACHER'S DAY CELEBRATION 2026", cvs.width / 2, 50);

      // Bottom footer
      ctx.font = 'bold 44px "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#0f172a';
      ctx.fillText(teacherName, cvs.width / 2, cvs.height - 60);

      ctx.font = '600 24px "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = theme === 'dark' ? '#94a3b8' : '#64748b';
      const sub = collegeName
        ? `${collegeName} • Bohol Island State University — Bilar Campus`
        : 'Bohol Island State University — Bilar Campus';
      ctx.fillText(sub, cvs.width / 2, cvs.height - 24);
    } else {
      // Template 2 (16:9 Widescreen): Top & Bottom Minimal Bar
      ctx.font = 'bold 32px "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = theme === 'dark' ? '#fbbf24' : '#1e3a8a';
      ctx.fillText("BISU BILAR • TEACHER'S DAY CELEBRATION 2026", cvs.width / 2, 45);

      ctx.font = 'bold 40px "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#0f172a';
      ctx.fillText(`${teacherName}${collegeName ? ` • ${collegeName}` : ''}`, cvs.width / 2, cvs.height - 35);
    }
    ctx.restore();
  }

  return {
    canvas: cvs,
    dataUrl: cvs.toDataURL('image/png'),
  };
};
