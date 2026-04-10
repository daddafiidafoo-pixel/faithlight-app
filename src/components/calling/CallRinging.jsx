import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Phone, PhoneOff, Video } from 'lucide-react';

export default function CallRinging({ 
  callMode = 'audio',
  otherUserName,
  isIncoming = false,
  onAnswer,
  onDecline,
  isAnswering = false,
  isDecining = false
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="max-w-sm w-full bg-gradient-to-b from-gray-900 to-black border border-gray-800">
        <div className="p-8 text-center">
          {/* Status */}
          <div className="mb-6">
            {isIncoming ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-2">Incoming Call</h2>
                <p className="text-gray-300 text-lg">{otherUserName}</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-2">Calling...</h2>
                <p className="text-gray-300 text-lg">{otherUserName}</p>
                <p className="text-gray-500 text-sm mt-2">{elapsedSeconds}s</p>
              </>
            )}
          </div>

          {/* Call Type Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto animate-pulse">
              {callMode === 'video' ? (
                <Video className="w-10 h-10 text-white" />
              ) : (
                <Phone className="w-10 h-10 text-white" />
              )}
            </div>
          </div>

          {/* Call Mode Badge */}
          <p className="text-sm bg-gray-800 text-gray-300 rounded-full px-4 py-1 inline-block mb-8 capitalize">
            {callMode} call
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isIncoming ? (
              <>
                <Button
                  onClick={onAnswer}
                  disabled={isAnswering}
                  className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white h-12"
                >
                  <Phone className="w-5 h-5" />
                  {isAnswering ? 'Answering...' : 'Answer'}
                </Button>
                <Button
                  onClick={onDecline}
                  disabled={isDecining}
                  variant="destructive"
                  className="w-full gap-2 h-12"
                >
                  <PhoneOff className="w-5 h-5" />
                  {isDecining ? 'Declining...' : 'Decline'}
                </Button>
              </>
            ) : (
              <Button
                onClick={onDecline}
                disabled={isDecining}
                variant="destructive"
                className="w-full gap-2 h-12"
              >
                <PhoneOff className="w-5 h-5" />
                {isDecining ? 'Ending...' : 'End Call'}
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Powered by Agora • Ready for audio & video
          </p>
        </div>
      </Card>
    </div>
  );
}