import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Download, Send, BookOpen, MessageCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

const FEEDBACK_TYPES = [
  { value: 'progress_update', label: 'Progress Update' },
  { value: 'concern', label: 'Concern' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'success_story', label: 'Success Story' },
  { value: 'resource_request', label: 'Resource Request' }
];

export default function AmbassadorDashboard() {
  const [user, setUser] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.user_role !== 'ambassador') {
          window.location.href = '/';
        }
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: myCountries = [] } = useQuery({
    queryKey: ['ambassadorCountries', user?.email],
    queryFn: async () => {
      try { return await base44.entities.Country.filter({ ambassador_assigned: user?.email }); } catch { return []; }
    },
    enabled: !!user,
    retry: false,
  });

  const { data: handbook } = useQuery({
    queryKey: ['ambassadorHandbook'],
    queryFn: async () => {
      try { const handbooks = await base44.entities.AmbassadorHandbook.list(); return handbooks[0]; } catch { return null; }
    },
    retry: false,
  });

  const { data: countryDocuments = [] } = useQuery({
    queryKey: ['ambassadorDocuments', selectedCountry?.id],
    queryFn: async () => {
      try { return await base44.entities.CountryDocument.filter({ country_id: selectedCountry?.id }); } catch { return []; }
    },
    enabled: !!selectedCountry,
    retry: false,
  });

  const feedbackMutation = useMutation({
    mutationFn: (data) => base44.entities.AmbassadorFeedback.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambassadorFeedback'] });
      setShowFeedback(false);
    }
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Ambassador Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage your assigned countries and share feedback with the FaithLight team.</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ambassador Handbook</CardTitle>
              </CardHeader>
              <CardContent>
                {handbook ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-4">{handbook.title}</p>
                    <Button variant="outline" className="w-full gap-2">
                      <BookOpen className="w-4 h-4" />
                      View Handbook
                    </Button>
                    <p className="text-xs text-gray-500">{handbook.version}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No handbook available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">My Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {myCountries.length === 0 ? (
                    <p className="text-sm text-gray-500">No countries assigned yet</p>
                  ) : (
                    myCountries.map((country) => (
                      <div
                        key={country.id}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedCountry?.id === country.id
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <button
                          onClick={() => setSelectedCountry(country)}
                          className="w-full text-left"
                        >
                          <p className="font-semibold text-sm text-gray-900">{country.country_name}</p>
                          <p className="text-xs text-gray-500">{country.region}</p>
                        </button>
                        {selectedCountry?.id === country.id && (
                          <Link
                            to={`/ambassador/country/${country.id}`}
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 mt-2"
                          >
                            View Details <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-2">
            {selectedCountry ? (
              <Tabs defaultValue="resources" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="feedback">Feedback</TabsTrigger>
                </TabsList>

                <TabsContent value="resources" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedCountry.country_name} Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Region</p>
                          <p className="font-semibold">{selectedCountry.region}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Status</p>
                          <Badge className={
                            selectedCountry.launch_status === 'live' ? 'bg-green-100 text-green-800' :
                            selectedCountry.launch_status === 'soft_launch' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {selectedCountry.launch_status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Languages</p>
                          <p className="font-semibold text-sm">{selectedCountry.primary_languages?.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Primary Language</p>
                          <p className="font-semibold text-sm">{selectedCountry.primary_languages?.[0] || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Country Documents</h3>
                        {countryDocuments.length === 0 ? (
                          <p className="text-sm text-gray-500">No documents available yet</p>
                        ) : (
                          <div className="space-y-2">
                            {countryDocuments.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">{doc.title}</p>
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
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="feedback">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Send Feedback</CardTitle>
                        <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
                          <DialogTrigger asChild>
                            <Button className="gap-2">
                              <Send className="w-4 h-4" />
                              New Feedback
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <FeedbackForm
                              countryId={selectedCountry.id}
                              ambassadorEmail={user.email}
                              onSubmit={(data) => {
                                feedbackMutation.mutate(data);
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Use this form to share progress updates, concerns, suggestions, and success stories with the FaithLight team. We review feedback monthly.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="p-12 text-center">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900 mb-2">Select a country</p>
                  <p className="text-gray-600">Choose a country from your list to view resources and send feedback</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackForm({ countryId, ambassadorEmail, onSubmit }) {
  const [formData, setFormData] = React.useState({
    ambassador_id: ambassadorEmail,
    country_id: countryId,
    feedback_type: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.feedback_type && formData.subject && formData.message) {
      onSubmit(formData);
      setFormData({
        ambassador_id: ambassadorEmail,
        country_id: countryId,
        feedback_type: '',
        subject: '',
        message: ''
      });
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Submit Feedback</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select value={formData.feedback_type} onValueChange={(v) => setFormData({ ...formData, feedback_type: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Type of feedback" />
          </SelectTrigger>
          <SelectContent>
            {FEEDBACK_TYPES.map(ft => (
              <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
        />
        <Textarea
          placeholder="Your feedback..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="h-32"
          required
        />
        <Button type="submit" className="w-full">Submit Feedback</Button>
      </form>
    </div>
  );
}