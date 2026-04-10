import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, BookOpen, Download, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';

export default function TeacherWelcome() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const user = await base44.auth.me();
        if (!['teacher', 'pastor', 'admin'].includes(user.user_role)) {
          navigate(createPageUrl('Home'));
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    checkAccess();
  }, [navigate]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to FaithLight Teaching Tools
          </h1>
          <p className="text-xl text-gray-600">
            You're ready to create biblical teaching materials with AI support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Create AI-assisted teaching programs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Generate complete sermons, Bible studies, and lessons based on Scripture passages and topics.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Review & edit all content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                All generated content is fully editable. You maintain complete control over your teaching materials.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Download or print materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Export your teaching programs as PDFs or print them directly for distribution.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Always test teaching against Scripture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI is a tool to support your ministry. The Bible remains the final authority for all teaching.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-50 border-blue-200 mb-8">
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-gray-800 mb-4">
              Ready to prepare your first teaching program?
            </p>
            <Link to={createPageUrl('TeachingProgramGenerator')}>
              <Button size="lg">
                Create My First Teaching Program
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to={createPageUrl('AIIntegrity')} className="text-indigo-600 hover:underline">
            Learn about AI Use & Biblical Integrity →
          </Link>
        </div>
      </div>
    </div>
  );
}