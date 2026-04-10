import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, BookOpen, CheckCircle } from 'lucide-react';

export default function AIIntegrity() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
            AI Use & Biblical Integrity
          </h1>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-lg text-gray-800 leading-relaxed mb-6">
              FaithLight uses artificial intelligence to assist learning and teaching, not to replace Scripture, prayer, pastors, or the Church.
            </p>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Our commitments:</h2>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">The Bible is the final authority for faith and practice</p>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">AI responses are generated using Scripture-based prompts</p>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">All teaching materials should be reviewed by the user</p>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">FaithLight does not claim divine authority or new revelation</p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-600 rounded">
              <p className="text-lg font-semibold text-gray-900 text-center">
                AI is a tool — God's Word is the truth.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-300">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-amber-700 mt-1 flex-shrink-0" />
              <p className="text-gray-800 italic">
                Always test teaching against Scripture (Acts 17:11).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}