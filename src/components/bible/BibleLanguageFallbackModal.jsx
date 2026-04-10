import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { getLanguageConfig, getActualBibleLanguage } from '@/lib/languageConfig';
import { useLanguage } from '@/components/i18n/LanguageProvider';

const FALLBACK_MESSAGES = {
  en: 'Bible text is not yet available in your selected language. Would you like to continue with the English Bible for now?',
  om: 'Barreeffamni Macaafa Qulqulluu yeroo ammaa afaan filatte keessatti hin jiru. Ammaaf Macaafa Qulqulluu Ingiliffaan itti fufuu barbaaddaa?',
  am: 'የመጽሐፍ ቅዱስ ጽሑፍ በመረጡት ቋንቋ አሁን አልተገኘም። ለጊዜው በእንግሊዝኛ መቀጠል ይፈልጋሉ?',
  ti: 'ንቑሑ መጻሕፊ ቅዱስ በምርጫ ልሳንካ ኣብዚ ግዜ የሎን። ንሕና ናይ ሎሚ እንግሊዛዊ መጻሕፊ ቅዱስ ብምሕላው ክቕጽል ትደሊ?',
  ar: 'نص الكتاب المقدس غير متاح حالياً باللغة المختارة. هل تود الاستمرار باستخدام الكتاب المقدس بالإنجليزية في الوقت الراهن؟',
  sw: 'Maandishi ya Biblia hayajastahimiliwa kwa lugha yako iliyochaguliwa. Je, ungependa kuendelea na Biblia ya Kiingereza kwa sasa?',
  fr: 'Le texte de la Bible n\'est pas encore disponible dans votre langue choisie. Souhaitez-vous continuer avec la Bible en anglais pour le moment?',
};

export default function BibleLanguageFallbackModal({ 
  open, 
  onOpenChange, 
  selectedLanguage,
  onConfirmEnglish 
}) {
  const { t } = useLanguage();

  if (!open) return null;
  const config = getLanguageConfig(selectedLanguage);
  const message = FALLBACK_MESSAGES[selectedLanguage] || FALLBACK_MESSAGES.en;

  const handleContinueEnglish = () => {
    if (onConfirmEnglish) onConfirmEnglish();
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-gray-900">
              {config.displayName}
            </h2>
            <p className="text-sm text-gray-700 mt-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1"
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleContinueEnglish}
            className="flex-1"
          >
            {t('common.continue', 'Continue with English')}
          </Button>
        </div>
      </div>
    </div>
  );
}