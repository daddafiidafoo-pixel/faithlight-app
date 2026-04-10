import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Users, BarChart3, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';

export default function ChurchAdminGuides() {
  const [expandedGuide, setExpandedGuide] = useState(0);

  const guides = [
    {
      id: 0,
      title: 'Getting Started',
      time: '5 minutes',
      icon: <BookOpen className="w-5 h-5" />,
      steps: [
        'Log in as Church Admin',
        'Navigate to Groups & Classes',
        'Create groups (Youth, Bible Study, Leaders)',
        'Invite members by email or share group link',
        'Assign your first lesson',
        'Tip: Start with 1 lesson per week to build momentum'
      ]
    },
    {
      id: 1,
      title: 'Assigning Lessons & Quizzes',
      time: '10 minutes',
      icon: <Users className="w-5 h-5" />,
      steps: [
        'Select a group from your Groups list',
        'Click "Assign" or "Add Lessons"',
        'Choose one or multiple lessons',
        'Enable quiz requirement (optional)',
        'Set completion deadline',
        'Members will see assignments in their dashboard',
        'Best Practice: Discuss quiz results in small groups to deepen understanding'
      ]
    },
    {
      id: 2,
      title: 'Monitoring Progress',
      time: '5 minutes',
      icon: <BarChart3 className="w-5 h-5" />,
      steps: [
        'Open any group to view member progress',
        'See completion rates for each lesson',
        'View quiz averages and individual scores',
        'Identify members who need support or are falling behind',
        'Reach out personally to encourage progress',
        'Privacy Note: Admins see progress data, not private member notes'
      ]
    },
    {
      id: 3,
      title: 'Managing Teachers',
      time: '5 minutes',
      icon: <Users className="w-5 h-5" />,
      steps: [
        'Navigate to the Teachers section',
        'Review teacher applications from your church',
        'Approve teachers to enable lesson creation',
        'View teaching drafts before they go public',
        'Encourage teachers to submit content for review',
        'Best Practice: Review lessons before church presentation'
      ]
    },
    {
      id: 4,
      title: 'Billing & Seats (if applicable)',
      time: '5 minutes',
      icon: <CreditCard className="w-5 h-5" />,
      steps: [
        'Check your plan status in the Billing tab',
        'Add or remove active seats as your group grows',
        'View renewal date and payment history',
        'Download invoices for church records',
        'Contact support if you need a different plan tier'
      ]
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Church Admin User Guides</h1>
          <p className="text-gray-600">Step-by-step instructions for managing your church's FaithLight experience</p>
        </div>

        {/* Guides */}
        <div className="space-y-4">
          {guides.map((guide) => (
            <Card
              key={guide.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setExpandedGuide(expandedGuide === guide.id ? -1 : guide.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-indigo-600 mt-1">{guide.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{guide.time}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    {expandedGuide === guide.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </CardHeader>

              {expandedGuide === guide.id && (
                <CardContent className="border-t">
                  <ol className="space-y-3 list-none">
                    {guide.steps.map((step, idx) => (
                      <li key={idx} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-semibold">
                            {idx + 1}
                          </div>
                        </div>
                        <div className="text-gray-700 pt-1">
                          {step.startsWith('Best Practice:') || step.startsWith('Privacy Note:') || step.startsWith('Tip:') ? (
                            <>
                              <strong className="text-indigo-600">
                                {step.split(':')[0]}:
                              </strong>
                              {' ' + step.split(':').slice(1).join(':')}
                            </>
                          ) : (
                            step
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Quick Tips */}
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              💡 Quick Tips for Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-green-900">
              <li>✓ Start small with 1–2 groups and scale up</li>
              <li>✓ Set clear completion deadlines to build accountability</li>
              <li>✓ Discuss lessons in group settings to encourage engagement</li>
              <li>✓ Recognize members who complete lessons publicly to motivate others</li>
              <li>✓ Use the progress dashboard to identify members needing personal support</li>
              <li>✓ Train your teachers on how to create quality content</li>
            </ul>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-600">
              If you have questions or encounter issues:
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>📧 Email: support@faithlight.com</li>
              <li>💬 WhatsApp: Join your regional support group</li>
              <li>📖 Knowledge Base: Visit help.faithlight.com</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}