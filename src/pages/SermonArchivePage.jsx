import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArchiveIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SermonArchiveManager from '@/components/sermon/SermonArchiveManager';

export default function SermonArchivePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
                <ArchiveIcon className="w-8 h-8 text-indigo-600" />
                Sermon Archive
              </h1>
              <p className="text-gray-600 mt-1">Manage your recorded sermons and broadcasts</p>
            </div>
          </div>
          <Link to="/LiveBroadcast">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              New Broadcast
            </Button>
          </Link>
        </div>

        {/* Archive Manager */}
        <SermonArchiveManager />
      </div>
    </div>
  );
}