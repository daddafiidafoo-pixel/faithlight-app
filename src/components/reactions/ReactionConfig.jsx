export const REACTIONS = [
  { key: 'AMEN',       emoji: '🤲', label_en: 'Amen',              label_om: 'Ameen' },
  { key: 'PRAYER',     emoji: '🙏', label_en: 'Praying for You',   label_om: 'Siif Kadhachaa Jira' },
  { key: 'ENCOURAGED', emoji: '❤️', label_en: 'Encouraged',        label_om: 'Jajjabeesse' },
  { key: 'PEACE',      emoji: '🕊️', label_en: 'Peace',             label_om: 'Nageenya' },
  { key: 'SCRIPTURE',  emoji: '📖', label_en: 'Scripture Inspired',label_om: 'Kitaaba Qulqulluu' },
  { key: 'INSIGHTFUL', emoji: '💡', label_en: 'Insightful',        label_om: 'Hubannoo Gaarii' },
  { key: 'GROWING',    emoji: '🌱', label_en: 'Growing',           label_om: 'Guddachaa Jira' },
  { key: 'PRAISE',     emoji: '🙌', label_en: 'Praise',            label_om: 'Faarfannaa' },
  { key: 'HOPE',       emoji: '✨', label_en: 'Hope',              label_om: 'Abdiin' },
  { key: 'STRENGTH',   emoji: '🛡️', label_en: 'Strength',         label_om: 'Jabeenya' },
  { key: 'LOVE',       emoji: '🤍', label_en: 'Love in Christ',    label_om: 'Jaalala Kiristoos' },
  { key: 'MOVED',      emoji: '🔥', label_en: 'Spiritually Moved', label_om: 'Hafuura irraa' },
  { key: 'BLESSED',    emoji: '😇', label_en: 'Blessed',           label_om: 'Eebbifame' },
  { key: 'WORSHIP',    emoji: '🎵', label_en: 'Worship',           label_om: 'Waaqeffannaa' },
  { key: 'SUPPORT',    emoji: '🤝', label_en: 'Support',           label_om: 'Si Deggera' },
];

export const REACTION_MAP = Object.fromEntries(REACTIONS.map(r => [r.key, r]));