import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users, Bell } from 'lucide-react';
import StudentManagementList from '@/components/instructor/StudentManagementList';
import AnnouncementManager from '@/components/instructor/AnnouncementManager';
import StudentMessageModal from '@/components/instructor/StudentMessageModal';

export default function InstructorStudentManagement() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser || !['teacher', 'admin'].includes(currentUser.user_role)) {
          base44.auth.redirectToLogin();
          return;
        }
        setUser(currentUser);

        // Fetch instructor's courses
        const teacherCourses = await base44.entities.Course.filter(
          { instructor_id: currentUser.id },
          '-created_date',
          100
        );
        setCourses(teacherCourses || []);

        if (teacherCourses && teacherCourses.length > 0) {
          setSelectedCourse(teacherCourses[0].id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch all instructor's students
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['instructor-students'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getAllInstructorStudents', {});
      return response.data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">You don't have any courses yet</p>
              <Button onClick={() => window.location.href = '/MyCourses'}>
                Create a Course
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const courseOptions = courses.map((course) => ({
    id: course.id,
    title: course.title,
  }));

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-indigo-600" />
            Student Management
          </h1>
          <p className="text-gray-600">
            Manage your students, send messages, and create announcements
          </p>
        </div>

        {/* Course Selector */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Select Course
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {courses.map((course) => (
              <Button
                key={course.id}
                onClick={() => setSelectedCourse(course.id)}
                variant={selectedCourse === course.id ? 'default' : 'outline'}
                className="whitespace-nowrap"
              >
                {course.title}
              </Button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList>
            <TabsTrigger value="students" className="gap-2">
              <Users className="w-4 h-4" />
              Students ({studentsData?.total_unique_students || 0})
            </TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2">
              <Bell className="w-4 h-4" />
              Announcements
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <StudentManagementList
              students={
                selectedCourse
                  ? (studentsData?.students || []).filter(
                      (student) =>
                        student.course_details.some(
                          (c) => c.course_id === selectedCourse
                        )
                    )
                  : studentsData?.students || []
              }
              isLoading={isLoading}
              onSelectStudent={(studentId) => {
                const student = studentsData?.students.find(
                  (s) => s.user_id === studentId
                );
                if (student) {
                  setSelectedStudent(student);
                  setShowMessageModal(true);
                }
              }}
              onSendMessage={(student) => {
                setSelectedStudent(student);
                setShowMessageModal(true);
              }}
            />
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            {selectedCourse ? (
              <AnnouncementManager
                courseId={selectedCourse}
                teacherId={user.id}
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-gray-600">
                  Select a course to manage announcements
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Message Modal */}
        {showMessageModal && selectedStudent && (
          <StudentMessageModal
            student={selectedStudent}
            courseId={selectedCourse}
            onClose={() => {
              setShowMessageModal(false);
              setSelectedStudent(null);
            }}
            onSuccess={() => {
              // Optionally refresh student data
            }}
          />
        )}
      </div>
    </div>
  );
}