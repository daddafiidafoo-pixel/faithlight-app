import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { AccessibleSelect } from '@/components/ui/accessible-select';
import { Globe } from 'lucide-react';

export default function BibleVersionSelector({ language, onSelect, selectedBibleId }) {
  const { data: versions = [] } = useQuery({
    queryKey: ['bible-versions', language],
    queryFn: async () => {
      try {
        const result = await base44.entities.BibleVersion.filter({
          language: language,
          isActive: true
        });
        return result || [];
      } catch (error) {
        console.debug('[BibleVersionSelector] Failed to fetch versions:', error?.message);
        return [];
      }
    },
    enabled: !!language
  });

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-500 shrink-0" />
      <AccessibleSelect
        name="bible-version"
        value={selectedBibleId || ''}
        onValueChange={onSelect}
        options={versions.map(v => ({ value: v.id, label: v.name }))}
        placeholder="Select Bible version..."
        className="w-[280px]"
      />
    </div>
  );
}