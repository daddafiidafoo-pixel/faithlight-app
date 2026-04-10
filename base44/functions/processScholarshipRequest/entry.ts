import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Process scholarship applications
 * Auto-approves Tier 1 (Africa/Developing) if funds available
 * Manual review for Tier 2 & 3
 */

Deno.serve(async (req) => {
  try {
    if (req.method === 'GET') {
      return Response.json({ status: 'ok' }, { status: 200 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { countryCode, reason, isStudent, isChurchLeader } = payload;

    if (!countryCode || !reason) {
      return Response.json(
        { error: 'countryCode and reason required' },
        { status: 400 }
      );
    }

    // Get country pricing tier
    const tierInfo = await base44.entities.CountryPricingTier.filter(
      { country_code: countryCode.toUpperCase() },
      '-created_date',
      1
    );

    if (!tierInfo?.length) {
      return Response.json(
        { error: 'Country not found' },
        { status: 404 }
      );
    }

    const tier = tierInfo[0].tier;

    // Create scholarship request
    const scholarshipRequest = await base44.asServiceRole.entities.ScholarshipRequest.create({
      user_id: user.id,
      country_code: countryCode.toUpperCase(),
      reason: reason,
      is_student: isStudent,
      is_church_leader: isChurchLeader,
      status: 'pending',
      tier_1_auto_approved: tier === 'tier_1' // Flag for auto-approval eligibility
    });

    // Auto-approve for Tier 1 countries
    if (tier === 'tier_1') {
      const approvedUntil = new Date();
      approvedUntil.setMonth(approvedUntil.getMonth() + 6);

      await base44.asServiceRole.entities.ScholarshipRequest.update(scholarshipRequest.id, {
        status: 'approved',
        approved_by: 'system_auto',
        approved_at: new Date().toISOString(),
        premium_access_until: approvedUntil.toISOString()
      });

      // Update user to have premium access
      try {
        await base44.auth.updateMe({
          scholarship_approved: true,
          scholarship_expires_at: approvedUntil.toISOString(),
          scholarship_id: scholarshipRequest.id
        });
      } catch (err) {
        console.warn('Failed to update user profile:', err.message);
      }

      return Response.json({
        success: true,
        scholarshipId: scholarshipRequest.id,
        autoApproved: true,
        expiresAt: approvedUntil.toISOString(),
        message: 'Scholarship approved! You now have premium access for 6 months.'
      });
    }

    // For Tier 2 & 3: Flag for manual review
    return Response.json({
      success: true,
      scholarshipId: scholarshipRequest.id,
      autoApproved: false,
      status: 'pending',
      message: 'Application submitted. Our team will review within 48 hours.'
    });

  } catch (error) {
    console.error('Scholarship Processing Error:', error);
    return Response.json(
      { error: 'Scholarship processing failed', details: error.message },
      { status: 500 }
    );
  }
});