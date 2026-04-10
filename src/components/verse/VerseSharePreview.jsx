import React, { useEffect, useRef } from 'react';

export default function VerseSharePreview({ verse, reference, format, template, fontStyle, language }) {
  const canvasRef = useRef(null);

  const getDimensions = (fmt) => {
    switch (fmt) {
      case 'square':
        return { width: 512, height: 512 };
      case 'story':
        return { width: 1080, height: 1920 };
      case 'portrait':
        return { width: 1080, height: 1350 };
      default:
        return { width: 1080, height: 1920 };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = getDimensions(format);
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    if (template.bgGradient.includes('gradient')) {
      // Parse gradient (simplified)
      const colors = template.bgGradient.match(/#[0-9a-f]{6}/gi) || ['#fff', '#f3f4f6'];
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[colors.length - 1]);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = template.bgGradient;
    }
    ctx.fillRect(0, 0, width, height);

    // Subtle overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);

    // Cross watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.font = `${width * 0.15}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('✝', width / 2, height * 0.15);

    // Verse text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = `${width * 0.05}px ${fontStyle.family}`;
    ctx.textAlign = 'center';
    ctx.lineWidth = width * 0.02;

    // Word wrap
    const maxWidth = width * 0.8;
    const words = verse.split(' ');
    let lines = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);

    const lineHeight = width * 0.08;
    const startY = height * 0.3;
    lines.forEach((line, i) => {
      ctx.fillText(`"${line}"`, width / 2, startY + i * lineHeight);
    });

    // Reference
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = `bold ${width * 0.04}px ${fontStyle.family}`;
    ctx.fillText(`— ${reference}`, width / 2, startY + (lines.length + 1.5) * lineHeight);

    // FaithLight branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = `${width * 0.03}px ${fontStyle.family}`;
    ctx.fillText('Made with FaithLight · faithlight.app', width / 2, height * 0.95);
  }, [verse, reference, format, template, fontStyle]);

  const { width, height } = getDimensions(format);
  const scale = Math.min(300 / width, 400 / height);

  return (
    <canvas
      id="verse-share-preview"
      ref={canvasRef}
      style={{
        width: `${width * scale}px`,
        height: `${height * scale}px`,
        borderRadius: 8,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      }}
    />
  );
}