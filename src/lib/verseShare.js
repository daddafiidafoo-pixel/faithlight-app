// Generate social media share text
export function generateShareText(verseReference, verseText) {
  return `"${verseText}"\n\n— ${verseReference}\n\nRead more on FaithLight`;
}

// Copy text to clipboard
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return true;
    }
  } catch (e) {
    console.error('Copy failed:', e);
    return false;
  }
}

// Native share API
export async function shareVerse(verseReference, verseText) {
  const text = generateShareText(verseReference, verseText);
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Share a Verse',
        text,
        url: window.location.origin,
      });
      return true;
    } catch (e) {
      if (e.name !== 'AbortError') console.error('Share failed:', e);
      return false;
    }
  }
  return false;
}

// WhatsApp fallback
export function getWhatsAppShareUrl(verseReference, verseText) {
  const text = generateShareText(verseReference, verseText);
  const encoded = encodeURIComponent(text);
  return `https://wa.me/?text=${encoded}`;
}

// Download canvas as image
export async function downloadCanvasAsImage(canvasEl, filename = 'verse.png') {
  try {
    const link = document.createElement('a');
    link.href = canvasEl.toDataURL('image/png');
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (e) {
    console.error('Download failed:', e);
    return false;
  }
}

// Social media share URLs
export function getFacebookShareUrl(verseReference, verseText) {
  const text = `"${verseText}" — ${verseReference}`;
  const encoded = encodeURIComponent(text);
  return `https://www.facebook.com/sharer/sharer.php?quote=${encoded}&href=${encodeURIComponent(window.location.origin)}`;
}

export function getTwitterShareUrl(verseReference, verseText) {
  const text = `"${verseText}" — ${verseReference} #FaithLight`;
  const encoded = encodeURIComponent(text);
  return `https://twitter.com/intent/tweet?text=${encoded}&url=${encodeURIComponent(window.location.origin)}`;
}