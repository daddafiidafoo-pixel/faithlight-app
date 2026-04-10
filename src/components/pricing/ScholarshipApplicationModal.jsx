import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';

export default function ScholarshipApplicationModal({ open, onOpenChange, userCountryCode }) {
  const [reason, setReason] = useState('');
  const [isStudent, setIsStudent] = useState(false);
  const [isChurchLeader, setIsChurchLeader] = useState(false);

  const applyMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('processScholarshipRequest', {
        countryCode: userCountryCode,
        reason,
        isStudent,
        isChurchLeader
      });
      return result.data;
    },
    onSuccess: (data) => {
      if (data.autoApproved) {
        alert('🎉 Scholarship approved! You now have premium access for 6 months.');
      } else {
        alert('Thank you for applying. Our team will review your request within 48 hours.');
      }
      setReason('');
      setIsStudent(false);
      setIsChurchLeader(false);
      onOpenChange(false);
    },
    onError: () => {
      alert('Failed to submit application. Please try again.');
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for Scholarship</DialogTitle>
          <DialogDescription>
            FaithLight offers free or reduced premium access to students, church leaders, and those in financial need.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-900">
                Scholarship grants premium access for 6 months and is renewable. Be honest about your situation.
              </p>
            </div>
          </div>

          {/* Application Form */}
          <div className="space-y-4">
            {/* Status Questions */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Tell us about yourself:</label>

              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded border">
                <Checkbox
                  id="student"
                  checked={isStudent}
                  onCheckedChange={setIsStudent}
                />
                <label htmlFor="student" className="text-sm text-gray-700 cursor-pointer">
                  I'm a student
                </label>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded border">
                <Checkbox
                  id="leader"
                  checked={isChurchLeader}
                  onCheckedChange={setIsChurchLeader}
                />
                <label htmlFor="leader" className="text-sm text-gray-700 cursor-pointer">
                  I'm a church leader
                </label>
              </div>
            </div>

            {/* Reason Text */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Why do you need this scholarship?
              </label>
              <Textarea
                placeholder="Please briefly explain your situation. (50-200 words)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-24 text-sm"
              />
              <p className="text-xs text-gray-600 mt-1">
                {reason.length}/200 characters
              </p>
            </div>

            {/* Privacy Notice */}
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <p className="text-xs text-gray-600">
                ✓ Your application is confidential<br />
                ✓ We'll review within 48 hours<br />
                ✓ Approved scholarships are 6 months (renewable)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => applyMutation.mutate()}
              disabled={!reason.trim() || applyMutation.isPending}
            >
              {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}