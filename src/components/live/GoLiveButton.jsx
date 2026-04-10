import React from 'react';
import { Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GoLiveButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/LiveBroadcast')}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
    >
      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
      <Radio className="w-4 h-4" />
      Go Live
    </button>
  );
}