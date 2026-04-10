// Stub: automationEngine — backend logic runs server-side only
export async function scheduleReminder({ userId, type, scheduledAt, metadata }) {
  console.warn('[automationEngine] scheduleReminder called client-side — use backend function instead');
  return { success: false, message: 'Automation runs server-side only' };
}

export async function cancelReminder({ reminderId }) {
  console.warn('[automationEngine] cancelReminder called client-side — use backend function instead');
  return { success: false };
}

export async function getUserReminders({ userId }) {
  return [];
}