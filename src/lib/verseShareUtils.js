/**
 * Verse Share Utilities
 * Handles copying, native share, and social platform URLs
 */

const APP_URL = 'https://faithlight.app';

/**
 * Copy verse to clipboard as plain text
 */
export async function copyVerseToClipboard(verseText, reference) {
  const text = `"${verseText}"\n\n— ${reference}\n\nShared via FaithLight`;
  
  try {
    await navigator.clipboard.writeText(text);
    return { success: true, message: 'Copied to clipboard' };
  } catch (error) {
    console.error('[copyVerseToClipboard] error:', error);
    return { success: false, message: 'Failed to copy' };
  }
}

/**
 * Generate WhatsApp share URL
 */
export function getWhatsAppShareUrl(verseText, reference) {
  const message = encodeURIComponent(
    `"${verseText}"\n\n— ${reference}\n\n${APP_URL}`
  );
  return `https://wa.me/?text=${message}`;
}

/**
 * Generate Facebook share URL (fallback to share dialog)
 */
export function getFacebookShareUrl(reference) {
  const url = new URL('https://www.facebook.com/sharer/sharer.php');
  url.searchParams.set('u', `${APP_URL}?verse=${encodeURIComponent(reference)}`);
  return url.toString();
}

/**
 * Prepare text for native share (Web Share API)
 */
export function getShareData(verseText, reference) {
  return {
    title: `${reference} - FaithLight`,
    text: `"${verseText}"\n\n— ${reference}`,
    url: APP_URL,
  };
}

/**
 * Check if native share is available
 */
export function isNativeShareAvailable() {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

/**
 * Trigger native share if available
 */
export async function shareNative(verseText, reference) {
  if (!isNativeShareAvailable()) {
    return { success: false, message: 'Native share not available' };
  }

  try {
    await navigator.share(getShareData(verseText, reference));
    return { success: true, message: 'Shared successfully' };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, message: 'Share cancelled' };
    }
    console.error('[shareNative] error:', error);
    return { success: false, message: 'Share failed' };
  }
}

/**
 * Generate social image from VerseShareCard using html2canvas
 * Returns blob for download/preview
 */
export async function generateVerseImage(verseText, reference) {
  try {
    const { default: html2canvas } = await import('html2canvas');
    
    // Ensure card is in DOM
    const cardElement = document.getElementById('verse-share-card');
    if (!cardElement) {
      return { success: false, message: 'Share card not found in DOM' };
    }

    const canvas = await html2canvas(cardElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: null,
    });

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    return { success: true, blob, message: 'Image generated' };
  } catch (error) {
    console.error('[generateVerseImage] error:', error);
    return { success: false, message: 'Failed to generate image' };
  }
}

/**
 * Download image blob as PNG file
 */
export function downloadVerseImage(blob, reference) {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reference.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { success: true, message: 'Image downloaded' };
  } catch (error) {
    console.error('[downloadVerseImage] error:', error);
    return { success: false, message: 'Failed to download image' };
  }
}