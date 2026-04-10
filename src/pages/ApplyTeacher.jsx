import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookMarked, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function ApplyTeacher() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [roleType, setRoleType] = useState('pastor');
  const [churchOrg, setChurchOrg] = useState('');
  const [country, setCountry] = useState('');
  const [teachingDesc, setTeachingDesc] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setFullName(currentUser.full_name || '');
        setEmail(currentUser.email || '');
      } catch (error) {
        // User not logged in - that's okay
      }
    };
    fetchUser();
  }, []);

  const applyMutation = useMutation({
    mutationFn: async (data) => {
      if (!user) {
        // Redirect to login first
        base44.auth.redirectToLogin(window.location.href);
        throw new Error('Please login first');
      }
      return base44.entities.TeacherApplication.create(data);
    },
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    applyMutation.mutate({
      full_name: fullName,
      email: email,
      role_type: roleType,
      church_organization: churchOrg || null,
      country: country,
      teaching_description: teachingDesc,
      user_id: user.id,
      status: 'pending'
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h1>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for applying to become a teacher on FaithLight. Our team will review your application and get back to you shortly.
              </p>
              <Button onClick={() => navigate(createPageUrl('Home'))}>
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-4">
            <BookMarked className="w-10 h-10 text-indigo-600" />
            Apply as Teacher / Pastor
          </h1>
          <p className="text-gray-600">Join FaithLight as a teacher and help others grow in biblical knowledge</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="roleType">Role *</Label>
                <Select value={roleType} onValueChange={setRoleType}>
                  <SelectTrigger id="roleType" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pastor">Pastor</SelectItem>
                    <SelectItem value="bible_teacher">Bible Teacher</SelectItem>
                    <SelectItem value="lecturer">Lecturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="churchOrg">Church / Organization (Optional)</Label>
                <Input
                  id="churchOrg"
                  value={churchOrg}
                  onChange={(e) => setChurchOrg(e.target.value)}
                  placeholder="e.g., Grace Community Church"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="teachingDesc">What do you teach? *</Label>
                <Textarea
                  id="teachingDesc"
                  value={teachingDesc}
                  onChange={(e) => setTeachingDesc(e.target.value)}
                  placeholder="Tell us about your teaching ministry, subjects, and experience..."
                  rows={5}
                  required
                  className="mt-2"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={applyMutation.isPending}
              >
                {applyMutation.isPending ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}