import { base44 } from "@/api/base44Client";

const BACKGROUND_STYLES = {
  gradient_purple: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
  gradient_blue: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
  gradient_gold: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  solid_dark: "#1f2937",
};

export async function generateShareCard(userEmail, cardData) {
  try {
    const card = await base44.entities.SocialShareCard.create({
      user_email: userEmail,
      card_type: cardData.type,
      title: cardData.title,
      content: cardData.content,
      reference: cardData.reference || "",
      background_style: cardData.backgroundStyle || "gradient_purple",
      created_at: new Date().toISOString(),
    });

    return { card };
  } catch (error) {
    console.error("Error creating share card:", error);
    throw error;
  }
}

export async function recordShare(cardId, platforms) {
  try {
    const card = await base44.entities.SocialShareCard.filter(
      { id: cardId },
      null,
      1
    );

    if (card.length) {
      const current = card[0];
      const allPlatforms = new Set([
        ...new Set(current.shared_platforms || []),
        ...platforms,
      ]);

      await base44.entities.SocialShareCard.update(cardId, {
        shared_platforms: Array.from(allPlatforms),
        share_count: (current.share_count || 0) + 1,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error recording share:", error);
    throw error;
  }
}

export async function getSocialCards(userEmail, limit = 20) {
  try {
    const cards = await base44.entities.SocialShareCard.filter(
      { user_email: userEmail },
      "-created_at",
      limit
    );

    return { cards };
  } catch (error) {
    console.error("Error fetching cards:", error);
    throw error;
  }
}

export function generateHtmlCard(cardData) {
  const style = BACKGROUND_STYLES[cardData.backgroundStyle] || BACKGROUND_STYLES.gradient_purple;

  return `
    <div style="
      width: 1080px;
      height: 1080px;
      background: ${style};
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 60px;
      font-family: 'Inter', sans-serif;
      position: relative;
      overflow: hidden;
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%);
        pointer-events: none;
      "></div>

      <div style="position: relative; z-index: 1; text-align: center; max-width: 900px;">
        <h2 style="
          color: #ffffff;
          font-size: 48px;
          font-weight: 700;
          margin: 0 0 30px 0;
          line-height: 1.2;
        ">${cardData.title}</h2>

        <p style="
          color: rgba(255,255,255,0.95);
          font-size: 32px;
          font-weight: 500;
          margin: 0 0 40px 0;
          line-height: 1.6;
          font-style: italic;
        ">"${cardData.content}"</p>

        ${
          cardData.reference
            ? `<p style="
          color: rgba(255,255,255,0.8);
          font-size: 20px;
          margin: 0;
        ">${cardData.reference}</p>`
            : ""
        }
      </div>

      <div style="
        position: absolute;
        bottom: 30px;
        right: 30px;
        color: rgba(255,255,255,0.6);
        font-size: 14px;
      ">FaithLight</div>
    </div>
  `;
}

export function getShareUrl(platform, cardTitle, cardContent) {
  const text = `${cardTitle}\n\n"${cardContent}"\n\n#FaithLight #Scripture`;

  switch (platform) {
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(text)}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`;
    case "instagram":
      return "instagram://"; // Mobile app only
    default:
      return null;
  }
}