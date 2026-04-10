import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

export default function StudentProgressOverview({ students = [] }) {
  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Top Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">No student progress data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          Top Performing Students
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {students.map((student, idx) => (
            <div key={student.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Student {idx + 1}</p>
                  <p className="text-xs text-gray-600">
                    Enrolled {new Date(student.enrolled_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                      style={{ width: `${student.progress_percentage}%` }}
                    />
                  </div>
                  <p className="font-bold text-gray-900 w-12 text-right">
                    {student.progress_percentage}%
                  </p>
                </div>
                <div className="mt-1">
                  {student.status === 'completed' && (
                    <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>
                  )}
                  {student.status === 'in_progress' && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">In Progress</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}