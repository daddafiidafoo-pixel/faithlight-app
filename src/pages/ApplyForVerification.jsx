import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ApplyForVerification() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    requested_role: 'pastor',
    church_name: '',
    country: '',
    city: '',
    description: '',
    reference_contact: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: existingApplication } = useQuery({
    queryKey: ['my-application', user?.id],
    queryFn: () => base44.entities.LeaderApplication.filter({ user_id: user.id }),
    enabled: !!user,
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.LeaderApplication.create({
        user_id: user.id,
        full_name: user.full_name,
        requested_role: formData.requested_role,
        church_name: formData.church_name,
        country: formData.country,
        city: formData.city,
        description: formData.description,
        reference_contact: formData.reference_contact,
        status: 'pending',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-application']);
      toast.success('Application submitted! Admins will review it shortly.');
      setFormData({
        requested_role: 'pastor',
        church_name: '',
        country: '',
        city: '',
        description: '',
        reference_contact: '',
      });
    },
  });

  const isAlreadyVerified = user?.verification_status === 'verified';
  const hasApplication = existingApplication && existingApplication.length > 0;
  const application = hasApplication ? existingApplication[0] : null;

  if (!user) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Become a Verified Leader</h1>
          <p className="text-xl text-gray-600">
            Join FaithLight's verified leader community. Train groups, host live sessions, and grow your ministry.
          </p>
        </div>

        {isAlreadyVerified && (
          <Alert className="mb-6 border-green-300 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              You're already a verified {user.badge_type}! Your verification ID is <strong>{user.verification_id}</strong>
            </AlertDescription>
          </Alert>
        )}

        {hasApplication && !isAlreadyVerified && (
          <Alert className="mb-6" variant={application.status === 'rejected' ? 'destructive' : ''}>
            <Clock className={application.status === 'rejected' ? 'text-red-600' : 'text-orange-600'} className="h-4 w-4" />
            <AlertDescription>
              {application.status === 'pending' && (
                <>Your application is pending review. We'll notify you when admins have made a decision.</>
              )}
              {application.status === 'rejected' && (
                <>
                  Your application was rejected. Reason: {application.rejection_reason}
                  <p className="mt-2 text-sm">Feel free to reapply with updated information.</p>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {!isAlreadyVerified && (!hasApplication || application.status === 'rejected') && (
          <Card>
            <CardHeader>
              <CardTitle>Apply for Leader Verification</CardTitle>
              <CardDescription>
                Fill out your information to apply for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Requested Role</Label>
                <Select
                  value={formData.requested_role}
                  onValueChange={(val) => setFormData({ ...formData, requested_role: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pastor">Pastor</SelectItem>
                    <SelectItem value="trainer">Trainer</SelectItem>
                    <SelectItem value="ambassador">Ambassador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.requested_role === 'pastor' && (
                <div>
                  <Label>Church/Organization Name</Label>
                  <Input
                    value={formData.church_name}
                    onChange={(e) => setFormData({ ...formData, church_name: e.target.value })}
                    placeholder="Your church or organization name"
                  />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Country</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Your country"
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Your city"
                  />
                </div>
              </div>

              <div>
                <Label>Background & Experience</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us about your background, experience in ministry/training, and why you want to join FaithLight..."
                  className="h-32"
                />
              </div>

              <div>
                <Label>Reference Contact (optional)</Label>
                <Input
                  type="email"
                  value={formData.reference_contact}
                  onChange={(e) => setFormData({ ...formData, reference_contact: e.target.value })}
                  placeholder="Email of someone who can vouch for your background"
                />
              </div>

              <Button
                onClick={() => submitApplicationMutation.mutate()}
                disabled={submitApplicationMutation.isPending || !formData.description}
                className="w-full"
                size="lg"
              >
                Submit Application
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Verified Pastor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Lead church groups, manage training cohorts, host live sessions up to 500 participants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                Verified Trainer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Create training cohorts, assign courses, track mentee progress, issue certificates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
                Verified Ambassador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Represent FaithLight in your region, coordinate ministry initiatives, manage teams
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}