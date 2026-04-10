import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Info } from 'lucide-react';

const PRICING_BY_REGION = {
  'north-america': {
    name: 'North America',
    monthlyPrice: '$9.99',
    annualPrice: '$99.99',
    currency: 'USD/CAD',
    countries: ['US', 'CA', 'MX'],
  },
  'europe': {
    name: 'Europe',
    monthlyPrice: '€9.99',
    annualPrice: '€99.99',
    currency: 'EUR',
    countries: ['GB', 'DE', 'FR', 'ES', 'IT'],
  },
  'asia': {
    name: 'Asia-Pacific',
    monthlyPrice: 'Variable',
    annualPrice: 'Variable',
    currency: 'Local',
    countries: ['JP', 'KR', 'SG', 'IN', 'AU', 'NZ'],
  },
  'south-america': {
    name: 'South America',
    monthlyPrice: 'R$ 49.99',
    annualPrice: 'R$ 499.99',
    currency: 'BRL',
    countries: ['BR'],
  },
  'africa': {
    name: 'Africa',
    monthlyPrice: 'Variable',
    annualPrice: 'Variable',
    currency: 'Local',
    countries: ['ZA', 'NG', 'KE', 'ET'],
  },
};

export default function SubscriptionPricingInfo({ userCountry, userRegion }) {
  const regionPricing = PRICING_BY_REGION[userRegion] || PRICING_BY_REGION['north-america'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Subscription Pricing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-gray-900">Your Region</span>
            </div>
            <Badge className="bg-indigo-600">{regionPricing.name}</Badge>
          </div>
          <p className="text-sm text-gray-700">
            Pricing applies to: {regionPricing.countries.join(', ')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">Monthly Subscription</p>
            <p className="text-2xl font-bold text-gray-900">{regionPricing.monthlyPrice}</p>
            <p className="text-xs text-gray-600 mt-1">Billed monthly</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-gray-600 mb-2">Annual Plan (Save 17%)</p>
            <p className="text-2xl font-bold text-green-600">{regionPricing.annualPrice}</p>
            <p className="text-xs text-gray-600 mt-1">Billed annually</p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
          <div className="flex gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1">How pricing works:</p>
              <ul className="text-xs space-y-1">
                <li>• Your language preference (app setting) is independent</li>
                <li>• You can use any language regardless of location</li>
                <li>• Subscription price is set by your country's app store</li>
                <li>• All features available in all languages</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p className="font-semibold text-gray-900 mb-1">Premium Features Include:</p>
          <ul className="space-y-0.5">
            <li>✓ Unlimited offline lesson downloads</li>
            <li>✓ Advanced Bible search tools</li>
            <li>✓ Ad-free experience</li>
            <li>✓ Exclusive audio Bible content</li>
            <li>✓ Priority support</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}