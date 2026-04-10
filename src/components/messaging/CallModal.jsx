import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Phone, Video, X } from 'lucide-react';

export default function CallModal({ isOpen, onClose, otherUserName, onAudioCall, onVideoCall, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-sm w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Call with {otherUserName}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onAudioCall}
              disabled={isLoading}
              className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white h-12 text-base"
            >
              <Phone className="w-5 h-5" />
              Audio Call
            </Button>

            <Button
              onClick={onVideoCall}
              disabled={isLoading}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white h-12 text-base"
            >
              <Video className="w-5 h-5" />
              Video Call
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Agora calling integration ready • Respect block & safety rules
          </p>
        </div>
      </Card>
    </div>
  );
}