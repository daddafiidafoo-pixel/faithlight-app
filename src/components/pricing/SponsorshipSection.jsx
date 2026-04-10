import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';

export default function SponsorshipSection({ userCountryTier }) {
  const [sponsorshipAmount, setSponsorshipAmount] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('global');

  // Only show sponsorship option for Tier 3 users (Western countries)
  const isWesternUser = userCountryTier === 'tier_3';

  const sponsorMutation = useMutation({
    mutationFn: async (amount) => {
      const result = await base44.functions.invoke('createSponsorship', {
        monthlyAmountCents: amount,
        beneficiaryRegion: selectedRegion
      });
      return result.data;
    },
    onSuccess: () => {
      setSponsorshipAmount(null);
      alert('Thank you for supporting believers worldwide! 🙏');
    },
    onError: () => {
      alert('Unable to set up sponsorship. Please try again.');
    }
  });

  if (!isWesternUser) {
    return null; // Only show for Tier 3 users
  }

  return (
    <div className="space-y-6 mt-12 pt-12 border-t border-gray-200">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">💝 Support a Believer</h2>
        <p className="text-lg text-gray-600">
          Help make FaithLight accessible to disciples in developing regions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sponsorship Option 1 */}
        <Card className={`cursor-pointer transition-all ${sponsorshipAmount === 200 ? 'ring-2 ring-indigo-600 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setSponsorshipAmount(200)}>
          <CardContent className="pt-6 text-center space-y-3">
            <Heart className="w-8 h-8 text-red-500 mx-auto" />
            <div>
              <p className="text-2xl font-bold text-indigo-600">$2</p>
              <p className="text-xs text-gray-600">/month</p>
            </div>
            <p className="text-sm text-gray-700">
              Sponsor one believer's premium access
            </p>
            <Badge className={sponsorshipAmount === 200 ? 'bg-indigo-600' : 'bg-gray-200'}>
              {sponsorshipAmount === 200 ? '✓ Selected' : 'Select'}
            </Badge>
          </CardContent>
        </Card>

        {/* Sponsorship Option 2 */}
        <Card className={`cursor-pointer transition-all ${sponsorshipAmount === 500 ? 'ring-2 ring-indigo-600 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setSponsorshipAmount(500)}>
          <CardContent className="pt-6 text-center space-y-3">
            <Users className="w-8 h-8 text-orange-500 mx-auto" />
            <div>
              <p className="text-2xl font-bold text-indigo-600">$5</p>
              <p className="text-xs text-gray-600">/month</p>
            </div>
            <p className="text-sm text-gray-700">
              Support 2–3 believers
            </p>
            <Badge className={sponsorshipAmount === 500 ? 'bg-indigo-600' : 'bg-gray-200'}>
              {sponsorshipAmount === 500 ? '✓ Selected' : 'Select'}
            </Badge>
          </CardContent>
        </Card>

        {/* Sponsorship Option 3 */}
        <Card className={`cursor-pointer transition-all ${sponsorshipAmount === 1000 ? 'ring-2 ring-indigo-600 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setSponsorshipAmount(1000)}>
          <CardContent className="pt-6 text-center space-y-3">
            <Globe className="w-8 h-8 text-blue-500 mx-auto" />
            <div>
              <p className="text-2xl font-bold text-indigo-600">$10</p>
              <p className="text-xs text-gray-600">/month</p>
            </div>
            <p className="text-sm text-gray-700">
              Support a whole small group
            </p>
            <Badge className={sponsorshipAmount === 1000 ? 'bg-indigo-600' : 'bg-gray-200'}>
              {sponsorshipAmount === 1000 ? '✓ Selected' : 'Select'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Region Selection */}
      {sponsorshipAmount && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-4">
          <p className="text-sm font-semibold text-gray-900">Where should your gift help?</p>
          <div className="flex gap-2">
            {[
              { value: 'africa', label: '🌍 Africa' },
              { value: 'asia_middle_east', label: '🏔 Asia & Middle East' },
              { value: 'global', label: '🌐 Global Need' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedRegion(option.value)}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                  selectedRegion === option.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CTA Button */}
      {sponsorshipAmount && (
        <div className="text-center space-y-3">
          <Button
            className="bg-red-600 hover:bg-red-700 text-lg px-8 py-3"
            onClick={() => sponsorMutation.mutate(sponsorshipAmount)}
            disabled={sponsorMutation.isPending}
          >
            {sponsorMutation.isPending ? 'Setting up...' : `Set Up ${sponsorshipAmount === 200 ? '$2' : sponsorshipAmount === 500 ? '$5' : '$10'} Monthly Sponsorship`}
          </Button>
          <p className="text-xs text-gray-600">
            Your sponsorship helps directly fund scholarships for believers in developing regions.
          </p>
        </div>
      )}

      {/* Impact Message */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-6 space-y-3">
          <p className="font-semibold text-gray-900">💪 Your Impact</p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Fund scholarships for believers in developing countries</li>
            <li>✓ Enable pastors to lead stronger small groups</li>
            <li>✓ Build the global church through education</li>
            <li>✓ 100% of sponsorship funds support scholarships (admin costs covered separately)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}