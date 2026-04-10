import React from "react";
import { useNavigate } from "react-router-dom";
import AIEnhancedBibleStudyPremiumPage from "@/components/ai/AIEnhancedBibleStudyPremiumPage";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function AIEnhancedBibleStudyPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <AIEnhancedBibleStudyPremiumPage
      language={language}
      initialTab="theology"
      onBack={() => navigate(-1)}
    />
  );
}