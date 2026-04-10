import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

const CHECK = ({ color = 'text-green-600' }) => (
  <CheckCircle className={`w-4 h-4 ${color} flex-shrink-0 mt-0.5`} />
);

export default function PricingPsychologyCards({ pricing, onSelectPlan, selectedPlan }) {
  const plans = [
    {
      id: 'premium',
      label: 'Premium',
      identity: 'For leaders & teachers',
      monthlyPrice: pricing?.premium,
      monthlyPriceDisplay: `${pricing?.currency || '$'}${pricing?.premium || '10'}`,
      annualPrice: Math.floor(pricing?.premium * 12 * 0.8),
      annualSavings: Math.ceil(pricing?.premium * 12 * 0.2),
      badge: 'Best Value',
      color: 'purple',
      features: [
        'Everything in Basic',
        'Unlimited AI (no cap)',
        'Advanced sermon prep tools',
        'Certificate in Theology & Leadership',
        'Offline downloads',
        'Priority support',
      ],
      highlighted: true,
    },
    {
      id: 'basic',
      label: 'Basic',
      identity: 'For committed learners',
      monthlyPrice: pricing?.basic,
      monthlyPriceDisplay: `${pricing?.currency || '$'}${pricing?.basic || '5'}`,
      annualPrice: Math.floor(pricing?.basic * 12 * 0.8),
      annualSavings: Math.ceil(pricing?.basic * 12 * 0.2),
      badge: 'Most Popular',
      color: 'blue',
      features: [
        'Unlimited Bible reading',
        'Unlimited audio streaming',
        'Extended AI study support',
        'Speed control + sleep timer',
        'Community features',
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`rounded-2xl overflow-hidden cursor-pointer transition-all ${
            plan.highlighted
              ? 'border-2 border-purple-400 shadow-lg'
              : 'border-2 border-gray-200'
          } ${selectedPlan === plan.id ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
          onClick={() => onSelectPlan?.(plan.id)}
        >
          {/* Header */}
          <div
            className={`px-6 py-6 ${
              plan.color === 'purple'
                ? 'bg-gradient-to-br from-purple-700 to-indigo-700'
                : 'bg-blue-600'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-widest ${
                  plan.color === 'purple' ? 'text-purple-200' : 'text-blue-200'
                } mb-1`}>
                  {plan.label}
                </p>
                <p className="text-white text-sm font-medium">{plan.identity}</p>
              </div>
              <Badge className={`${
                plan.color === 'purple'
                  ? 'bg-purple-500 text-white'
                  : 'bg-blue-500 text-white'
              } text-xs`}>
                {plan.badge}
              </Badge>
            </div>

            {/* Pricing */}
            <div className="mt-4 space-y-1">
              <div>
                <span className="text-4xl font-extrabold text-white">
                  {plan.monthlyPriceDisplay}
                </span>
                <span className={`text-sm ${
                  plan.color === 'purple' ? 'text-purple-200' : 'text-blue-200'
                }`}>
                  /month
                </span>
              </div>
              <p className={`text-xs ${
                plan.color === 'purple' ? 'text-purple-200' : 'text-blue-100'
              }`}>
                {plan.annualPrice ? `${plan.annualPrice}/year (Save ${plan.annualSavings})` : 'Annual available'}
              </p>
            </div>
          </div>

          {/* Features */}
          <CardContent className={`px-6 py-6 ${
            plan.color === 'purple' ? 'bg-purple-50' : 'bg-blue-50'
          }`}>
            <ul className="space-y-3">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                  <CHECK color={plan.color === 'purple' ? 'text-purple-600' : 'text-blue-500'} />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}