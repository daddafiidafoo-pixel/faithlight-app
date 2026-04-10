/**
 * Native Share Sheet using Capacitor
 * Falls back to web share API if Capacitor unavailable
 */

export async function shareVerse(reference, translation = 'NIV') {
  const text = `📖 ${reference} (${translation})\n\nShared from FaithLight`;
  const url = `${window.location.origin}?ref=${encodeURIComponent(reference)}&translation=${translation}`;

  try {
    // Check if Capacitor is available
    if (window.Capacitor && window.Capacitor.isNativePlatform?.()) {
      const { Share } = window.capacitor;
      if (Share) {
        await Share.share({
          title: `Bible Verse: ${reference}`,
          text,
          url,
          dialogTitle: 'Share Verse',
        });
        return;
      }
    }

    // Fallback to Web Share API
    if (navigator.share) {
      await navigator.share({
        title: `Bible Verse: ${reference}`,
        text,
        url,
      });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${reference}\n${url}`);
      console.log('Verse copied to clipboard');
    }
  } catch (err) {
    console.error('Share error:', err);
    // Silent fallback to clipboard
    try {
      await navigator.clipboard.writeText(`${reference}\n${url}`);
    } catch {
      // Ignore clipboard errors
    }
  }
}

export async function shareQuizResults(score, topic, difficulty) {
  const text = `🎯 I scored ${score}% on a "${topic}" quiz (${difficulty} difficulty) on FaithLight!\n\nWant to test your Bible knowledge?`;
  const url = `${window.location.origin}/AIQuizzes`;

  try {
    if (window.Capacitor?.isNativePlatform?.()) {
      const { Share } = window.capacitor;
      if (Share) {
        await Share.share({
          title: 'FaithLight Bible Quiz',
          text,
          url,
          dialogTitle: 'Share Results',
        });
        return;
      }
    }

    if (navigator.share) {
      await navigator.share({ title: 'FaithLight Quiz', text, url });
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
    }
  } catch (err) {
    console.error('Share error:', err);
  }
}

export async function shareApp() {
  const text = 'FaithLight - Study the Bible with AI. Read, listen, study, and grow in faith every day.';
  const url = 'https://faithlight.app';

  try {
    if (window.Capacitor?.isNativePlatform?.()) {
      const { Share } = window.capacitor;
      if (Share) {
        await Share.share({
          title: 'FaithLight',
          text,
          url,
          dialogTitle: 'Share FaithLight',
        });
        return;
      }
    }

    if (navigator.share) {
      await navigator.share({ title: 'FaithLight', text, url });
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
    }
  } catch (err) {
    console.error('Share error:', err);
  }
}