import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Heart, Shield, BookOpen, Briefcase } from 'lucide-react';

const roles = [
  {
    id: 'youth_leader',
    name: 'Youth Leader',
    icon: Heart,
    description: 'Training focused on discipleship, safety, and engaging young people',
    color: 'bg-pink-500',
  },
  {
    id: 'elder',
    name: 'Elder',
    icon: Shield,
    description: 'Emphasis on oversight, doctrine, accountability, and church unity',
    color: 'bg-blue-500',
  },
  {
    id: 'pastor',
    name: 'Pastor',
    icon: BookOpen,
    description: 'Focus on shepherding, preaching, counseling, and leadership multiplication',
    color: 'bg-purple-500',
  },
  {
    id: 'ministry_team',
    name: 'Ministry Team Member',
    icon: Briefcase,
    description: 'Training for teamwork, communication, planning, and serving excellence',
    color: 'bg-green-500',
  },
  {
    id: 'general',
    name: 'General Leader',
    icon: Users,
    description: 'Core leadership training without role-specific emphasis',
    color: 'bg-gray-500',
  },
];

export default function RoleSelector({ selectedRole, onSelectRole, trackName }) {
  return (
    <Card className="mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader>
        <CardTitle>Who are you training as?</CardTitle>
        <CardDescription>
          Select your leadership role to personalize your training experience with relevant examples, scenarios, and reflection questions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <button
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-white shadow-md'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${role.color} p-2 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{role.name}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="mt-3 text-xs font-medium text-indigo-600">
                    ✓ Selected
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>What this changes:</strong> Examples and scenarios, reflection questions, some quiz questions, and optional role-specific mini-lessons. Core content remains the same.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}