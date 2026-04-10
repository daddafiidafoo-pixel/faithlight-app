import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Stub — actual RecordingControls lives in components/audio/RecordingControls
function RecordingControls() { return null; }
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Volume2, Lock, Unlock, LogOut, Hand, Mic, MicOff, Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const ControlTooltip = ({ label, helpText, children }) => (
  <div className="space-y-2">
    <p className="text-sm font-semibold">{label}</p>
    <p className="text-xs text-gray-600">{helpText}</p>
    <div className="mt-3">{children}</div>
  </div>
);

export default function LiveSessionControls({
  session,
  hostRole, // "OWNER" or "CO_HOST"
  participants = [],
  onMuteAll,
  onLockRoom,
  onUnlockRoom,
  onMuteParticipant,
  onUnmuteParticipant,
  onPromoteToSpeaker,
  onDemoteToListener,
  onRemoveParticipant,
  onEndSession,
}) {
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);

  const requestingParticipants = participants.filter(p => p.voice_state === 'requesting');
  const speakers = participants.filter(p => p.voice_state === 'speaker');
  const listeners = participants.filter(p => p.voice_state === 'listener');

  const isOwner = hostRole === 'OWNER';
  const isCoHost = hostRole === 'CO_HOST';

  const handleAction = (action) => {
    if (!selectedParticipant) return;

    switch (action) {
      case 'mute':
        onMuteParticipant(selectedParticipant.id);
        break;
      case 'unmute':
        if (!isOwner) {
          toast.error('Only the host can unmute members.');
          return;
        }
        onUnmuteParticipant(selectedParticipant.id);
        break;
      case 'promote':
        onPromoteToSpeaker(selectedParticipant.id);
        break;
      case 'demote':
        onDemoteToListener(selectedParticipant.id);
        break;
      case 'remove':
        onRemoveParticipant(selectedParticipant.id);
        break;
    }
    setActionDialogOpen(false);
    setSelectedParticipant(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Live Session Controls</h3>
        <p className="text-gray-600 mt-1">
          {isOwner
            ? 'You are the host. You can manage speakers and keep the room respectful.'
            : 'You are a co-host. You can mute and manage speakers.'}
        </p>
      </div>

      {/* Recording Controls */}
      <RecordingControls
        session={session}
        isHost={isOwner}
        groupId={session?.group_id}
      />

      {/* Safety Note */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Use 'Request to Speak' to keep sessions clear with large groups.
        </AlertDescription>
      </Alert>

      {/* Main Controls */}
      <div className="grid md:grid-cols-3 gap-4">
        <Button
          onClick={onMuteAll}
          className="bg-red-600 hover:bg-red-700 h-24 flex flex-col items-center justify-center"
        >
          <Volume2 className="w-6 h-6 mb-2" />
          <span className="text-sm font-semibold">Mute All</span>
          <span className="text-xs mt-1">Immediately mutes all</span>
        </Button>

        <Button
          onClick={session?.room_locked ? onUnlockRoom : onLockRoom}
          variant={session?.room_locked ? 'destructive' : 'outline'}
          className="h-24 flex flex-col items-center justify-center"
        >
          {session?.room_locked ? (
            <>
              <Lock className="w-6 h-6 mb-2" />
              <span className="text-sm font-semibold">Room Locked</span>
              <span className="text-xs mt-1">Click to unlock</span>
            </>
          ) : (
            <>
              <Unlock className="w-6 h-6 mb-2" />
              <span className="text-sm font-semibold">Unlock Room</span>
              <span className="text-xs mt-1">Allow new members</span>
            </>
          )}
        </Button>

        <Button
          onClick={onEndSession}
          className="bg-gray-600 hover:bg-gray-700 h-24 flex flex-col items-center justify-center"
        >
          <LogOut className="w-6 h-6 mb-2" />
          <span className="text-sm font-semibold">End Session</span>
          <span className="text-xs mt-1">Ends for everyone</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">
            Requests {requestingParticipants.length > 0 && `(${requestingParticipants.length})`}
          </TabsTrigger>
          <TabsTrigger value="speakers">
            Speakers {speakers.length > 0 && `(${speakers.length})`}
          </TabsTrigger>
          <TabsTrigger value="all">
            All {participants.length > 0 && `(${participants.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Requests to Speak */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Requests to Speak</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Approve to make someone a speaker
              </p>
            </CardHeader>
            <CardContent>
              {requestingParticipants.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No requests</p>
              ) : (
                <div className="space-y-3">
                  {requestingParticipants.map(participant => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Hand className="w-5 h-5 text-orange-600" />
                        <span className="font-semibold">{participant.user_name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            onPromoteToSpeaker(participant.id);
                            toast.success(`${participant.user_name} can now speak`);
                          }}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve Speaker
                        </Button>
                        <Button
                          onClick={() => {
                            onDemoteToListener(participant.id);
                            toast.success('Request denied');
                          }}
                          size="sm"
                          variant="outline"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Speakers */}
        <TabsContent value="speakers">
          <Card>
            <CardHeader>
              <CardTitle>Current Speakers</CardTitle>
            </CardHeader>
            <CardContent>
              {speakers.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No speakers</p>
              ) : (
                <div className="space-y-2">
                  {speakers.map(speaker => (
                    <ParticipantRow
                      key={speaker.id}
                      participant={speaker}
                      isOwner={isOwner}
                      canMute={true}
                      onSelect={() => {
                        setSelectedParticipant(speaker);
                        setActionDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Participants */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Participants</CardTitle>
            </CardHeader>
            <CardContent>
              {participants.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No participants</p>
              ) : (
                <div className="space-y-2">
                  {participants.map(participant => (
                    <ParticipantRow
                      key={participant.id}
                      participant={participant}
                      isOwner={isOwner}
                      isCoHost={isCoHost}
                      onSelect={() => {
                        setSelectedParticipant(participant);
                        setActionDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Participant Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage {selectedParticipant?.user_name}</DialogTitle>
          </DialogHeader>
          {selectedParticipant && (
            <div className="space-y-4">
              <Badge className={
                selectedParticipant.voice_state === 'speaker'
                  ? 'bg-green-100 text-green-800'
                  : selectedParticipant.voice_state === 'requesting'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-gray-100 text-gray-800'
              }>
                {selectedParticipant.voice_state}
              </Badge>

              <div className="space-y-3">
                {/* Mute/Unmute */}
                <ControlTooltip
                  label={selectedParticipant.is_muted ? 'Unmute' : 'Mute'}
                  helpText={
                    selectedParticipant.is_muted
                      ? 'Allows the member\'s microphone.'
                      : 'Silences the member.'
                  }
                >
                  <Button
                    onClick={() => handleAction(selectedParticipant.is_muted ? 'unmute' : 'mute')}
                    className="w-full"
                    variant="outline"
                    disabled={!isOwner && selectedParticipant.is_muted}
                  >
                    {selectedParticipant.is_muted ? (
                      <><Mic className="w-4 h-4 mr-2" /> Unmute</>
                    ) : (
                      <><MicOff className="w-4 h-4 mr-2" /> Mute</>
                    )}
                  </Button>
                </ControlTooltip>

                {/* Promote/Demote */}
                {selectedParticipant.voice_state !== 'speaker' && (
                  <ControlTooltip
                    label="Promote to Speaker"
                    helpText="Moves listener to speaker role."
                  >
                    <Button
                      onClick={() => handleAction('promote')}
                      className="w-full"
                    >
                      Approve Speaker
                    </Button>
                  </ControlTooltip>
                )}

                {selectedParticipant.voice_state === 'speaker' && (
                  <ControlTooltip
                    label="Demote to Listener"
                    helpText="Moves speaker back to listener role."
                  >
                    <Button
                      onClick={() => handleAction('demote')}
                      className="w-full"
                      variant="outline"
                    >
                      Make Listener
                    </Button>
                  </ControlTooltip>
                )}

                {/* Remove */}
                <ControlTooltip
                  label="Remove from Session"
                  helpText="Removes the member from this live session."
                >
                  <Button
                    onClick={() => handleAction('remove')}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    Remove
                  </Button>
                </ControlTooltip>
              </div>

              {!isOwner && selectedParticipant.is_muted && (
                <p className="text-xs text-gray-500">
                  Only the host can unmute members.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ParticipantRow({ participant, isOwner, isCoHost, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3 flex-1">
        <span className="font-semibold">{participant.user_name}</span>
        <Badge className={
          participant.voice_state === 'speaker' ? 'bg-green-100 text-green-800' :
          participant.voice_state === 'requesting' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }>
          {participant.voice_state}
        </Badge>
      </div>
      {participant.is_muted ? (
        <MicOff className="w-4 h-4 text-gray-400" />
      ) : (
        <Mic className="w-4 h-4 text-green-600" />
      )}
    </div>
  );
}