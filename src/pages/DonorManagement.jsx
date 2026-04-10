import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Plus, Trash2, Mail } from 'lucide-react';

export default function DonorManagement() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.role !== 'admin') {
          window.location.href = '/';
        }
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: donorAccess = [] } = useQuery({
    queryKey: ['donorAccess'],
    queryFn: () => base44.entities.DonorPortalAccess.list(),
    enabled: !!user
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['donorMetrics'],
    queryFn: () => base44.entities.DonorImpactMetrics.list(),
    enabled: !!user
  });

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: () => base44.entities.Country.list(),
    enabled: !!user
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Donor Portal Management</h1>
          <p className="text-gray-600">Create donor access, manage impact metrics, and track engagement.</p>
        </div>

        <Tabs defaultValue="donors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="donors">Donor Access</TabsTrigger>
            <TabsTrigger value="metrics">Impact Metrics</TabsTrigger>
          </TabsList>

          {/* Donor Access Tab */}
          <TabsContent value="donors" className="space-y-4">
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Donor Access
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <CreateDonorAccessForm
                    countries={countries}
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['donorAccess'] })}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {donorAccess.length === 0 ? (
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No donor access created yet</p>
                  </CardContent>
                </Card>
              ) : (
                donorAccess.map((donor) => (
                  <Card key={donor.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{donor.donor_name}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">{donor.donor_email}</p>
                        </div>
                        <Badge variant={donor.is_active ? 'default' : 'destructive'}>
                          {donor.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Portal Link</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-white p-2 rounded flex-1 font-mono text-gray-900 break-all">
                              {typeof window !== 'undefined' ? `${window.location.origin}/donor-portal?token=${donor.access_token}` : 'Portal link'}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const url = `${window.location.origin}/donor-portal?token=${donor.access_token}`;
                                navigator.clipboard.writeText(url);
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-600 mb-2">Access Level</p>
                          <p className="text-sm font-semibold">{donor.access_level.replace('_', ' ')}</p>
                        </div>

                        {donor.access_level === 'specific_countries' && (
                          <div>
                            <p className="text-xs text-gray-600 mb-2">Visible Countries</p>
                            <div className="flex flex-wrap gap-1">
                              {donor.allowed_countries?.map((countryId) => {
                                const country = countries.find(c => c.id === countryId);
                                return (
                                  <Badge key={countryId} variant="outline" className="text-xs">
                                    {country?.country_name || countryId}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {donor.expires_at && (
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Expires</p>
                            <p className="text-sm text-gray-900">{new Date(donor.expires_at).toLocaleDateString()}</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2 border-t">
                          <Button variant="outline" size="sm" className="gap-2 flex-1">
                            <Mail className="w-4 h-4" />
                            Send Link
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Record Metrics
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <RecordMetricsForm
                    countries={countries}
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['donorMetrics'] })}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {metrics.length === 0 ? (
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No impact metrics recorded yet</p>
                  </CardContent>
                </Card>
              ) : (
                metrics.map((metric) => {
                  const country = countries.find(c => c.id === metric.country_id);
                  return (
                    <Card key={metric.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{country?.country_name}</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                              {metric.reporting_period} • {new Date(metric.period_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">{metric.reporting_period}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-600">Pastors Supported</p>
                            <p className="text-lg font-bold text-gray-900">{metric.pastors_supported}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Churches Engaged</p>
                            <p className="text-lg font-bold text-gray-900">{metric.churches_engaged}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Learners Reached</p>
                            <p className="text-lg font-bold text-gray-900">{metric.learners_reached}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Funds Deployed</p>
                            <p className="text-lg font-bold text-gray-900">${metric.funds_deployed?.toLocaleString() || 0}</p>
                          </div>
                        </div>

                        {metric.key_story && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-blue-900 font-semibold mb-1">Impact Story</p>
                            <p className="text-sm text-blue-900 italic">{metric.key_story}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CreateDonorAccessForm({ countries, onSuccess }) {
  const [formData, setFormData] = React.useState({
    donor_name: '',
    donor_email: '',
    access_level: 'all_countries',
    allowed_countries: []
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const token = generateAccessToken();
      return base44.entities.DonorPortalAccess.create({
        ...data,
        access_token: token,
        is_active: true
      });
    },
    onSuccess: () => {
      onSuccess();
    }
  });

  const generateAccessToken = () => {
    return 'donor_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.donor_name && formData.donor_email) {
      mutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Create Donor Access</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Donor name"
          value={formData.donor_name}
          onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
          required
        />
        <Input
          type="email"
          placeholder="Donor email"
          value={formData.donor_email}
          onChange={(e) => setFormData({ ...formData, donor_email: e.target.value })}
          required
        />
        <Select value={formData.access_level} onValueChange={(v) => setFormData({ ...formData, access_level: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Access level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_countries">All Countries</SelectItem>
            <SelectItem value="specific_countries">Specific Countries</SelectItem>
          </SelectContent>
        </Select>

        {formData.access_level === 'specific_countries' && (
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Select Countries</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {countries.map(country => (
                <label key={country.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowed_countries.includes(country.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          allowed_countries: [...formData.allowed_countries, country.id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          allowed_countries: formData.allowed_countries.filter(id => id !== country.id)
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{country.country_name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <Button type="submit" className="w-full">Create Access</Button>
      </form>
    </div>
  );
}

function RecordMetricsForm({ countries, onSuccess }) {
  const [formData, setFormData] = React.useState({
    country_id: '',
    reporting_period: 'quarterly',
    period_date: new Date().toISOString().split('T')[0],
    pastors_supported: 0,
    churches_engaged: 0,
    learners_reached: 0,
    lessons_completed: 0,
    languages_served: 0,
    funds_deployed: 0,
    key_story: '',
    next_quarter_goals: ''
  });

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.DonorImpactMetrics.create(data),
    onSuccess: () => {
      onSuccess();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.country_id && formData.key_story) {
      mutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Record Impact Metrics</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select value={formData.country_id} onValueChange={(v) => setFormData({ ...formData, country_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map(c => <SelectItem key={c.id} value={c.id}>{c.country_name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={formData.reporting_period} onValueChange={(v) => setFormData({ ...formData, reporting_period: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Reporting period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={formData.period_date}
          onChange={(e) => setFormData({ ...formData, period_date: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Pastors supported"
            value={formData.pastors_supported}
            onChange={(e) => setFormData({ ...formData, pastors_supported: parseInt(e.target.value) || 0 })}
          />
          <Input
            type="number"
            placeholder="Churches engaged"
            value={formData.churches_engaged}
            onChange={(e) => setFormData({ ...formData, churches_engaged: parseInt(e.target.value) || 0 })}
          />
          <Input
            type="number"
            placeholder="Learners reached"
            value={formData.learners_reached}
            onChange={(e) => setFormData({ ...formData, learners_reached: parseInt(e.target.value) || 0 })}
          />
          <Input
            type="number"
            placeholder="Funds deployed"
            value={formData.funds_deployed}
            onChange={(e) => setFormData({ ...formData, funds_deployed: parseInt(e.target.value) || 0 })}
          />
        </div>

        <textarea
          placeholder="Key impact story"
          value={formData.key_story}
          onChange={(e) => setFormData({ ...formData, key_story: e.target.value })}
          className="w-full p-2 border rounded text-sm"
          rows="3"
          required
        />

        <Button type="submit" className="w-full">Record Metrics</Button>
      </form>
    </div>
  );
}