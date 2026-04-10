import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ContinueReadingTracker } from './ContinueReadingTracker';
import { ChevronRight, BookOpen, History } from 'lucide-react';

/**
 * Dashboard card showing continue reading and recently viewed verses
 */
export default function ContinueReadingCard() {
  const [lastVerse, setLastVerse] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const last = ContinueReadingTracker.getLastVerse();
    const hist = ContinueReadingTracker.getHistory();
    setLastVerse(last);
    setHistory(hist.slice(0, 5)); // Show top 5
  }, []);

  if (!lastVerse) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Continue Reading</h3>
        </div>
        <p className="text-muted-foreground text-sm">
          Start reading to track your Bible passages here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Continue Reading</h3>
      </div>

      {/* Last Verse */}
      <Link
        to={`/DailyDevotional?verse=${encodeURIComponent(lastVerse.reference)}`}
        className="block p-4 bg-primary/5 border border-primary/20 rounded-lg mb-4 hover:bg-primary/10 transition-colors"
      >
        <p className="text-sm font-semibold text-primary mb-1">{lastVerse.reference}</p>
        <p className="text-sm text-foreground line-clamp-2 mb-3">{lastVerse.text}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Continue reading</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </Link>

      {/* History Toggle */}
      {history.length > 0 && (
        <>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center gap-2 text-sm text-primary hover:text-primary/80 mb-3 transition-colors"
          >
            <History className="w-4 h-4" />
            <span>Recent verses ({history.length})</span>
            <span className="ml-auto text-xs">{showHistory ? '−' : '+'}</span>
          </button>

          {/* History List */}
          {showHistory && (
            <div className="space-y-2 border-t border-border pt-3">
              {history.map((verse, idx) => (
                <Link
                  key={idx}
                  to={`/DailyDevotional?verse=${encodeURIComponent(verse.reference)}`}
                  className="block p-2 rounded text-xs hover:bg-muted transition-colors"
                >
                  <p className="font-medium text-foreground">{verse.reference}</p>
                  <p className="text-muted-foreground line-clamp-1 mt-0.5">{verse.text}</p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}