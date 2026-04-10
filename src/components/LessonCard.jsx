import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BookText, Download, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { OfflineStorage } from "./OfflineStorage";

export default function LessonCard({ lesson, completed, index }) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(OfflineStorage.isLessonOffline(lesson.id));
  }, [lesson.id]);

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOffline) {
      if (confirm('Remove this lesson from offline storage?')) {
        OfflineStorage.removeLesson(lesson.id);
        setIsOffline(false);
      }
    } else {
      OfflineStorage.saveLesson(lesson);
      setIsOffline(true);
    }
  };

  return (
    <Link to={createPageUrl(`LessonView?id=${lesson.id}`)}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3 flex-1">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <BookText className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {index && <span className="text-sm text-gray-500">Lesson {index}</span>}
                  {completed && (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                  {isOffline && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                      Offline
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-1">{lesson.title}</CardTitle>
                {lesson.scripture_references && (
                  <CardDescription className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {lesson.scripture_references}
                    </Badge>
                  </CardDescription>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="flex-shrink-0"
              title={isOffline ? 'Remove offline access' : 'Download for offline'}
            >
              {isOffline ? (
                <Trash2 className="w-4 h-4 text-red-500" />
              ) : (
                <Download className="w-4 h-4 text-gray-500" />
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}