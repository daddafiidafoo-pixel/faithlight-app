import React, { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Star } from 'lucide-react';

const RATING_STORAGE_KEY = 'faithlight_rating_shown';
const RATING_COOLDOWN_DAYS = 30; // Don't show rating prompt more than once per month

export function useRatingPrompt() {
  const [showRating, setShowRating] = useState(false);

  const canShowRating = () => {
    const lastShown = localStorage.getItem(RATING_STORAGE_KEY);
    if (!lastShown) return true;

    const lastShownDate = new Date(lastShown);
    const daysSinceShown = (new Date() - lastShownDate) / (1000 * 60 * 60 * 24);
    return daysSinceShown >= RATING_COOLDOWN_DAYS;
  };

  const triggerRatingPrompt = () => {
    if (canShowRating()) {
      setShowRating(true);
      localStorage.setItem(RATING_STORAGE_KEY, new Date().toISOString());
    }
  };

  return { showRating, setShowRating, triggerRatingPrompt };
}

export function RatingPrompt({ show, onClose, reason = 'default' }) {
  const handleRate = () => {
    // Detect platform and open appropriate store
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      // iOS App Store — requires app ID (replace with your actual ID when live)
      window.open('https://apps.apple.com/app/faithlight/id6738484502?action=write-review', '_blank');
    } else if (isAndroid) {
      // Android Google Play — replace with your actual package name
      window.open('https://play.google.com/store/apps/details?id=app.faithlight', '_blank');
    } else {
      // Fallback for web
      alert('Thanks! Please rate FaithLight in the App Store to help others discover it.');
    }

    onClose();
  };

  const messages = {
    readingPlanComplete: {
      title: 'Enjoying Your Reading Plan?',
      description: 'You\'ve made great progress in Scripture. Help others discover FaithLight—rate us on the App Store!'
    },
    churchSession: {
      title: 'Great Church Experience?',
      description: 'Thanks for joining a live church session! Share your FaithLight experience with others.'
    },
    prayerSupport: {
      title: 'Feeling Supported?',
      description: 'We\'re so glad our community helped you. Rate FaithLight to help your friends discover it too.'
    },
    default: {
      title: 'Love FaithLight?',
      description: 'Help others grow in their faith—rate us on the App Store!'
    }
  };

  const content = messages[reason] || messages.default;

  return (
    <AlertDialog open={show} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-sm">
        <div className="flex justify-center mb-4">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>
        <AlertDialogHeader>
          <AlertDialogTitle>{content.title}</AlertDialogTitle>
          <AlertDialogDescription className="pt-2">
            {content.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 pt-4">
          <AlertDialogCancel>Later</AlertDialogCancel>
          <AlertDialogAction onClick={handleRate} className="bg-indigo-600 hover:bg-indigo-700">
            Rate Now
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}