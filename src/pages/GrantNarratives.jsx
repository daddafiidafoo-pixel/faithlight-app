import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Copy, FileText } from 'lucide-react';

const defaultNarratives = {
  Ethiopia: {
    title: 'Ethiopia — Grant Narrative',
    context_need: 'Ethiopia has a rapidly growing Christian population, yet many pastors and Bible teachers lack access to structured theological education in Amharic and Afaan Oromo. Printed resources are limited, and formal training is often inaccessible due to cost, distance, and language barriers.',
    proposed_solution: 'FaithLight will provide Scripture-centered Bible lessons, quizzes, and teaching preparation tools translated into local languages. Pastors will receive affordable access to digital resources that support sermon preparation, Bible studies, and discipleship—without replacing Scripture or church authority.',
    expected_impact: '50–75 pastors equipped with teaching tools\n300+ believers engaged in structured Bible study\n20 lessons available in Amharic and Oromo\nStronger theological clarity and confidence among church leaders',
    sustainability: 'FaithLight combines donor support with affordable regional pricing, allowing local churches to continue using the platform beyond the grant period.'
  },
  Kenya: {
    title: 'Kenya — Grant Narrative',
    context_need: 'Churches in East Africa are growing quickly, especially among youth. However, many leaders lack consistent discipleship materials in Swahili, limiting biblical depth and continuity across congregations.',
    proposed_solution: 'FaithLight will deliver Swahili Bible lessons, interactive quizzes, and group-learning tools to support discipleship beyond Sunday services. Teachers will receive structured tools for lesson preparation and follow-up.',
    expected_impact: '40+ pastors and teachers trained\n10 churches piloting group learning\n400+ learners completing Bible lessons\nImproved consistency in teaching and discipleship',
    sustainability: 'Group plans and church partnerships will sustain usage after the grant period.'
  },
  Tanzania: {
    title: 'Tanzania — Grant Narrative',
    context_need: 'Churches in East Africa are growing quickly, especially among youth. However, many leaders lack consistent discipleship materials in Swahili, limiting biblical depth and continuity across congregations.',
    proposed_solution: 'FaithLight will deliver Swahili Bible lessons, interactive quizzes, and group-learning tools to support discipleship beyond Sunday services. Teachers will receive structured tools for lesson preparation and follow-up.',
    expected_impact: '40+ pastors and teachers trained\n10 churches piloting group learning\n400+ learners completing Bible lessons\nImproved consistency in teaching and discipleship',
    sustainability: 'Group plans and church partnerships will sustain usage after the grant period.'
  },
  France: {
    title: 'France — Grant Narrative',
    context_need: 'Many churches and Christian institutions in France seek academically sound, Scripture-faithful digital resources for Bible education and leadership training, especially among students and migrant congregations.',
    proposed_solution: 'FaithLight will localize structured Bible and theology lessons in French, with careful theological review, supporting seminaries, study groups, and church leaders.',
    expected_impact: 'Seminary pilot programs launched\nFrench-language lesson library expanded\nIncreased access to clear biblical teaching',
    sustainability: 'Partnerships with seminaries and churches ensure sustainable usage.'
  }
};

export default function GrantNarratives() {
  const [user, setUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.user_role !== 'admin') {
          alert('Access denied. Admin role required.');
          window.location.href = '/';
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const { data: narratives = [] } = useQuery({
    queryKey: ['grant-narratives'],
    queryFn: () => base44.entities.GrantNarrative.filter({}),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Grant Narratives</h1>
          <p className="text-gray-600">Manage grant proposal narratives for each country</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(defaultNarratives).map(([country, defaults]) => {
            const existing = narratives.find(n => n.country === country);
            return (
              <NarrativeCard
                key={country}
                country={country}
                narrative={existing || defaults}
                isExisting={!!existing}
                onEdit={() => setEditingId(existing?.id || country)}
              />
            );
          })}
        </div>

        {/* Edit/Create Dialog */}
        {editingId && (
          <NarrativeDialog
            narrative={narratives.find(n => n.id === editingId) || 
                       { country: editingId, ...defaultNarratives[editingId] }}
            onClose={() => setEditingId(null)}
            isNew={!narratives.find(n => n.id === editingId)}
          />
        )}
      </div>
    </div>
  );
}

function NarrativeCard({ country, narrative, isExisting, onEdit }) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GrantNarrative.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['grant-narratives']);
    }
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {narrative.title}
            </CardTitle>
            <Badge className="mt-2">{isExisting ? 'Custom' : 'Default'}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Context & Need</p>
          <p className="text-sm text-gray-600 line-clamp-3">{narrative.context_need}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Proposed Solution</p>
          <p className="text-sm text-gray-600 line-clamp-3">{narrative.proposed_solution}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1 gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
          </Button>
          {isExisting && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate(narrative.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NarrativeDialog({ narrative, onClose, isNew }) {
  const [formData, setFormData] = useState(narrative);
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (isNew) {
        return base44.entities.GrantNarrative.create({
          ...data,
          status: 'draft'
        });
      } else {
        return base44.entities.GrantNarrative.update(narrative.id, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['grant-narratives']);
      onClose();
    }
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Create' : 'Edit'} Grant Narrative — {formData.country}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Context & Need</Label>
            <Textarea
              value={formData.context_need}
              onChange={(e) => setFormData({ ...formData, context_need: e.target.value })}
              rows={4}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Proposed Solution</Label>
            <Textarea
              value={formData.proposed_solution}
              onChange={(e) => setFormData({ ...formData, proposed_solution: e.target.value })}
              rows={4}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Expected Impact</Label>
            <Textarea
              value={formData.expected_impact}
              onChange={(e) => setFormData({ ...formData, expected_impact: e.target.value })}
              rows={4}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Sustainability</Label>
            <Textarea
              value={formData.sustainability}
              onChange={(e) => setFormData({ ...formData, sustainability: e.target.value })}
              rows={4}
              className="mt-2"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={saveMutation.isPending}
            >
              Save Narrative
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}