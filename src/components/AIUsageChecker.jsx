import { base44 } from '@/api/base44Client';

export const AI_LIMITS = {
  free: { tutor: 5, teaching: 0 },
  pro: { tutor: -1, teaching: 0 }, // -1 means unlimited
  teacher: { tutor: -1, teaching: 30 },
  pastor: { tutor: -1, teaching: 30 },
  admin: { tutor: -1, teaching: -1 }
};

export async function checkAndUpdateAIUsage(user, usageType = 'tutor') {
  // Check if reset is needed
  const today = new Date();
  const resetDate = user.ai_reset_date ? new Date(user.ai_reset_date) : null;
  
  if (!resetDate || today >= resetDate) {
    // Reset usage and set next reset date
    const nextReset = new Date(today);
    nextReset.setMonth(nextReset.getMonth() + 1);
    nextReset.setDate(1); // First day of next month
    
    await base44.auth.updateMe({
      ai_generations_used: 0,
      ai_reset_date: nextReset.toISOString().split('T')[0]
    });
    
    user.ai_generations_used = 0;
    user.ai_reset_date = nextReset.toISOString().split('T')[0];
  }
  
  // Get user's plan (use user_role for backward compatibility)
  const plan = user.plan_type || (user.user_role === 'teacher' || user.user_role === 'pastor' ? 'teacher' : 'free');
  const limits = AI_LIMITS[plan] || AI_LIMITS.free;
  
  // Check limit based on usage type
  const limit = usageType === 'teaching' ? limits.teaching : limits.tutor;
  
  if (limit === -1) {
    // Unlimited
    return { allowed: true };
  }
  
  if (limit === 0) {
    // No access
    return { 
      allowed: false, 
      message: `This feature is not available on your current plan. Upgrade to access AI ${usageType === 'teaching' ? 'Teaching Builder' : 'Bible Tutor'}.`
    };
  }
  
  if (user.ai_generations_used >= limit) {
    const resetDate = new Date(user.ai_reset_date);
    const daysUntilReset = Math.ceil((resetDate - today) / (1000 * 60 * 60 * 24));
    return { 
      allowed: false, 
      message: `You've reached this month's AI generation limit. It resets in ${daysUntilReset} day${daysUntilReset !== 1 ? 's' : ''}.`
    };
  }
  
  // Increment usage
  await base44.auth.updateMe({
    ai_generations_used: user.ai_generations_used + 1
  });
  
  return { allowed: true, remaining: limit - user.ai_generations_used - 1 };
}

export function getDaysUntilReset(resetDate) {
  if (!resetDate) return 0;
  const today = new Date();
  const reset = new Date(resetDate);
  return Math.ceil((reset - today) / (1000 * 60 * 60 * 24));
}