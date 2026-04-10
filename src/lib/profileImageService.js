import { base44 } from '@/api/base44Client';

const MAX_FILE_SIZE_MB = 10;
const MAX_DIMENSION = 400; // square avatar

/**
 * Resize & crop image file to a square canvas, return as Blob
 */
async function resizeToSquare(file, size = MAX_DIMENSION) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Center-crop to square
      const minSide = Math.min(img.width, img.height);
      const sx = (img.width - minSide) / 2;
      const sy = (img.height - minSide) / 2;
      ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/jpeg', 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

/**
 * Upload from gallery file input
 */
export async function updateProfileImageFromGallery(file) {
  if (!file) throw new Error('No file provided');

  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) throw new Error('Invalid file type. Use JPG, PNG, or WebP.');

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`File too large. Max ${MAX_FILE_SIZE_MB}MB.`);
  }

  // Resize to square avatar
  const blob = await resizeToSquare(file);
  const resizedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

  const { file_url } = await base44.integrations.Core.UploadFile({ file: resizedFile });

  await base44.auth.updateMe({
    profileImageUrl: file_url,
    profileImageSource: 'gallery',
    profileVerseCardId: null,
  });

  return file_url;
}

/**
 * Set profile picture from a verse card image URL
 */
export async function updateProfileImageFromVerseCard(imageUrl, cardId) {
  if (!imageUrl) throw new Error('No verse card image URL provided');

  // Fetch the image, resize to square, re-upload
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  const file = new File([blob], 'verse-avatar.jpg', { type: 'image/jpeg' });

  const squareBlob = await resizeToSquare(file);
  const squareFile = new File([squareBlob], 'verse-avatar.jpg', { type: 'image/jpeg' });

  const { file_url } = await base44.integrations.Core.UploadFile({ file: squareFile });

  await base44.auth.updateMe({
    profileImageUrl: file_url,
    profileImageSource: 'verse_card',
    profileVerseCardId: cardId || null,
  });

  return file_url;
}

/**
 * Remove profile image
 */
export async function removeProfileImage() {
  await base44.auth.updateMe({
    profileImageUrl: null,
    profileImageSource: null,
    profileVerseCardId: null,
  });
}