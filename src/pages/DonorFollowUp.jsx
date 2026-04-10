import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, Calendar, BarChart3, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function DonorFollowUp() {
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

  const { data: donors = [] } = useQuery({
    queryKey: ['donors'],
    queryFn: () => base44.entities.DonorPortalAccess.list(),
    enabled: !!user
  });

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: () => base44.entities.Country.list(),
    enabled: !!user
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => base44.entities.DonorImpactMetrics.list(),
    enabled: !!user
  });

  const { data: communications = [] } = useQuery({
    queryKey: ['communications'],
    queryFn: () => base44.entities.DonorCommunication.list(),
    enabled: !!user
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Donor Follow-Up Management</h1>
          <p className="text-gray-600">Automate donor communications with updates, reports, and annual summaries.</p>
        </div>

        <Tabs defaultValue="30day" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="30day">30-Day Updates</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly Reports</TabsTrigger>
            <TabsTrigger value="annual">Annual Summaries</TabsTrigger>
          </TabsList>

          {/* 30-Day Update Tab */}
          <TabsContent value="30day" className="space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <p className="text-sm text-gray-700">Send a 30-day update email to donors after a country launch or significant milestone.</p>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Mail className="w-4 h-4" />
                    Trigger 30-Day Update
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <Trigger30DayUpdate
                    donors={donors}
                    countries={countries}
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['communications'] })}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {communications.filter(c => c.communication_type === '30_day_update').length === 0 ? (
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No 30-day updates sent yet</p>
                  </CardContent>
                </Card>
              ) : (
                communications.filter(c => c.communication_type === '30_day_update').map((comm) => {
                  const donor = donors.find(d => d.id === comm.donor_id);
                  const country = countries.find(c => c.id === comm.trigger_event);
                  return (
                    <Card key={comm.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{donor?.donor_name}</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">{country?.country_name} Launch</p>
                          </div>
                          <Badge variant={comm.status === 'sent' ? 'default' : 'outline'}>
                            {comm.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-600">Subject:</span> {comm.subject}</p>
                          {comm.sent_at && (
                            <p><span className="text-gray-600">Sent:</span> {new Date(comm.sent_at).toLocaleDateString()}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Quarterly Reports Tab */}
          <TabsContent value="quarterly" className="space-y-4">
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <p className="text-sm text-gray-700">Auto-generate quarterly donor reports from recorded metrics and country documents.</p>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Generate & Send Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <GenerateQuarterlyReport
                    donors={donors}
                    countries={countries}
                    metrics={metrics}
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['communications'] })}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {communications.filter(c => c.communication_type === 'quarterly_report').length === 0 ? (
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No quarterly reports sent yet</p>
                  </CardContent>
                </Card>
              ) : (
                communications.filter(c => c.communication_type === 'quarterly_report').map((comm) => {
                  const donor = donors.find(d => d.id === comm.donor_id);
                  return (
                    <Card key={comm.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{donor?.donor_name}</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">{comm.subject}</p>
                          </div>
                          <Badge variant={comm.status === 'sent' ? 'default' : 'outline'}>
                            {comm.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          {comm.metrics_snapshot && (
                            <div className="grid grid-cols-2 gap-2 pt-2">
                              <div>
                                <p className="text-gray-600">Learners</p>
                                <p className="font-semibold">{comm.metrics_snapshot.learners_reached || 0}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Funds</p>
                                <p className="font-semibold">${comm.metrics_snapshot.funds_deployed || 0}</p>
                              </div>
                            </div>
                          )}
                          {comm.sent_at && (
                            <p><span className="text-gray-600">Sent:</span> {new Date(comm.sent_at).toLocaleDateString()}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Annual Summary Tab */}
          <TabsContent value="annual" className="space-y-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <p className="text-sm text-gray-700">Generate comprehensive year-end summaries pulling all quarterly reports and country metrics.</p>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <FileText className="w-4 h-4" />
                    Generate & Send Annual Summary
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <GenerateAnnualSummary
                    donors={donors}
                    metrics={metrics}
                    communications={communications}
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['communications'] })}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {communications.filter(c => c.communication_type === 'annual_summary').length === 0 ? (
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No annual summaries sent yet</p>
                  </CardContent>
                </Card>
              ) : (
                communications.filter(c => c.communication_type === 'annual_summary').map((comm) => {
                  const donor = donors.find(d => d.id === comm.donor_id);
                  return (
                    <Card key={comm.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{donor?.donor_name}</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">{comm.subject}</p>
                          </div>
                          <Badge variant={comm.status === 'sent' ? 'default' : 'outline'}>
                            {comm.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          {comm.metrics_snapshot && (
                            <div className="grid grid-cols-2 gap-2 pt-2">
                              <div>
                                <p className="text-gray-600">Total Learners</p>
                                <p className="font-semibold">{comm.metrics_snapshot.total_learners || 0}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Year Fund Impact</p>
                                <p className="font-semibold">${comm.metrics_snapshot.year_funds || 0}</p>
                              </div>
                            </div>
                          )}
                          {comm.sent_at && (
                            <p><span className="text-gray-600">Sent:</span> {new Date(comm.sent_at).toLocaleDateString()}</p>
                          )}
                        </div>
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

function Trigger30DayUpdate({ donors, countries, onSuccess }) {
  const [formData, setFormData] = React.useState({
    donor_id: '',
    country_id: ''
  });
  const [sending, setSending] = React.useState(false);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const donor = donors.find(d => d.id === data.donor_id);
      const country = countries.find(c => c.id === data.country_id);
      
      const emailBody = `Dear ${donor.donor_name},

We're thrilled to share that FaithLight has officially launched in ${country.country_name}!

Over the past 30 days, here's what we've accomplished:
• Engaged ${country.primary_languages?.length || 1} local language communities
• Connected with church leaders eager to strengthen biblical teaching
• Established foundational infrastructure for sustained impact

Your partnership made this launch possible. Together, we're equipping pastors and teachers with transformative biblical education resources.

We'll share more detailed metrics in our quarterly reports. For now, we invite you to explore the impact directly:
Visit: [Portal Link]

Thank you for believing in this mission.

In Christ,
The FaithLight Team`;

      await base44.integrations.Core.SendEmail({
        to: donor.donor_email,
        subject: `FaithLight Launches in ${country.country_name} - 30-Day Update`,
        body: emailBody,
        from_name: 'FaithLight'
      });

      return base44.entities.DonorCommunication.create({
        donor_id: data.donor_id,
        communication_type: '30_day_update',
        trigger_event: data.country_id,
        subject: `FaithLight Launches in ${country.country_name} - 30-Day Update`,
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_by: 'admin'
      });
    },
    onSuccess: () => {
      onSuccess();
      setSending(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.donor_id && formData.country_id) {
      setSending(true);
      mutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Trigger 30-Day Update</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select value={formData.donor_id} onValueChange={(v) => setFormData({ ...formData, donor_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select donor" />
          </SelectTrigger>
          <SelectContent>
            {donors.filter(d => d.is_active).map(d => (
              <SelectItem key={d.id} value={d.id}>{d.donor_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={formData.country_id} onValueChange={(v) => setFormData({ ...formData, country_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.country_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" className="w-full" disabled={sending}>
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Update
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

function GenerateQuarterlyReport({ donors, countries, metrics, onSuccess }) {
  const [formData, setFormData] = React.useState({
    donor_id: '',
    period_date: new Date().toISOString().split('T')[0]
  });
  const [sending, setSending] = React.useState(false);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const donor = donors.find(d => d.id === data.donor_id);
      const periodDate = new Date(data.period_date);
      const quarter = Math.ceil((periodDate.getMonth() + 1) / 3);
      
      // Get metrics for this quarter
      const quarterMetrics = metrics.filter(m => {
        const mDate = new Date(m.period_date);
        return mDate.getFullYear() === periodDate.getFullYear() &&
               Math.ceil((mDate.getMonth() + 1) / 3) === quarter &&
               m.reporting_period === 'quarterly';
      });

      const totalLearners = quarterMetrics.reduce((sum, m) => sum + (m.learners_reached || 0), 0);
      const totalFunds = quarterMetrics.reduce((sum, m) => sum + (m.funds_deployed || 0), 0);

      const emailBody = `Dear ${donor.donor_name},

Here's your Q${quarter} ${periodDate.getFullYear()} Impact Report.

GLOBAL IMPACT:
• Active Learners: ${totalLearners.toLocaleString()}
• Funds Deployed: $${totalFunds.toLocaleString()}
• Countries Active: ${quarterMetrics.length}

KEY HIGHLIGHTS:
${quarterMetrics.slice(0, 3).map(m => `• ${m.key_story || 'Ongoing impact'}`).join('\n')}

View detailed reports: [Portal Link]

Thank you for your partnership in advancing biblical education worldwide.

Blessings,
The FaithLight Team`;

      await base44.integrations.Core.SendEmail({
        to: donor.donor_email,
        subject: `FaithLight Q${quarter} ${periodDate.getFullYear()} Impact Report`,
        body: emailBody,
        from_name: 'FaithLight'
      });

      return base44.entities.DonorCommunication.create({
        donor_id: data.donor_id,
        communication_type: 'quarterly_report',
        trigger_event: `Q${quarter}-${periodDate.getFullYear()}`,
        subject: `FaithLight Q${quarter} ${periodDate.getFullYear()} Impact Report`,
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_by: 'admin',
        metrics_snapshot: {
          learners_reached: totalLearners,
          funds_deployed: totalFunds,
          countries_active: quarterMetrics.length
        }
      });
    },
    onSuccess: () => {
      onSuccess();
      setSending(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.donor_id) {
      setSending(true);
      mutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Generate Quarterly Report</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select value={formData.donor_id} onValueChange={(v) => setFormData({ ...formData, donor_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select donor" />
          </SelectTrigger>
          <SelectContent>
            {donors.filter(d => d.is_active).map(d => (
              <SelectItem key={d.id} value={d.id}>{d.donor_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Report Period End Date</label>
          <input
            type="date"
            value={formData.period_date}
            onChange={(e) => setFormData({ ...formData, period_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <Button type="submit" className="w-full" disabled={sending}>
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Generate & Send
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

function GenerateAnnualSummary({ donors, metrics, communications, onSuccess }) {
  const [formData, setFormData] = React.useState({
    donor_id: '',
    year: new Date().getFullYear().toString()
  });
  const [sending, setSending] = React.useState(false);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const donor = donors.find(d => d.id === data.donor_id);
      const year = parseInt(data.year);

      // Get all metrics for the year
      const yearMetrics = metrics.filter(m => {
        const mDate = new Date(m.period_date);
        return mDate.getFullYear() === year;
      });

      const totalLearners = yearMetrics.reduce((sum, m) => sum + (m.learners_reached || 0), 0);
      const totalFunds = yearMetrics.reduce((sum, m) => sum + (m.funds_deployed || 0), 0);
      const totalPastors = yearMetrics.reduce((sum, m) => sum + (m.pastors_supported || 0), 0);

      const emailBody = `Dear ${donor.donor_name},

2024 was a year of remarkable growth in biblical education globally. Thank you for being essential to this journey.

YEAR IN REVIEW:
• Pastors Equipped: ${totalPastors.toLocaleString()}
• Learners Reached: ${totalLearners.toLocaleString()}
• Total Investment: $${totalFunds.toLocaleString()}
• Countries Impacted: ${yearMetrics.length}

IMPACT HIGHLIGHTS:
${yearMetrics.slice(0, 5).map(m => `• ${m.key_story || 'Continuous kingdom impact'}`).join('\n')}

LOOKING AHEAD TO ${year + 1}:
${yearMetrics.slice(0, 3).map(m => m.next_quarter_goals || '').filter(Boolean).join('\n')}

Full report: [Portal Link]

Your generosity is transforming how God's Word reaches pastors and students worldwide.

With deep gratitude,
The FaithLight Team`;

      await base44.integrations.Core.SendEmail({
        to: donor.donor_email,
        subject: `FaithLight ${year} Annual Impact Summary`,
        body: emailBody,
        from_name: 'FaithLight'
      });

      return base44.entities.DonorCommunication.create({
        donor_id: data.donor_id,
        communication_type: 'annual_summary',
        trigger_event: data.year,
        subject: `FaithLight ${year} Annual Impact Summary`,
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_by: 'admin',
        metrics_snapshot: {
          total_learners: totalLearners,
          year_funds: totalFunds,
          total_pastors: totalPastors,
          countries: yearMetrics.length
        }
      });
    },
    onSuccess: () => {
      onSuccess();
      setSending(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.donor_id) {
      setSending(true);
      mutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Generate Annual Summary</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select value={formData.donor_id} onValueChange={(v) => setFormData({ ...formData, donor_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select donor" />
          </SelectTrigger>
          <SelectContent>
            {donors.filter(d => d.is_active).map(d => (
              <SelectItem key={d.id} value={d.id}>{d.donor_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={formData.year} onValueChange={(v) => setFormData({ ...formData, year: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {[2024, 2025, 2026].map(y => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" className="w-full" disabled={sending}>
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Generate & Send
            </>
          )}
        </Button>
      </form>
    </div>
  );
}