import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Heart, Users, BookOpen, TrendingUp, Download, AlertCircle } from 'lucide-react';

export default function DonorPortal() {
  const [searchParams] = useSearchParams();
  const [accessToken, setAccessToken] = useState(searchParams.get('token') || '');
  const [authenticated, setAuthenticated] = useState(false);
  const [donorInfo, setDonorInfo] = useState(null);

  // Verify access token
  const { data: access } = useQuery({
    queryKey: ['donorAccess', accessToken],
    queryFn: async () => {
      if (!accessToken) return null;
      const results = await base44.entities.DonorPortalAccess.filter({
        access_token: accessToken,
        is_active: true
      });
      return results[0];
    },
    enabled: !!accessToken
  });

  useEffect(() => {
    if (access) {
      setDonorInfo(access);
      setAuthenticated(true);
    }
  }, [access]);

  // Fetch countries (filtered by donor access)
  const { data: countries = [] } = useQuery({
    queryKey: ['donorCountries', donorInfo?.id],
    queryFn: async () => {
      const allCountries = await base44.entities.Country.list();
      if (!donorInfo) return [];
      
      if (donorInfo.access_level === 'all_countries') {
        return allCountries;
      }
      return allCountries.filter(c => donorInfo.allowed_countries?.includes(c.id));
    },
    enabled: authenticated && !!donorInfo
  });

  // Fetch impact metrics
  const { data: metrics = [] } = useQuery({
    queryKey: ['donorMetrics'],
    queryFn: () => base44.entities.DonorImpactMetrics.list(),
    enabled: authenticated
  });

  // Fetch donor reports
  const { data: donorReports = [] } = useQuery({
    queryKey: ['donorReports'],
    queryFn: async () => {
      const allDocs = await base44.entities.CountryDocument.list();
      return allDocs.filter(d => 
        d.visibility?.includes('donor_external') || d.document_type === 'donor_report'
      );
    },
    enabled: authenticated
  });

  if (!accessToken) {
    return <DonorAccessForm onAccessGranted={(token) => setAccessToken(token)} />;
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold">Access Denied</p>
            <p className="text-gray-600 text-sm mt-2">The access token is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalImpact = {
    pastors: metrics.reduce((sum, m) => sum + (m.pastors_supported || 0), 0),
    learners: metrics.reduce((sum, m) => sum + (m.learners_reached || 0), 0),
    lessons: metrics.reduce((sum, m) => sum + (m.lessons_completed || 0), 0),
    languages: [...new Set(metrics.flatMap(m => m.languages_served || []))].length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">FaithLight Impact</h1>
            </div>
            {donorInfo?.donor_name && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome,</p>
                <p className="text-lg font-semibold text-gray-900">{donorInfo.donor_name}</p>
              </div>
            )}
          </div>
          <p className="text-gray-600">Your partnership is strengthening biblical teaching globally. Here's the impact of your generous support.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Global Impact Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pastors Supported</p>
                  <p className="text-3xl font-bold text-indigo-600">{totalImpact.pastors.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Learners Reached</p>
                  <p className="text-3xl font-bold text-purple-600">{totalImpact.learners.toLocaleString()}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Lessons Completed</p>
                  <p className="text-3xl font-bold text-green-600">{totalImpact.lessons.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Countries Served</p>
                  <p className="text-3xl font-bold text-pink-600">{countries.length}</p>
                </div>
                <Globe className="w-8 h-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="countries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="countries">Countries</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="stories">Impact Stories</TabsTrigger>
          </TabsList>

          {/* Countries Tab */}
          <TabsContent value="countries" className="space-y-4">
            <div className="grid gap-4">
              {countries.length === 0 ? (
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No countries available</p>
                  </CardContent>
                </Card>
              ) : (
                countries.map((country) => {
                  const countryMetrics = metrics.find(m => m.country_id === country.id);
                  return (
                    <Card key={country.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{country.country_name}</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">{country.region}</p>
                          </div>
                          <Badge className={
                            country.launch_status === 'live' ? 'bg-green-100 text-green-800' :
                            country.launch_status === 'soft_launch' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {country.launch_status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {countryMetrics ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Pastors</p>
                              <p className="text-xl font-bold text-gray-900">{countryMetrics.pastors_supported}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Churches</p>
                              <p className="text-xl font-bold text-gray-900">{countryMetrics.churches_engaged}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Active Learners</p>
                              <p className="text-xl font-bold text-gray-900">{countryMetrics.learners_reached}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Languages</p>
                              <p className="text-xl font-bold text-gray-900">{countryMetrics.languages_served}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No metrics available yet</p>
                        )}
                        {countryMetrics?.key_story && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Recent Story</p>
                            <p className="text-sm text-gray-700 italic">{countryMetrics.key_story}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4">
              {donorReports.length === 0 ? (
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No reports available yet</p>
                  </CardContent>
                </Card>
              ) : (
                donorReports.map((report) => {
                  const reportCountry = countries.find(c => c.id === report.country_id);
                  return (
                    <Card key={report.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{report.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {report.document_type.replace(/_/g, ' ')}
                              </Badge>
                              {reportCountry && (
                                <Badge variant="outline" className="text-xs">
                                  {reportCountry.country_name}
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">{report.version}</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => window.open(report.file_url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      </CardHeader>
                      {report.description && (
                        <CardContent>
                          <p className="text-sm text-gray-700">{report.description}</p>
                        </CardContent>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Impact Stories Tab */}
          <TabsContent value="stories" className="space-y-4">
            <div className="grid gap-4">
              {metrics.filter(m => m.key_story).length === 0 ? (
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No impact stories available yet</p>
                  </CardContent>
                </Card>
              ) : (
                metrics.filter(m => m.key_story).map((metric) => {
                  const country = countries.find(c => c.id === metric.country_id);
                  return (
                    <Card key={metric.id} className="border-l-4 border-l-purple-600">
                      <CardHeader>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">{country?.country_name} • {metric.reporting_period}</p>
                          <p className="text-sm text-gray-500">{new Date(metric.period_date).toLocaleDateString()}</p>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-900 leading-relaxed">{metric.key_story}</p>
                        {metric.next_quarter_goals && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-xs text-gray-600 font-semibold mb-1">Next Quarter Goals</p>
                            <p className="text-sm text-gray-700">{metric.next_quarter_goals}</p>
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

        {/* Footer */}
        <div className="mt-16 text-center text-gray-600 border-t pt-8">
          <p className="text-sm">Thank you for your partnership in strengthening biblical teaching worldwide.</p>
          <p className="text-xs mt-2 italic">"Let the word of Christ dwell in you richly." — Colossians 3:16</p>
        </div>
      </div>
    </div>
  );
}

function DonorAccessForm({ onAccessGranted }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (token.trim()) {
      onAccessGranted(token);
      setError('');
    } else {
      setError('Please enter an access token');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <CardTitle>FaithLight Donor Portal</CardTitle>
          </div>
          <p className="text-sm text-gray-600">Access your personalized impact report</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Access Token</label>
              <Input
                type="text"
                placeholder="Enter your access token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="font-mono text-sm"
              />
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>
            <Button type="submit" className="w-full">
              Access Portal
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Your access token was sent to your email address.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}