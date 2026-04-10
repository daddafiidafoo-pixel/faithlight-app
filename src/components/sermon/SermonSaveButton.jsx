import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SermonSaveButton({ sermon, isSaved = false, onSaveChange }) {
  const [saved, setSaved] = useState(isSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would save to a SavedSermon entity
      // For now, just toggle the state
      setSaved(!saved);
      
      if (!saved) {
        toast.success('Sermon saved to your collection');
      } else {
        toast.success('Sermon removed from saved');
      }
      
      if (onSaveChange) {
        onSaveChange(!saved);
      }
    } catch (error) {
      console.error('Error saving sermon:', error);
      toast.error('Failed to save sermon');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSave}
      disabled={isLoading}
      variant="ghost"
      size="sm"
      className={`gap-2 ${saved ? 'text-yellow-500' : 'text-gray-600'}`}
    >
      <Star 
        className={`w-4 h-4 ${saved ? 'fill-yellow-500' : ''}`}
      />
      {saved ? 'Saved' : 'Save'}
    </Button>
  );
}