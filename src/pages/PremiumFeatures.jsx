import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Music, BookOpen, Brain, FileText, Users, Shield, Zap } from 'lucide-react';
import RegionalPricingDisplay from '../components/pricing/RegionalPricingDisplay';
import SponsorshipSection from '../components/pricing/SponsorshipSection';
import ScholarshipApplicationModal from '../components/pricing/ScholarshipApplicationModal';
import { base44 } from '@/api/base44Client';

export default function PremiumFeatures() {
  const [trialStarted, setTrialStarted] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [scholarshipOpen, setScholarshipOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch {
        // Not logged in
      }
    };
    fetchUser();
  }, []);

  const features = [
    {
      icon: Music,
      title: "🎧 Offline Audio Downloads",
      description: "Download courses, Bible chapters, and lessons to listen anywhere—commuting, traveling, or offline.",
      included: false
    },
    {
      icon: BookOpen,
      title: "📖 Advanced Theology Courses",
      description: "Level 3–4 structured theology modules exploring doctrine, biblical history, and theological frameworks.",
      included: false
    },
    {
      icon: Brain,
      title: "🧠 AI Bible Tutor Pro",
      description: "Deeper scriptural explanations, cross-references, theological context, and personalized study guidance.",
      included: false
    },
    {
      icon: FileText,
      title: "📝 Sermon & Study Tools",
      description: "Export notes, organize outlines, prepare sermons with AI assistance, and build teaching presentations.",
      included: false
    },
    {
      icon: Users,
      title: "👥 Church Leader Dashboard",
      description: "Manage small groups, track member progress, assign studies, and lead collective discipleship.",
      included: false
    },
    {
      icon: Zap,
      title: "⚡ Personalized Study Plans",
      description: "AI-generated learning paths tailored to your spiritual level, interests, and growth goals.",
      included: false
    }
  ];

  const freeFeatures = [
    "Bible Reader (all translations)",
    "Audio Bible streaming",
    "Level 1 & 2 courses",
    "Safe community access",
    "Basic AI Bible Tutor",
    "Daily verse & reflections"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-indigo-100 text-indigo-800">Upgrade Your Growth</Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">FaithLight Premium</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced tools for deeper discipleship, leadership development, and structured spiritual growth.
          </p>
        </div>

        {/* Hero CTA */}
        <Card className="mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="text-3xl font-bold mb-2">Ready to Go Deeper?</h2>
            <p className="text-lg mb-6 text-indigo-100">
              7-day free trial. No credit card required. Cancel anytime.
            </p>
            <Button 
              onClick={() => setTrialStarted(true)}
              className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold text-lg px-8 py-3"
            >
              Start Your Free Trial
            </Button>
          </CardContent>
        </Card>

        {/* Regional Pricing Display */}
        <div className="mb-12">
          <RegionalPricingDisplay 
            onPricingLoaded={(pricingData) => setPricing(pricingData)}
          />
        </div>

        {/* Features Grid */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What You Get With Premium</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-100 rounded-lg flex-shrink-0">
                      <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-700">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* What Stays Free */}
        <Card className="mb-12 border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">✔ What Always Stays Free</CardTitle>
            <p className="text-gray-600 mt-2">Core faith content will never be paywalled.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {freeFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ethical Commitment */}
        <Card className="mb-12 border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">🛡 Our Ethical Commitment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
              <p className="text-gray-700">
                <strong>No ads interrupting prayer or Bible reading.</strong> Your spiritual practice is sacred.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
              <p className="text-gray-700">
                <strong>We never sell your data.</strong> Your faith journey is private and secure.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
              <p className="text-gray-700">
                <strong>No prosperity gospel or spiritual manipulation.</strong> We don't profit from vulnerability.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
              <p className="text-gray-700">
                <strong>Full refund within 7 days, no questions asked.</strong> Try it risk-free.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Church Plans */}
        <Card className="mb-12 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">🤝 For Churches & Organizations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Equip your entire church or ministry with FaithLight's structured discipleship tools.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-1" />
                <span>Unlimited member access ($19–49/month based on size)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-1" />
                <span>Admin dashboard & group leader tools</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-1" />
                <span>Progress tracking & analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-1" />
                <span>Dedicated support & training</span>
              </li>
            </ul>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Contact Church Sales</Button>
          </CardContent>
        </Card>

        {/* FAQ */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Questions?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              Yes. Cancel immediately through your account settings. No penalties or hidden fees.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Do I need a credit card for the trial?</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              No. Try Premium free for 7 days. You'll only be charged after the trial ends.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What if I'm not satisfied?</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              Full refund within 7 days. If Premium isn't right for you, we'll give your money back.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need help paying for premium?</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              Apply for a scholarship below. We auto-approve for students and leaders in developing countries.
            </CardContent>
          </Card>
        </div>

        {/* Scholarship Section */}
        {user && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎓 Scholarship Program</h2>
            <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
              <CardContent className="pt-6 space-y-4">
                <p className="text-gray-700">
                  FaithLight offers free or reduced premium access to students, church leaders, and those in financial need.
                </p>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setScholarshipOpen(true)}
                >
                  Apply for Scholarship
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sponsorship Section */}
        {user && pricing && (
          <SponsorshipSection userCountryTier={pricing.tier} />
        )}
      </div>

      {/* Scholarship Modal */}
      {user && (
        <ScholarshipApplicationModal
          open={scholarshipOpen}
          onOpenChange={setScholarshipOpen}
          userCountryCode={user.country_code || 'US'}
        />
      )}
    </div>
  );
}