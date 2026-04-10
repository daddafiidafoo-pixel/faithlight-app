import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, RotateCw, Brain, CheckCircle, XCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemorizationMode({ sermon, onClose }) {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [progress, setProgress] = useState({});
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, total: 0 });

  useEffect(() => {
    // Extract verses and key points from sermon
    const cards = extractFlashcards(sermon.content);
    setFlashcards(cards);
    
    // Load progress from localStorage
    const savedProgress = localStorage.getItem(`sermon-progress-${sermon.topic}`);
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, [sermon]);

  const extractFlashcards = (content) => {
    const cards = [];
    
    // Extract verses (looking for Book Chapter:Verse format)
    const verseMatches = content.matchAll(/([A-Za-z1-3\s]+)\s+(\d+):(\d+(?:-\d+)?)/g);
    for (const match of verseMatches) {
      const reference = `${match[1].trim()} ${match[2]}:${match[3]}`;
      // Find context around the verse
      const index = content.indexOf(match[0]);
      const contextStart = Math.max(0, index - 100);
      const contextEnd = Math.min(content.length, index + 200);
      const context = content.substring(contextStart, contextEnd).trim();
      
      cards.push({
        type: 'verse',
        question: reference,
        answer: context.substring(0, 150) + '...',
        reference: reference
      });
    }

    // Extract key points (looking for numbered or bulleted points)
    const pointMatches = content.matchAll(/(?:\*\*Point \d+:|#{2,3}\s*Point \d+:|\d+\.\s+)(.+?)(?:\n|$)/gi);
    for (const match of pointMatches) {
      const point = match[1].trim();
      if (point.length > 10) {
        cards.push({
          type: 'point',
          question: 'What is this key point?',
          answer: point,
          reference: point.substring(0, 50) + '...'
        });
      }
    }

    // Extract big idea
    const bigIdeaMatch = content.match(/(?:Big Idea|Main Message):\s*(.+?)(?:\n\n|\n#)/is);
    if (bigIdeaMatch) {
      cards.push({
        type: 'big-idea',
        question: 'What is the Big Idea of this sermon?',
        answer: bigIdeaMatch[1].trim(),
        reference: 'Big Idea'
      });
    }

    return cards;
  };

  const calculateNextReview = (difficulty) => {
    // Spaced repetition intervals (in days)
    const intervals = {
      easy: 7,
      good: 3,
      hard: 1
    };
    
    const days = intervals[difficulty] || 1;
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + days);
    return nextReview.toISOString();
  };

  const handleRating = (difficulty) => {
    const card = flashcards[currentIndex];
    const cardKey = `${card.type}-${currentIndex}`;
    
    const updatedProgress = {
      ...progress,
      [cardKey]: {
        difficulty,
        lastReviewed: new Date().toISOString(),
        nextReview: calculateNextReview(difficulty),
        reviewCount: (progress[cardKey]?.reviewCount || 0) + 1
      }
    };
    
    setProgress(updatedProgress);
    localStorage.setItem(`sermon-progress-${sermon.topic}`, JSON.stringify(updatedProgress));

    // Update stats
    if (difficulty === 'easy' || difficulty === 'good') {
      setSessionStats(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1, total: prev.total + 1 }));
    }

    // Move to next card
    setTimeout(() => {
      setShowAnswer(false);
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Restart from beginning
        setCurrentIndex(0);
      }
    }, 500);
  };

  const getCardProgress = (index) => {
    const card = flashcards[index];
    const cardKey = `${card.type}-${index}`;
    return progress[cardKey];
  };

  const getDueCards = () => {
    const now = new Date();
    return flashcards.filter((card, index) => {
      const cardProgress = getCardProgress(index);
      if (!cardProgress) return true;
      return new Date(cardProgress.nextReview) <= now;
    });
  };

  if (flashcards.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-indigo-600" />
                Memorization Mode
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">No flashcards could be extracted from this sermon.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const cardProgress = getCardProgress(currentIndex);
  const dueCards = getDueCards();
  const masteredCards = flashcards.filter((_, i) => {
    const p = getCardProgress(i);
    return p && p.reviewCount >= 3 && p.difficulty === 'easy';
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-t-xl p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Brain className="w-6 h-6 text-indigo-600" />
                  Memorization Mode
                </h2>
                <p className="text-sm text-gray-600">{sermon.title}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                {masteredCards.length} Mastered
              </Badge>
              <Badge variant="outline" className="gap-1">
                <RotateCw className="w-3 h-3 text-blue-500" />
                {dueCards.length} Due
              </Badge>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress: {currentIndex + 1} / {flashcards.length}</span>
              <span className="text-gray-600">
                Session: {sessionStats.correct} ✓ / {sessionStats.incorrect} ✗
              </span>
            </div>
            <Progress value={((currentIndex + 1) / flashcards.length) * 100} />
          </div>
        </div>

        {/* Flashcard */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl"
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow bg-white min-h-[400px] flex flex-col"
                onClick={() => setShowAnswer(!showAnswer)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-2">
                        {currentCard.type === 'verse' ? '📖 Verse' : 
                         currentCard.type === 'big-idea' ? '💡 Big Idea' : '🎯 Key Point'}
                      </Badge>
                      {cardProgress && (
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Reviewed {cardProgress.reviewCount}x
                          </Badge>
                          {cardProgress.difficulty && (
                            <Badge variant="outline" className={`text-xs ${
                              cardProgress.difficulty === 'easy' ? 'bg-green-50 text-green-700' :
                              cardProgress.difficulty === 'good' ? 'bg-blue-50 text-blue-700' :
                              'bg-orange-50 text-orange-700'
                            }`}>
                              {cardProgress.difficulty}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {currentCard.reference}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {!showAnswer ? (
                      <motion.div
                        key="question"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center"
                      >
                        <p className="text-2xl font-semibold text-gray-900 mb-4">
                          {currentCard.question}
                        </p>
                        <p className="text-gray-500 text-sm">Click to reveal answer</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="answer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                      >
                        <p className="text-lg text-gray-900 leading-relaxed">
                          {currentCard.answer}
                        </p>
                        <div className="text-center pt-4">
                          <p className="text-sm text-gray-600 mb-3">How well did you remember?</p>
                          <div className="flex gap-3 justify-center">
                            <Button
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); handleRating('hard'); }}
                              className="gap-2 border-orange-200 hover:bg-orange-50"
                            >
                              <XCircle className="w-4 h-4 text-orange-600" />
                              Hard (1 day)
                            </Button>
                            <Button
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); handleRating('good'); }}
                              className="gap-2 border-blue-200 hover:bg-blue-50"
                            >
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                              Good (3 days)
                            </Button>
                            <Button
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); handleRating('easy'); }}
                              className="gap-2 border-green-200 hover:bg-green-50"
                            >
                              <Star className="w-4 h-4 text-green-600" />
                              Easy (7 days)
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-b-xl p-4 border-t flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setShowAnswer(false);
              setCurrentIndex(Math.max(0, currentIndex - 1));
            }}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setCurrentIndex(0);
                setShowAnswer(false);
              }}
              className="gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Restart
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setShowAnswer(false);
              setCurrentIndex(Math.min(flashcards.length - 1, currentIndex + 1));
            }}
            disabled={currentIndex === flashcards.length - 1}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}