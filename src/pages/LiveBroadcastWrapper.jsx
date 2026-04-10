import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import LiveBroadcastPage from './LiveBroadcast';

export default function LiveBroadcastWrapper() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <LiveBroadcastPage
      selectedLanguage={language}
      onBack={() => navigate(-1)}
      onGoHome={() => navigate('/')}
      onExploreAudioBible={() => navigate('/AudioBiblePage')}
    />
  );
}