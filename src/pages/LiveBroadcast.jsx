import React, { useMemo } from "react";

/**
 * @typedef {("en" | "om" | "om_eastern" | "om_west_central" | "am" | "ar" | "sw" | "fr" | "ti")} SupportedLanguage
 * @typedef {{
 *   selectedLanguage?: SupportedLanguage;
 *   onBack?: () => void;
 *   onGoHome?: () => void;
 *   onExploreAudioBible?: () => void;
 * }} LiveBroadcastPageProps
 */

const COPY = {
  en: {
    pageTitle: "Live Broadcast",
    badge: "Coming Soon",
    heroTitle: "Live Streaming",
    heroSubtitle: "Broadcast church services and sermons live",
    body:
      "We're building live streaming for FaithLight so churches can share sermons, worship, and special events with their community.",
    sectionTitle: "What's coming",
    bullets: [
      "Live sermon streaming",
      "Church broadcast support",
      "Easy sharing to your community",
    ],
    footer: "Check back soon for updates.",
    back: "Back",
    home: "Back to Home",
    explore: "Explore Audio Bible",
  },

  om: {
    pageTitle: "Tamsaasa Kallattiin",
    badge: "Dhufuuf Jira",
    heroTitle: "Tamsaasa Kallattiin",
    heroSubtitle: "Tajaajila waldaa fi lallaba kallattiin tamsaasi",
    body:
      "FaithLight keessatti tamsaasa kallattii ijaaramaa jira; kun waldoonni lallaba, waaqeffannaa, fi sagantaalee addaa hawaasa isaanii waliin qooduuf ni gargaara.",
    sectionTitle: "Kan dhufu",
    bullets: [
      "Tamsaasa lallabaa kallattiin",
      "Deeggarsa tamsaasa waldaa",
      "Hawaasa keessan waliin qoodinsa salphaa",
    ],
    footer: "Odeeffannoo dabalataaf yeroo biraa deebi'i.",
    back: "Duubatti",
    home: "Gara Manaatti Deebi'i",
    explore: "Audio Bible Ilaali",
  },

  am: {
    pageTitle: "የቀጥታ ስርጭት",
    badge: "በቅርቡ",
    heroTitle: "የቀጥታ ስርጭት",
    heroSubtitle: "የቤተ ክርስቲያን አገልግሎቶችን እና ስብከቶችን በቀጥታ ያስተላልፉ",
    body:
      "FaithLight ለቤተ ክርስቲያኖች ስብከት፣ ዝማሬ እና ልዩ ፕሮግራሞችን ከማህበረሰባቸው ጋር በቀጥታ ለማጋራት የሚያስችል የቀጥታ ስርጭት ባህሪ እየተገነባ ነው።",
    sectionTitle: "የሚመጣው",
    bullets: [
      "የቀጥታ ስብከት ስርጭት",
      "የቤተ ክርስቲያን ስርጭት ድጋፍ",
      "ለማህበረሰብዎ ቀላል ማጋራት",
    ],
    footer: "ለተጨማሪ መረጃ በቅርቡ ይመለሱ።",
    back: "ተመለስ",
    home: "ወደ መነሻ ተመለስ",
    explore: "የድምፅ መጽሐፍ ቅዱስን ይመልከቱ",
  },
};

function normalizeLanguage(language) {
  if (!language) return "en";
  if (language === "am") return "am";
  if (
    language === "om" ||
    language === "om_eastern" ||
    language === "om_west_central"
  ) {
    return "om";
  }
  return "en";
}

export default function LiveBroadcastPage({
  selectedLanguage = "en",
  onBack,
  onGoHome,
  onExploreAudioBible,
}) {
  const lang = normalizeLanguage(selectedLanguage);
  const t = useMemo(() => COPY[lang], [lang]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button
          type="button"
          onClick={onBack}
          style={styles.backButton}
          aria-label={t.back}
        >
          <span style={styles.backArrow}>←</span>
          <span>{t.back}</span>
        </button>

        <h1 style={styles.pageTitle}>{t.pageTitle}</h1>
      </div>

      <main style={styles.main}>
        <section style={styles.heroCard}>
          <div style={styles.badge}>{t.badge}</div>

          <div style={styles.iconWrap} aria-hidden="true">
            <span style={styles.icon}>🎙️</span>
          </div>

          <h2 style={styles.heroTitle}>{t.heroTitle}</h2>
          <p style={styles.heroSubtitle}>{t.heroSubtitle}</p>
          <p style={styles.body}>{t.body}</p>

          <div style={styles.featureBox}>
            <h3 style={styles.sectionTitle}>{t.sectionTitle}</h3>
            <ul style={styles.list}>
              {t.bullets.map((item) => (
                <li key={item} style={styles.listItem}>
                  <span style={styles.dot} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p style={styles.footer}>{t.footer}</p>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={onGoHome}
              style={styles.primaryButton}
            >
              {t.home}
            </button>

            <button
              type="button"
              onClick={onExploreAudioBible}
              style={styles.secondaryButton}
            >
              {t.explore}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f7f8fc",
    color: "#16233b",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "24px 20px 8px",
  },

  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "none",
    background: "transparent",
    color: "#344054",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
  },

  backArrow: {
    fontSize: 24,
    lineHeight: 1,
  },

  pageTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "#111827",
  },

  main: {
    padding: "24px 20px 40px",
    display: "flex",
    justifyContent: "center",
  },

  heroCard: {
    width: "100%",
    maxWidth: 920,
    background: "#ffffff",
    border: "1px solid #e7e9f2",
    borderRadius: 28,
    boxShadow: "0 18px 48px rgba(79, 70, 229, 0.08)",
    padding: "40px 28px",
    textAlign: "center",
  },

  badge: {
    display: "inline-block",
    padding: "10px 18px",
    borderRadius: 999,
    background: "#eef2ff",
    color: "#5b3df5",
    fontWeight: 800,
    fontSize: 14,
    marginBottom: 20,
  },

  iconWrap: {
    width: 84,
    height: 84,
    margin: "0 auto 18px",
    borderRadius: 24,
    background: "linear-gradient(135deg, #6d4aff 0%, #a395f7 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 16px 36px rgba(109, 74, 255, 0.28)",
  },

  icon: {
    fontSize: 38,
    lineHeight: 1,
  },

  heroTitle: {
    margin: "0 0 12px",
    fontSize: 48,
    fontWeight: 900,
    lineHeight: 1.08,
    color: "#5b3df5",
  },

  heroSubtitle: {
    margin: "0 auto 16px",
    maxWidth: 700,
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.35,
    color: "#253858",
  },

  body: {
    margin: "0 auto 26px",
    maxWidth: 760,
    fontSize: 18,
    lineHeight: 1.75,
    color: "#4b5565",
  },

  featureBox: {
    margin: "0 auto 24px",
    maxWidth: 720,
    textAlign: "left",
    background: "#f8f8ff",
    border: "1px solid #e8e5ff",
    borderRadius: 22,
    padding: "22px 20px",
  },

  sectionTitle: {
    margin: "0 0 14px",
    fontSize: 20,
    fontWeight: 800,
    color: "#1f2a44",
  },

  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "grid",
    gap: 12,
  },

  listItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 16,
    lineHeight: 1.5,
    color: "#344054",
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#6d4aff",
    flexShrink: 0,
  },

  footer: {
    margin: "0 0 26px",
    fontSize: 16,
    color: "#667085",
  },

  actions: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  primaryButton: {
    border: "none",
    borderRadius: 14,
    background: "#5b3df5",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 800,
    padding: "14px 22px",
    cursor: "pointer",
    minWidth: 190,
  },

  secondaryButton: {
    border: "1px solid #d7dcf0",
    borderRadius: 14,
    background: "#ffffff",
    color: "#243650",
    fontSize: 16,
    fontWeight: 700,
    padding: "14px 22px",
    cursor: "pointer",
    minWidth: 190,
  },
};