import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, Check, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { format, addHours } from 'date-fns';
import { validateStep, getRequiredFieldsMessage, FRIENDLY_ERRORS } from '../components/live/liveEventWizardHelpers';

export default function CreateLiveEvent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: '',
    mode: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: format(addHours(new Date(), 1), 'HH:mm'),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    duration_minutes: 60,
    online_provider: '',
    online_url: '',
    location_name: '',
    address: '',
    city: '',
    country: '',
    visibility: 'public',
    group_id: '',
    agree_guidelines: false,
    allow_chat: true,
    allow_reactions: true,
    recording_enabled: false,
    reminders_enabled: true,
    max_attendees: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        console.error('Auth error:', err);
        setError(FRIENDLY_ERRORS.load);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return;
      try {
        const userGroups = await base44.entities.Group.filter({
          creator_user_id: user.id
        });
        setGroups(userGroups || []);
      } catch (err) {
        console.error('Groups load error:', err);
      }
    };
    fetchGroups();
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    const validation = validateStep(step, formData);
    if (validation.ok) {
      setValidationErrors({});
      setStep(step + 1);
    } else {
      setValidationErrors(validation.errors);
    }
  };

  const handlePublish = async () => {
    const validation = validateStep(4, formData);
    if (!validation.ok) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const startDateTime = new Date(`${formData.date}T${formData.start_time}`);
      const endDateTime = new Date(startDateTime.getTime() + formData.duration_minutes * 60000);

      const eventData = {
        title: formData.title,
        description: formData.description || null,
        event_type: formData.event_type,
        mode: formData.mode,
        visibility: formData.visibility,
        timezone: formData.timezone,
        start_at: startDateTime.toISOString(),
        end_at: endDateTime.toISOString(),
        duration_minutes: formData.duration_minutes,
        status: 'scheduled',
        is_published: true,
        published_at: new Date().toISOString(),
        allow_chat: formData.allow_chat,
        allow_reactions: formData.allow_reactions,
        recording_enabled: formData.recording_enabled,
        reminders_enabled: formData.reminders_enabled,
      };

      if (formData.mode === 'online' || formData.mode === 'hybrid') {
        eventData.online_provider = formData.online_provider;
        eventData.online_url = formData.online_url;
      }

      if (formData.mode === 'in_person' || formData.mode === 'hybrid') {
        eventData.location_name = formData.location_name;
        eventData.address = formData.address;
        eventData.city = formData.city || null;
        eventData.country = formData.country || null;
      }

      if (formData.visibility === 'group_only') {
        eventData.group_id = formData.group_id;
      }

      if (formData.max_attendees) {
        eventData.max_attendees = parseInt(formData.max_attendees);
      }

      const newEvent = await base44.entities.LiveEvent.create(eventData);

      await base44.entities.LiveEventAttendee.create({
        event_id: newEvent.id,
        user_id: user.id,
        role: 'host',
        rsvp_status: 'going'
      });

      setSuccessMessage(`✓ Event "${formData.title}" created successfully!`);
      setTimeout(() => {
        window.location.href = createPageUrl(`LiveEventDetail?id=${newEvent.id}`);
      }, 1500);
    } catch (err) {
      console.error('Publish error:', err);
      setError(FRIENDLY_ERRORS.publish);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen text-gray-600">Loading...</div>;
  }

  const stepLabels = ['Details', 'Schedule', 'Location', 'Publish'];
  const missingFieldsMsg = Object.keys(validationErrors).length > 0 ? getRequiredFieldsMessage(validationErrors) : null;
  const isNextDisabled = Object.keys(validationErrors).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--faith-light-bg)] to-[var(--faith-light-bg-secondary)] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--faith-light-primary-dark)]">Schedule Live Event</h1>
              <p className="text-gray-600 mt-1">Step {step} of 4 — {stepLabels[step - 1]}</p>
            </div>
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => {
                  setStep(step - 1);
                  setValidationErrors({});
                }}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>

          {/* PROGRESS BARS */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-2 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[var(--faith-light-primary)]' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        {/* ERROR ALERTS */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-900 font-semibold">{error}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setError('')}>Dismiss</Button>
                <Button size="sm" variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              </div>
            </div>
          </div>
        )}

        {/* VALIDATION HELPER */}
        {missingFieldsMsg && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm">
            {missingFieldsMsg}
          </div>
        )}

        {/* SUCCESS */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-900 flex items-center gap-2">
            <Check className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            {/* STEP 1: DETAILS */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold">Event Title *</Label>
                  <Input
                    placeholder="e.g., Sunday Morning Prayer"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={validationErrors.title ? 'border-red-500' : ''}
                  />
                  {validationErrors.title && <p className="text-xs text-red-600 mt-1">{validationErrors.title}</p>}
                </div>

                <div>
                  <Label className="text-sm font-semibold">Description *</Label>
                  <Textarea
                    placeholder="Add a short description so people know what to expect."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`${validationErrors.description ? 'border-red-500' : ''} min-h-24`}
                  />
                  {validationErrors.description && <p className="text-xs text-red-600 mt-1">{validationErrors.description}</p>}
                </div>

                <div>
                  <Label className="text-sm font-semibold">Event Type *</Label>
                  <Select value={formData.event_type} onValueChange={(value) => handleInputChange('event_type', value)}>
                    <SelectTrigger className={validationErrors.event_type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prayer">Prayer Meeting</SelectItem>
                      <SelectItem value="sermon">Sermon</SelectItem>
                      <SelectItem value="study">Bible Study</SelectItem>
                      <SelectItem value="discussion">Discussion</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.event_type && <p className="text-xs text-red-600 mt-1">{validationErrors.event_type}</p>}
                </div>

                <div>
                  <Label className="text-sm font-semibold">Format *</Label>
                  <Select value={formData.mode} onValueChange={(value) => handleInputChange('mode', value)}>
                    <SelectTrigger className={validationErrors.mode ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">🌐 Online</SelectItem>
                      <SelectItem value="in_person">📍 In-Person</SelectItem>
                      <SelectItem value="hybrid">🔄 Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.mode && <p className="text-xs text-red-600 mt-1">{validationErrors.mode}</p>}
                </div>
              </div>
            )}

            {/* STEP 2: SCHEDULE */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Date *</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className={validationErrors.date ? 'border-red-500' : ''}
                    />
                    {validationErrors.date && <p className="text-xs text-red-600 mt-1">{validationErrors.date}</p>}
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Time *</Label>
                    <Input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => handleInputChange('start_time', e.target.value)}
                      className={validationErrors.start_time ? 'border-red-500' : ''}
                    />
                    {validationErrors.start_time && <p className="text-xs text-red-600 mt-1">{validationErrors.start_time}</p>}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Timezone *</Label>
                  <Input
                    type="text"
                    value={formData.timezone}
                    readOnly
                    className="bg-gray-100 text-gray-600 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-detected from your device</p>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Duration (minutes) *</Label>
                  <Input
                    type="number"
                    min="15"
                    max="240"
                    value={formData.duration_minutes}
                    onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                    className={validationErrors.duration_minutes ? 'border-red-500' : ''}
                  />
                  {validationErrors.duration_minutes && <p className="text-xs text-red-600 mt-1">{validationErrors.duration_minutes}</p>}
                </div>
              </div>
            )}

            {/* STEP 3: LOCATION/LINK */}
            {step === 3 && (
              <div className="space-y-5">
                {(formData.mode === 'online' || formData.mode === 'hybrid') && (
                  <>
                    <div>
                      <Label className="text-sm font-semibold">Streaming Provider *</Label>
                      <Select value={formData.online_provider} onValueChange={(value) => handleInputChange('online_provider', value)}>
                        <SelectTrigger className={validationErrors.online_provider ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zoom">Zoom</SelectItem>
                          <SelectItem value="google_meet">Google Meet</SelectItem>
                          <SelectItem value="teams">Microsoft Teams</SelectItem>
                          <SelectItem value="youtube">YouTube Live</SelectItem>
                          <SelectItem value="custom">Custom URL</SelectItem>
                        </SelectContent>
                      </Select>
                      {validationErrors.online_provider && <p className="text-xs text-red-600 mt-1">{validationErrors.online_provider}</p>}
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Event Link *</Label>
                      <Input
                        placeholder="https://…"
                        value={formData.online_url}
                        onChange={(e) => handleInputChange('online_url', e.target.value)}
                        className={validationErrors.online_url ? 'border-red-500' : ''}
                      />
                      {validationErrors.online_url && <p className="text-xs text-red-600 mt-1">{validationErrors.online_url}</p>}
                    </div>
                  </>
                )}

                {(formData.mode === 'in_person' || formData.mode === 'hybrid') && (
                  <>
                    <div>
                      <Label className="text-sm font-semibold">Location Name *</Label>
                      <Input
                        placeholder="e.g., Community Center Hall A"
                        value={formData.location_name}
                        onChange={(e) => handleInputChange('location_name', e.target.value)}
                        className={validationErrors.location_name ? 'border-red-500' : ''}
                      />
                      {validationErrors.location_name && <p className="text-xs text-red-600 mt-1">{validationErrors.location_name}</p>}
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Address *</Label>
                      <Input
                        placeholder="Street address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={validationErrors.address ? 'border-red-500' : ''}
                      />
                      {validationErrors.address && <p className="text-xs text-red-600 mt-1">{validationErrors.address}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold">City</Label>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">Country</Label>
                        <Input
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 4: PUBLISH */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold">Visibility *</Label>
                  <Select value={formData.visibility} onValueChange={(value) => handleInputChange('visibility', value)}>
                    <SelectTrigger className={validationErrors.visibility ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">🌍 Public</SelectItem>
                      <SelectItem value="group_only">👥 Group Only</SelectItem>
                      <SelectItem value="private">🔒 Private (Invited Only)</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.visibility && <p className="text-xs text-red-600 mt-1">{validationErrors.visibility}</p>}
                </div>

                {formData.visibility === 'group_only' && (
                  <div>
                    <Label className="text-sm font-semibold">Select Group *</Label>
                    <Select value={formData.group_id} onValueChange={(value) => handleInputChange('group_id', value)}>
                      <SelectTrigger className={validationErrors.group_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Choose a group..." />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map(g => (
                          <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.group_id && <p className="text-xs text-red-600 mt-1">{validationErrors.group_id}</p>}
                  </div>
                )}

                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={formData.allow_chat}
                      onCheckedChange={(checked) => handleInputChange('allow_chat', checked)}
                    />
                    <Label className="text-sm font-medium cursor-pointer">Allow chat during event</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={formData.allow_reactions}
                      onCheckedChange={(checked) => handleInputChange('allow_reactions', checked)}
                    />
                    <Label className="text-sm font-medium cursor-pointer">Allow reactions</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={formData.recording_enabled}
                      onCheckedChange={(checked) => handleInputChange('recording_enabled', checked)}
                    />
                    <Label className="text-sm font-medium cursor-pointer">Enable recording</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={formData.reminders_enabled}
                      onCheckedChange={(checked) => handleInputChange('reminders_enabled', checked)}
                    />
                    <Label className="text-sm font-medium cursor-pointer">Enable reminders</Label>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Checkbox
                      checked={formData.agree_guidelines}
                      onCheckedChange={(checked) => handleInputChange('agree_guidelines', checked)}
                      className="mt-1"
                    />
                    <div>
                      <Label className="text-sm font-medium cursor-pointer">
                        I agree to the Community Guidelines and responsible event hosting *
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        By publishing, you confirm this event complies with our policies.
                      </p>
                    </div>
                  </div>
                  {validationErrors.agree_guidelines && <p className="text-xs text-red-600 mt-2">{validationErrors.agree_guidelines}</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* BUTTONS */}
        <div className="mt-6 flex gap-3 justify-end">
          {step < 4 && (
            <Button
              onClick={handleNext}
              disabled={isNextDisabled}
              className="gap-2 bg-[var(--faith-light-primary)] hover:bg-[var(--faith-light-primary-light)]"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          )}
          {step === 4 && (
            <Button
              onClick={handlePublish}
              disabled={loading || isNextDisabled}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Publishing...' : 'Publish Event'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}