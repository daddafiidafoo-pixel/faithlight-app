import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

export default function GroupCard({ group, onSelect }) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader>
        <CardTitle className="text-lg">{group.group_name}</CardTitle>
        {group.is_private && (
          <span className="text-xs font-semibold px-2 py-1 bg-gray-200 text-gray-700 rounded-full inline-block w-fit">
            Private
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">{group.description || 'No description'}</p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{group.member_count} member{group.member_count !== 1 ? 's' : ''}</span>
        </div>
        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}>
          View Group
        </Button>
      </CardContent>
    </Card>
  );
}