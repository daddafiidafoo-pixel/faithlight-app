import React from 'react';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  { value: 'all', label: 'All', icon: '📋' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'gratitude', label: 'Gratitude', icon: '🙏' },
  { value: 'work', label: 'Work', icon: '💼' },
  { value: 'faith', label: 'Faith', icon: '✨' },
  { value: 'relationships', label: 'Relationships', icon: '❤️' },
  { value: 'finances', label: 'Finances', icon: '💰' },
  { value: 'other', label: 'Other', icon: '📌' },
];

export default function CategoryFilter({ activeCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {CATEGORIES.map(cat => (
        <Button
          key={cat.value}
          onClick={() => onCategoryChange(cat.value)}
          variant={activeCategory === cat.value ? 'default' : 'outline'}
          className="text-sm"
        >
          <span className="mr-1">{cat.icon}</span>
          {cat.label}
        </Button>
      ))}
    </div>
  );
}