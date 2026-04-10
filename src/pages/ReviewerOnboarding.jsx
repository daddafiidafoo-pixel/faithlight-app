import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ReviewerOnboarding() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [invitation, setInvitation] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    languages: [],
    primary_language: '',
    country: '',
    role_title: '',
    theological_background: '',
    years_of_ministry: '',
    denominational_tradition: '',
    bio: '',
    availability: 'part-time',
    agreed_to_reviewer_agreement: false
  });

  const countries = ['Ethiopia', 'Kenya', 'Tanzania', 'Uganda', 'Nigeria', 'Ghana', 'France', 'Germany', 'India', 'Brazil', 'Mexico'];
  const languages = ['English', 'Amharic', 'Oromo', 'Swahili', 'French', 'Spanish', 'Portuguese', 'German', 'Chinese', 'Hindi', 'Arabic', 'Russian'];
  const theologicalBackgrounds = ['Reformed', 'Evangelical', 'Pentecostal', 'Catholic', 'Orthodox', 'Other'];
  const yearsOptions = [0, 1, 3, 5, 10, 15, 20, 25];

  useEffect(() => {
    const initiate = async () => {
      try {
        if (!token) {
          setError('Invalid invitation link. No token provided.');
          setLoading(false);
          return;
        }

        // Try to get current user first
        try {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        } catch (e) {
          // User not logged in, redirect to login
          const loginUrl = `${base44.auth.getLoginUrl()}?next=${window.location.href}`;
          window.location.href = loginUrl;
          return;
        }

        // Validate invitation token
        const invitations = await base44.entities.ReviewerInvitation.filter({});
        const matchingInvitation = invitations.find(inv => inv.token === token);

        if (!matchingInvitation) {
          setError('Invalid or expired invitation token.');
          setLoading(false);
          return;
        }

        if (matchingInvitation.status !== 'sent') {
          setError('This invitation has already been used or is no longer valid.');
          setLoading(false);
          return;
        }

        const now = new Date();
        if (new Date(matchingInvitation.expires_at) < now) {
          setError('This invitation has expired. Please contact the administrator.');
          setLoading(false);
          return;
        }

        setInvitation(matchingInvitation);
        setLoading(false);
      } catch (err) {
        setError('Error validating invitation: ' + err.message);
        setLoading(false);
      }
    };

    initiate();
  }, [token]);

  const handleLanguageToggle = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.primary_language || !formData.country || !formData.role_title || !formData.theological_background || !formData.years_of_ministry) {
      setError('Please complete all required fields.');
      return;
    }

    if (!formData.agreed_to_reviewer_agreement) {
      setError('You must agree to the reviewer agreement to continue.');
      return;
    }

    try {
      // Create reviewer profile
      const profile = await base44.entities.ReviewerProfile.create({
        user_id: user.id,
        languages: formData.languages,
        primary_language: formData.primary_language,
        country: formData.country,
        role_title: formData.role_title,
        theological_background: formData.theological_background,
        years_of_ministry: parseInt(formData.years_of_ministry),
        denominational_tradition: formData.denominational_tradition,
        bio: formData.bio,
        availability: formData.availability,
        agreed_to_reviewer_agreement: true,
        status: 'pending_approval'
      });

      // Mark invitation as accepted
      await base44.entities.ReviewerInvitation.update(invitation.id, {
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        reviewer_user_id: user.id
      });

      // Update user role (backend would normally do this)
      setSubmitted(true);
    } catch (err) {
      setError('Error submitting profile: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Validating invitation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Button onClick={() => window.location.href = '/'}>Return to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Submitted Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for completing your reviewer profile. An administrator will review your qualifications and notify you when you're approved.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            In the meantime, you can log in to FaithLight and explore the platform.
          </p>
          <Button onClick={() => window.location.href = '/'}>Return to FaithLight</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Reviewer Profile</CardTitle>
            <p className="text-gray-600 mt-2">Welcome, {user?.full_name}! Let's set up your reviewer account.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Languages */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Languages You Can Review (Select at least one)</Label>
              <div className="grid grid-cols-2 gap-3">
                {languages.map(lang => (
                  <div key={lang} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.languages.includes(lang)}
                      onCheckedChange={() => handleLanguageToggle(lang)}
                    />
                    <label className="text-sm text-gray-700 cursor-pointer">{lang}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Language */}
            <div>
              <Label>Primary Working Language *</Label>
              <Select value={formData.primary_language} onValueChange={(val) => setFormData({ ...formData, primary_language: val })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select primary language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Country */}
            <div>
              <Label>Country *</Label>
              <Select value={formData.country} onValueChange={(val) => setFormData({ ...formData, country: val })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Title */}
            <div>
              <Label>Role/Title (e.g., Pastor, Seminary Professor) *</Label>
              <Input
                value={formData.role_title}
                onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                placeholder="Your role or title"
                className="mt-2"
              />
            </div>

            {/* Theological Background */}
            <div>
              <Label>Theological Background *</Label>
              <Select value={formData.theological_background} onValueChange={(val) => setFormData({ ...formData, theological_background: val })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select theological tradition" />
                </SelectTrigger>
                <SelectContent>
                  {theologicalBackgrounds.map(bg => (
                    <SelectItem key={bg} value={bg.toLowerCase()}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Years of Ministry */}
            <div>
              <Label>Years of Teaching/Ministry *</Label>
              <Select value={String(formData.years_of_ministry)} onValueChange={(val) => setFormData({ ...formData, years_of_ministry: val })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {yearsOptions.map(years => (
                    <SelectItem key={years} value={String(years)}>
                      {years === 0 ? 'New/In training' : `${years} years`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Denominational Tradition (Optional) */}
            <div>
              <Label>Denominational Tradition (optional)</Label>
              <Input
                value={formData.denominational_tradition}
                onChange={(e) => setFormData({ ...formData, denominational_tradition: e.target.value })}
                placeholder="e.g., Presbyterian Church, Pentecostal Assembly"
                className="mt-2"
              />
            </div>

            {/* Bio (Optional) */}
            <div>
              <Label>Professional Bio (optional)</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief background in Scripture teaching and ministry experience"
                rows={3}
                className="mt-2"
              />
            </div>

            {/* Availability (Optional) */}
            <div>
              <Label>Availability (optional)</Label>
              <Select value={formData.availability} onValueChange={(val) => setFormData({ ...formData, availability: val })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Agreement */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Checkbox
                  checked={formData.agreed_to_reviewer_agreement}
                  onCheckedChange={(checked) => setFormData({ ...formData, agreed_to_reviewer_agreement: checked })}
                />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-2">I agree to the FaithLight Reviewer Agreement</p>
                  <p className="text-xs text-gray-600 space-y-1">
                    <span className="block">✓ I will maintain doctrinal accuracy and Scripture integrity</span>
                    <span className="block">✓ I will respect cultural contexts and provide constructive feedback</span>
                    <span className="block">✓ I will complete reviews within agreed timelines</span>
                    <span className="block">✓ I will keep reviewer discussions confidential</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                disabled={!formData.agreed_to_reviewer_agreement}
              >
                Submit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}