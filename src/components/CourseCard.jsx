import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, User } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import ProgressBar from "./course/ProgressBar";

export default function CourseCard({ course, lessonCount, progressPercentage = 0, showProgress = false, showInstructor = true }) {
  const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800"
  };

  return (
    <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        {course.image_url && (
          <div className="h-48 overflow-hidden">
            <img 
              src={course.image_url} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl">{course.title}</CardTitle>
            <Badge className={difficultyColors[course.difficulty]}>
              {course.difficulty}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {showProgress && (
            <div>
              <div className="flex justify-between text-xs mb-1 text-gray-600">
                <span>Progress</span>
                <span className="font-semibold">{Math.round(progressPercentage)}%</span>
              </div>
              <ProgressBar percentage={progressPercentage} height="h-2" />
            </div>
          )}

          {showInstructor && course.instructor_name && (
            <Link to={createPageUrl(`InstructorProfile?id=${course.instructor_id}`)}>
              <div className="flex items-center gap-2 p-2 rounded bg-gray-50 hover:bg-indigo-50 transition-colors">
                <User className="w-4 h-4 text-indigo-600" />
                <span className="text-sm text-indigo-600 hover:underline font-medium">
                  {course.instructor_name}
                </span>
              </div>
            </Link>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{lessonCount || 0} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.language}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}