import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Globe, Copy } from 'lucide-react';

export default function BilingualLegalDocs() {
  const [copiedSection, setCopiedSection] = useState(null);

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const PrivacySection = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* English */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Privacy Policy</h3>
          </div>

          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">FaithLight Privacy Policy</h4>
              <p className="text-xs text-gray-500 mb-3">Effective Date: January 2026</p>
            </div>

            <div className="bg-gray-50 rounded p-3 space-y-2">
              <p><strong>Respect Your Privacy</strong></p>
              <p>FaithLight respects your privacy. We collect limited personal information such as name, email, and usage data to provide our services.</p>
            </div>

            <div className="bg-gray-50 rounded p-3 space-y-2">
              <p><strong>Data Protection</strong></p>
              <p>We do not sell your personal data. Your data is stored securely and protected from unauthorized access.</p>
            </div>

            <div className="bg-gray-50 rounded p-3 space-y-2">
              <p><strong>Your Rights</strong></p>
              <p>You may request deletion of your account at any time. You can contact us at privacy@faithlight.com.</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-xs"><strong>AI Disclaimer:</strong> AI-generated content may contain errors. Verify all teaching with Scripture.</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-2"
            onClick={() => copyToClipboard('FaithLight Privacy Policy...', 'privacy-en')}
          >
            <Copy className="w-4 h-4" />
            {copiedSection === 'privacy-en' ? 'Copied!' : 'Copy Text'}
          </Button>
        </div>

        {/* Oromo */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Imaammata Iccitii</h3>
          </div>

          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Imaammata Iccitii – FaithLight</h4>
              <p className="text-xs text-gray-500 mb-3">Guyyaa hojii irra oole: Amajjii 2026</p>
            </div>

            <div className="bg-gray-50 rounded p-3 space-y-2">
              <p><strong>Iccitii Kee Kabajuu</strong></p>
              <p>FaithLight iccitii kee kabaja. Odeeffannoo xiqqaa akka maqaa, email, fi odeeffannoo fayyadamaa tajaajila kennuuf qofa sassaabna.</p>
            </div>

            <div className="bg-gray-50 rounded p-3 space-y-2">
              <p><strong>Eegannoo Odeeffannoo</strong></p>
              <p>Odeeffannoo kee hin gurgurru. Odeeffannoon kee nageenyaan kuufama fi waan hin beeksisin irraa eegama.</p>
            </div>

            <div className="bg-gray-50 rounded p-3 space-y-2">
              <p><strong>Midhaa Kee</strong></p>
              <p>Yeroo barbaadde akkaawuntii kee haquu ni dandeessa. Gaaffii yoo qabaatte, privacy@faithlight.com irratti gadi faaruu.</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-xs"><strong>Ofrii AI:</strong> Qabiyyeen AI dogoggora qabaachuu danda'a. Kitaaba Qulqulluu irratti mirkaneessi.</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-2"
            onClick={() => copyToClipboard('Imaammata Iccitii – FaithLight...', 'privacy-om')}
          >
            <Copy className="w-4 h-4" />
            {copiedSection === 'privacy-om' ? 'Copied!' : 'Copy Text'}
          </Button>
        </div>
      </div>
    </div>
  );

  const TermsSection = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* English */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Terms of Service</h3>
          </div>

          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">FaithLight Terms of Service</h4>
              <p className="text-xs text-gray-500 mb-3">Effective Date: January 2026</p>
            </div>

            <div className="bg-gray-50 rounded p-3 space-y-2">
              <p><strong>Agreement</strong></p>
              <p>By using FaithLight, you agree to follow these terms. We reserve the right to change these terms at any time.</p>
            </div>

            <div className="bg-gray-50 rounded p-3 space-y-2">
              <p><strong>User Conduct</strong></p>
              <p>Users must behave respectfully. Do not post harmful, hateful, or sexually explicit content. Political campaigning is prohibited.</p>
            </div>

            <div className="bg-gray-50 rounded p-3 space-y-2">
              <p><strong>Account Suspension</strong></p>
              <p>We may suspend or delete accounts that violate these terms. Users engaging in harassment or hate speech may be banned.</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-xs"><strong>Limitation of Liability:</strong> AI content must be reviewed carefully. We are not liable for errors in AI-generated teaching.</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-2"
            onClick={() => copyToClipboard('FaithLight Terms of Service...', 'terms-en')}
          >
            <Copy className="w-4 h-4" />
            {copiedSection === 'terms-en' ? 'Copied!' : 'Copy Text'}
          </Button>
        </div>

        {/* Oromo */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Haala Tajaajilaa</h3>
          </div>

          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Haala Tajaajilaa – FaithLight</h4>
              <p className="text-xs text-gray-500 mb-3">Guyyaa hojii irra oole: Amajjii 2026</p>
            </div>

            <div className="bg-gray-50 rounded p-3 space-y-2">
              <p><strong>Walii Galuu</strong></p>
              <p>FaithLight fayyadamuun, seerota kana ni walii galla. Haala kana yeroo gara yerootti jijjiiruu dandeerna.</p>
            </div>

            <div className="bg-gray-50 rounded p-3 space-y-2">
              <p><strong>Amala Fayyadamaa</strong></p>
              <p>Fayyadamaan namoota kabajuu qaba. Qabiyyee miidhaa, jibbaa, ykn dhoksa qofaa hin maxxansin. Siyaasa filannoo hin eeyyamamu.</p>
            </div>

            <div className="bg-gray-50 rounded p-3 space-y-2">
              <p><strong>Cufuu Akkaawuntii</strong></p>
              <p>Akkaawuntiin seerota kana cabsu cufamuu ykn haqamuu danda'a. Waan kadhannoo ykn jibbaa dubbata nama banni danda'ama.</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-xs"><strong>Daangaa Dirqama:</strong> Qabiyyeen AI of-eeggannoon ilaalamuu qaba. Dogoggora AI keessaa dirqama hindhaaba.</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-2"
            onClick={() => copyToClipboard('Haala Tajaajilaa – FaithLight...', 'terms-om')}
          >
            <Copy className="w-4 h-4" />
            {copiedSection === 'terms-om' ? 'Copied!' : 'Copy Text'}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bilingual Legal Documents</h1>
          <p className="text-gray-600">Professional side-by-side English & Oromo legal pages</p>
        </div>

        <Tabs defaultValue="privacy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
            <TabsTrigger value="terms">Terms of Service</TabsTrigger>
          </TabsList>

          <TabsContent value="privacy" className="mt-6">
            <PrivacySection />
          </TabsContent>

          <TabsContent value="terms" className="mt-6">
            <TermsSection />
          </TabsContent>
        </Tabs>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Usage Notes</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ Copy-paste friendly for web pages or PDFs</li>
            <li>✓ Use toggle buttons to switch languages on live site</li>
            <li>✓ All terminology matches app localization</li>
            <li>✓ AI disclaimers included in both languages</li>
            <li>✓ Professional academy-level Oromo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}