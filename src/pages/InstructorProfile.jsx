import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, BookOpen, Users, Award, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import CourseCard from '../components/CourseCard';

export default function InstructorProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const instructorId = urlParams.get('id');

  const { data: instructor, isLoading: instructorLoading } = useQuery({
    queryKey: ['instructor', instructorId],
    queryFn: async () => {
      if (!instructorId) return null;
      const users = await base44.entities.User.filter({ id: instructorId }, '-created_date', 1);
      return users?.[0] || null;
    },
    enabled: !!instructorId,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['instructor-courses', instructorId],
    queryFn: async () => {
      if (!instructorId) return [];
      const allCourses = await base44.entities.Course.filter({ instructor_id: instructorId });
      return allCourses || [];
    },
    enabled: !!instructorId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['instructor-reviews', instructorId],
    queryFn: async () => {
      if (!instructorId) return [];
      try {
        const courseReviews = await base44.entities.CourseReview?.filter({ 
          instructor_id: instructorId 
        }) || [];
        return courseReviews;
      } catch (err) {
        return [];
      }
    },
    enabled: !!instructorId,
  });

  if (instructorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading instructor profile...</p>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Instructor not found</p>
      </div>
    );
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Image */}
              {instructor.profile_photo_url && (
                <div className="flex-shrink-0">
                  <img
                    src={instructor.profile_photo_url}
                    alt={instructor.full_name}
                    className="w-48 h-48 rounded-lg object-cover shadow-lg"
                  />
                </div>
              )}

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{instructor.full_name}</h1>
                
                {instructor.user_role && (
                  <Badge className="mb-4 bg-indigo-100 text-indigo-800 capitalize">
                    {instructor.user_role.replace('_', ' ')}
                  </Badge>
                )}

                {avgRating && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(avgRating) ? 'fill-current' : ''}`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{avgRating}</span>
                    <span className="text-gray-600">({reviews.length} reviews)</span>
                  </div>
                )}

                {instructor.bio && (
                  <p className="text-gray-700 mb-6 leading-relaxed">{instructor.bio}</p>
                )}

                {/* Credentials */}
                {instructor.expertise_areas && instructor.expertise_areas.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Areas of Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {instructor.expertise_areas.map((area) => (
                        <Badge key={area} variant="outline">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spiritual Gifts */}
                {instructor.spiritual_gifts && instructor.spiritual_gifts.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Spiritual Gifts</h3>
                    <div className="flex flex-wrap gap-2">
                      {instructor.spiritual_gifts.map((gift) => (
                        <Badge key={gift} className="bg-purple-100 text-purple-800">{gift}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button className="gap-2">
                    <Mail className="w-4 h-4" />
                    Contact {instructor.full_name.split(' ')[0]}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600">Courses Authored</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.reduce((sum, c) => sum + (c.student_count || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {instructor.mentor_experience_years ? `${instructor.mentor_experience_years}+ years` : 'Active'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Section */}
        {courses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Courses by {instructor.full_name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} lessonCount={course.lesson_count || 0} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{review.student_name}</p>
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (review.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {reviews.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-gray-600">No reviews yet. Be the first to review this instructor!</p>
          </Card>
        )}
      </div>
    </div>
  );
}