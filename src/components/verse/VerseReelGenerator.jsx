import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Loader, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;
const FPS = 30;
const DURATION = 15; // seconds

export default function VerseReelGenerator({ reference, verseText, reflection }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const canvasRef = useRef(null);

  const drawFrame = (ctx, progress) => {
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#6C5CE7');
    gradient.addColorStop(1, '#5F3DC4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // FaithLight branding (top)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 48px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('FaithLight', CANVAS_WIDTH / 2, 120);

    // Verse reference (fade in)
    const refAlpha = Math.min(progress / 3, 1);
    ctx.fillStyle = `rgba(255, 255, 255, ${refAlpha})`;
    ctx.font = 'bold 64px Inter';
    ctx.fillText(reference, CANVAS_WIDTH / 2, 400);

    // Verse text (main, animate in)
    const textAlpha = Math.min((progress - 1) / 3, 1);
    ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha * 0.95})`;
    ctx.font = '48px Inter';
    ctx.textAlign = 'center';

    const maxWidth = CANVAS_WIDTH - 80;
    const words = verseText.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);

    const lineHeight = 60;
    const totalHeight = lines.length * lineHeight;
    let y = 900 - totalHeight / 2;

    lines.forEach((line) => {
      ctx.fillText(line, CANVAS_WIDTH / 2, y);
      y += lineHeight;
    });

    // Reflection (fade in at end)
    const reflectAlpha = Math.max((progress - 10) / 5, 0);
    ctx.fillStyle = `rgba(255, 255, 255, ${reflectAlpha * 0.8})`;
    ctx.font = '32px italic Inter';
    ctx.fillText(reflection.substring(0, 80), CANVAS_WIDTH / 2, 1600);

    // Bottom branding
    const brandAlpha = Math.min(progress / 3, 1);
    ctx.fillStyle = `rgba(255, 255, 255, ${brandAlpha * 0.7})`;
    ctx.font = '28px Inter';
    ctx.fillText('Growing in faith through biblical education', CANVAS_WIDTH / 2, 1850);
  };

  const generateReel = async () => {
    setIsGenerating(true);

    try {
      // Get AI reflection
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a brief 1-sentence reflection on this Bible verse: "${verseText}" (Reference: ${reference}). Make it inspirational and concise.`,
      });

      const reflectionText = aiResponse.substring(0, 80);

      // Create canvas frames
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      const ctx = canvas.getContext('2d');

      // Create video using canvas to blob
      const mediaStream = canvas.captureStream(FPS);
      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoBlob(blob);
      };

      mediaRecorder.start();

      // Draw frames
      const frameCount = DURATION * FPS;
      for (let i = 0; i < frameCount; i++) {
        const progress = (i / frameCount) * DURATION;
        drawFrame(ctx, progress);
        await new Promise((r) => setTimeout(r, 1000 / FPS));
      }

      mediaRecorder.stop();
    } catch (err) {
      console.error('Reel generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReel = () => {
    if (!videoBlob) return;
    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verse-reel-${reference.replace(/\s+/g, '-')}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareReel = () => {
    if (!videoBlob) return;
    if (navigator.share) {
      navigator.share({
        title: `${reference} - FaithLight`,
        text: verseText,
        files: [
          new File([videoBlob], `verse-reel-${reference}.webm`, {
            type: 'video/webm',
          }),
        ],
      });
    } else {
      alert('Share feature not supported on this device. Use Download instead.');
    }
  };

  return (
    <div className="space-y-4">
      {!videoBlob ? (
        <Button
          onClick={generateReel}
          disabled={isGenerating}
          className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          {isGenerating ? (
            <>
              <Loader size={18} className="animate-spin" />
              Generating Reel...
            </>
          ) : (
            'Generate Verse Reel'
          )}
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <p className="text-white text-sm mb-2">Preview (15-second video generated)</p>
            <p className="text-gray-400 text-xs">
              Ready to share on TikTok, Instagram Reels, and YouTube Shorts
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={downloadReel}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Download size={18} />
              Download
            </Button>
            <Button
              onClick={shareReel}
              className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Share2 size={18} />
              Share
            </Button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}