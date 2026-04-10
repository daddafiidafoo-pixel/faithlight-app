import { toPng } from 'html-to-image';

const formatSizes = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  portrait: { width: 1080, height: 1350 }
};

function buildFileName(reference, format) {
  const safeRef = reference.replace(/\s+/g, '-').replace(/:/g, '-');
  return `faithlight-${safeRef}-${format}.png`;
}

export async function exportVerseShareImage(element, format, reference) {
  const size = formatSizes[format];

  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    canvasWidth: size.width,
    canvasHeight: size.height,
    width: size.width,
    height: size.height,
    style: {
      width: `${size.width}px`,
      height: `${size.height}px`
    }
  });

  return {
    dataUrl,
    fileName: buildFileName(reference, format)
  };
}

export async function downloadVerseShareImage(element, format, reference) {
  const { dataUrl, fileName } = await exportVerseShareImage(
    element,
    format,
    reference
  );

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

export async function shareVerseShareImage(
  element,
  format,
  reference,
  fallbackText
) {
  const { dataUrl, fileName } = await exportVerseShareImage(
    element,
    format,
    reference
  );

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const file = new File([blob], fileName, { type: 'image/png' });

  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      files: [file],
      title: reference,
      text: fallbackText || 'Shared from FaithLight'
    });
    return;
  }

  // Fallback: download image
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}