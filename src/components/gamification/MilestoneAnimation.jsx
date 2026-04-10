import React, { useEffect, useState } from 'react';
import { Trophy, Sparkles } from 'lucide-react';

export default function MilestoneAnimation({ milestone, onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="animate-bounce">
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-75 animate-pulse" />
          <div className="relative bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full p-6 flex items-center justify-center shadow-2xl">
            <Trophy size={48} className="text-white drop-shadow-lg" />
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping"
            style={{
              left: `${100 * Math.cos((i * Math.PI) / 3)}px`,
              top: `${100 * Math.sin((i * Math.PI) / 3)}px`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute bottom-1/3 text-center animate-fade-in-up">
        <p className="text-2xl font-bold text-white drop-shadow-lg">{milestone}-Day Streak! 🎉</p>
        <p className="text-white text-sm drop-shadow-lg mt-1">Amazing consistency!</p>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}