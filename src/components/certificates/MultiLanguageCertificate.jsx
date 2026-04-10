import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { getCertificateText } from '@/functions/certificateTranslations';

const LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧' },
  om: { name: 'Afaan Oromo', flag: '🇪🇹' },
  am: { name: 'Amharic', flag: '🇪🇹' },
  ar: { name: 'العربية', flag: '🇸🇦' },
};

export default function MultiLanguageCertificate({ 
  userName, 
  courseName, 
  date, 
  certificateId,
  defaultLanguage = 'en',
  onDownload 
}) {
  const [selectedLanguage, setSelectedLanguage] = React.useState(defaultLanguage);
  
  const text = getCertificateText(selectedLanguage, userName, courseName, date);
  const isRTL = ['ar'].includes(selectedLanguage);

  const handleCopy = () => {
    const fullText = `${text.title}\n\n${text.line1}\n${text.name}\n${text.line2}\n${text.course}\n${text.line3}\n\n${text.date}\n${certificateId}`;
    navigator.clipboard.writeText(fullText);
    toast.success('Certificate text copied!');
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold">View Certificate</h3>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGES).map(([code, lang]) => (
                <SelectItem key={code} value={code}>
                  {lang.flag} {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Certificate Display */}
        <div 
          className={`p-12 border-4 border-blue-600 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 text-center mb-6 ${isRTL ? 'dir-rtl' : 'dir-ltr'}`}
        >
          <div className="text-4xl font-bold text-blue-900 mb-8">
            {text.title}
          </div>

          <div className="space-y-3 text-lg text-gray-800">
            <p>{text.line1}</p>
            <p className="text-3xl font-bold text-blue-700">{text.name}</p>
            <p>{text.line2}</p>
            <p className="text-2xl font-semibold text-blue-700">{text.course}</p>
            <p>{text.line3}</p>
          </div>

          <div className="mt-8 pt-8 border-t-2 border-blue-400 space-y-2 text-sm text-gray-700">
            <p>{text.date}</p>
            <p>Certificate ID: {certificateId}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy Text
          </Button>
          <Button
            onClick={() => onDownload?.(selectedLanguage)}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}