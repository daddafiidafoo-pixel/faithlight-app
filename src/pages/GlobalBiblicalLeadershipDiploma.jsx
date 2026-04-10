import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, AlertTriangle, Zap, Users, Award, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function GlobalBiblicalLeadershipDiploma() {
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          // Check premium status
          const checkResult = await base44.functions.invoke('checkPremium', {});
          setIsPremium(checkResult.data.isPremium);
        }
      } catch (error) {
        console.error('Load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleStartProgram = async () => {
    if (!user) {
      await base44.auth.redirectToLogin();
      return;
    }

    if (!isPremium) {
      window.location.href = createPageUrl('UpgradePremium');
      return;
    }

    // Navigate to program
    toast.success('Welcome to the Diploma Program!');
    window.location.href = createPageUrl('DiplomaModules');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-indigo-100 text-indigo-700">Non-Accredited Religious Program</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            FaithLight Advanced Biblical Leadership Diploma
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Deepen your understanding of Scripture. Strengthen your ministry leadership. Grow in theological clarity and pastoral wisdom.
          </p>
        </div>

        {/* CTA */}
        <div className="flex justify-center mb-12">
          <Button
            onClick={handleStartProgram}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            disabled={loading}
          >
            {loading ? 'Loading...' : (
              <>
                <BookOpen className="w-5 h-5" />
                {user && isPremium ? 'Start Diploma Program' : 'Unlock with Premium'}
              </>
            )}
          </Button>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* For Whom */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Designed For</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Users className="w-5 h-5 text-indigo-600 mt-0.5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Pastors & Ministry Leaders</p>
                  <p className="text-sm text-gray-600">Deepen theological foundation and leadership skills</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Users className="w-5 h-5 text-indigo-600 mt-0.5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Youth Leaders & Teachers</p>
                  <p className="text-sm text-gray-600">Strengthen ability to mentor and teach scripture</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Users className="w-5 h-5 text-indigo-600 mt-0.5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Emerging Christian Leaders</p>
                  <p className="text-sm text-gray-600">Build solid theological understanding for leadership</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Users className="w-5 h-5 text-indigo-600 mt-0.5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Serious Bible Students</p>
                  <p className="text-sm text-gray-600">Complete structured study of biblical leadership</p>
                </div>
              </div>
            </div>
          </Card>

          {/* What You'll Study */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Study</h2>
            <div className="space-y-3">
              {[
                'Biblical interpretation and context',
                'Christian leadership principles',
                'Theology foundations and applied theology',
                'Church and community leadership',
                'Ethical and pastoral responsibility',
                'Mentoring and discipleship models',
              ].map((topic, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{topic}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Program Format */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Program Format</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: BookOpen, label: 'Structured Lesson Modules' },
                { icon: Award, label: 'Guided Study Materials' },
                { icon: Zap, label: 'Reflection & Application Exercises' },
                { icon: CheckCircle2, label: 'Progress Tracking' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex gap-3">
                    <Icon className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                    <p className="text-gray-700 font-medium">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Certification */}
          <Card className="p-8 bg-indigo-50 border-indigo-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Certification</h2>
            <p className="text-gray-700 mb-4">
              Upon successful completion, you will receive a:
            </p>
            <div className="bg-white p-4 rounded-lg border-2 border-indigo-600 mb-4">
              <p className="text-lg font-bold text-center text-indigo-600">
                FaithLight Certificate of Completion
              </p>
              <p className="text-sm text-center text-gray-600 mt-2">
                FaithLight Advanced Biblical Leadership Diploma (Non-Accredited)
              </p>
            </div>
            <p className="text-sm text-gray-600">
              This diploma is intended for personal and ministry development.
            </p>
          </Card>

          {/* Important Notice */}
          <Card className="p-8 bg-yellow-50 border-l-4 border-l-yellow-500">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Important Notice</h3>
                <div className="text-gray-700 space-y-2">
                  <p>
                    <strong>This is a non-accredited religious training program offered by FaithLight.</strong>
                  </p>
                  <p>
                    It does not represent a government-accredited academic degree or professional license.
                  </p>
                  <p className="text-sm">
                    FaithLight makes no claims regarding equivalency to accredited academic programs. Users are responsible for verifying whether this training meets requirements for their local church, organization, or regulatory body.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Premium Gate */}
          {user && !isPremium && (
            <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200">
              <div className="flex gap-4 items-start">
                <Lock className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Required</h3>
                  <p className="text-gray-700 mb-4">
                    Unlock this diploma program and all advanced features with FaithLight Premium.
                  </p>
                  <div className="flex gap-2">
                    <Link to={createPageUrl('UpgradePremium')}>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        Upgrade to Premium
                      </Button>
                    </Link>
                    <Link to={createPageUrl('Pricing')}>
                      <Button variant="outline">
                        See Plans
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* CTA Footer */}
          {user && isPremium && (
            <div className="text-center">
              <Button
                onClick={handleStartProgram}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Start Your Journey Today
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA for non-users */}
      {!user && (
        <div className="bg-indigo-600 text-white py-12">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to grow in biblical leadership?</h2>
            <p className="mb-6 text-indigo-100">
              Join thousands of Christian leaders strengthening their faith and leadership skills.
            </p>
            <Button
              onClick={handleStartProgram}
              className="bg-white text-indigo-600 hover:bg-gray-100"
              size="lg"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}