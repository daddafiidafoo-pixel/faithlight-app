import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Download } from 'lucide-react';

export default function ReviewerQAChecklist() {
  const [checklist, setChecklist] = useState({
    scripture_accuracy: {
      references_match: false,
      no_added_meaning: false,
      translation_aligned: false,
      notes: ''
    },
    theological_soundness: {
      no_new_doctrine: false,
      historic_alignment: false,
      clear_distinction: false,
      notes: ''
    },
    language_clarity: {
      church_language: false,
      local_clarity: false,
      consistent_terms: false,
      notes: ''
    },
    cultural_sensitivity: {
      appropriate_examples: false,
      no_confusing_metaphors: false,
      respectful_tone: false,
      notes: ''
    }
  });

  const [reviewerInfo, setReviewerInfo] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    approved: null
  });

  const sections = [
    {
      id: 'scripture_accuracy',
      title: 'Scripture Accuracy',
      icon: '📖',
      items: [
        { key: 'references_match', label: 'References match the cited verses' },
        { key: 'no_added_meaning', label: 'No added or removed Scripture meaning' },
        { key: 'translation_aligned', label: 'Public-domain or approved translation alignment' }
      ]
    },
    {
      id: 'theological_soundness',
      title: 'Theological Soundness',
      icon: '✝️',
      items: [
        { key: 'no_new_doctrine', label: 'No new doctrine introduced' },
        { key: 'historic_alignment', label: 'Consistent with historic Christian teaching' },
        { key: 'clear_distinction', label: 'Clear distinction between Scripture and explanation' }
      ]
    },
    {
      id: 'language_clarity',
      title: 'Language & Clarity',
      icon: '💬',
      items: [
        { key: 'church_language', label: 'Natural church language (not academic jargon)' },
        { key: 'local_clarity', label: 'Clear for local audience' },
        { key: 'consistent_terms', label: 'Terms consistent across lessons' }
      ]
    },
    {
      id: 'cultural_sensitivity',
      title: 'Cultural Sensitivity',
      icon: '🌍',
      items: [
        { key: 'appropriate_examples', label: 'Examples appropriate to local context' },
        { key: 'no_confusing_metaphors', label: 'No culturally confusing metaphors' },
        { key: 'respectful_tone', label: 'Respectful tone throughout' }
      ]
    }
  ];

  const allChecked = sections.every(section =>
    section.items.every(item => checklist[section.id][item.key])
  );

  const handleToggle = (section, key) => {
    setChecklist(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key]
      }
    }));
  };

  const handleNotesChange = (section, notes) => {
    setChecklist(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        notes
      }
    }));
  };

  const handleDownload = () => {
    const content = `
FAITHLIGHT REVIEWER QA CHECKLIST
================================

Reviewer: ${reviewerInfo.name}
Date: ${reviewerInfo.date}

${sections.map(section => `
${section.icon} ${section.title.toUpperCase()}
${'-'.repeat(section.title.length + 2)}
${section.items.map(item => `
[${checklist[section.id][item.key] ? 'X' : ' '}] ${item.label}
`).join('')}
${checklist[section.id].notes ? `
Notes:
${checklist[section.id].notes}
` : ''}
`).join('\n')}

FINAL APPROVAL
==============
Status: ${reviewerInfo.approved === true ? 'APPROVED ✓' : reviewerInfo.approved === false ? 'NEEDS REVISION' : 'PENDING'}

Reviewer Signature: ${reviewerInfo.name}
Date: ${reviewerInfo.date}
    `.trim();

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `qa-checklist-${reviewerInfo.date}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reviewer QA Checklist</h1>
          <p className="text-gray-600">Ensure all translations and lessons meet FaithLight's quality standards</p>
        </div>

        {/* Reviewer Info */}
        <Card className="mb-8 border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle>Reviewer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Reviewer Name</label>
                <input
                  type="text"
                  value={reviewerInfo.name}
                  onChange={(e) => setReviewerInfo({ ...reviewerInfo, name: e.target.value })}
                  className="w-full mt-2 p-2 border rounded"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Review Date</label>
                <input
                  type="date"
                  value={reviewerInfo.date}
                  onChange={(e) => setReviewerInfo({ ...reviewerInfo, date: e.target.value })}
                  className="w-full mt-2 p-2 border rounded"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist Sections */}
        <div className="space-y-6 mb-8">
          {sections.map(section => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="text-xl">{section.icon} {section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {section.items.map(item => (
                    <div key={item.key} className="flex items-start gap-3">
                      <Checkbox
                        checked={checklist[section.id][item.key]}
                        onCheckedChange={() => handleToggle(section.id, item.key)}
                        className="mt-1"
                      />
                      <label className="text-sm text-gray-700 cursor-pointer flex-1 pt-1">
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Section Notes
                  </label>
                  <Textarea
                    value={checklist[section.id].notes}
                    onChange={(e) => handleNotesChange(section.id, e.target.value)}
                    placeholder="Any observations or concerns..."
                    rows={3}
                    className="text-sm"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  All items in this section {section.items.every(item => checklist[section.id][item.key]) ? '✓ Complete' : 'need review'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Final Approval */}
        <Card className={allChecked ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {allChecked ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  Ready for Final Decision
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                  Complete All Sections
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button
                onClick={() => setReviewerInfo({ ...reviewerInfo, approved: true })}
                className={reviewerInfo.approved === true ? 'bg-green-600' : ''}
                variant={reviewerInfo.approved === true ? 'default' : 'outline'}
                disabled={!allChecked}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => setReviewerInfo({ ...reviewerInfo, approved: false })}
                variant={reviewerInfo.approved === false ? 'destructive' : 'outline'}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Request Changes
              </Button>
            </div>

            {reviewerInfo.approved !== null && (
              <div className="p-4 rounded border">
                <Badge className={reviewerInfo.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {reviewerInfo.approved ? 'APPROVED' : 'NEEDS REVISION'}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Reviewer: {reviewerInfo.name || 'Not provided'} • Date: {reviewerInfo.date}
                </p>
              </div>
            )}

            <Button onClick={handleDownload} className="w-full gap-2">
              <Download className="w-4 h-4" />
              Download Checklist
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}