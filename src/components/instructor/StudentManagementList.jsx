import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, ChevronDown } from 'lucide-react';

export default function StudentManagementList({
  students,
  isLoading,
  onSelectStudent,
  onSendMessage,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStudents, setExpandedStudents] = useState({});

  const filteredStudents = students.filter(
    (student) =>
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (studentId) => {
    setExpandedStudents((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-100 text-green-800';
    if (progress >= 50) return 'bg-blue-100 text-blue-800';
    if (progress >= 20) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Input
          placeholder="Search students by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-4"
        />
      </div>

      {/* Students List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-600">
              Loading students...
            </CardContent>
          </Card>
        ) : filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-600">
              No students found
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.user_id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                {/* Main Student Row */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{student.full_name}</h3>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Enrolled in {student.courses_enrolled} course{student.courses_enrolled !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getProgressColor(student.avg_progress)}>
                      {student.avg_progress}% Avg
                    </Badge>

                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => onSendMessage(student)}
                      className="gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleExpand(student.user_id)}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedStudents[student.user_id] ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </div>
                </div>

                {/* Expanded Course Details */}
                {expandedStudents[student.user_id] && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    {student.course_details.map((course) => (
                      <div
                        key={course.course_id}
                        className={`p-3 rounded-lg border ${getStatusColor(course.status)}`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {course.course_title}
                            </p>
                            <p className="text-xs text-gray-600">
                              {course.status === 'completed' && '✓ Completed'}
                              {course.status === 'in_progress' && '⏳ In Progress'}
                              {course.status === 'not_started' && '⭕ Not Started'}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {course.progress_percentage}%
                          </Badge>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${course.progress_percentage}%` }}
                          />
                        </div>

                        <p className="text-xs text-gray-600 mt-1">
                          Enrolled: {new Date(course.enrolled_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}