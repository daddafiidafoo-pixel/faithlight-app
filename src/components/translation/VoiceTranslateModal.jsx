import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Loader, Mic, MicOff, BookOpen, Sparkles, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { createVoiceRequest } from '@/functions/voiceTranslationEngine';
import TranslationFeedbackForm from './TranslationFeedbackForm';

const LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧' },
  om: { name: 'Afaan Oromo', flag: '🇪🇹' },
  am: { name: 'Amharic', flag: '🇪🇹' },
  ar: { name: 'العربية', flag: '🇸🇦' },
};

const UI_TEXT = {
  en: {
    title: 'Voice Translate',
    subtitle: 'Speak or select text to translate',
    speakNow: 'Speak now',
    useSelected: 'Use selected verses',
    targetLanguage: 'Target language',
    translate: 'Translate',
    translateExplain: 'Translate + Explain',
    selectLanguage: 'Select target language',
    recording: 'Recording...',
    processing: 'Processing translation...',
    disclaimer: 'Scripture references stay unchanged.',
    safetyNote: 'AI translation — please verify with your Bible translation.',
    error: 'Microphone not available in your browser',
  },
  om: {
    title: 'Hiikkaa Sagaleedhaan',
    subtitle: 'Dubbadhu ykn barruun filachi',
    speakNow: 'Amma dubbadhu',
    useSelected: 'Barruun filamte fayyadhadhu',
    targetLanguage: 'Afaan itti hiikamuu',
    translate: 'Hiiki',
    translateExplain: 'Hiiki + Ibsi',
    selectLanguage: 'Afaan filachi',
    recording: 'Hiikkaa funaanaa jira...',
    processing: 'Hiikkaa poolisaa jira...',
    disclaimer: 'Fayyadamni Seera qabu hin jijjiiru.',
    safetyNote: 'Hiikkaa AI ti — seera kee ilaali.',
  },
  am: {
    title: 'በድምፅ ትርጉም',
    subtitle: 'ተናገር ወይም ፅሁፍ ምረጥ',
    speakNow: 'አሁን ተናገር',
    useSelected: 'የተመረጠ ቁርጥራጮች ተጠቀም',
    targetLanguage: 'የመድረሻ ቋንቋ',
    translate: 'ተርጉም',
    translateExplain: 'ተርጉም + አብራራ',
    selectLanguage: 'ቋንቋ ምረጥ',
    recording: 'ቅዝቃዜ ይቀተታል...',
    processing: 'ትርጉም ይሰራል...',
    disclaimer: 'የመጽሐፍ ቅዱስ ማቋቋም ሳይቀየር ይቆያል።',
    safetyNote: 'AI ትርጉም — ከሕዝብ ትርጉም ጋር ያረጋግጡ።',
  },
  ar: {
    title: 'ترجمة بالصوت',
    subtitle: 'تحدّث أو اختر النص',
    speakNow: 'تحدّث الآن',
    useSelected: 'استخدم الآيات المختارة',
    targetLanguage: 'لغة الترجمة',
    translate: 'ترجم',
    translateExplain: 'ترجم + اشرح',
    selectLanguage: 'اختر اللغة',
    recording: 'جاري التسجيل...',
    processing: 'جاري معالجة الترجمة...',
    disclaimer: 'تبقى مراجع الكتاب المقدس دون تغيير.',
    safetyNote: 'ترجمة ذكية — يرجى التحقق من ترجمتك للكتاب المقدس.',
  },
};

export default function VoiceTranslateModal({ isOpen, onClose, selectedText = '', userLanguage = 'en' }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('om');
  const [sourceText, setSourceText] = useState(selectedText);
  const [translationResult, setTranslationResult] = useState(null);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const t = UI_TEXT[userLanguage] || UI_TEXT.en;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioTranscription(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError(t.error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioTranscription = async (audioBlob) => {
    try {
      setIsProcessing(true);
      
      // Upload audio file
      const audioUrl = await base44.integrations.Core.UploadFile({
        file: audioBlob,
      });

      // For now, we'll use placeholder transcription
      // In production, integrate with speech-to-text service
      const transcribedText = await transcribeAudio(audioUrl.file_url);
      setSourceText(transcribedText);
    } catch (err) {
      setError('Failed to process audio');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const transcribeAudio = async (audioUrl) => {
    // Placeholder - in production, call your speech-to-text service
    // For now, return a sample message
    return 'Psalm 119:105';
  };

  const handleTranslate = async (mode) => {
    if (!sourceText.trim()) {
      setError('Please provide text to translate');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');

      const request = await createVoiceRequest(
        (await base44.auth.me()).id,
        'SELECTED_TEXT',
        sourceText,
        targetLanguage,
        mode
      );

      setCurrentRequestId(request.id);
      setTranslationResult({
        translation: request.result_translation,
        explanation: request.result_explanation,
        ttsUrl: request.result_tts_url,
      });

      toast.success('Translation complete!');
    } catch (err) {
      setError('Translation failed. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            {t.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Important disclaimer: not a Bible translation tool */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-300 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              <strong>Study tool only.</strong> This AI feature translates general text and notes — it does NOT translate Bible verses.
              Bible verse text is always served from licensed scripture datasets. Never use AI output as authoritative scripture.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Feedback Form */}
          {showFeedback && translationResult && (
            <TranslationFeedbackForm
              voiceRequestId={currentRequestId}
              sourceText={sourceText}
              translation={translationResult.translation}
              explanation={translationResult.explanation}
              language={targetLanguage}
              onSubmitted={() => {
                setShowFeedback(false);
                setTranslationResult(null);
                setSourceText('');
              }}
            />
          )}

          {/* Result View */}
          {translationResult && !showFeedback ? (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Original</h3>
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{sourceText}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Translation ({LANGUAGES[targetLanguage].name})
                  </h3>
                  <p className="text-gray-900 p-3 bg-blue-50 rounded-lg">{translationResult.translation}</p>
                </div>

                {translationResult.explanation && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Explanation</h3>
                    <p className="text-gray-700 p-3 bg-amber-50 rounded-lg">{translationResult.explanation}</p>
                  </div>
                )}

                {translationResult.ttsUrl && (
                   <Button className="w-full gap-2" variant="outline">
                     🔊 {t.playTranslation}
                   </Button>
                 )}

                 <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                   {t.safetyNote}
                 </div>

                 <div className="flex gap-2">
                   <Button
                     onClick={() => setShowFeedback(true)}
                     variant="outline"
                     className="flex-1"
                   >
                     Report Issue
                   </Button>
                   <Button onClick={() => setTranslationResult(null)} className="flex-1">
                     Translate Another
                   </Button>
                 </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Voice Input Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🎙️ Voice Input</CardTitle>
                </CardHeader>
                <CardContent>
                  {isRecording ? (
                    <Button
                      onClick={stopRecording}
                      disabled={isProcessing}
                      className="w-full gap-2 bg-red-600 hover:bg-red-700"
                    >
                      <MicOff className="w-4 h-4" />
                      {t.recording}
                    </Button>
                  ) : (
                    <Button
                      onClick={startRecording}
                      disabled={isProcessing}
                      className="w-full gap-2"
                      variant="outline"
                    >
                      <Mic className="w-4 h-4" />
                      {t.speakNow}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Text Input Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">📖 Text Input</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Enter or paste text here..."
                    className="w-full h-24 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </CardContent>
              </Card>

              {/* Language Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t.targetLanguage}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage} disabled={isProcessing}>
                    <SelectTrigger>
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
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                {t.disclaimer}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleTranslate('TRANSLATE_ONLY')}
                  disabled={!sourceText.trim() || isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      {t.processing}
                    </>
                  ) : (
                    t.translate
                  )}
                </Button>
                <Button
                  onClick={() => handleTranslate('TRANSLATE_EXPLAIN')}
                  disabled={!sourceText.trim() || isProcessing}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      {t.processing}
                    </>
                  ) : (
                    t.translateExplain
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}