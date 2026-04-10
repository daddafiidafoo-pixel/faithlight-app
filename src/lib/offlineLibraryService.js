import { base44 } from "@/api/base44Client";

export async function downloadBiblePassage(userEmail, reference, text, language = "en") {
  try {
    const existing = await base44.entities.OfflineLibraryItem.filter(
      {
        user_email: userEmail,
        item_type: "bible_passage",
        reference: reference,
      },
      null,
      1
    );

    if (existing.length) {
      return { alreadyDownloaded: true, item: existing[0] };
    }

    const item = await base44.entities.OfflineLibraryItem.create({
      user_email: userEmail,
      item_type: "bible_passage",
      title: `${reference} - Bible Passage`,
      reference: reference,
      content: text,
      downloaded_at: new Date().toISOString(),
      language: language,
      file_size_kb: Math.ceil(text.length / 1024),
    });

    return { item };
  } catch (error) {
    console.error("Error downloading passage:", error);
    throw error;
  }
}

export async function downloadReadingPlan(userEmail, planTitle, planData) {
  try {
    const item = await base44.entities.OfflineLibraryItem.create({
      user_email: userEmail,
      item_type: "reading_plan",
      title: planTitle,
      reference: planData.id || planTitle,
      content: JSON.stringify(planData),
      downloaded_at: new Date().toISOString(),
      file_size_kb: Math.ceil(JSON.stringify(planData).length / 1024),
    });

    return { item };
  } catch (error) {
    console.error("Error downloading reading plan:", error);
    throw error;
  }
}

export async function downloadAIInsight(userEmail, title, insight) {
  try {
    const item = await base44.entities.OfflineLibraryItem.create({
      user_email: userEmail,
      item_type: "ai_insight",
      title: title,
      reference: insight.type || "insight",
      content: JSON.stringify(insight),
      downloaded_at: new Date().toISOString(),
      file_size_kb: Math.ceil(JSON.stringify(insight).length / 1024),
    });

    return { item };
  } catch (error) {
    console.error("Error downloading AI insight:", error);
    throw error;
  }
}

export async function getLibrary(userEmail, itemType = null) {
  try {
    const query = itemType
      ? { user_email: userEmail, item_type: itemType }
      : { user_email: userEmail };

    const items = await base44.entities.OfflineLibraryItem.filter(
      query,
      "-downloaded_at"
    );

    const pinnedItems = items.filter((i) => i.is_pinned);
    const regularItems = items.filter((i) => !i.is_pinned);

    const totalSize = items.reduce((sum, i) => sum + (i.file_size_kb || 0), 0);

    return {
      items: [...pinnedItems, ...regularItems],
      totalSize: totalSize,
      count: items.length,
    };
  } catch (error) {
    console.error("Error fetching library:", error);
    throw error;
  }
}

export async function togglePin(itemId, isPinned) {
  try {
    await base44.entities.OfflineLibraryItem.update(itemId, {
      is_pinned: !isPinned,
    });
    return { success: true };
  } catch (error) {
    console.error("Error toggling pin:", error);
    throw error;
  }
}

export async function deleteLibraryItem(itemId) {
  try {
    await base44.entities.OfflineLibraryItem.delete(itemId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
}

export function formatFileSize(sizeKb) {
  if (sizeKb < 1024) return `${sizeKb} KB`;
  return `${(sizeKb / 1024).toFixed(1)} MB`;
}