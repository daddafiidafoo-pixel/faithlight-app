import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, MapPin, Award, Zap, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AmbassadorProgram() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.user_role !== 'admin') {
          alert('Access denied. Admin role required.');
          window.location.href = '/';
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const { data: ambassadors = [] } = useQuery({
    queryKey: ['ambassadors'],
    queryFn: () => base44.entities.Ambassador.filter({}),
    enabled: !!user,
  });

  const activeAmbassadors = ambassadors.filter(a => a.status === 'active');
  const pendingAmbassadors = ambassadors.filter(a => a.status === 'pending');
  const leadAmbassadors = activeAmbassadors.filter(a => a.role === 'lead');

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Award className="w-10 h-10 text-amber-600" />
                Regional Ambassador Program
              </h1>
              <p className="text-gray-600 mt-2">Build local trust and growth through respected leaders</p>
            </div>
            <InviteAmbassadorDialog onAmbassadorAdded={() => queryClient.invalidateQueries(['ambassadors'])} />
          </div>
        </div>

        {/* Program Overview */}
        <Card className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <CardTitle>About the Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              Ambassadors are trusted pastors and Bible teachers who represent FaithLight in their regions. They help introduce FaithLight to churches, onboard teachers, provide cultural feedback, and share insights about local needs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Ambassador Responsibilities</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ Introduce FaithLight to churches</li>
                  <li>✓ Help onboard teachers</li>
                  <li>✓ Provide cultural feedback</li>
                  <li>✓ Share quarterly insights</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Ambassador Benefits</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ Free Teacher plan</li>
                  <li>✓ Early access to features</li>
                  <li>✓ Public recognition</li>
                  <li>✓ Training certificates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-gray-600 text-sm">Active Ambassadors</p>
                <p className="text-3xl font-bold text-gray-900">{activeAmbassadors.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-gray-600 text-sm">Lead Ambassadors</p>
                <p className="text-3xl font-bold text-gray-900">{leadAmbassadors.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{pendingAmbassadors.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-gray-600 text-sm">Countries Covered</p>
                <p className="text-3xl font-bold text-gray-900">
                  {new Set(activeAmbassadors.map(a => a.country)).size}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active Ambassadors</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          </TabsList>

          {/* Active Ambassadors */}
          <TabsContent value="active" className="space-y-4">
            {activeAmbassadors.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No active ambassadors yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAmbassadors.map(ambassador => (
                  <AmbassadorCard key={ambassador.id} ambassador={ambassador} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pending Ambassadors */}
          <TabsContent value="pending" className="space-y-4">
            {pendingAmbassadors.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No pending applications</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAmbassadors.map(ambassador => (
                  <PendingAmbassadorCard
                    key={ambassador.id}
                    ambassador={ambassador}
                    onApproved={() => queryClient.invalidateQueries(['ambassadors'])}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AmbassadorCard({ ambassador }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">{ambassador.full_name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {ambassador.country}
            </p>
          </div>
          <Badge className={ambassador.role === 'lead' ? 'bg-amber-600' : ''}>
            {ambassador.role === 'lead' ? '⭐ Lead' : 'Supporting'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">{ambassador.bio}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Churches Onboarded</p>
            <p className="text-2xl font-bold text-gray-900">{ambassador.churches_onboarded}</p>
          </div>
          <div>
            <p className="text-gray-600">Teachers Helped</p>
            <p className="text-2xl font-bold text-gray-900">{ambassador.teachers_helped}</p>
          </div>
        </div>
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600">
            <strong>Languages:</strong> {ambassador.languages?.join(', ') || 'Not specified'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function PendingAmbassadorCard({ ambassador, onApproved }) {
  const queryClient = useQueryClient();
  const approveMutation = useMutation({
    mutationFn: () =>
      base44.entities.Ambassador.update(ambassador.id, { status: 'active' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['ambassadors']);
      onApproved();
    }
  });

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-lg">{ambassador.full_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">{ambassador.bio}</p>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Country:</strong> {ambassador.country}</p>
            <p><strong>Church:</strong> {ambassador.church_affiliation}</p>
            <p><strong>Languages:</strong> {ambassador.languages?.join(', ') || 'Not specified'}</p>
          </div>
        </div>
        <Button
          onClick={() => approveMutation.mutate()}
          className="w-full"
          disabled={approveMutation.isPending}
        >
          {approveMutation.isPending ? 'Approving...' : 'Approve Ambassador'}
        </Button>
      </CardContent>
    </Card>
  );
}

function InviteAmbassadorDialog({ onAmbassadorAdded }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    country: '',
    role: 'supporting',
    church_affiliation: '',
    bio: '',
    languages: ''
  });
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    getUser();
  }, []);

  const createAmbassadorMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.Ambassador.create({
        ...data,
        user_id: user?.id || 'pending',
        languages: data.languages.split(',').map(l => l.trim()).filter(l => l),
        status: 'pending'
      }),
    onSuccess: () => {
      setOpen(false);
      setFormData({
        full_name: '',
        email: '',
        country: '',
        role: 'supporting',
        church_affiliation: '',
        bio: '',
        languages: ''
      });
      queryClient.invalidateQueries(['ambassadors']);
      onAmbassadorAdded();
    }
  });

  const countries = ['Ethiopia', 'Kenya', 'Tanzania', 'Uganda', 'Nigeria', 'Ghana', 'France', 'Germany', 'India', 'Brazil', 'Mexico'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Invite Ambassador
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invite Regional Ambassador</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Ambassador name"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ambassador@church.com"
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Country</Label>
              <Select value={formData.country} onValueChange={(val) => setFormData({ ...formData, country: val })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead Ambassador</SelectItem>
                  <SelectItem value="supporting">Supporting Ambassador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Church / Organization</Label>
            <Input
              value={formData.church_affiliation}
              onChange={(e) => setFormData({ ...formData, church_affiliation: e.target.value })}
              placeholder="Church or organization name"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Languages (comma-separated)</Label>
            <Input
              value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
              placeholder="E.g., Amharic, English, Oromo"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Brief bio and ministry focus"
              rows={3}
              className="mt-2"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createAmbassadorMutation.mutate(formData)}>
              Send Invitation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}