import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Button } from '@/components/ui/button';

export default function ProfileCompletionCard({ user }) {
  const completionItems = [
    { label: 'Profile photo', completed: !!user?.profile_photo_url },
    { label: 'Bio', completed: !!user?.bio },
    { label: 'Spiritual gifts', completed: user?.spiritual_gifts?.length > 0 },
    { label: 'Expertise areas', completed: user?.expertise_areas?.length > 0 },
    { label: 'Learning goals', completed: user?.learning_goals?.length > 0 },
    { label: 'Interests', completed: user?.interests?.length > 0 },
  ];

  const completed = completionItems.filter(item => item.completed).length;
  const total = completionItems.length;
  const percentage = (completed / total) * 100;

  if (percentage === 100) return null;

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="text-lg">Complete Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-700">{completed} of {total} sections</span>
            <span className="text-indigo-600 font-semibold">{Math.round(percentage)}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        <div className="space-y-2">
          {completionItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <CheckCircle2
                className={`w-4 h-4 flex-shrink-0 ${
                  item.completed ? 'text-green-600' : 'text-gray-300'
                }`}
              />
              <span className={item.completed ? 'text-gray-600' : 'text-gray-500'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <Link to={createPageUrl('UserProfile')}>
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700" size="sm">
            Complete Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}