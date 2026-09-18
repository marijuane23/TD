/**
 * pdfGenerator.js
 * Generates a commemorative multi-page PDF Keepsake Album for a teacher:
 * - Includes all text messages and attached photos.
 * - Automatically excludes video items.
 * - Features a branded BISU Bilar cover page and elegant tribute cards.
 */

import { jsPDF } from 'jspdf';
import { loadImage } from './collageGenerator.js';
import { API_BASE_URL } from '../api/client.js';

/**
 * Sanitizes text for jsPDF Standard Fonts (Helvetica)
 * Preserves Latin-1 characters (like ñ, accented vowels), converts smart quotes, and strips emojis.
 */
const sanitizeForPdf = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/[\u2018\u2019]/g, "'") // smart single quotes
    .replace(/[\u201C\u201D]/g, '"') // smart double quotes
    .replace(/[\u2013\u2014]/g, '-') // en-dash, em-dash
    .replace(/\u2026/g, '...') // ellipsis
    .replace(/[^\x20-\x7E\u00A0-\u00FF\n\r\t]/g, ''); // keep standard ASCII + Latin-1, remove emojis
};

/**
 * Converts an image URL into a base64 JPEG data URL with dimensions.
 */
export const urlToDataUrl = async (url) => {
  try {
    const img = await loadImage(url);
    if (!img || !img.width || !img.height) return null;

    const canvas = document.createElement('canvas');
    // Limit max resolution to keep PDF size reasonable
    const maxDim = 1200;
    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.85),
      width: w,
      height: h,
    };
  } catch (err) {
    console.error('urlToDataUrl error:', err);
    return null;
  }
};

/**
 * Generates and downloads the PDF Keepsake Album.
 *
 * @param {Object} params
 * @param {Object} params.teacher - Teacher object
 * @param {Array} params.messages - All timeline messages
 * @param {Function} [params.onProgress] - Progress callback ({ percent, status })
 * @returns {Promise<void>}
 */
export const generateKeepsakePdf = async ({ teacher, messages = [], onProgress = null }) => {
  if (!teacher) throw new Error('Teacher data is required.');

  // Filter out pure video messages; keep messages with photos or text
  const eligibleMessages = messages.filter((m) => {
    const isVideo = m.media_type === 'video' || (m.media_mime && m.media_mime.startsWith('video/'));
    const hasText = Boolean((m.message_text || m.message || '').trim());
    // If it has video but no text, exclude from static keepsake PDF
    if (isVideo && !hasText) return false;
    return true;
  });

  const photoMessages = eligibleMessages.filter(
    (m) =>
      (m.media_type === 'image' || (m.media_mime && m.media_mime.startsWith('image/'))) &&
      (m.media_url || m.media_id)
  );


  const totalSteps = 2 + photoMessages.length + eligibleMessages.length;
  let completedSteps = 0;

  const updateProgress = (status) => {
    completedSteps++;
    if (onProgress) {
      const percent = Math.min(Math.round((completedSteps / totalSteps) * 100), 98);
      onProgress({ percent, status });
    }
  };

  updateProgress('Preparing document layout...');

  // Initialize jsPDF (A4 portrait, units: mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2; // 178mm

  // ----------------------------------------------------
  // 1. COVER PAGE
  // ----------------------------------------------------
  updateProgress('Generating cover page...');

  // Header deep navy background banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 56, 'F');

  // Gold accent line
  doc.setFillColor(234, 179, 8); // bisu-gold
  doc.rect(0, 56, pageWidth, 3, 'F');

  // Header text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('BOHOL ISLAND STATE UNIVERSITY — BILAR CAMPUS', pageWidth / 2, 22, { align: 'center' });

  doc.setTextColor(234, 179, 8);
  doc.setFontSize(10);
  doc.text("TEACHER'S DAY CELEBRATION 2026", pageWidth / 2, 32, { align: 'center' });

  doc.setTextColor(203, 213, 225); // slate-300
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('COMMEMORATIVE TRIBUTE KEEPSAKE ALBUM', pageWidth / 2, 42, { align: 'center' });

  // Teacher photo on cover page
  let coverY = 72;
  if (teacher.photo_url) {
    try {
      const photoData = await urlToDataUrl(teacher.photo_url);
      if (photoData) {
        const photoSize = 48;
        const photoX = (pageWidth - photoSize) / 2;

        // Gold border box around photo
        doc.setDrawColor(234, 179, 8);
        doc.setLineWidth(1.2);
        doc.rect(photoX - 1.5, coverY - 1.5, photoSize + 3, photoSize + 3);

        doc.addImage(photoData.dataUrl, 'JPEG', photoX, coverY, photoSize, photoSize);
        coverY += photoSize + 14;
      } else {
        coverY += 10;
      }
    } catch {
      coverY += 10;
    }
  } else {
    coverY += 16;
  }

  // Teacher Name
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(teacher.name || 'Honored Faculty', pageWidth / 2, coverY, { align: 'center' });
  coverY += 8;

  // College & Department
  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const deptStr = teacher.college_name
    ? `${teacher.college_name}${teacher.department ? ` • ${teacher.department}` : ''}`
    : teacher.department || 'BISU Faculty Mentor';
  doc.text(deptStr, pageWidth / 2, coverY, { align: 'center' });
  coverY += 16;

  // Subtle separator line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(marginX + 20, coverY, pageWidth - marginX - 20, coverY);
  coverY += 14;

  // Statistics & Summary Box
  const boxWidth = 140;
  const boxX = (pageWidth - boxWidth) / 2;
  const boxHeight = 44;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(boxX, coverY, boxWidth, boxHeight, 4, 4, 'FD');

  doc.setTextColor(30, 58, 138); // blue-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('A Legacy of Mentorship & Gratitude', pageWidth / 2, coverY + 11, { align: 'center' });

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(
    `This special keepsake contains ${eligibleMessages.length} heartfelt tributes`,
    pageWidth / 2,
    coverY + 20,
    { align: 'center' }
  );
  doc.text(
    `and ${photoMessages.length} memorable photos dedicated by students & peers.`,
    pageWidth / 2,
    coverY + 27,
    { align: 'center' }
  );

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text(
    `Compiled on ${new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}`,
    pageWidth / 2,
    coverY + 36,
    { align: 'center' }
  );

  // Bottom Slogan / Footer
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text(
    'Honoring our mentors with gratitude • Computing Society x SaPaSu',
    pageWidth / 2,
    pageHeight - 20,
    { align: 'center' }
  );

  // ----------------------------------------------------
  // 2. TRIBUTE PAGES
  // ----------------------------------------------------
  let currentPage = 1;

  const drawPageHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('BOHOL ISLAND STATE UNIVERSITY • TEACHER\'S DAY 2026', marginX, 13);
    doc.text(`Tributes for ${teacher.name}`, pageWidth - marginX, 13, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(marginX, 16, pageWidth - marginX, 16);
  };

  const startNewTributePage = () => {
    doc.addPage();
    currentPage++;
    drawPageHeader();
    return 24; // starting Y for cards
  };

  let currentY = startNewTributePage();
  const maxY = pageHeight - 22;

  // Pre-load all photo images for tributes
  const photoCache = new Map();
  for (let i = 0; i < photoMessages.length; i++) {
    const m = photoMessages[i];
    const url = m.media_url || (m.media_id ? `${API_BASE_URL}/media/${m.media_id}` : null);
    if (url && !photoCache.has(url)) {
      updateProgress(`Loading photo ${i + 1} of ${photoMessages.length}...`);
      const imgData = await urlToDataUrl(url);
      if (imgData) photoCache.set(url, imgData);
    }
  }

  // Iterate over eligible messages and draw cards
  for (let i = 0; i < eligibleMessages.length; i++) {
    const m = eligibleMessages[i];
    updateProgress(`Composing tribute ${i + 1} of ${eligibleMessages.length}...`);

    const rawAuthor = (m.sender_name || m.author_name || '').trim();
    const author = sanitizeForPdf(
      rawAuthor && rawAuthor.toLowerCase() !== 'anonymous'
        ? rawAuthor
        : (rawAuthor || 'Anonymous Student')
    );

    const dateStr = m.created_at
      ? new Date(m.created_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '';

    const text = sanitizeForPdf((m.message_text || m.message || '').trim());
    const textLines = text ? doc.splitTextToSize(text, contentWidth - 16) : [];
    const textHeight = textLines.length * 4.4;

    // Check photo attachment
    const photoUrl = m.media_url || (m.media_id ? `${API_BASE_URL}/media/${m.media_id}` : null);
    const hasPhoto =
      (m.media_type === 'image' || (m.media_mime && m.media_mime.startsWith('image/'))) &&
      photoUrl &&
      photoCache.has(photoUrl);

    let photoDrawW = 0;
    let photoDrawH = 0;
    if (hasPhoto) {
      const cached = photoCache.get(photoUrl);
      const aspect = cached.width / cached.height;
      const maxPhotoW = contentWidth - 20;
      const maxPhotoH = 65; // mm

      if (aspect >= 1) {
        photoDrawW = Math.min(maxPhotoW, 110);
        photoDrawH = photoDrawW / aspect;
        if (photoDrawH > maxPhotoH) {
          photoDrawH = maxPhotoH;
          photoDrawW = photoDrawH * aspect;
        }
      } else {
        photoDrawH = Math.min(maxPhotoH, 60);
        photoDrawW = photoDrawH * aspect;
      }
    }

    // Card dimensions
    const cardPaddingTop = 8;
    const cardPaddingBottom = 8;
    const headerHeight = 8;
    const spacing = 4;
    const cardHeight =
      cardPaddingTop +
      headerHeight +
      (textHeight > 0 ? textHeight + spacing : 0) +
      (hasPhoto ? photoDrawH + spacing + 2 : 0) +
      cardPaddingBottom;

    // Check if card fits on current page
    if (currentY + cardHeight > maxY) {
      currentY = startNewTributePage();
    }

    // Draw card background
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(marginX, currentY, contentWidth, cardHeight, 3, 3, 'FD');

    // Left accent bar
    doc.setFillColor(234, 179, 8); // gold accent
    doc.roundedRect(marginX, currentY, 2.5, cardHeight, 1.2, 1.2, 'F');

    let innerY = currentY + cardPaddingTop + 2;

    // Author & date
    doc.setTextColor(30, 58, 138); // blue-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(author, marginX + 8, innerY);

    if (dateStr) {
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(dateStr, pageWidth - marginX - 8, innerY, { align: 'right' });
    }
    innerY += 6;

    // Message text
    if (textLines.length > 0) {
      doc.setTextColor(51, 65, 85); // slate-700
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(textLines, marginX + 8, innerY);
      innerY += textHeight + spacing;
    }

    // Embedded photo
    if (hasPhoto) {
      const cached = photoCache.get(photoUrl);
      const photoX = (pageWidth - photoDrawW) / 2;


      // Photo border
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.rect(photoX - 0.5, innerY - 0.5, photoDrawW + 1, photoDrawH + 1);

      doc.addImage(cached.dataUrl, 'JPEG', photoX, innerY, photoDrawW, photoDrawH);
      innerY += photoDrawH + spacing;
    }

    currentY += cardHeight + 5; // space between cards
  }

  // ----------------------------------------------------
  // 3. RUNNING FOOTERS (Page X of Y)
  // ----------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Bohol Island State University — Bilar Campus', marginX, pageHeight - 10);
    doc.text(`Page ${p - 1} of ${totalPages - 1}`, pageWidth - marginX, pageHeight - 10, {
      align: 'right',
    });
  }

  updateProgress('Finalizing and downloading PDF...');

  // Trigger download
  const cleanName = (teacher.name || 'Teacher').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanName}_Keepsake_Album.pdf`;
  doc.save(filename);
};
