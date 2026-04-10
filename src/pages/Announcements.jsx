import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Megaphone, BookOpen, MessageCircle, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';

export default function Announcements() {
  const features = [
    "Clear Bible and theology lessons",
    "Interactive quizzes for deeper understanding",
    "An AI Bible Tutor that explains Scripture with references",
    "Teaching and sermon preparation tools for pastors and Bible teachers"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Megaphone className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Introducing FaithLight — A New Way to Learn and Teach the Bible
          </h1>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6 space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              We are excited to introduce FaithLight, a new Christian education platform designed to help believers study 
              the Bible, grow in faith, and prepare Scripture-based teaching with confidence.
            </p>
            
            <div>
              <p className="font-semibold text-gray-900 mb-3">FaithLight offers:</p>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-gray-700 leading-relaxed">
              FaithLight is built with integrity and global accessibility in mind. Scripture remains the final authority, 
              and AI is used only to support learning—not replace prayer, pastors, or the Church.
            </p>

            <p className="text-gray-700 leading-relaxed">
              To serve believers worldwide, FaithLight includes multilingual support and region-based pricing, ensuring 
              accessibility across cultures and economic backgrounds.
            </p>

            <p className="text-gray-700 leading-relaxed">
              We invite students, pastors, teachers, and churches to explore FaithLight and grow together in understanding God's Word.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link to={createPageUrl('Home')}>
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600">
              Explore Lessons
            </Button>
          </Link>
          <Link to={createPageUrl('ApplyTeacher')}>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Apply as Teacher/Pastor
            </Button>
          </Link>
        </div>

        <div className="p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-center">
          <p className="text-xl text-white font-medium italic">
            "Let the word of Christ dwell in you richly."
          </p>
          <p className="text-indigo-100 mt-2">— Colossians 3:16</p>
        </div>
      </div>
    </div>
  );
}