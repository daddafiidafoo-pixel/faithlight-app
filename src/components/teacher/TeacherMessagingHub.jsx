import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Send, MessageSquare, Users, X } from 'lucide-react';

export default function TeacherMessagingHub({ teacherId, courses }) {
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [showStudentSelector, setShowStudentSelector] = useState(false);

  const { data: courseProgress = [] } = useQuery({
    queryKey: ['course-students', selectedCourse],
    queryFn: () =>
      base44.entities.UserCourseProgress.filter({ course_id: selectedCourse }),
    enabled: !!selectedCourse,
  });

  const { data: threads = [] } = useQuery({
    queryKey: ['teacher-message-threads', selectedCourse],
    queryFn: async () => {
      const messages = await base44.entities.CourseMessage.filter({
        course_id: selectedCourse,
        sender_id: teacherId,
      });
      return messages || [];
    },
    enabled: !!selectedCourse,
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const threadId = `thread-${Date.now()}`;
      await base44.entities.CourseMessage.create({
        course_id: selectedCourse,
        sender_id: teacherId,
        sender_type: 'teacher',
        recipient_ids: selectedStudents,
        is_group_message: selectedStudents.length > 1,
        thread_id: threadId,
        subject,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teacher-message-threads', selectedCourse]);
      setSubject('');
      setContent('');
      setSelectedStudents([]);
      setShowStudentSelector(false);
    },
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (selectedStudents.length > 0 && content.trim()) {
      sendMutation.mutate();
    }
  };

  const toggleStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Course Selector */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Select Course
        </label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCourse && (
        <>
          {/* Send Message Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                New Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-4">
                {/* Student Selector */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Recipient(s)
                  </label>
                  <div className="border rounded-lg p-3 bg-gray-50 min-h-12">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedStudents.map((studentId) => (
                        <div
                          key={studentId}
                          className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                        >
                          <span>Student {studentId.substring(0, 8)}...</span>
                          <button
                            type="button"
                            onClick={() => toggleStudent(studentId)}
                            className="hover:text-indigo-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowStudentSelector(!showStudentSelector)}
                      className="w-full"
                    >
                      {selectedStudents.length > 0
                        ? `${selectedStudents.length} selected`
                        : 'Select Students'}
                    </Button>
                  </div>

                  {/* Student List */}
                  {showStudentSelector && (
                    <div className="mt-3 border rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                      {courseProgress.length === 0 ? (
                        <p className="text-sm text-gray-600 text-center py-4">
                          No students enrolled
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {courseProgress.map((progress) => (
                            <label
                              key={progress.id}
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(progress.user_id)}
                                onChange={() => toggleStudent(progress.user_id)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-700">
                                Student {progress.user_id.substring(0, 8)}...
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Subject
                  </label>
                  <Input
                    placeholder="Message subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Message
                  </label>
                  <Textarea
                    placeholder="Type your message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={selectedStudents.length === 0 || !content.trim() || sendMutation.isPending}
                  className="w-full gap-2"
                >
                  {sendMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Message History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Message History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {threads.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-8">No messages sent yet</p>
              ) : (
                <div className="space-y-3">
                  {threads.map((message) => (
                    <div
                      key={message.id}
                      className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{message.subject}</h4>
                            {message.is_group_message && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                <Users className="w-3 h-3" />
                                Group
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {message.content}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>
                              {message.recipient_ids.length} recipient
                              {message.recipient_ids.length !== 1 ? 's' : ''}
                            </span>
                            <span>{new Date(message.created_date).toLocaleDateString()}</span>
                            <span>{message.read_by?.length || 0} read</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}