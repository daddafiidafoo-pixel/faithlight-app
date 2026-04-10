import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function FavoritesToggle({ prayer, userEmail, onToggle }) {
  const [isFavorite, setIsFavorite] = useState(prayer?.isFavorite || false);
  const queryClient = useQueryClient();

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      const newState = !isFavorite;
      setIsFavorite(newState);

      // Optimistic update done above, now sync to backend
      await base44.functions.invoke('prayerCRUD', {
        action: 'update',
        prayerId: prayer.id,
        isFavorite: newState,
      });

      return newState;
    },
    onSuccess: (newState) => {
      queryClient.invalidateQueries({ queryKey: ['prayers', userEmail] });
      onToggle?.(newState);
    },
    onError: () => {
      setIsFavorite(!isFavorite);
      toast.error('Failed to update favorite');
    },
  });

  const handleToggle = (e) => {
    e.stopPropagation();
    favoriteMutation.mutate();
  };

  return (
    <button
      onClick={handleToggle}
      disabled={favoriteMutation.isPending}
      className={`p-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2 ${
        isFavorite
          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
      } ${favoriteMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star
        className="w-5 h-5"
        fill={isFavorite ? 'currentColor' : 'none'}
      />
    </button>
  );
}