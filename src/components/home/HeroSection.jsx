import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { BookOpen, Map } from 'lucide-react';

export default function HeroSection({ isAuthenticated }) {
  const canvasRef = useRef(null);

  // Subtle floating particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(250, 204, 21, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="relative text-white overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
        minHeight: '65vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Animated particles canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Glowing orb behind title */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.25) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 py-20 text-center">
        {/* Logo badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-sm font-medium text-indigo-200">
          <BookOpen className="w-4 h-4" />
          FaithLight
        </div>

        {/* Main headline */}
        <h1
          className="font-extrabold leading-tight mb-5 text-white"
          style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', letterSpacing: '-0.02em', lineHeight: 1.15 }}
        >
          Reaching the World<br />
          <span style={{ color: '#FACC15' }}>With God's Word</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl mb-8 font-normal" style={{ color: '#E0E7FF', maxWidth: '520px', margin: '0 auto 2rem' }}>
          Study, grow, and share Scripture globally.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link to={createPageUrl('BibleReader')}>
            <Button
              size="lg"
              className="font-bold gap-2 px-8 rounded-xl shadow-lg transition-all hover:scale-105"
              style={{ background: '#FBBF24', color: '#1E1B4B', border: 'none', boxShadow: '0 4px 24px rgba(251,191,36,0.35)' }}
            >
              <BookOpen className="w-5 h-5" /> Start Reading
            </Button>
          </Link>
          <Link to={createPageUrl('BibleStudyPlans')}>
            <Button
              size="lg"
              variant="outline"
              className="font-semibold gap-2 px-8 rounded-xl transition-all hover:bg-white/10"
              style={{ border: '2px solid rgba(255,255,255,0.7)', color: 'white', background: 'transparent' }}
            >
              <Map className="w-5 h-5" /> Explore Study Plans
            </Button>
          </Link>
        </div>

        {/* Scripture block */}
        <div
          className="inline-block rounded-2xl px-6 py-4 text-center"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <p className="text-white text-sm md:text-base italic leading-relaxed mb-1">
            "Go into all the world and preach the gospel to all creation."
          </p>
          <p className="text-sm font-semibold" style={{ color: '#FACC15' }}>— Mark 16:15</p>
        </div>
      </div>
    </div>
  );
}