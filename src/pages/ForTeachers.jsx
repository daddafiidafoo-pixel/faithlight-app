import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Download, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function ForTeachers() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
    };
    checkAuth();
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: 'AI-Assisted Teaching Outlines',
      description: 'Generate sermon structures and lesson plans based on Scripture passages'
    },
    {
      icon: FileText,
      title: 'Scripture-Based Structure',
      description: 'Every teaching is rooted in biblical text with proper references'
    },
    {
      icon: Download,
      title: 'Printable and Downloadable Materials',
      description: 'Export your teaching programs ready for print or digital use'
    },
    {
      icon: Clock,
      title: 'Tools Designed to Save Time',
      description: 'Prepare quality sermons and lessons in minutes, not hours'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Teach with Confidence</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            FaithLight helps pastors and Bible teachers prepare sermons, Bible studies, and lessons efficiently—without 
            compromising biblical integrity.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{feature.title}</h3>
                      <p className="text-gray-700">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <p className="text-gray-800 text-lg">
                Tools designed to save time and support ministry
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <p className="text-gray-800 text-lg">
                Always grounded in Scripture as the final authority
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          {isAuthenticated ? (
            <Link to={createPageUrl('TeachingProgramGenerator')}>
              <Button size="lg" className="gap-2 text-lg px-8">
                👉 Start Creating Teaching Materials
              </Button>
            </Link>
          ) : (
            <Link to={createPageUrl('ApplyTeacher')}>
              <Button size="lg" className="gap-2 text-lg px-8">
                👉 Apply for Teacher Access
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}