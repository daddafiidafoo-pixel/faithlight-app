import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function AmbassadorCountryDetail() {
  const { countryId } = useParams();
  const [user, setUser] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: country } = useQuery({
    queryKey: ['country', countryId],
    queryFn: async () => {
      try { return await base44.entities.Country.read(countryId); } catch { return null; }
    },
    enabled: !!countryId && !!user,
    retry: false,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['countryDocuments', countryId],
    queryFn: async () => {
      try {
        const docs = await base44.entities.CountryDocument.filter({ country_id: countryId });
        return docs.filter(d => ['ambassador', 'admin_only'].includes(d.visibility));
      } catch { return []; }
    },
    enabled: !!countryId && !!user,
    retry: false,
  });

  const { data: updates = [] } = useQuery({
    queryKey: ['ambassadorUpdates', countryId],
    queryFn: async () => {
      try {
        return await base44.entities.AmbassadorUpdate.filter({ country_id: countryId });
      } catch { return []; }
    },
    enabled: !!countryId && !!user,
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.AmbassadorUpdate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambassadorUpdates', countryId] });
      setShowUpdateForm(false);
    }
  });

  if (!user || !country) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Link to={createPageUrl('AmbassadorDashboard')} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{country.country_name}</h1>
              <p className="text-gray-600 mt-2">{country.region}</p>
            </div>
            <Badge className={
              country.launch_status === 'live' ? 'bg-green-100 text-green-800' :
              country.launch_status === 'soft_launch' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }>
              {country.launch_status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-gray-600">Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{country.primary_languages?.join(', ')}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-gray-600">Churches Onboarded</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{country.churches_onboarded || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-gray-600">Active Learners</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{country.active_learners || 0}</p>
                </CardContent>
              </Card>
            </div>

            {country.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{country.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Country Resources</CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-gray-500">No documents available for this country</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{doc.title}</p>
                          <p className="text-xs text-gray-500">{doc.document_type.replace(/_/g, ' ')} • {doc.version}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => window.open(doc.file_url, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={showUpdateForm} onOpenChange={setShowUpdateForm}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Send className="w-4 h-4" />
                    Submit Update
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <UpdateForm
                    countryId={countryId}
                    ambassadorId={user.email}
                    onSubmit={(data) => updateMutation.mutate(data)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {updates.length === 0 ? (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">No updates submitted yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {updates.map((update) => (
                  <Card key={update.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Update for {new Date(update.period_date).toLocaleDateString()}</p>
                          <Badge className="mt-2" variant={update.status === 'reviewed' ? 'default' : 'outline'}>
                            {update.status === 'reviewed' ? 'Reviewed' : 'Submitted'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Churches Contacted</p>
                          <p className="text-xl font-bold">{update.churches_contacted}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Churches Onboarded</p>
                          <p className="text-xl font-bold">{update.churches_onboarded}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Teachers Approved</p>
                          <p className="text-xl font-bold">{update.teachers_approved}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Active Learners</p>
                          <p className="text-xl font-bold">{update.learners_active}</p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Wins & Testimonies</p>
                        <p className="text-sm text-gray-700">{update.wins_testimonies}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-2">Challenges & Needs</p>
                        <p className="text-sm text-gray-700">{update.challenges_needs}</p>
                      </div>

                      {update.admin_notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs text-blue-900 font-semibold mb-1">Admin Response</p>
                          <p className="text-sm text-blue-900">{update.admin_notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function UpdateForm({ countryId, ambassadorId, onSubmit }) {
  const [formData, setFormData] = React.useState({
    submitted_by: ambassadorId,
    country_id: countryId,
    period_date: new Date().toISOString().split('T')[0],
    churches_contacted: 0,
    churches_onboarded: 0,
    teachers_approved: 0,
    learners_active: 0,
    wins_testimonies: '',
    challenges_needs: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.wins_testimonies && formData.challenges_needs) {
      onSubmit(formData);
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Submit Country Update</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Churches Contacted</label>
            <Input
              type="number"
              value={formData.churches_contacted}
              onChange={(e) => setFormData({ ...formData, churches_contacted: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Churches Onboarded</label>
            <Input
              type="number"
              value={formData.churches_onboarded}
              onChange={(e) => setFormData({ ...formData, churches_onboarded: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Teachers Approved</label>
            <Input
              type="number"
              value={formData.teachers_approved}
              onChange={(e) => setFormData({ ...formData, teachers_approved: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Active Learners</label>
            <Input
              type="number"
              value={formData.learners_active}
              onChange={(e) => setFormData({ ...formData, learners_active: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-600 block mb-1">Wins & Testimonies</label>
          <Textarea
            placeholder="Share success stories and positive feedback..."
            value={formData.wins_testimonies}
            onChange={(e) => setFormData({ ...formData, wins_testimonies: e.target.value })}
            className="h-24"
            required
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 block mb-1">Challenges & Needs</label>
          <Textarea
            placeholder="What challenges did you face? What resources do you need?"
            value={formData.challenges_needs}
            onChange={(e) => setFormData({ ...formData, challenges_needs: e.target.value })}
            className="h-24"
            required
          />
        </div>

        <Button type="submit" className="w-full">Submit Update</Button>
      </form>
    </div>
  );
}