// Media validation utilities

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export async function validateMediaFile(file) {
  if (!file) return { valid: true };

  // 1. File size check (50MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const mbSize = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File is too large (${mbSize}MB). Maximum allowed upload size is 50MB.`);
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    throw new Error('Unsupported file format. Please upload JPG, PNG, WEBP, MP4, or WEBM.');
  }

  // 2. Video duration check (strictly 20s to 120s)
  if (isVideo) {
    const duration = await getVideoDuration(file);
    if (duration < 20 || duration > 120) {
      throw new Error(
        `Video must be between 20 and 120 seconds long. Your video is ${Math.round(duration)} seconds.`
      );
    }
    return { valid: true, type: 'video', duration };
  }

  return { valid: true, type: 'image' };
}

function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read video metadata. Please ensure the video file is not corrupted.'));
    };

    video.src = objectUrl;
  });
}
